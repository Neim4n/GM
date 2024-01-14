import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CanvasDraw3Service {
    cvs: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    pointRadius = 2;

    F = 1;
    B = 45;
    A = 30;

    X = 100;
    Y = 100;
    Z = 100;
    cube: any;

    offset: any
    rotation: any
    animationCube: any

    constructor() {
    }

    setSettings(projection: any, cube: any, offset: any, rotation: any, animation: any) {
        this.F = projection.F;
        this.A = projection.A;
        this.B = projection.B;

        this.X = cube.X;
        this.Y = cube.Y;
        this.Z = cube.Z;

        this.offset = offset;
        this.rotation = rotation;
        this.animationCube = animation;

        this.setCube();
    }

    setCube() {
        this.cube = [
            {x: 0, y: 0, z: 0, w: 1},
            {x: this.X, y: 0, z: 0, w: 1},
            {x: this.X, y: this.Y, z: 0, w: 1},
            {x: 0, y: this.Y, z: 0, w: 1},
            {x: 0, y: 0, z: 0, w: 1},

            {x: 0, y: 0, z: this.Z, w: 1},
            {x: this.X, y: 0, z: this.Z, w: 1},
            {x: this.X, y: this.Y, z: this.Z, w: 1},
            {x: 0, y: this.Y, z: this.Z, w: 1},
            {x: 0, y: 0, z: this.Z, w: 1},

            {x: this.X, y: 0, z: this.Z, w: 1},
            {x: this.X, y: 0, z: 0, w: 1},
            {x: this.X, y: this.Y, z: this.Z, w: 1},
            {x: this.X, y: this.Y, z: 0, w: 1},
            {x: 0, y: this.Y, z: this.Z, w: 1},
            {x: 0, y: this.Y, z: 0, w: 1},
        ]

        this.cube.forEach((point: any) => {
            point.x = point.x + this.offset.x;
            point.y = point.y + this.offset.y;
            point.z = point.z + this.offset.z;
        })

        this.cube.forEach((point: any) => {
            const rotationPoint = {
                x: this.offset.x + this.X / 2,
                y: this.offset.y + this.Y / 2,
                z: this.offset.z + this.Z / 2
            }

            const newPoint = this.rotatePoint3D(point, rotationPoint)

            point.x = newPoint.x;
            point.y = newPoint.y;
            point.z = newPoint.z;
        })
    }

    rotatePoint3D(pointToRotate: any, centerOfRotation: any, animation?: any) {
        // Convert angles to radians
        const radianX = this.degToRad(animation?.Ox || this.rotation.Ox);
        const radianY = this.degToRad(animation?.Oy || this.rotation.Oy);
        const radianZ = this.degToRad(animation?.Oz || this.rotation.Oz);

        // Translate point to origin
        const translatedPoint = {
            x: pointToRotate.x - centerOfRotation.x,
            y: pointToRotate.y - centerOfRotation.y,
            z: pointToRotate.z - centerOfRotation.z
        };

        // Rotate around x-axis
        const rotatedX = translatedPoint.x;
        const rotatedY = translatedPoint.y * Math.cos(radianX) - translatedPoint.z * Math.sin(radianX);
        const rotatedZ = translatedPoint.y * Math.sin(radianX) + translatedPoint.z * Math.cos(radianX);

        // Rotate around y-axis
        const rotatedX2 = rotatedX * Math.cos(radianY) + rotatedZ * Math.sin(radianY);
        const rotatedY2 = rotatedY;
        const rotatedZ2 = -rotatedX * Math.sin(radianY) + rotatedZ * Math.cos(radianY);

        // Rotate around z-axis
        const rotatedX3 = rotatedX2 * Math.cos(radianZ) - rotatedY2 * Math.sin(radianZ);
        const rotatedY3 = rotatedX2 * Math.sin(radianZ) + rotatedY2 * Math.cos(radianZ);
        const rotatedZ3 = rotatedZ2;

        // Translate back to the original position
        const finalPoint = {
            x: rotatedX3 + centerOfRotation.x,
            y: rotatedY3 + centerOfRotation.y,
            z: rotatedZ3 + centerOfRotation.z,
            w: pointToRotate.w
        };

        return finalPoint;
    }

    redrawScene() {
        this.ctx.setTransform(1, 0, 0, -1, 0, this.cvs.height);
        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)
        this.drawScene(this.cvs, this.ctx)
    }

    drawScene(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.cvs = cvs;

        this.drawAxes();
        this.drawCube();
    }

    // Function to draw XYZ axes
    drawAxes() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#1cb710';
        this.ctx.moveTo(this.cvs.width / 2, this.cvs.height / 2);
        const xAxis = this.countCoordinate({x: 500, y: 0, z: 0, w: 1})
        this.ctx.lineTo(this.cvs.width / 2 + xAxis.x, this.cvs.height / 2 + xAxis.y); // X-axis
        this.ctx.fillText("X", this.cvs.width / 2 + xAxis.x - 10, this.cvs.height / 2 + xAxis.y + 10);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillStyle = '#1cb710';
        for (let i = 50; i <= 500; i += 50) {
            const xAxis = this.countCoordinate({x: i, y: 0, z: 0, w: 1});
            this.ctx.arc(this.cvs.width / 2 + xAxis.x, this.cvs.height / 2 + xAxis.y, this.pointRadius, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#c41515';
        this.ctx.moveTo(this.cvs.width / 2, this.cvs.height / 2);
        const yAxis = this.countCoordinate({x: 0, y: 500, z: 0, w: 1})
        this.ctx.lineTo(this.cvs.width / 2 + yAxis.x, this.cvs.height / 2 + yAxis.y); // Y-axis
        this.ctx.fillText("Y", this.cvs.width / 2 + yAxis.x - 10, this.cvs.height / 2 + yAxis.y - 10);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillStyle = '#c41515';
        for (let i = 50; i <= 500; i += 50) {
            const xAxis = this.countCoordinate({x: 0, y: i, z: 0, w: 1});
            this.ctx.arc(this.cvs.width / 2 + xAxis.x, this.cvs.height / 2 + xAxis.y, this.pointRadius, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#154cc4';
        this.ctx.moveTo(this.cvs.width / 2, this.cvs.height / 2);
        const zAxis = this.countCoordinate({x: 0, y: 0, z: 500, w: 1})
        this.ctx.lineTo(this.cvs.width / 2 + zAxis.x, this.cvs.height / 2 + zAxis.y); // Z-axis
        this.ctx.fillText("Z", this.cvs.width / 2 + zAxis.x - 10, this.cvs.height / 2 + zAxis.y - 10);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillStyle = '#154cc4';
        for (let i = 50; i <= 500; i += 50) {
            const xAxis = this.countCoordinate({x: 0, y: 0, z: i, w: 1});
            this.ctx.arc(this.cvs.width / 2 + xAxis.x, this.cvs.height / 2 + xAxis.y, this.pointRadius, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        this.ctx.stroke();
    }

    // Function to draw a cube
    drawCube() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#000000';

        this.cube.forEach((point: any, index: number) => {
            const newPoint = this.countCoordinate(point);

            if (index === 0 || index === 10 || index === 12 || index === 14) {
                this.ctx.moveTo(this.cvs.width / 2 + newPoint.x, this.cvs.height / 2 + newPoint.y);
            } else {
                this.ctx.lineTo(this.cvs.width / 2 + newPoint.x, this.cvs.height / 2 + newPoint.y);
            }
        })

        this.ctx.stroke();
    }

    countCoordinate(point: any) {
        const a = this.degToRad(this.A)
        const T = [[1, 0, 0, 0],
            [0, 1, 0, 0],
            [-this.F * Math.cos(a), -this.F * Math.sin(a), 0, 0],
            [0, 0, 0, 1]]

        return {
            x: point.x * T[0][0] + point.y * T[1][0] + point.z * T[2][0] + point.w * T[3][0],
            y: point.x * T[0][1] + point.y * T[1][1] + point.z * T[2][1] + point.w * T[3][1],
            z: point.x * T[0][2] + point.y * T[1][2] + point.z * T[2][2] + point.w * T[3][2],
            w: point.x * T[0][3] + point.y * T[1][3] + point.z * T[2][3] + point.w * T[3][3],
        }
    }

    degToRad(deg: number) {
        return deg * Math.PI / 180;
    }

    playAnimation(step: number) {
        const speed = 100;
        if (step === 100) {
            return;
        }

        this.cube.forEach((point: any, index: number) => {
            point.x = point.x + this.animationCube.x / speed;
            point.y = point.y + this.animationCube.y / speed;
            point.z = point.z + this.animationCube.z / speed;
        })

        this.cube.forEach((point: any) => {
            const rotationPoint = {
                x: this.animationCube.x / speed + this.X / 2,
                y: this.animationCube.y / speed + this.Y / 2,
                z: this.animationCube.z / speed + this.Z / 2
            }

            const animation = {
                Ox: this.animationCube.Ox / speed,
                Oy: this.animationCube.Oy / speed,
                Oz: this.animationCube.Oz / speed
            }

            const newPoint = this.rotatePoint3D(point, rotationPoint, animation)

            point.x = newPoint.x;
            point.y = newPoint.y;
            point.z = newPoint.z;
        })

        this.redrawScene();
        requestAnimationFrame(() => this.playAnimation(step + 1));
    }
}
