import { Matric } from '../../MathLib/Matric';
import { MathLib } from '../../MathLib/MathLib';


class Transform {
    public static rotateX(degree: number) {
        let c = Math.cos(MathLib.degreeToRadians(degree));
        let s = Math.sin(MathLib.degreeToRadians(degree));

        return new Matric([
            [1.0, 0.0, 0.0, 0.0],
            [0.0,   c,  -s, 0.0],
            [0.0,   s,   c, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ]);
    }

    public static rotateY(degree: number) {
        let c = Math.cos(MathLib.degreeToRadians(degree));
        let s = Math.sin(MathLib.degreeToRadians(degree));

        return new Matric([
            [  c, 0.0,   s, 0.0],
            [0.0, 1.0, 0.0, 0.0],
            [ -s, 0.0,   c, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ]);
    }

    public static rotateZ(degree: number) {
        let c = Math.cos(MathLib.degreeToRadians(degree));
        let s = Math.sin(MathLib.degreeToRadians(degree));

        return new Matric([
            [  c,  -s, 0.0, 0.0],
            [  s,   c, 0.0, 0.0],
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ]);
    }

    public static translate(x: number, y: number, z: number) {
        let result = new Matric([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);

        result[0][3] = x;
        result[1][3] = y;
        result[2][3] = z;

        return result;
    }

    public static shadow(y: number) {
        let result = new Matric([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);
        result[3][3] = 0;
        result[3][1] = -1/y;

        return result;
    }
}


export { Transform };