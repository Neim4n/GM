import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CanvasDraw4Service {
    cvs: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    scale = 30;
    iterations = 100000;

    constructor() {
    }

    transformations = [
        {a: 0.787879, b: -0.424242, c: 0.242424, d: 0.859848, e: 1.758647, f: 1.408065, p: 0.895652, color: "blue"},
        {a: -0.121212, b: 0.257576, c: 0.151515, d: 0.053030, e: -6.721654, f: 1.377236, p: 0.052174, color: "red"},
        {a: 0.181818, b: -0.136364, c: 0.090909, d: 0.181818, e: 6.086107, f: 1.568035, p: 0.052174, color: "green"}
    ]

    setSettings(fractal: any) {
        this.scale = fractal.scale;
        this.iterations = fractal.iterations;
    }

    drawScene(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.cvs = cvs;

        this.drawCurve();
    }

    drawCurve() {
        let params;
        let point = {x: 0, y: 0,}

        for (let iter = 0; iter < this.iterations; iter++) {
            const random = Math.random();

            if (this.transformations[0].p >= random) {
                params = this.transformations[0];
            } else if (this.transformations[0].p + this.transformations[1].p >= random && random > this.transformations[0].p) {
                params = this.transformations[1];
            } else if (this.transformations[0].p + this.transformations[1].p + this.transformations[2].p >= random && random > this.transformations[0].p + this.transformations[1].p) {
                params = this.transformations[2];
            }

            point = this.applyTransformation(point, params);
            this.drawPoint(point, this.scale);
        }
    }

    playAnimation(iterations: any) {
        if (300 === iterations) {
            return;
        }

        let params;
        let point = {x: 0, y: 0,}

        for (let iter = 0; iter < iterations; iter++) {
            const random = Math.random();

            if (this.transformations[0].p >= random) {
                params = this.transformations[0];
            } else if (this.transformations[0].p + this.transformations[1].p >= random && random > this.transformations[0].p) {
                params = this.transformations[1];
            } else if (this.transformations[0].p + this.transformations[1].p + this.transformations[2].p >= random && random > this.transformations[0].p + this.transformations[1].p) {
                params = this.transformations[2];
            }

            point = this.applyTransformation(point, params);
            this.drawPoint(point, this.scale);
        }

        iterations++;
        requestAnimationFrame(() => this.playAnimation(iterations));
    }

    applyTransformation(point: any, params: any) {
        const x = (params.a * point.x) + (params.b * point.y) + params.e
        const y = (params.c * point.x) + (params.d * point.y) + params.f

        return {
            x: x,
            y: y,
            color: params.color
        }
    }

    drawPoint(point: any, scale: any) {
        this.ctx.fillStyle = point.color;
        this.ctx.fillRect(point.x * scale + 500 - scale * 2, point.y * scale + 500 - scale * 2, 1, 1)
    }
}
