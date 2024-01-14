import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CanvasDraw2Service {
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
        X: 500,
        Y: 500,
        DEG: 0
    };
    offset = {
        X: 0,
        Y: 0
    };

    pointRadius = 2;
    curves = [
        {start: {x: 20, y: 110}, end: {x: 250, y: 20}, parameter: {x: 230, y: 150}}
    ]
    curvesSettings = {
        display_point: true,
        unite_points: false,
        wa: 1,
        wb: 1,
        wc: 1,
    }

    curvesStatus = false;

    isMouseDown = false;
    pickedPoint: any;
    pickedPointType: any;
    pickedPoints: any[];
    pickedCurves: any[];
    distanceToParameters: any[]


    constructor() {
    }

    setSettings(curvesSettings: any, curvesOffset: any, curvesPivot: any) {
        this.curvesSettings = curvesSettings;
        this.pivot = curvesPivot;
        this.offset = curvesOffset;
    }

    drawCurve(startPoint: any, endPoint: any, parameterPoint: any) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "black";

        const offsetedStartPoint = this.offsetPoint(startPoint);
        const offsetedParameterPoint = this.offsetPoint(parameterPoint);
        const offsetedEndPoint = this.offsetPoint(endPoint);

        const rotatedStartPoint = this.rotatePoint(offsetedStartPoint);
        const rotatedParameterPoint = this.rotatePoint(offsetedParameterPoint);
        const rotatedEndPoint = this.rotatePoint(offsetedEndPoint);

        this.ctx.moveTo(rotatedStartPoint.x, rotatedStartPoint.y);
        for (let i = 0.01; i < 1; i += 0.01) {
            const wa = this.curvesSettings.wa;
            const wc = this.curvesSettings.wc;
            const wb = this.curvesSettings.wb;
            let x = (rotatedStartPoint.x * wa * Math.pow((1 - i), 2) + 2 * rotatedParameterPoint.x * wb * i * (1 - i) + rotatedEndPoint.x * wc * i * i) / (wa * Math.pow((1 - i), 2) + 2 * wb * i * (1 - i) + wc * i * i);
            let y = (rotatedStartPoint.y * wa * Math.pow((1 - i), 2) + 2 * rotatedParameterPoint.y * wb * i * (1 - i) + rotatedEndPoint.y * wc * i * i) / (wa * Math.pow((1 - i), 2) + 2 * wb * i * (1 - i) + wc * i * i);
            this.ctx.lineTo(x, y);
        }
        this.ctx.lineTo(rotatedEndPoint.x, rotatedEndPoint.y);
        this.ctx.stroke();

        if (this.curvesSettings.display_point) {
            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "grey";
            this.ctx.moveTo(rotatedStartPoint.x, rotatedStartPoint.y);
            this.ctx.lineTo(rotatedParameterPoint.x, rotatedParameterPoint.y);
            this.ctx.lineTo(rotatedEndPoint.x, rotatedEndPoint.y);
            this.ctx.stroke();
        }
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

    drawScene(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D, status: boolean) {
        this.ctx = ctx;
        this.cvs = cvs;

        if (status) {
            this.curves = this.getCurves();
        }

        this.drawGrid();
        this.drawCurves();
    }

    drawPoints(point: any, color = 'green') {
        this.ctx.beginPath();
        this.ctx.lineWidth = 4;
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;

        const offsetedPoint = this.offsetPoint(point);
        const rotatedPoint = this.rotatePoint(offsetedPoint);
        this.ctx.arc(rotatedPoint.x, rotatedPoint.y, this.pointRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawCurves() {
        this.curves.forEach((point) => {
            this.drawCurve(point.start, point.end, point.parameter);
        })

        if (this.curvesSettings.display_point) {
            this.curves.forEach((point) => {
                this.drawPoints(point.start);
                this.drawPoints(point.end);
                this.drawPoints(point.parameter, 'red');
            })
        }
    }

    getMousePoint(e: any) {
        const mouseX = e.clientX - this.cvs.getBoundingClientRect().left;
        const mouseY = this.cvs.width - (e.clientY - this.cvs.getBoundingClientRect().top);
        const pivot = {
            ...this.pivot,
            DEG: -this.pivot.DEG
        }
        let point = {x: mouseX, y: mouseY};
        point.x -= this.offset.X
        point.y -= this.offset.Y
        point = this.rotatePoint(point, pivot)

        return point;
    }

    createHandlers() {
        const countVectorLength = (point_1: any, point_2: any) => {
            return Math.sqrt(Math.pow(2 * (point_2.x - point_1.x), 2) + Math.pow(2 * (point_2.y - point_1.y), 2));
        }

        const getNewParameter = (currentParameter: any, point: any, secondParameter: any) => {
            let t_x = 2*(currentParameter.x - point.x) / countVectorLength(currentParameter, point);
            let t_y = 2*(currentParameter.y - point.y) / countVectorLength(currentParameter, point);

            secondParameter.x = point.x - (t_x * countVectorLength(point, secondParameter))/2;
            secondParameter.y = point.y - (t_y * countVectorLength(point, secondParameter))/2;

            return secondParameter;
        }

        this.cvs.addEventListener('mousemove', (e) => {
            if (!this.isMouseDown) {
                return;
            }

            const point = this.getMousePoint(e)

            if (this.pickedPoints) {
                const isNodePoints = this.pickedPoints.every(p => p.node)
                const isCurvesHaveNodes = this.pickedCurves.every((curve) => {
                    return curve.start.node && curve.start.smooth || curve.end.node && curve.end.smooth
                })

                if (isNodePoints) {
                    this.pickedPoints.forEach((p) => {
                        p.x = point.x;
                        p.y = point.y;
                    })

                    const isSmoothPoints = this.pickedPoints.every(p => p.smooth)
                    if (isSmoothPoints) {
                        this.pickedCurves.forEach((curve, index) => {
                            curve.parameter.x = point.x + this.distanceToParameters[index].x;
                            curve.parameter.y = point.y + this.distanceToParameters[index].y;
                        })
                    }
                } else if (isCurvesHaveNodes && this.pickedPointType === 'parameter') {
                    this.pickedPoints.forEach((p) => {
                        p.x = point.x;
                        p.y = point.y;
                    })

                    this.pickedCurves.forEach((curve) => {
                        const nodePoint = curve.start.node && curve.start.smooth ? curve.start : curve.end.node && curve.end.smooth ? curve.end : null;

                        if (nodePoint) {
                            const secondCurve = this.curves.find((curves) => {
                                return (this.checkInPoint(curves.start, nodePoint) || this.checkInPoint(curves.end, nodePoint)) && !(curves.parameter.x === this.pickedPoints[0].x && curves.parameter.y === this.pickedPoints[0].y);
                            });

                            getNewParameter(this.pickedPoints[0], nodePoint, secondCurve!.parameter);
                        }
                    })
                } else  {
                    this.pickedPoints[0].x = point.x;
                    this.pickedPoints[0].y = point.y;
                }
            }
            this.redrawScene();
        });

        this.cvs.addEventListener('mousedown', (e) => {
            const point = this.getMousePoint(e)

            const pickedCurves = this.curves.filter((curves) => {
                return this.checkInPoint(curves.start, point) || this.checkInPoint(curves.end, point) || this.checkInPoint(curves.parameter, point)
            })

            if (pickedCurves.length) {
                this.pickedCurves = pickedCurves;

                this.pickedPoints = pickedCurves.map((curve: any) => {
                    if (this.checkInPoint(curve.start, point)) {
                        return curve.start;
                    } else if (this.checkInPoint(curve.end, point)) {
                        return curve.end;
                    } else if (this.checkInPoint(curve.parameter, point)) {
                        this.pickedPointType = 'parameter';
                        return curve.parameter;
                    }
                })

                const isNodeSmoothPoints = this.pickedPoints.every(p => p.node && p.smooth)
                if (isNodeSmoothPoints) { this.getDistancesToParameters(); }

                this.isMouseDown = true
            }
        });

        this.cvs.addEventListener('mouseup', (e) => {
            this.isMouseDown = false;
            this.pickedPoint = null;
            this.pickedPointType = undefined;
        });
    }

    getDistancesToParameters() {
        this.distanceToParameters = this.pickedCurves.map((curve) => {
            const x = curve.parameter.x - this.pickedPoints[0].x;
            const y = curve.parameter.y - this.pickedPoints[0].y;

            return {x, y};
        })
    }

    checkInPoint = (point: any, mousePoint: any) => {
        return point.x + this.pointRadius >= mousePoint.x && point.x - this.pointRadius <= mousePoint.x && point.y + this.pointRadius >= mousePoint.y && point.y - this.pointRadius <= mousePoint.y
    }

    addCurve() {
        this.curves.push({start: {x: 20, y: 110}, end: {x: 250, y: 20}, parameter: {x: 230, y: 150}})
        this.redrawScene();
    }

    redrawScene() {
        this.saveCurves();
        this.ctx.setTransform(1, 0, 0, -1, 0, this.cvs.height);
        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)
        this.drawScene(this.cvs, this.ctx, false)
    }

    saveCurves() {
        localStorage.setItem('curvesLR3', JSON.stringify(this.curves));
    }

    getSavedCurves() {
        const res = localStorage.getItem('curvesLR3')
        if (res) {
            this.curves = JSON.parse(res);
        }
    }

    getCurves() {
        return [{
            "start": {"x": 320.5, "y": 479.5,  "node": true, "smooth": false},
            "end": {"x": 530.5714302062988, "y": 755.2857055664062},
            "parameter": {"x": 213, "y": 686.875}
        }, {
            "start": {"x": 247, "y": 155.875},
            "end": {"x": 222.5, "y": 392.5, "node": true, "smooth": true},
             "parameter": {"x": 77.55554962158203, "y": 185.55555725097656}
        }, {
            "start": {"x": 621, "y": 794},
            "end": {"x": 564, "y": 767},
            "parameter": {"x": 589, "y": 794}
        }, {
            "start": {"x": 700, "y": 828.875},
            "end": {"x": 805, "y": 735.875},
            "parameter": {"x": 800, "y": 820.875}
        }, {
            "start": {"x": 700, "y": 832.5555572509766},
            "end": {"x": 755, "y": 815.875},
            "parameter": {"x": 740, "y": 884.5555572509766}
        }, {
            "start": {"x": 547.5714302062988, "y": 755.2857055664062},
            "end": {"x": 326, "y": 480.8},
            "parameter": {"x": 241, "y": 669.875}
        }, {
            "start": {"x": 530, "y": 755.3333282470703},
            "end": {"x": 547, "y": 754.875},
            "parameter": {"x": 570, "y": 767.3333282470703}
        }, {
            "start": {"x": 650.555549621582, "y": 782.5555572509766},
            "end": {"x": 631.555549621582, "y": 844.5555572509766},
            "parameter": {"x": 592.555549621582, "y": 813.5555572509766}
        }, {
            "start": {"x": 631.555549621582, "y": 844.5555572509766},
            "end": {"x": 692, "y": 798.5555572509766},
            "parameter": {"x": 669.555549621582, "y": 862.5555572509766}
        }, {
            "start": {"x": 588.555549621582, "y": 645.5555572509766},
            "end": {"x": 659.555549621582, "y": 572.5555572509766},
            "parameter": {"x": 623.555549621582, "y": 585.5555572509766}
        }, {
            "start": {"x": 598.555549621582, "y": 654.5555572509766},
            "end": {"x": 659.555549621582, "y": 572.5555572509766},
            "parameter": {"x": 618.555549621582, "y": 613.5555572509766}
        }, {
            "start": {"x": 588.555549621582, "y": 645.5555572509766},
            "end": {"x": 598.555549621582, "y": 654.5555572509766},
            "parameter": {"x": 592.555549621582, "y": 651.5555572509766}
        }, {
            "start": {"x": 675.555549621582, "y": 584.5555572509766},
            "end": {"x": 686.555549621582, "y": 688.5555572509766},
            "parameter": {"x": 653.555549621582, "y": 612.5555572509766}
        }, {
            "start": {"x": 701.555549621582, "y": 683.5555572509766},
            "end": {"x": 676.555549621582, "y": 584.5555572509766},
            "parameter": {"x": 665.555549621582, "y": 642.5555572509766}
        }, {
            "start": {"x": 686.555549621582, "y": 688.5555572509766},
            "end": {"x": 701.555549621582, "y": 683.5555572509766},
            "parameter": {"x": 695.555549621582, "y": 688.5555572509766}
        }, {
            "start": {"x": 602.555549621582, "y": 620.5555572509766},
            "end": {"x": 567.555549621582, "y": 574.5555572509766},
            "parameter": {"x": 546.555549621582, "y": 591.5555572509766}
        }, {
            "start": {"x": 567.555549621582, "y": 574.5555572509766},
            "end": {"x": 601.555549621582, "y": 619.5555572509766},
            "parameter": {"x": 578.555549621582, "y": 593.5555572509766}
        }, {
            "start": {"x": 537.555549621582, "y": 605.5555572509766},
            "end": {"x": 498.55554962158203, "y": 437.55555725097656},
            "parameter": {"x": 602.555549621582, "y": 548.5555572509766}
        }, {
            "start": {"x": 538.555549621582, "y": 604.5555572509766},
            "end": {"x": 488.55554962158203, "y": 444.55555725097656},
            "parameter": {"x": 580.555549621582, "y": 524.5555572509766}
        }, {
            "start": {"x": 488.55554962158203, "y": 444.55555725097656},
            "end": {"x": 498.55554962158203, "y": 437.55555725097656},
            "parameter": {"x": 493.55554962158203, "y": 441.55555725097656}
        }, {
            "start": {"x": 348.55554962158203, "y": 462.55555725097656},
            "end": {"x": 473.55554962158203, "y": 445.55555725097656},
            "parameter": {"x": 391.55554962158203, "y": 423.55555725097656}
        }, {
            "start": {"x": 347.55554962158203, "y": 462.55555725097656},
            "end": {"x": 482.55554962158203, "y": 430.55555725097656},
            "parameter": {"x": 373.55554962158203, "y": 417.55555725097656}
        }, {
            "start": {"x": 473.55554962158203, "y": 447.55555725097656},
            "end": {"x": 482.55554962158203, "y": 430.55555725097656},
            "parameter": {"x": 477.55554962158203, "y": 439.55555725097656}
        }, {
            "start": {"x": 335.55554962158203, "y": 458.55555725097656},
            "end": {"x": 241.55554962158203, "y": 258.55555725097656},
            "parameter": {"x": 195.55554962158203, "y": 328.55555725097656}
        }, {
            "start": {"x": 336.55554962158203, "y": 457.55555725097656},
            "end": {"x": 247.55554962158203, "y": 263.55555725097656},
            "parameter": {"x": 206.55554962158203, "y": 315.55555725097656}
        }, {
            "start": {"x": 247.55554962158203, "y": 264.55555725097656},
            "end": {"x": 268.55554962158203, "y": 265.55555725097656},
            "parameter": {"x": 291.55554962158203, "y": 293.55555725097656}
        }, {
            "start": {"x": 268.55554962158203, "y": 265.55555725097656},
            "end": {"x": 285.55554962158203, "y": 265.55555725097656},
            "parameter": {"x": 277.55554962158203, "y": 267.55555725097656}
        }, {
            "start": {"x": 283.55554962158203, "y": 265.55555725097656},
            "end": {"x": 271.55554962158203, "y": 245.55555725097656},
            "parameter": {"x": 368.55554962158203, "y": 309.55555725097656}
        }, {
            "start": {"x": 238.55554962158203, "y": 170.55555725097656},
            "end": {"x": 238.55554962158203, "y": 392.55555725097656, "node": true, "smooth": true},
            "parameter": {"x": 101.55554962158203, "y": 197.55555725097656}
        }, {
            "start": {"x": 238.55554962158203, "y": 171.55555725097656},
            "end": {"x": 247.55554962158203, "y": 155.55555725097656},
            "parameter": {"x": 245, "y": 162.55555725097656}
        }, {
            "start": {"x": 222.5, "y": 392.5, "node": true, "smooth": true},
            "end": {"x": 320.5, "y": 479.5, "node": true, "smooth": false},
            "parameter": {"x": 266.55554962158203, "y": 441.55555725097656}
        }, {
            "start": {"x": 238.55554962158203, "y": 392.55555725097656, "node": true, "smooth": true},
            "end": {"x": 326, "y": 480.8, "node": true, "smooth": false},
            "parameter": {"x": 259.55554962158203, "y": 420.55555725097656}
        }, {
            "start": {"x": 418, "y": 250.55555725097656, "node": true, "smooth": true},
            "end": {"x": 240, "y": 172.55555725097656},
            "parameter": {"x": 345, "y": 167.55555725097656}
        }, {
            "start": {"x": 240, "y": 172.55555725097656},
            "end": {"x": 412, "y": 257.5, "node": true, "smooth": true},
            "parameter": {"x": 351, "y": 182.55555725097656}
        }, {
            "start": {"x": 420, "y": 314.55555725097656, "node": true, "smooth": false},
            "end": {"x": 417, "y": 249.55555725097656, "node": true, "smooth": true},
            "parameter": {"x": 442, "y": 290.55555725097656}
        }, {
            "start": {"x": 408, "y": 305.55555725097656},
            "end": {"x": 412, "y": 257.5, "node": true, "smooth": true},
            "parameter": {"x": 435, "y": 298.55555725097656}
        }, {
            "start": {"x": 400, "y": 289.55555725097656},
            "end": {"x": 422, "y": 314.55555725097656, "node": true, "smooth": false},
            "parameter": {"x": 402, "y": 309.55555725097656}
        }, {
            "start": {"x": 323, "y": 261.55555725097656},
            "end": {"x": 362, "y": 298.55555725097656},
            "parameter": {"x": 303, "y": 278.55555725097656}
        }, {
            "start": {"x": 323, "y": 261.55555725097656},
            "end": {"x": 355, "y": 291.55555725097656},
            "parameter": {"x": 338, "y": 284.55555725097656}
        }, {
            "start": {"x": 242, "y": 258.55555725097656},
            "end": {"x": 253, "y": 251.55555725097656},
            "parameter": {"x": 262, "y": 269.55555725097656}
        }, {
            "start": {"x": 253, "y": 252.55555725097656},
            "end": {"x": 272, "y": 245.55555725097656},
            "parameter": {"x": 277, "y": 267.55555725097656}
        }, {
            "start": {"x": 355, "y": 291.55555725097656},
            "end": {"x": 395, "y": 307.55555725097656},
            "parameter": {"x": 343, "y": 251.55555725097656}
        }, {
            "start": {"x": 361, "y": 297.55555725097656},
            "end": {"x": 395, "y": 307.55555725097656},
            "parameter": {"x": 394, "y": 314.55555725097656}
        }, {
            "start": {"x": 621, "y": 793.5555572509766},
            "end": {"x": 576, "y": 760.5555572509766},
            "parameter": {"x": 587, "y": 782.5555572509766}
        }, {
            "start": {"x": 564, "y": 767.5555572509766},
            "end": {"x": 576, "y": 760.5555572509766},
            "parameter": {"x": 567, "y": 760.5555572509766}
        }, {
            "start": {"x": 655, "y": 759.5555572509766},
            "end": {"x": 746, "y": 700.5555572509766},
            "parameter": {"x": 615, "y": 674.5555572509766}
        }, {
            "start": {"x": 664, "y": 750.5555572509766},
            "end": {"x": 745, "y": 702.5555572509766},
            "parameter": {"x": 628, "y": 689.5555572509766}
        }, {
            "start": {"x": 655, "y": 758.5555572509766},
            "end": {"x": 664, "y": 749.5555572509766},
            "parameter": {"x": 661, "y": 755.5555572509766}
        }, {
            "start": {"x": 745, "y": 701.5555572509766},
            "end": {"x": 797, "y": 694.5555572509766},
            "parameter": {"x": 766, "y": 667.5555572509766}
        }, {
            "start": {"x": 744, "y": 701.5555572509766},
            "end": {"x": 792, "y": 699.5555572509766},
            "parameter": {"x": 775, "y": 677.5555572509766}
        }, {
            "start": {"x": 696, "y": 821.5555572509766},
            "end": {"x": 802, "y": 723.5555572509766},
            "parameter": {"x": 786, "y": 822.5555572509766}
        }, {
            "start": {"x": 797, "y": 694.5555572509766},
            "end": {"x": 816, "y": 699.5555572509766},
            "parameter": {"x": 811, "y": 693.5555572509766}
        }, {
            "start": {"x": 803, "y": 722.5555572509766},
            "end": {"x": 816, "y": 699.5555572509766},
            "parameter": {"x": 815, "y": 708.5555572509766}
        }, {
            "start": {"x": 792, "y": 699.5555572509766},
            "end": {"x": 806, "y": 717.5555572509766},
            "parameter": {"x": 777, "y": 703.5555572509766}
        }, {
            "start": {"x": 802, "y": 722.5555572509766},
            "end": {"x": 805, "y": 735.5555572509766},
            "parameter": {"x": 820, "y": 708.5555572509766}
        }, {
            "start": {"x": 702, "y": 831.5555572509766},
            "end": {"x": 743, "y": 820.5555572509766},
            "parameter": {"x": 742, "y": 869.5555572509766}
        }, {
            "start": {"x": 702, "y": 832.5555572509766},
            "end": {"x": 696, "y": 820.5555572509766},
            "parameter": {"x": 687, "y": 833.5555572509766}
        }, {
            "start": {"x": 652, "y": 784.5555572509766},
            "end": {"x": 638, "y": 835.5555572509766},
            "parameter": {"x": 606, "y": 817.5555572509766}
        }, {
            "start": {"x": 636, "y": 835.5555572509766},
            "end": {"x": 680, "y": 798.5555572509766},
            "parameter": {"x": 675, "y": 845.5555572509766}
        }, {
            "start": {"x": 680, "y": 798.5555572509766},
            "end": {"x": 692, "y": 799.5555572509766},
            "parameter": {"x": 678, "y": 764.5555572509766}
        }, {
            "start": {"x": 691, "y": 653.5555572509766},
            "end": {"x": 708, "y": 612.5555572509766},
            "parameter": {"x": 691, "y": 617.5555572509766}
        }, {
            "start": {"x": 692, "y": 653.5555572509766},
            "end": {"x": 708, "y": 612.5555572509766},
            "parameter": {"x": 704, "y": 624.5555572509766}
        }, {
            "start": {"x": 715, "y": 611},
            "end": {"x": 743, "y": 603},
            "parameter": {"x": 721, "y": 632}
        }, {
            "start": {"x": 715, "y": 611},
            "end": {"x": 743, "y": 603},
            "parameter": {"x": 722, "y": 614}
        }, {
            "start": {"x": 693, "y": 582},
            "end": {"x": 737, "y": 570},
            "parameter": {"x": 720, "y": 593}
        }, {
            "start": {"x": 702, "y": 575},
            "end": {"x": 737, "y": 570},
            "parameter": {"x": 718, "y": 579}
        }, {
            "start": {"x": 719, "y": 574},
            "end": {"x": 704, "y": 564},
            "parameter": {"x": 751, "y": 548}
        }, {
            "start": {"x": 703, "y": 575},
            "end": {"x": 705, "y": 564},
            "parameter": {"x": 738, "y": 565}
        }, {
            "start": {"x": 671, "y": 552},
            "end": {"x": 715, "y": 545},
            "parameter": {"x": 695, "y": 555}
        }, {
            "start": {"x": 675, "y": 559},
            "end": {"x": 715, "y": 545},
            "parameter": {"x": 718, "y": 561}
        }, {
            "start": {"x": 675, "y": 560},
            "end": {"x": 671, "y": 552},
            "parameter": {"x": 654, "y": 581}
        }, {
            "start": {"x": 678, "y": 615},
            "end": {"x": 700, "y": 599},
            "parameter": {"x": 695, "y": 606}
        }, {
            "start": {"x": 679, "y": 615},
            "end": {"x": 699, "y": 590},
            "parameter": {"x": 691, "y": 594}
        }, {
            "start": {"x": 700, "y": 599},
            "end": {"x": 735, "y": 595},
            "parameter": {"x": 729, "y": 607}
        }, {
            "start": {"x": 699, "y": 590},
            "end": {"x": 734, "y": 594},
            "parameter": {"x": 715, "y": 598}
        }, {
            "start": {"x": 423, "y": 427},
            "end": {"x": 486, "y": 415},
            "parameter": {"x": 441, "y": 402}
        }, {
            "start": {"x": 486, "y": 415},
            "end": {"x": 530, "y": 401},
            "parameter": {"x": 508, "y": 405}
        }, {
            "start": {"x": 424, "y": 426},
            "end": {"x": 490, "y": 407},
            "parameter": {"x": 400, "y": 406}
        }, {
            "start": {"x": 488, "y": 409},
            "end": {"x": 530, "y": 400},
            "parameter": {"x": 500, "y": 395}
        }, {
            "start": {"x": 498, "y": 400},
            "end": {"x": 510, "y": 371},
            "parameter": {"x": 550, "y": 357}
        }, {
            "start": {"x": 382, "y": 435},
            "end": {"x": 364, "y": 413},
            "parameter": {"x": 395, "y": 424}
        }, {
            "start": {"x": 365, "y": 413},
            "end": {"x": 400, "y": 402},
            "parameter": {"x": 361, "y": 398}
        }, {
            "start": {"x": 400, "y": 402},
            "end": {"x": 462, "y": 371},
            "parameter": {"x": 421, "y": 396}
        }, {
            "start": {"x": 487, "y": 374},
            "end": {"x": 462, "y": 372},
            "parameter": {"x": 476, "y": 340}
        }, {
            "start": {"x": 488, "y": 373},
            "end": {"x": 510, "y": 370},
            "parameter": {"x": 513, "y": 348}
        }, {
            "start": {"x": 396, "y": 431},
            "end": {"x": 402, "y": 411},
            "parameter": {"x": 353, "y": 395}
        }, {
            "start": {"x": 402, "y": 411},
            "end": {"x": 469, "y": 379},
            "parameter": {"x": 433, "y": 396}
        }, {
            "start": {"x": 476, "y": 366},
            "end": {"x": 499, "y": 374},
            "parameter": {"x": 452, "y": 420}
        }, {"start": {"x": 498, "y": 377}, "end": {"x": 520, "y": 380}, "parameter": {"x": 479, "y": 403}}]
    }

    getOtherCurves() {
        return [{
            "start": {"x": 241, "y": 663},
            "end": {"x": 211, "y": 743},
            "parameter": {"x": 200, "y": 685.5}
        }, {
            "start": {"x": 348, "y": 785},
            "end": {"x": 353, "y": 833},
            "parameter": {"x": 356, "y": 801}
        }, {
            "start": {"x": 510, "y": 518.5},
            "end": {"x": 529, "y": 487.5},
            "parameter": {"x": 519, "y": 503.5}
        }, {
            "start": {"x": 775, "y": 742},
            "end": {"x": 801, "y": 780},
            "parameter": {"x": 788, "y": 776}
        }, {
            "start": {"x": 467, "y": 704},
            "end": {"x": 488, "y": 697},
            "parameter": {"x": 481, "y": 707}
        }, {
            "start": {"x": 218, "y": 815},
            "end": {"x": 263, "y": 768},
            "parameter": {"x": 246, "y": 797}
        }, {
            "start": {"x": 211, "y": 743},
            "end": {"x": 218, "y": 815},
            "parameter": {"x": 198, "y": 774}
        }, {
            "start": {"x": 541, "y": 492.5},
            "end": {"x": 521, "y": 531.5},
            "parameter": {"x": 521, "y": 510.5}
        }, {
            "start": {"x": 560, "y": 749},
            "end": {"x": 601, "y": 746},
            "parameter": {"x": 576, "y": 752}
        }, {
            "start": {"x": 269, "y": 768.5},
            "end": {"x": 286, "y": 771.5},
            "parameter": {"x": 291, "y": 717.5}
        }, {
            "start": {"x": 499, "y": 509.5},
            "end": {"x": 545, "y": 549.5},
            "parameter": {"x": 516, "y": 538.5}
        }, {
            "start": {"x": 295, "y": 771.5},
            "end": {"x": 311, "y": 773.5},
            "parameter": {"x": 309, "y": 722.5}
        }, {
            "start": {"x": 663, "y": 617},
            "end": {"x": 569, "y": 612},
            "parameter": {"x": 536, "y": 556}
        }, {
            "start": {"x": 717, "y": 632},
            "end": {"x": 666, "y": 638},
            "parameter": {"x": 646, "y": 600}
        }, {
            "start": {"x": 486, "y": 656},
            "end": {"x": 518, "y": 621},
            "parameter": {"x": 414, "y": 615}
        }, {
            "start": {"x": 352, "y": 745.5},
            "end": {"x": 354, "y": 735.5},
            "parameter": {"x": 355, "y": 741.5}
        }, {
            "start": {"x": 220, "y": 814.5},
            "end": {"x": 211, "y": 741.5},
            "parameter": {"x": 264, "y": 760.5}
        }, {
            "start": {"x": 372, "y": 729.5},
            "end": {"x": 400, "y": 739.5},
            "parameter": {"x": 386, "y": 735.5}
        }, {
            "start": {"x": 380, "y": 718.5},
            "end": {"x": 404, "y": 721.5},
            "parameter": {"x": 394, "y": 722.5}
        }, {
            "start": {"x": 243, "y": 726.5},
            "end": {"x": 241, "y": 717.5},
            "parameter": {"x": 244, "y": 722.5}
        }, {
            "start": {"x": 227, "y": 641.5},
            "end": {"x": 215, "y": 628.5},
            "parameter": {"x": 252, "y": 617.5}
        }, {
            "start": {"x": 231, "y": 682.5},
            "end": {"x": 203, "y": 670.5},
            "parameter": {"x": 213, "y": 683.5}
        }, {
            "start": {"x": 197, "y": 694.5},
            "end": {"x": 230, "y": 697.5},
            "parameter": {"x": 213, "y": 701.5}
        }, {
            "start": {"x": 240, "y": 579.5},
            "end": {"x": 271, "y": 525.5},
            "parameter": {"x": 307, "y": 587.5}
        }, {
            "start": {"x": 342, "y": 655.5},
            "end": {"x": 310, "y": 562.5},
            "parameter": {"x": 341, "y": 430.5}
        }, {
            "start": {"x": 308, "y": 562.5},
            "end": {"x": 301, "y": 529.5},
            "parameter": {"x": 299, "y": 545.5}
        }, {
            "start": {"x": 301, "y": 529.5},
            "end": {"x": 254, "y": 512.5},
            "parameter": {"x": 337, "y": 510.5}
        }, {
            "start": {"x": 315, "y": 623.5},
            "end": {"x": 310, "y": 562.5},
            "parameter": {"x": 320, "y": 598.5}
        }, {
            "start": {"x": 379, "y": 759.5},
            "end": {"x": 323, "y": 774},
            "parameter": {"x": 354, "y": 895}
        }, {
            "start": {"x": 380, "y": 759.5},
            "end": {"x": 348, "y": 785},
            "parameter": {"x": 363, "y": 790}
        }, {
            "start": {"x": 254, "y": 512.5},
            "end": {"x": 241, "y": 663},
            "parameter": {"x": 151, "y": 568}
        }, {
            "start": {"x": 323, "y": 774},
            "end": {"x": 263, "y": 768},
            "parameter": {"x": 297, "y": 782}
        }, {
            "start": {"x": 342, "y": 656},
            "end": {"x": 379, "y": 759.5},
            "parameter": {"x": 415, "y": 681}
        }, {
            "start": {"x": 309, "y": 713.5},
            "end": {"x": 293, "y": 693.5},
            "parameter": {"x": 315, "y": 687.5}
        }, {
            "start": {"x": 192, "y": 614.5},
            "end": {"x": 210, "y": 546.5},
            "parameter": {"x": 191, "y": 551.5}
        }, {
            "start": {"x": 239, "y": 518.5},
            "end": {"x": 172, "y": 597.5},
            "parameter": {"x": 160, "y": 503.5}
        }, {
            "start": {"x": 341, "y": 655.5},
            "end": {"x": 240, "y": 663.5},
            "parameter": {"x": 300, "y": 639.5}
        }, {
            "start": {"x": 309, "y": 712.5},
            "end": {"x": 331, "y": 703.5},
            "parameter": {"x": 320, "y": 691.5}
        }, {
            "start": {"x": 299, "y": 713.5},
            "end": {"x": 315, "y": 716.5},
            "parameter": {"x": 310, "y": 709.5}
        }, {
            "start": {"x": 269, "y": 525.5},
            "end": {"x": 281, "y": 609.5},
            "parameter": {"x": 293, "y": 549.5}
        }, {
            "start": {"x": 270, "y": 524.5},
            "end": {"x": 301, "y": 528.5},
            "parameter": {"x": 290, "y": 536.5}
        }, {
            "start": {"x": 203, "y": 593.5},
            "end": {"x": 224, "y": 602.5},
            "parameter": {"x": 227, "y": 584.5}
        }, {
            "start": {"x": 204, "y": 606.5},
            "end": {"x": 224, "y": 601.5},
            "parameter": {"x": 222, "y": 618.5}
        }, {
            "start": {"x": 473, "y": 678},
            "end": {"x": 632, "y": 640},
            "parameter": {"x": 533, "y": 571}
        }, {
            "start": {"x": 172, "y": 597.5},
            "end": {"x": 192, "y": 614.5},
            "parameter": {"x": 188, "y": 638.5}
        }, {
            "start": {"x": 474, "y": 679},
            "end": {"x": 520, "y": 740},
            "parameter": {"x": 480, "y": 720}
        }, {
            "start": {"x": 520, "y": 740},
            "end": {"x": 557, "y": 750},
            "parameter": {"x": 521, "y": 808}
        }, {
            "start": {"x": 648, "y": 715},
            "end": {"x": 757, "y": 765},
            "parameter": {"x": 700, "y": 816}
        }, {
            "start": {"x": 703, "y": 620},
            "end": {"x": 773, "y": 624},
            "parameter": {"x": 714, "y": 588}
        }, {
            "start": {"x": 719, "y": 632},
            "end": {"x": 734, "y": 688},
            "parameter": {"x": 707, "y": 687}
        }, {
            "start": {"x": 758, "y": 765},
            "end": {"x": 825, "y": 813},
            "parameter": {"x": 779, "y": 832}
        }, {
            "start": {"x": 518, "y": 703},
            "end": {"x": 503, "y": 709},
            "parameter": {"x": 514, "y": 728}
        }, {
            "start": {"x": 568, "y": 678},
            "end": {"x": 590, "y": 673},
            "parameter": {"x": 583, "y": 677}
        }, {
            "start": {"x": 569, "y": 696},
            "end": {"x": 593, "y": 689},
            "parameter": {"x": 580, "y": 725}
        }, {
            "start": {"x": 773, "y": 624},
            "end": {"x": 759, "y": 763},
            "parameter": {"x": 805, "y": 705}
        }, {
            "start": {"x": 570, "y": 666},
            "end": {"x": 587, "y": 662},
            "parameter": {"x": 579, "y": 670}
        }, {
            "start": {"x": 481, "y": 684},
            "end": {"x": 463, "y": 684},
            "parameter": {"x": 471, "y": 689}
        }, {
            "start": {"x": 602, "y": 747},
            "end": {"x": 652, "y": 690},
            "parameter": {"x": 634, "y": 819}
        }, {
            "start": {"x": 634, "y": 643},
            "end": {"x": 653, "y": 690},
            "parameter": {"x": 647, "y": 660}
        }, {
            "start": {"x": 801, "y": 778},
            "end": {"x": 826, "y": 813},
            "parameter": {"x": 844, "y": 805}
        }, {
            "start": {"x": 636, "y": 653},
            "end": {"x": 651, "y": 701},
            "parameter": {"x": 619, "y": 713}
        }, {
            "start": {"x": 521, "y": 681},
            "end": {"x": 545, "y": 674},
            "parameter": {"x": 531, "y": 661}
        }, {
            "start": {"x": 540, "y": 744},
            "end": {"x": 529, "y": 774},
            "parameter": {"x": 542, "y": 749}
        }, {
            "start": {"x": 500, "y": 640},
            "end": {"x": 461, "y": 639},
            "parameter": {"x": 498, "y": 630}
        }, {
            "start": {"x": 495, "y": 686},
            "end": {"x": 518, "y": 682},
            "parameter": {"x": 504, "y": 672}
        }, {
            "start": {"x": 630, "y": 726},
            "end": {"x": 624, "y": 773},
            "parameter": {"x": 635, "y": 753}
        }, {
            "start": {"x": 439, "y": 573.3333282470703},
            "end": {"x": 434, "y": 563.3333282470703},
            "parameter": {"x": 424, "y": 578.3333282470703}
        }, {
            "start": {"x": 559, "y": 750},
            "end": {"x": 520, "y": 740},
            "parameter": {"x": 537, "y": 755}
        }, {
            "start": {"x": 559, "y": 524.5},
            "end": {"x": 577, "y": 511.5},
            "parameter": {"x": 569, "y": 516.5}
        }, {
            "start": {"x": 439, "y": 573.3333282470703},
            "end": {"x": 432, "y": 564.3333282470703},
            "parameter": {"x": 445, "y": 562.3333282470703}
        }, {
            "start": {"x": 614, "y": 508.5},
            "end": {"x": 577, "y": 511.5},
            "parameter": {"x": 595, "y": 536.5}
        }, {
            "start": {"x": 775, "y": 645},
            "end": {"x": 779, "y": 710},
            "parameter": {"x": 737, "y": 656}
        }, {
            "start": {"x": 670, "y": 745},
            "end": {"x": 729, "y": 781},
            "parameter": {"x": 763, "y": 707}
        }, {
            "start": {"x": 621, "y": 733},
            "end": {"x": 610, "y": 731},
            "parameter": {"x": 616, "y": 735}
        }, {
            "start": {"x": 647, "y": 611},
            "end": {"x": 596, "y": 589},
            "parameter": {"x": 598, "y": 646}
        }, {
            "start": {"x": 399, "y": 569.5},
            "end": {"x": 423, "y": 569.5},
            "parameter": {"x": 410, "y": 544.5}
        }, {
            "start": {"x": 435, "y": 594.5},
            "end": {"x": 420, "y": 594.5},
            "parameter": {"x": 430, "y": 573.5}
        }, {
            "start": {"x": 399, "y": 569.5},
            "end": {"x": 423, "y": 569.5},
            "parameter": {"x": 409, "y": 589.5}
        }, {
            "start": {"x": 435, "y": 594.5},
            "end": {"x": 420, "y": 594.5},
            "parameter": {"x": 425, "y": 612.5}
        }, {
            "start": {"x": 472, "y": 548.5},
            "end": {"x": 497, "y": 480.5},
            "parameter": {"x": 454, "y": 506.5}
        }, {
            "start": {"x": 337, "y": 642.5},
            "end": {"x": 341, "y": 631.5},
            "parameter": {"x": 304, "y": 624.5}
        }, {
            "start": {"x": 394, "y": 595.5},
            "end": {"x": 410, "y": 595.5},
            "parameter": {"x": 402, "y": 608.5}
        }, {
            "start": {"x": 497, "y": 480.5},
            "end": {"x": 560, "y": 525.5},
            "parameter": {"x": 538, "y": 469.5}
        }, {
            "start": {"x": 497, "y": 480.5},
            "end": {"x": 472, "y": 548.5},
            "parameter": {"x": 475, "y": 501.5}
        }, {
            "start": {"x": 493, "y": 526.5},
            "end": {"x": 534, "y": 558.5},
            "parameter": {"x": 509, "y": 549.5}
        }, {
            "start": {"x": 394, "y": 595.5},
            "end": {"x": 410, "y": 595.5},
            "parameter": {"x": 396, "y": 580.5}
        }, {
            "start": {"x": 472, "y": 548.5},
            "end": {"x": 560, "y": 525.5},
            "parameter": {"x": 521, "y": 597.5}
        }, {
            "start": {"x": 484, "y": 559.5},
            "end": {"x": 512, "y": 480.5},
            "parameter": {"x": 489, "y": 509.5}
        }, {"start": {"x": 524, "y": 565.5}, "end": {"x": 488, "y": 543.5}, "parameter": {"x": 505, "y": 565.5}}]
    }

    playAnimation() {
        const dx = 0.03;
        const otherCurves = !this.curvesStatus ? this.getOtherCurves() : this.getCurves();

        const checkFunction = (point: number, point1: number) => {
            return +point.toFixed(1) === +point1.toFixed(1);
        }

        const check = this.curves.every((curve, index) => {
            const end = checkFunction(curve.end.x, otherCurves[index].end.x) && checkFunction(curve.end.y, otherCurves[index].end.y);
            const start = checkFunction(curve.start.y, otherCurves[index].start.y) && checkFunction(curve.start.y, otherCurves[index].start.y);
            const parameter = checkFunction(curve.parameter.y, otherCurves[index].parameter.y) && checkFunction(curve.parameter.y, otherCurves[index].parameter.y);

            return end && start && parameter;
        })

        console.log(check);
        if (check) {
            this.curves = !this.curvesStatus ? this.getOtherCurves() : this.getCurves();
            this.curvesStatus = !this.curvesStatus;
            return
        }

        this.curves = this.curves.map((curve, index) => {
            curve.end.x += (otherCurves[index].end.x - curve.end.x) * dx;
            curve.end.y += (otherCurves[index].end.y - curve.end.y) * dx;

            curve.start.x += (otherCurves[index].start.x - curve.start.x) * dx;
            curve.start.y += (otherCurves[index].start.y - curve.start.y) * dx;

            curve.parameter.x += (otherCurves[index].parameter.x - curve.parameter.x) * dx;
            curve.parameter.y += (otherCurves[index].parameter.y - curve.parameter.y) * dx;

            return curve;
        })

        this.redrawScene();
        requestAnimationFrame(() => this.playAnimation());
    }

    rotatePoint(point: any, pivot = this.pivot) {
        return {
            ...point,
            x: pivot.X + (point.x - pivot.X) * Math.cos(this.degToRad(pivot.DEG)) - (point.y - pivot.Y) * Math.sin(this.degToRad(pivot.DEG)),
            y: pivot.Y + (point.y - pivot.Y) * Math.cos(this.degToRad(pivot.DEG)) + (point.x - pivot.X) * Math.sin(this.degToRad(pivot.DEG))
        }
    }

    offsetPoint(point: any) {
        return {
            ...point,
            x: point.x + this.offset.X,
            y: point.y + this.offset.Y
        }
    }

    degToRad(deg: number) {
        return deg * Math.PI / 180;
    }
}
