// based on https://github.com/mozilla/pdf.js/blob/master/src/display/dom_utils.js
export default class PageViewport {
    /**
     * @param {PageViewportParameters}
     */
    constructor({
                    viewBox, scale, rotation, offsetX = 0, offsetY = 0,
                    dontFlip = false,
                }) {
        this.viewBox = viewBox;
        this.scale = scale;
        this.rotation = rotation;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        // creating transform to convert pdf coordinate system to the normal
        // canvas like coordinates taking in account scale and rotation
        let centerX = (viewBox[2] + viewBox[0]) / 2;
        let centerY = (viewBox[3] + viewBox[1]) / 2;
        let rotateA, rotateB, rotateC, rotateD;
        rotation = rotation % 360;
        rotation = rotation < 0 ? rotation + 360 : rotation;
        switch (rotation) {
            case 180:
                rotateA = -1;
                rotateB = 0;
                rotateC = 0;
                rotateD = 1;
                break;
            case 90:
                rotateA = 0;
                rotateB = 1;
                rotateC = 1;
                rotateD = 0;
                break;
            case 270:
                rotateA = 0;
                rotateB = -1;
                rotateC = -1;
                rotateD = 0;
                break;
            // case 0:
            default:
                rotateA = 1;
                rotateB = 0;
                rotateC = 0;
                rotateD = -1;
                break;
        }

        if (dontFlip) {
            rotateC = -rotateC;
            rotateD = -rotateD;
        }

        let offsetCanvasX, offsetCanvasY;
        let width, height;
        if (rotateA === 0) {
            offsetCanvasX = Math.abs(centerY - viewBox[1]) * scale + offsetX;
            offsetCanvasY = Math.abs(centerX - viewBox[0]) * scale + offsetY;
            width = Math.abs(viewBox[3] - viewBox[1]) * scale;
            height = Math.abs(viewBox[2] - viewBox[0]) * scale;
        } else {
            offsetCanvasX = Math.abs(centerX - viewBox[0]) * scale + offsetX;
            offsetCanvasY = Math.abs(centerY - viewBox[1]) * scale + offsetY;
            width = Math.abs(viewBox[2] - viewBox[0]) * scale;
            height = Math.abs(viewBox[3] - viewBox[1]) * scale;
        }
        // creating transform for the following operations:
        // translate(-centerX, -centerY), rotate and flip vertically,
        // scale, and translate(offsetCanvasX, offsetCanvasY)
        this.transform = [
            rotateA * scale,
            rotateB * scale,
            rotateC * scale,
            rotateD * scale,
            offsetCanvasX - rotateA * scale * centerX - rotateC * scale * centerY,
            offsetCanvasY - rotateB * scale * centerX - rotateD * scale * centerY
        ];

        this.width = width;
        this.height = height;
    }

    clone({ scale = this.scale, rotation = this.rotation,
              dontFlip = false, } = {}) {
        return new PageViewport({
            viewBox: this.viewBox.slice(),
            scale,
            rotation,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            dontFlip,
        });
    }
}