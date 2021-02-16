import { GlslAttribute } from './glsl/parameter/GlslAttribute';
import { GlslUniform, GlslUniformType } from './glsl/parameter/GlslUniform';


class RenderObject {
    fsSource: string;
    vsSource: string;
    mode: number;
    count: number;
    attributes: Map<string, GlslAttribute>;
    uniforms: Map<string, GlslUniform>;
    type: number = null;
    indices: Array<number> = null;
    firstRender: boolean = true;

    constructor(vsSource: string, fsSource: string, mode: number, count: number, 
                attributes: Map<string, GlslAttribute>, uniforms: Map<string, GlslUniform>) {
        this.vsSource = vsSource;
        this.fsSource = fsSource;
        this.mode = mode;
        this.count = count;
        this.attributes = attributes;
        this.uniforms = uniforms;
    }

    hasUniform(): Boolean {
        return this.uniforms.size > 0;
    }

    updateUniform(name: string, val: any): void {
        this.uniforms.get(name).update(val);
    }

    drawElement(type: number, indices: Array<number>): void {
        this.type = type;
        this.indices = indices;
    }

    isDrawElement(): Boolean {
        return !(this.indices === null);
    }

    isFirstRender(): Boolean {
        if (this.firstRender === true) {
            this.firstRender = false;
            return true;
        }
        return false;
    }
}


export {RenderObject};