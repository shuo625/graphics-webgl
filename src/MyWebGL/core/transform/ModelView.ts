import { MathLib } from '../../MathLib/MathLib';
import { Matric } from '../../MathLib/Matric';
import { Vector } from '../../MathLib/Vector';


class ModelView {

    public static lookAt(eye: Vector, at: Vector, up: Vector) {
        if (eye.equal(at)) {
            return new Matric([
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ]);
        }

        let v: Vector = at.substract(eye).normalize();
        let n: Vector = v.cross(up).normalize();
        let u: Vector = n.cross(v).normalize();

        v.negate();

        let n_val = n.getValues();
        let u_val = u.getValues();
        let v_val = v.getValues();
        n_val.push(-n.dot(eye));
        u_val.push(-u.dot(eye));
        v_val.push(-v.dot(eye));

        return new Matric([
            n_val,
            u_val,
            v_val,
            [0, 0, 0, 1]
        ]);
    }
}


export { ModelView };