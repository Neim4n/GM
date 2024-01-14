import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CanvasDrawService } from "../../core/canvas-draw.service";
import { CanvasDraw1Service } from "../../core1/canvas-draw1.service";
import { CanvasDraw2Service } from "../../core2/canvas-draw2.service";
import { CanvasDraw3Service } from "../../core3/canvas-draw3.service";
import { CanvasDraw4Service } from "../../core4/canvas-draw4.service";

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, AfterViewInit {
    @ViewChild('canvasElement') canvas: ElementRef;

    numberLR = 5;

    //LR1
    gridScale = 20
    figure = {
        A: {X: 100, Y: 100},
        B: {X: 210, Y: 100},
        C: {X: 210, Y: 63},
        D: {X: 175, Y: 63},
        E: {X: 175, Y: 78},
        F: {X: 135, Y: 78},
        G: {X: 135, Y: 63},
        H: {X: 100, Y: 63},
        R1: {X: 111, Y: 90, Rx: 15, Ry: 15, rotate: 0},
        R2: {X: 199, Y: 90, Rx: 15, Ry: 15, rotate: 0},
    };
    pivot = {
        X: 155,
        Y: 90,
        DEG: 0
    }
    offset = {
        X: 0,
        Y: 0,
    }
    scale = {
        X: 1,
        Y: 1,
    }
    symmetry = {
        X: 400,
        Y: 400,
    }
    affine = {
        X: {
            X: 10,
            Y: 0,
        },
        Y: {
            X: 0,
            Y: 10
        },
        O: {
            X: 0,
            Y: 0,
        }
    }
    projective = {
        X: {
            X: 100,
            Y: 0,
            w: 3,
        },
        Y: {
            X: 0,
            Y: 200,
            w: 1
        },
        O: {
            X: 0,
            Y: 0,
            w: 500
        }
    }
    transformationMode = 'affine';

    //LR2
    curve = {
        a: 50,
        a_min: 10,
        a_max: 30,
        X0: 250,
        Y0: 250,
        arc_length: 0,
        square: 0,
        radius: 0,
        speed_build: 2,
        display_helpers: true,
    }
    curvePivot = {
        X: 250,
        Y: 250,
        DEG: 0
    }
    curveOffset = {
        X: 0,
        Y: 0,
    }
    curveTangentNormal = {
        X: 500,
        tangent: true,
        normal: true,
        inflections: true
    }

    //LR3
    curvesSettings = {
        display_point: true,
        unite_points: false,
        wa: 1,
        wb: 1,
        wc: 1,
    }
    curvesPivot = {
        X: 500,
        Y: 500,
        DEG: 0
    }
    curvesOffset = {
        X: 0,
        Y: 0,
    }

    //LR5
    projection = {
        F: 1,
        B: 45,
        A: 30
    }
    cube = {
        X: 100,
        Y: 100,
        Z: 100
    }
    offsetCube = {
        x: 0,
        y: 0,
        z: 0
    }
    rotationCube = {
        Ox: 0,
        Oy: 0,
        Oz: 0
    }
    animationCube = {
        x: 0,
        y: 0,
        z: 0,
        Ox: 0,
        Oy: 0,
        Oz: 0
    }

    //LR7
    fractal = {
        scale: 30,
        iterations: 100000
    }

    constructor(
        private canvasDrawService: CanvasDrawService,
        private canvasDraw1Service: CanvasDraw1Service,
        private canvasDraw2Service: CanvasDraw2Service,
        private canvasDraw3Service: CanvasDraw3Service,
        private canvasDraw4Service: CanvasDraw4Service
    ) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.drawCanvas(true);
    }

    changeInput() {
        this.drawCanvas(false);
    }

    onChangeSelect(event: any) {
        this.numberLR = event.target.value;
        this.drawCanvas(false);
    }

    onChangeSlider() {
        this.curve.radius = this.canvasDraw1Service.calculateRadiusOfCurvature(this.curveTangentNormal.X);
        this.canvasDraw1Service.onSlider(this.curveTangentNormal.X);
    }

    drawCanvas(status: boolean) {
        const cvs = this.canvas.nativeElement;
        const ctx = cvs.getContext('2d');
        console.log(this.curve.display_helpers);

        if (status) {
            ctx.transform(1, 0, 0, -1, 0, cvs.height);
        }

        ctx.setTransform(1, 0, 0, -1, 0, cvs.height);
        ctx.clearRect(0, 0, cvs.width, cvs.height);

        if (+this.numberLR === 1) {
            this.canvasDrawService.setSettings(this.figure, this.pivot, this.offset, this.gridScale, this.scale, this.affine, this.projective, this.transformationMode, this.symmetry)
            this.canvasDrawService.drawGrid(cvs, ctx);
            this.canvasDrawService.drawScene(ctx);
        } else if (+this.numberLR === 2) {
            this.canvasDraw1Service.setSettings(this.curve, this.curvePivot, this.curveOffset, this.curveTangentNormal);
            this.canvasDraw1Service.drawScene(cvs, ctx);

            this.curve.arc_length = this.canvasDraw1Service.calculateArcLength();
            this.curve.square = this.canvasDraw1Service.calculateSquare();
            this.curve.radius = this.canvasDraw1Service.calculateRadiusOfCurvature(this.curveTangentNormal.X);
            if (status) {
                this.canvasDraw1Service.createHandlers();
            }
        } else if (+this.numberLR === 3) {
            this.canvasDraw2Service.setSettings(this.curvesSettings, this.curvesOffset, this.curvesPivot);
            this.canvasDraw2Service.drawScene(cvs, ctx, status);

            if (status) {
                this.canvasDraw2Service.createHandlers();
            }
        } else if (+this.numberLR === 5) {
            this.canvasDraw3Service.setSettings(this.projection, this.cube, this.offsetCube, this.rotationCube, this.animationCube);
            this.canvasDraw3Service.drawScene(cvs, ctx)
        }  else if (+this.numberLR === 7) {
            this.canvasDraw4Service.setSettings(this.fractal);
            this.canvasDraw4Service.drawScene(cvs, ctx)
        }
    }

    playAnimationParameter() {
        this.curve.a = this.curve.a_max;
        requestAnimationFrame(() => this.canvasDraw1Service.drawCurveAnimationParameter(this.curve.a_min*2, this.curve.a_max*2));
    }

    playAnimationBuild() {
        requestAnimationFrame(() => this.canvasDraw1Service.drawCurveAnimation(-1000, 1000, this.curve.speed_build));
    }

    addCurveLr3(){
        this.canvasDraw2Service.addCurve();
    }

    playAnimationLr3(){
        this.canvasDraw2Service.playAnimation();
    }

    playAnimationLr4(){
        this.offsetCube.x = this.animationCube.x;
        this.offsetCube.y = this.animationCube.y;
        this.offsetCube.z = this.animationCube.z;

        this.rotationCube.Ox = this.animationCube.Ox;
        this.rotationCube.Oy = this.animationCube.Oy;
        this.rotationCube.Oz = this.animationCube.Oz;

        this.canvasDraw3Service.playAnimation(0);
    }

    playAnimationLr7(){
        const cvs = this.canvas.nativeElement;
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        this.canvasDraw4Service.playAnimation(0);
    }
}
