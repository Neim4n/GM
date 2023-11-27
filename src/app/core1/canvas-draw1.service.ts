import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CanvasDraw1Service {
    cvs: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    padding = 0;
    gridScale = 20;
    pointScale = 2;

    origin = {
        X: 0,
        Y: 0
    };

    pivot = {
        X: 250,
        Y: 250,
        DEG: 0
    };
    offset = {
        X: 0,
        Y: 0
    };

    raf: any;
    tangentAndNormalX: number | null;
    curve = {
        a: 0,
        X: 0,
        Y: 0,
        X0: 0,
        Y0: 0,
        arc_length: 0,
        display_helpers: true,
    }
    display = {
        tangent: true,
        normal: true,
        inflections: true
    }

    constructor() {
    }

    F(a: number, x: number) {
        return (8 * a ** 3) / (x ** 2 + 4 * a ** 2);
    }

    dF(a: number, x: number) {
        return (-16 * a ** 3 * x) / (x ** 2 + 4 * a ** 2) ** 2;
    }

    drawGrid() {
        this.origin = {
            X: this.padding,
            Y: this.padding
        }

        this.drawGridX(this.cvs, this.ctx);
        this.drawGridY(this.cvs, this.ctx);
        this.paintCoordinate(this.cvs, this.ctx);
    }

    drawGridX(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        const gridx = {
            X: this.padding,
            Y: this.padding
        }

        for (let i = 0; i < cvs.width / this.gridScale; i++) {
            gridx.X += this.gridScale;
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "grey";

            ctx.moveTo(gridx.X, gridx.Y);
            ctx.lineTo(gridx.X, cvs.height);
            ctx.stroke();
        }
    }

    drawGridY(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        const gridy = {
            X: this.padding,
            Y: this.padding
        }

        for (let i = 0; i < cvs.width / this.gridScale; i++) {
            gridy.Y += this.gridScale;
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "grey";

            ctx.moveTo(gridy.X, gridy.Y);
            ctx.lineTo(cvs.width, gridy.Y);

            ctx.stroke();
        }
    }

    paintCoordinate(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black"

        ctx.moveTo(this.origin.X, cvs.height);
        ctx.lineTo(this.origin.X, this.origin.Y);
        ctx.lineTo(cvs.width, this.origin.Y);
        ctx.stroke();
    }

    setSettings(curve: any, pivot: any, offset: any, display: any) {
        this.curve = curve;
        this.pivot = pivot;
        this.offset = offset;
        this.display.tangent = display.tangent;
        this.display.normal = display.normal;
        this.display.inflections = display.inflections;
    }

    drawScene(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.cvs = cvs;

        this.drawGrid();
        this.drawCurve();
        this.drawPivot();
    }

    createHandlers() {
        this.cvs.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX - this.cvs.getBoundingClientRect().left;
            const mouseY = e.clientY - this.cvs.getBoundingClientRect().top;
            const x = mouseX - this.pivot.X * 2 - this.offset.X * 2;
            const y = mouseY - this.pivot.Y * 2 - this.offset.Y * 2;


            this.ctx.setTransform(1, 0, 0, -1, 0, this.cvs.height);
            this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)

            this.drawScene(this.cvs, this.ctx);

            this.clearTangentAndNormal();
            this.tangentAndNormalX = x;
            this.drawTangentAndNormalLines(x);
        });
    }

    onSlider(x: number) {
        this.ctx.setTransform(1, 0, 0, -1, 0, this.cvs.height);
        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)

        this.drawScene(this.cvs, this.ctx);

        this.clearTangentAndNormal();
        this.tangentAndNormalX = x;
        this.drawTangentAndNormalLines(x)
    }

    drawCurve(cvs = this.cvs, ctx = this.ctx) {
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        const a = this.getScaledValue(this.curve.a);

        for (let x = -cvs.width; x < cvs.width; x++) {
            const y = this.F(a, x);
            if (y < cvs.height && y > 0) {
                let p = this.offsetPoint({X: this.curve.X0 + x / 2, Y: this.curve.Y0 + y / 2});
                p = this.rotatePoint(p, this.pivot);
                ctx.lineTo(p.X * 2, p.Y * 2);
            }
        }

        ctx.stroke();
        ctx.closePath();

        if (this.curve.display_helpers) {
            this.drawCurveHelpers(cvs, ctx, a);
        }

        if (this.display.inflections) {
            this.drawInflectionPoints();
        }
    }

    drawCurveAnimationParameter(aMin: number, aMax: number, cvs = this.cvs, ctx = this.ctx) {
        if (aMin >= aMax) {
            this.curve.a = aMax / 2;
            return;
        }
        ctx.setTransform(1, 0, 0, -1, 0, cvs.height);
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        this.drawGrid();

        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        let a = aMin;

        for (let x = -cvs.width; x < cvs.width; x++) {
            const y = this.F(a, x);
            if (y < cvs.height && y > 0) {
                let p = this.offsetPoint({X: this.curve.X0 + x / 2, Y: this.curve.Y0 + y / 2});
                p = this.rotatePoint(p, this.pivot);
                ctx.lineTo(p.X * 2, p.Y * 2);
            }
        }

        ctx.stroke();
        ctx.closePath();

        if (this.curve.display_helpers) {
            this.drawCurveHelpers(cvs, ctx, a);
        }

        a += 0.1;
        this.drawPivot();
        requestAnimationFrame(() => this.drawCurveAnimationParameter(a, aMax));
    }

    drawCurveAnimation(xStart: number, xEnd: number, speed: number, cvs = this.cvs, ctx = this.ctx) {
        if (xStart >= xEnd) {
            return;
        }
        ctx.setTransform(1, 0, 0, -1, 0, cvs.height);
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        this.drawGrid();

        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        const a = this.getScaledValue(this.curve.a);

        for (let x = -cvs.width; x < xStart; x++) {
            const y = this.F(a, x);
            if (y < cvs.height && y > 0) {
                let p = this.offsetPoint({X: this.curve.X0 + x / 2, Y: this.curve.Y0 + y / 2});
                p = this.rotatePoint(p, this.pivot);
                ctx.lineTo(p.X * 2, p.Y * 2);
            }
        }

        ctx.stroke();
        ctx.closePath();

        if (this.curve.display_helpers) {
            this.drawCurveHelpers(cvs, ctx, a);
        }

        xStart += speed;
        this.drawPivot();
        requestAnimationFrame(() => this.drawCurveAnimation(xStart, xEnd, speed));
    }

    drawCurveHelpers(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D, a: number) {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.strokeStyle = 'grey';
        const pC = this.getPoint({X: this.curve.X0, Y: this.curve.Y0 + a / 2})
        ctx.arc(pC.X, pC.Y, a, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.setLineDash([0, 0]);
        ctx.strokeStyle = 'grey';
        const p0 = this.getPoint({X: this.curve.X0, Y: this.curve.Y0})
        const p1 = this.getPoint({X: this.curve.X0, Y: this.curve.Y0 + a})
        ctx.moveTo(p0.X, p0.Y);
        ctx.lineTo(p1.X, p1.Y)

        const p2 = this.getPoint({X: -cvs.width, Y: this.curve.Y0})
        const p3 = this.getPoint({X: cvs.width, Y: this.curve.Y0})
        ctx.moveTo(p2.X, p2.Y);
        ctx.lineTo(p3.X, p3.Y);
        ctx.closePath();
        ctx.stroke();
    }

    drawTangentAndNormalLines(x: number) {
        const a = this.getScaledValue(this.curve.a);
        const y = this.F(a, x);
        const slope = this.dF(a, x);
        const normalSlope = -1 / slope;

        this.ctx.save();
        this.ctx.translate(this.pivot.X * 2, this.pivot.Y * 2);
        this.ctx.rotate(this.degToRad(this.pivot.DEG));
        this.ctx.translate(-this.pivot.X * 2, -this.pivot.Y * 2);

        if (this.display.tangent) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'green';
            this.ctx.lineWidth = 2;
            const x1_tangent = x + this.cvs.width / 2 - 50 + this.offset.X * 2;
            const y1_tangent = this.getCoordinate(this.curve.Y0) + y + this.offset.Y * 2 - slope * 50;
            const x2_tangent = x + this.cvs.width / 2 + 50 + this.offset.X * 2;
            const y2_tangent = this.getCoordinate(this.curve.Y0) + y + this.offset.Y * 2 + slope * 50;

            this.ctx.moveTo(x1_tangent, y1_tangent);
            this.ctx.lineTo(x2_tangent, y2_tangent);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        if (this.display.normal) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'blue';
            this.ctx.lineWidth = 2;
            const normalLength = 100;
            const x1 = x + this.cvs.width / 2 + this.offset.X * 2;
            const y1 = this.getCoordinate(this.curve.Y0) + y + this.offset.Y * 2;
            const x2a = x1 + (normalLength / 2) / Math.sqrt(1 + normalSlope ** 2);
            const y2a = y1 + normalSlope * (x2a - x1);
            const x2b = x1 - (normalLength / 2) / Math.sqrt(1 + normalSlope ** 2);
            const y2b = y1 - normalSlope * (x1 - x2b);
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2a, y2a);
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2b, y2b);
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.restore();
        }

        const pivot = {
            X: (x + this.cvs.width / 2) / this.pointScale + this.offset.X,
            Y: (this.getScaledValue(this.curve.Y0) + y) / this.pointScale + this.offset.Y
        }

        this.drawPivot(this.ctx, this.rotatePoint(pivot, this.pivot), 'black');
    }

    clearTangentAndNormal() {
        if (this.tangentAndNormalX !== null) {
            this.drawCurve(this.cvs, this.ctx);
            this.tangentAndNormalX = null;
        }
    }

    drawPivot(ctx = this.ctx, pivot: any = this.pivot, color?: string) {
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = color || "green";

        ctx.arc(this.getCoordinate(pivot.X), this.getCoordinate(pivot.Y), 2, 0, 2 * Math.PI);
        ctx.stroke();
    }

    //LINEAR FORMULA
    rotatePoint(point: any, pivot: any) {
        return {
            ...point,
            X: pivot.X + (point.X - pivot.X) * Math.cos(this.degToRad(pivot.DEG)) - (point.Y - pivot.Y) * Math.sin(this.degToRad(pivot.DEG)),
            Y: pivot.Y + (point.Y - pivot.Y) * Math.cos(this.degToRad(pivot.DEG)) + (point.X - pivot.X) * Math.sin(this.degToRad(pivot.DEG))
        }
    }

    offsetPoint(point: any) {
        return {
            ...point,
            X: point.X + this.offset.X,
            Y: point.Y + this.offset.Y
        }
    }

    scaledPoint(point: any) {
        return {
            ...point,
            X: point.X * this.pointScale,
            Y: point.Y * this.pointScale
        }
    }

    //HELP METHODS
    getPoint(point: any, scaledStatus = true) {
        point = this.offsetPoint(point);
        point = this.rotatePoint(point, this.pivot);
        point = scaledStatus ? this.scaledPoint(point) : point;
        return point;
    }

    getCoordinate(value: number) {
        return value * 2;
    }

    getScaledValue(value: number) {
        return value * this.pointScale;
    }

    degToRad(deg: number) {
        return deg * Math.PI / 180;
    }

    findInflectionPoints() {
        const inflectionPoints = [];
        const a = this.curve.a;
        for (let x = -this.cvs.width; x < this.cvs.width - 1; x++) {
            const y1 = (8 * a ** 3) / (x ** 2 + 4 * a ** 2);
            const y2 = (8 * a ** 3) / ((x + 1) ** 2 + 4 * a ** 2);
            const y3 = (8 * a ** 3) / ((x - 1) ** 2 + 4 * a ** 2);
            if ((y1 > y2 && y1 > y3) || (y1 < y2 && y1 < y3)) {
                inflectionPoints.push({X: x, Y: y1});
            }
        }
        inflectionPoints.push({X: a*2 / Math.sqrt(3), Y: 3*a*2/4});
        inflectionPoints.push({X: -a*2 / Math.sqrt(3), Y: 3*a*2/4});
        return inflectionPoints;
    }

    drawInflectionPoints() {
        this.findInflectionPoints().map((p) => {
            p.X += this.pivot.X + this.offset.X;
            p.Y += this.pivot.Y + this.offset.Y;
            p = this.rotatePoint(p, this.pivot)
            this.drawPivot(this.ctx, p, 'purple')
        });
    }

    calculateArcLength() {
        const a = this.curve.a;
        const dx = 0.01;
        let arcLength = 0;

        for (let x = -this.cvs.width; x < this.cvs.width; x += dx) {
            const derivative = this.dF(a, x);
            arcLength += Math.sqrt(1 + derivative ** 2) * dx;
        }
        return arcLength;
    }

    calculateSquare() {
        let square = 0;
        const a = this.curve.a;
        for (let x = -this.cvs.width; x < this.cvs.width; x++) {
            const y = this.F(a, x);
            square += y;
        }
        return square;
    }


    calculateRadiusOfCurvature(x: number) {
        const a = this.curve.a;
        const derivative = this.dF(a, x);
        const secondDerivative = (-48 * a ** 5) / (x ** 2 + 4 * a ** 2) ** 3;
        return Math.pow(1 + derivative ** 2, 1.5) / Math.abs(secondDerivative);
    }
}
