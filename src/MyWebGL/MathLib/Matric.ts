import { Vector } from './Vector';


class Matric extends Array<Vector> {

    constructor(value: number | Array<Array<number>>) {
        super(value instanceof Array? value.length: value);
        for (let i = 0; i < this.length; i++) {
            this[i] = value instanceof Array? new Vector(value[i]): new Vector(value);
        }
        Object.setPrototypeOf(this, Matric.prototype);
    }

    setValues(values: Array<Array<number>>) {
        if (values.length != this.length) {
            throw new Error('Length of values is different with length of matric.');
        }
        for (let i = 0; i < this.length; i++) {
            this[i] = new Vector(values[i]);
        }
    }

    transpose() {
        let result = [];

        for (let i = 0; i < this.length; i++) {
            let v = [];
            for (let j = 0; j < this.length; j++) {
                v.push(this[j][i]);
            }
            result.push(v);
        }

        return new Matric(result);
    }

    flatten() {
        let t = this.transpose();
        let result = [];
        
        for (let i = 0; i < t.length; i++) {
            for (let j = 0; j < t.length; j++) {
                result.push(t[i][j]);
            }
        }

        return new Float32Array(result);
    }

    
}


export { Matric };