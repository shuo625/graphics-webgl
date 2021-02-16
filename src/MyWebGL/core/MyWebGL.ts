import { GlslAttribute } from './glsl/parameter/GlslAttribute';
import { GlslUniform, GlslUniformType } from './glsl/parameter/GlslUniform';
import { RenderObject } from './RenderObject';


class MyWebGL {
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    canvas: HTMLCanvasElement


    constructor(canvasId: string, contextId: string) {
        this.canvas = <HTMLCanvasElement>document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl');
        this.clearCanvas();
    }

    clearCanvas() {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(1, 1, 1, 1);
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    get constant() {
        return this.gl;
    }

    get canvasWidth() {
        return this.canvas.width;
    }

    get canvasHeight() {
        return this.canvas.height;
    }

    createShader(type: number, source: string) {
        let shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        return shader;
    }

    useProgram(vsSource: string, fsSource: string) {
        let vShader = this.createShader(this.gl.VERTEX_SHADER, vsSource);
        let fShader = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vShader);
        this.gl.attachShader(this.program, fShader);
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);
    }

    useAttribute(attribute: GlslAttribute) {
        let buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(attribute.buffer), this.gl.STATIC_DRAW);
        let attributeLocation = this.gl.getAttribLocation(this.program, attribute.name);
        this.gl.enableVertexAttribArray(attributeLocation);
        this.gl.vertexAttribPointer(attributeLocation, attribute.size, this.gl.FLOAT, false, 0, 0);
    }

    useUniform(uniform: GlslUniform) {
        let uniformLocation = this.gl.getUniformLocation(this.program, uniform.name);
        if (uniform.type === GlslUniformType.mat4) {
            this.gl.uniformMatrix4fv(uniformLocation, false, uniform.value);
        } else if (uniform.type === GlslUniformType.vec4) {
            this.gl.uniform4fv(uniformLocation, uniform.value);
        } else if (uniform.type === GlslUniformType.mat3) {
            this.gl.uniformMatrix3fv(uniformLocation, false, uniform.value);
        } else if (uniform.type === GlslUniformType.vec3) {
            this.gl.uniform3fv(uniformLocation, uniform.value);
        } else if (uniform.type === GlslUniformType.float) {
            this.gl.uniform1f(uniformLocation, uniform.value);
        }
    }

    useAttributes(attributes: Map<string, GlslAttribute>) {
        attributes.forEach((value, key) => {
            this.useAttribute(value);
        });
    }

    useUniforms(uniforms: Map<string, GlslUniform>) {
        uniforms.forEach((value, key) => {
            this.useUniform(value);
        });
    }

    setUniform(uniform: string, val: any) {
        let uniformLocation = this.gl.getUniformLocation(this.program, uniform);
        this.gl.uniform3fv(uniformLocation, val);
    }

    createElementBuffer(data: Array<number>) {
        let buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this.gl.STATIC_DRAW);
    }

    drawArrays(mode: number, count: number) {
        this.gl.drawArrays(mode, 0, count);
    }

    drawElements(mode: number, count: number, type: number) {
        this.gl.drawElements(mode, count, type, 0);
    }

    enable(cap: number) {
        this.gl.enable(cap);
    }

    render(renderObj: RenderObject) {
        if (renderObj.isFirstRender()) {
            this.useProgram(renderObj.vsSource, renderObj.fsSource);
            this.useAttributes(renderObj.attributes);
        }

        if (renderObj.hasUniform()) {
            this.useUniforms(renderObj.uniforms);
        }

        if (renderObj.isDrawElement()) {
            this.createElementBuffer(renderObj.indices);
            this.drawElements(renderObj.mode, renderObj.count, renderObj.type);
        } else {
            this.drawArrays(renderObj.mode, renderObj.count);
        }
    }
}


export { MyWebGL };