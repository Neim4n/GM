import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CanvasDrawService {
    padding = 0

    origin = {
        X: 0,
        Y: 0
    };

    vertexRight: any;
    vertexTop: any;

    figure: any;
    pivot: any;
    offset: any
    gridScale: any;
    scale: any
    symmetry: any;
    affine: any;
    projective: any
    transformationMode: any;

    constructor() {
    }

    setSettings(figure: any, pivot: any, offset: any, gridScale: any, scale: any, affine: any, projective: any, transformationMode: any, symmetry: any) {
        this.figure = figure;
        this.pivot = pivot;
        this.offset = offset;
        this.gridScale = gridScale;
        this.scale = scale;
        this.affine = affine;
        this.projective = projective;
        this.transformationMode = transformationMode;
        this.symmetry = symmetry
    }

    drawGrid(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.vertexTop = {
            X: this.padding,
            Y: cvs.height - this.padding,
        }

        this.vertexRight = {
            X: cvs.width - this.padding,
            Y: this.padding
        }

        this.origin = {
            X: this.padding,
            Y: this.padding
        }

        this.drawGridX(cvs, ctx);
        this.drawGridY(cvs, ctx);
        this.paintCoordinate(cvs, ctx);
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

            let p0 = gridx;
            let p1 = {X: gridx.X, Y: this.vertexTop.Y};

            if (this.transformationMode === 'affine') {
                p0 = this.affinePoint(p0)
                p1 = this.affinePoint(p1)
            } else if (this.transformationMode === 'projective') {
                p0 = this.projectivePoint(p0)
                p1 = this.projectivePoint(p1)
            }

            ctx.moveTo(p0.X, p0.Y);
            ctx.lineTo(p1.X, p1.Y);
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

            let p0 = gridy;
            let p1 = {X: this.vertexRight.X, Y: gridy.Y};

            if (this.transformationMode === 'affine') {
                p0 = this.affinePoint(p0)
                p1 = this.affinePoint(p1)
            } else if (this.transformationMode === 'projective') {
                p0 = this.projectivePoint(p0)
                p1 = this.projectivePoint(p1)
            }

            ctx.moveTo(p0.X, p0.Y);
            ctx.lineTo(p1.X, p1.Y);

            ctx.stroke();
        }
    }

    paintCoordinate(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black"

        let p0 = this.vertexTop;
        let p1 = this.vertexRight;
        let p2 = this.origin;

        if (this.transformationMode === 'affine') {
            p0 = this.affinePoint(p0)
            p1 = this.affinePoint(p1)
            p2 = this.affinePoint(p2)
        } else if (this.transformationMode === 'projective') {
            p0 = this.projectivePoint(p0)
            p1 = this.projectivePoint(p1)
            p2 = this.projectivePoint(p2)
        }

        ctx.moveTo(p0.X, p0.Y);
        ctx.lineTo(p2.X, p2.Y);
        ctx.lineTo(p1.X, p1.Y);
        ctx.stroke();
    }

    drawScene(ctx: CanvasRenderingContext2D) {
        const figure = JSON.parse(JSON.stringify(this.figure))
        const pivot = JSON.parse(JSON.stringify(this.pivot))

        Object.keys(this.figure).forEach((key) => {
            figure[key] = this.getNewPoint(figure[key], this.movingMatrix(this.offset.X, this.offset.Y));
            figure[key] = this.getNewPoint(figure[key], this.scaleMatrix(this.scale.X, this.scale.Y));
            figure[key] = this.rotatePoint(figure[key], pivot)

            if (!figure[key].hasOwnProperty('Rx')) {
                if (this.transformationMode === 'affine') {
                    figure[key] = this.affinePoint(figure[key]);
                } else if (this.transformationMode === 'projective') {
                    const scaleMatrix = this.scaleMatrix(2, 2)
                    figure[key].X = this.countX(figure[key], scaleMatrix);
                    figure[key].Y = this.countY(figure[key], scaleMatrix);
                    figure[key] = this.projectivePoint(figure[key]);
                }
            }
        });

        this.drawFigure(ctx, figure, pivot);
        this.drawPivot(ctx);
        this.drawSymmetry(ctx, figure, pivot)
    }

    drawSymmetry(ctx: CanvasRenderingContext2D, figure: any, pivot: any) {
        const figure1 = JSON.parse(JSON.stringify(this.figure));
        const symmetricPivot = this.getSymmetryPoint(JSON.parse(JSON.stringify(pivot)));
        this.drawPivot(ctx, symmetricPivot);

        const symmetricFigure = JSON.parse(JSON.stringify(this.figure));
        Object.keys(this.figure).forEach((key) => {
            figure1[key] = this.getNewPoint(figure1[key], this.movingMatrix(this.offset.X, this.offset.Y));
            figure1[key] = this.getNewPoint(figure1[key], this.scaleMatrix(this.scale.X, this.scale.Y));

            symmetricFigure[key] = this.getSymmetryPoint(figure1[key]);
            symmetricFigure[key] = this.rotatePoint(symmetricFigure[key], symmetricPivot)

            if (!figure[key].hasOwnProperty('Rx')) {
                if (this.transformationMode === 'affine') {
                    symmetricFigure[key] = this.affinePoint(symmetricFigure[key]);
                } else if (this.transformationMode === 'projective') {
                    const scaleMatrix = this.scaleMatrix(2, 2)
                    symmetricFigure[key].X = this.countX(symmetricFigure[key], scaleMatrix);
                    symmetricFigure[key].Y = this.countY(symmetricFigure[key], scaleMatrix);
                    symmetricFigure[key] = this.projectivePoint(symmetricFigure[key]);
                }
            }
        });

        this.drawFigure(ctx, symmetricFigure,  symmetricPivot, "blue");
        this.drawSymmetryPivot(ctx);
    }

    drawFigure(ctx: CanvasRenderingContext2D, figure: any, pivot: any, color?: string) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color || "black";

        ctx.moveTo(this.getCurrentCoord(figure.A.X), this.getCurrentCoord(figure.A.Y));
        ctx.lineTo(this.getCurrentCoord(figure.B.X), this.getCurrentCoord(figure.B.Y));
        ctx.lineTo(this.getCurrentCoord(figure.C.X), this.getCurrentCoord(figure.C.Y));
        ctx.lineTo(this.getCurrentCoord(figure.D.X), this.getCurrentCoord(figure.D.Y));
        ctx.lineTo(this.getCurrentCoord(figure.E.X), this.getCurrentCoord(figure.E.Y));
        ctx.lineTo(this.getCurrentCoord(figure.F.X), this.getCurrentCoord(figure.F.Y));
        ctx.lineTo(this.getCurrentCoord(figure.G.X), this.getCurrentCoord(figure.G.Y));
        ctx.lineTo(this.getCurrentCoord(figure.H.X), this.getCurrentCoord(figure.H.Y));
        ctx.lineTo(this.getCurrentCoord(figure.A.X), this.getCurrentCoord(figure.A.Y));
        ctx.stroke();

        this.drawCircle(ctx, figure.R1, pivot);
        this.drawCircle(ctx, figure.R2, pivot);
    }

    drawPivot(ctx: CanvasRenderingContext2D, pivot: any = this.pivot) {
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "green";

        if (this.transformationMode === 'affine') {
            pivot = this.affinePoint(pivot);
        } else if (this.transformationMode === 'projective') {
            pivot = this.getNewPoint(pivot, this.scaleMatrix(2, 2));
            pivot = this.projectivePoint(pivot);
        }

        ctx.arc(this.getCurrentCoord(pivot.X), this.getCurrentCoord(pivot.Y), 2, 0, 2 * Math.PI);
        ctx.stroke();
    }

    drawSymmetryPivot(ctx: CanvasRenderingContext2D) {
        let symmetryP = JSON.parse(JSON.stringify(this.symmetry));
        if (this.transformationMode === 'affine') {
            symmetryP = this.affinePoint(symmetryP);
        } else if (this.transformationMode === 'projective') {
            symmetryP = this.projectivePoint(symmetryP);
        }

        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.arc(symmetryP.X, symmetryP.Y, 2, 0, 2 * Math.PI);
        ctx.stroke();
    }

    drawCircle(ctx: CanvasRenderingContext2D, circle: any, pivot: any) {
        ctx.beginPath();
        circle.Rx *= this.scale.X;
        circle.Ry *= this.scale.Y;

        if (this.transformationMode === 'projective') {
            const scaleMatrix = this.scaleMatrix(2, 2)
            circle.X = this.countX(circle, scaleMatrix);
            circle.Y = this.countY(circle, scaleMatrix);
        }

        if (this.transformationMode === 'affine') {
            /*const scaleMatrix = this.scaleMatrix(2, 2)
            circle.X = this.countX(circle, scaleMatrix);
            circle.Y = this.countY(circle, scaleMatrix);*/
        }

        for (let i = 0, sides = 50; i < sides; i++) {
            const angle = (i / sides) * 2 * Math.PI;
            const x = this.getCurrentCoord(circle.X) + circle.Rx * Math.cos(angle);
            const y = this.getCurrentCoord(circle.Y) + circle.Ry * Math.sin(angle);

            let p = {X: x, Y: y};
            if (this.transformationMode === 'affine') {
                p = this.affinePoint(p);
            } else if (this.transformationMode === 'projective') {
                p = this.projectivePoint(p);
            }

            ctx.lineTo(p.X, p.Y);
        }

        ctx.closePath();
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

    affinePoint(point: any, affinis: any = this.affine) {
        return {
            ...point,
            X: point.X * affinis.X.X / 10 + point.Y * affinis.Y.X / 10 + affinis.O.X,
            Y: point.X * affinis.X.Y / 10 + point.Y * affinis.Y.Y / 10 + affinis.O.Y
        }
    }

    projectivePoint(point: any, projective: any = this.projective) {
        const w0 = projective.X.w * point.X + projective.Y.w * point.Y + projective.O.w;

        return {
            ...point,
            X: (point.X * projective.X.X * 10 * projective.X.w + point.Y * projective.Y.X * 10 * projective.Y.w + projective.O.X * 10) / w0,
            Y: (point.X * projective.X.Y * 10 * projective.X.w + point.Y * projective.Y.Y * 10 * projective.Y.w + projective.O.Y  * 10) / w0
        }
    }

    //TRANSFORMATION MATRIX
    movingMatrix(moveX: number, moveY: number) {
        return [1, 0, 0,
            0, 1, 0,
            moveX, moveY, 1];
    }

    scaleMatrix(scaleX: number, scaleY: number) {
        return [scaleX, 0, 0,
            0, scaleY, 0,
            0, 0, 1];
    }

    symmetryMatrix(scaleX: number, scaleY: number) {
        return [1, 0, 0,
            0, -1, 0,
            0, 0, 1];
    }

    //HELP METHODS
    getCurrentCoord(value: number) {
        const cof = this.transformationMode === 'projective' ? 1 : 2;
        return value * cof;
    }

    countX(point: any, arr: any) {
        return (point.X * arr[0] + point.Y * arr[3] + arr[6]) / (point.X * arr[2] + point.Y * arr[5] + arr[8]);
    }

    countY(point: any, arr: any) {
        return (point.X * arr[1] + point.Y * arr[4] + arr[7]) / (point.X * arr[2] + point.Y * arr[5] + arr[8]);
    }

    degToRad(deg: number) {
        return deg * Math.PI / 180;
    }

    getNewPoint(point: any, matrix: any) {
        return {
            ...point,
            X: this.countX(point, matrix),
            Y: this.countY(point, matrix)
        }
    }

    getSymmetryPoint(point: any) {
        const symmetryPivot = JSON.parse(JSON.stringify(this.symmetry));

        return {
            ...point,
            X: symmetryPivot.X - point.X,
            Y: symmetryPivot.Y - point.Y
        }
    }
}
