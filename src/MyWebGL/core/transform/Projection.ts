import { Matric } from '../../MathLib/Matric';
import { MathLib } from '../../MathLib/MathLib';


class Projection {
    public static ortho(left: number, right: number, bottom: number, 
                        top: number, near: number, far: number) {
        let w = right - left;
        let h = top - bottom;
        let d = far - near;

        let result = new Matric([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);
        result[0][0] = 2.0 / w;
        result[1][1] = 2.0 / h;
        result[2][2] = -2.0 / d;
        result[0][3] = -(left + right) / w;
        result[1][3] = -(top + bottom) / h;
        result[2][3] = -(near + far) / d;

        return result;
    }

    public static perspective(fovy: number, aspect: number, near: number, far: number) {
        let f = 1.0 / Math.tan(MathLib.degreeToRadians(fovy) / 2);
        let d = far - near;

        let result = new Matric([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);
        result[0][0] = f / aspect;
        result[1][1] = f;
        result[2][2] = -(near + far) / d;
        result[2][3] = -2 * near * far / d;
        result[3][2] = -1;
        result[3][3] = 0.0;

        return result;
    }
}


export { Projection };