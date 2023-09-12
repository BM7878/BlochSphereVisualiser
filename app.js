
class BlochSphereVisualiser {
    constructor(canvasId) {
        var that = this;

        this.lastDrawTimestamp = 0;

        window.addEventListener("mousedown", function (e) { that.mouseDown(e); });
        window.addEventListener("mouseup", function (e) { that.mouseDown(e); });
        window.addEventListener("mousemove", function (e) { that.mouseDown(e); });

        this.canvasId = canvasId;

        this.alpha = 70;
        this.beta = 0;

        this.cx = 1000;
        this.cy = 1000;

        this.sphereRadius = 800;
        this.sphereRotation = 20;

        this.stateAlpha = 140;
        this.stateBeta = 45;

        this.time = 0;
    }

    __start__() {
        var that = this;

        this.canvas = document.getElementById(this.canvasId);

        this.context = this.canvas.getContext("2d");
        this.context.imageSmoothingQuality = "high";

        requestAnimationFrame(function (timestamp) { that.__loop__(timestamp); });
    }

    __loop__(timestamp) {
        var delta = timestamp - this.lastDrawTimestamp;

        if (delta > 30) {
            this.draw();

            this.lastDrawTimestamp = timestamp;
            this.time += delta;
        }

        var that = this;

        requestAnimationFrame(function (timestamp) { that.__loop__(timestamp); });
    }

    mouseDown(e) { }
    mouseUp(e) { }
    mouseMove(e) { }

    projectPoint(x, y, z) {
        var ca = Math.cos(this.alpha);
        var sa = Math.sin(this.alpha);

        var cb = Math.cos(this.beta);
        var sb = Math.sin(this.beta);

        var x2 = x;
        var y2 = ca * y + sa * z;
        var z2 = - sa * y + ca * z;

        var x3 = cb * x2 - sb * z2;
        var y3 = y2;
        var z3 = sb * x2 + cb * z2;

        var x4 = x3 + this.cx;
        var y4 = y3 + this.cy;

        return { "x": x4, "y": y4 };
    }

    getSurfaceVector(theta, phi) {
        var thetaR = 2 * Math.PI * theta / 360;
        var phiR = 2 * Math.PI * phi / 360;

        var x1 = this.sphereRadius * Math.sin(thetaR) * Math.cos(phiR);
        var y1 = this.sphereRadius * Math.sin(thetaR) * Math.sin(phiR);
        var z1 = this.sphereRadius * Math.cos(thetaR);

        return { "x": x1, "y": y1, "z": z1 };
    }

    getLineOfLatitude(latitude) {
        var path = [];

        for (var i = 0; i <= 360; i += 5) {
            var point1 = this.getSurfaceVector(latitude, i);
            var point2 = this.projectPoint(point1.x, point1.y, point1.z);

            path.push(point2);
        }

        return path;
    }

    drawLineOfLatitude(context, latitude, colour = "black") {
        var path = this.getLineOfLatitude(latitude);

        this.drawPath(context, path, colour);
    }

    drawPath(context, path, colour = "black") {
        context.strokeStyle = colour;
        context.lineWidth = 3;

        context.beginPath();
        context.moveTo(path[0].x, path[0].y);

        for (var i = 1; i < path.length; i++) {
            context.lineTo(path[i].x, path[i].y);
        }

        context.stroke();
    }

    fillPath(context, path, colour = "black") {
        context.fillStyle = colour;

        context.beginPath();
        context.moveTo(path[0].x, path[0].y);

        for (var i = 1; i < path.length; i++) {
            context.lineTo(path[i].x, path[i].y);
        }

        context.fill();
    }

    drawLine(context, x1, y1, x2, y2, colour = "black") {
        context.strokeStyle = colour;
        context.lineWidth = 3;

        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }

    drawArrowHead(context, x, y, ux, uy, colour = "black") {
        var path = []

        var w = 22;
        var h = 40;
        var u = this.getNormalVector(ux, uy);
        var n = this.getNormalVector(u.x, u.y);

        path.push({ "x": x, "y": y });
        path.push({ "x": x + u.x * w + n.x * h, "y": y + u.y * w + n.y * h });
        path.push({ "x": x + n.x * h * 0.8, "y": y + n.y * h * 0.8 });
        path.push({ "x": x + u.x * -w + n.x * h, "y": y + u.y * -w + n.y * h });
        path.push({ "x": x, "y": y });

        this.fillPath(context, path, colour);
    }

    drawState(context) {
        var r = 30 * this.time / 1000;

        var v1 = this.getSurfaceVector(this.stateAlpha, this.stateBeta + this.sphereRotation + r);
        var v1p = this.projectPoint(v1.x, v1.y, v1.z);

        this.drawLine(context, this.cx, this.cy, v1p.x, v1p.y);

        context.fillStyle = "black";

        context.beginPath();
        context.arc(v1p.x, v1p.y, 10, 0, 360);
        context.fill();
    }

    getUnitVector(x, y) {
        var m = Math.sqrt(x * x + y * y);

        return { "x": x / m, "y": y / m };
    }

    getNormalVector(x, y) {
        var theta = 2 * Math.PI * 90 / 360;
        var x2 = Math.cos(theta) * x - Math.sin(theta) * y;
        var y2 = Math.sin(theta) * x - Math.cos(theta) * y;

        return { "x": x2, "y": y2 };
    }

    draw() {
        var c = this.context;

        c.fillStyle = "white";
        c.fillRect(0, 0, 2000, 2000);

        for (var i = 10; i < 180; i += 10) {
            this.drawLineOfLatitude(c, i, "lightgrey");
        }

        var r = 30 * this.time / 1000;

        var v1 = this.getSurfaceVector(180, 0 + this.sphereRotation + r);
        var v1p = this.projectPoint(v1.x, v1.y, v1.z);
        var v1u = this.getUnitVector(v1p.x - this.cx, v1p.y - this.cy);

        this.drawLine(c, this.cx, this.cy, v1p.x, v1p.y);
        this.drawArrowHead(c, v1p.x, v1p.y, v1u.x, v1u.y);

        var v2 = this.getSurfaceVector(90, 0 + this.sphereRotation + r);
        var v2p = this.projectPoint(v2.x, v2.y, v2.z);
        var v2u = this.getUnitVector(v2p.x - this.cx, v2p.y - this.cy);

        this.drawLine(c, this.cx, this.cy, v2p.x, v2p.y);
        this.drawArrowHead(c, v2p.x, v2p.y, v2u.x, v2u.y);

        var v3 = this.getSurfaceVector(90, 90 + this.sphereRotation + r);
        var v3p = this.projectPoint(v3.x, v3.y, v3.z);
        var v3u = this.getUnitVector(v3p.x - this.cx, v3p.y - this.cy);

        this.drawLine(c, this.cx, this.cy, v3p.x, v3p.y);
        this.drawArrowHead(c, v3p.x, v3p.y, v3u.x, v3u.y);

        this.drawState(c);

        c.strokeStyle = "black";
        c.lineWidth = 3;

        c.beginPath();

        c.arc(this.cx, this.cy, this.sphereRadius, 0, 360);

        c.stroke();

        this.drawLineOfLatitude(c, 90);
    }
}

function loadVisualiser() {
    var visualiser = new BlochSphereVisualiser("maincanvas");

    visualiser.__start__();
}