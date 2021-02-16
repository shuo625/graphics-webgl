class Vector extends Array<number> {

    constructor(value: number | Array<number>) {
        super(value instanceof Array? value.length: value);
        for (let i = 0; i < this.length; i++) {
            this[i] = value instanceof Array? value[i]: 0.0;
        }
        Object.setPrototypeOf(this, Vector.prototype);
    }

    setValues(values: Array<number>) {
        if (values.length !== this.length) {
            throw new Error('Length of values is different with length of vector.')
        }
        for (let i = 0; i < values.length; i++) {
            this[i] = values[i];
        }
    }

    getValues(): Array<number> {
        let result = [];
        this.forEach((val) => {
            result.push(val);
        })

        return result;
    }

    equal(v: Vector): Boolean {
        if (this.length !== v.length) {
            return false;
        }
        for (let i = 0; i < this.length; i++) {
            if (this[i] !== v[i]) {
                return false;
            }
        }

        return true;
    }

    substract(v: Vector) {
        if (this.length !== v.length) {
            throw new Error('Length of two vectors is different.');
        }
        let result = [];
        for (let i = 0; i < this.length; i++) {
            result.push(this[i] - v[i]);
        }

        return new Vector(result);
    }

    dot(v: Vector): number {
        if (this.length !== v.length) {
            throw new Error('Length of two vectors is different.');
        }
        let sum = 0.0;
        for (let i = 0; i < this.length; i++) {
            sum += this[i] * v[i];
        }

        return sum;
    }

    len() {
        return Math.sqrt(this.dot(this));
    }

    normalizeExceptLast() {
        let vals = this.getValues();
        vals.pop();
        let v = new Vector(vals);
        let result = v.normalize().getValues();
        result.push(this[this.length - 1]);
        
        return new Vector(result); 
    }

    normalize(exceptLast: Boolean=false) {
        if (exceptLast) {
            return this.normalizeExceptLast();
        }
        let len = this.len();
        let result = [];
        for (let i = 0; i < this.length; i++) {
            result.push(this[i] / len);
        }

        return new Vector(result);
    }

    cross(v: Vector) {
        if (this.length !== v.length) {
            throw new Error('Length of two vectors is different.');
        }
        let result = [
            this[1] * v[2] - this[2] * v[1],
            this[2] * v[0] - this[0] * v[2],
            this[0] * v[1] - this[1] * v[0]
        ];

        return new Vector(result);
    }

    negate() {
        for (let i = 0; i < this.length; i++) {
            this[i] = -this[i];
        }
    }

    flatten() {
        return new Float32Array(this.getValues());
    }

    mix(v: Vector, n: number) {
        let result = [];

        for (let i = 0; i < this.length; i++) {
            result.push((1 - n) * this[i] + n * v[i]);
        }

        return new Vector(result);
    }

    mult(v: Vector) {
        let result = [];

        for (let i = 0; i < this.length; i++) {
            result.push(this[i] * v[i]);
        }

        return new Vector(result);
    }
}


export { Vector };