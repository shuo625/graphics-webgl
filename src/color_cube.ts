import { Transform } from './MyWebGL/core/transform/Transform';
import { MyWebGL } from './MyWebGL/core/MyWebGL';
import { GlslAttribute } from './MyWebGL/core/glsl/parameter/GlslAttribute';
import { GlslUniformType, GlslUniform } from './MyWebGL/core/glsl/parameter/GlslUniform';
import { RenderObject } from './MyWebGL/core/RenderObject';



const vsSource = `
    attribute vec4 vPosition;
    attribute vec4 vColor;
    
    varying vec4 fColor;

    uniform mat4 rx;
    uniform mat4 ry;
    uniform mat4 rz;

    void main() {
        fColor = vColor;
        gl_Position = rz * ry * rx * vPosition;
    }
`;

const fsSource = `
    precision mediump float;

    varying vec4 fColor;

    void main() {
        gl_FragColor = fColor;
    }
`;


let axis = 0;
let theta = [0, 0, 0];
let positions = [];
let colors = [];
let myWebGL: MyWebGL;
let renderObj: RenderObject;



/*
*            0----------1
*            -        --
*          3----------2-
*           -        - -
*           - 4      - -5
*           -        --
*          7----------6
*/


function getCubePositions() {
    function getPositions(a: number, b: number, c: number, d: number) {
        let vertexs = [
            [-0.5, -0.5,  0.5],
            [-0.5,  0.5,  0.5],
            [0.5,  0.5,  0.5],
            [0.5, -0.5,  0.5],
            [-0.5, -0.5, -0.5],
            [-0.5,  0.5, -0.5],
            [0.5,  0.5, -0.5],
            [0.5, -0.5, -0.5],
        ];

        let vertexColors = [
            [ 0.0, 0.0, 0.0, 1.0 ],  // black
            [ 1.0, 0.0, 0.0, 1.0 ],  // red
            [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
            [ 0.0, 1.0, 0.0, 1.0 ],  // green
            [ 0.0, 0.0, 1.0, 1.0 ],  // blue
            [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
            [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
            [ 1.0, 1.0, 1.0, 1.0 ]   // white
        ];

        let indices = [a, b, c, a, c, d];

        for (let i = 0; i < indices.length; i++) {
            positions = positions.concat(vertexs[indices[i]]);
            colors = colors.concat(vertexColors[a]);
        }
    }

    getPositions(1, 0, 3, 2);
    getPositions(2, 3, 7, 6);
    getPositions(3, 0, 4, 7);
    getPositions(6, 5, 1, 2);
    getPositions(4, 5, 6, 7);
    getPositions(5, 4, 0, 1);
}


function getAttributes() {
    getCubePositions();
    
    let attributes = new Map<string, GlslAttribute>();
    attributes.set('vPosition', new GlslAttribute('vPosition', 3, positions));
    attributes.set('vColor', new GlslAttribute('vColor', 4, colors));

    return attributes;
}


function getUniforms() {
    let uniforms = new Map<string, GlslUniform>();
    uniforms.set('rx', new GlslUniform('rx', GlslUniformType.mat4));
    uniforms.set('ry', new GlslUniform('ry', GlslUniformType.mat4));
    uniforms.set('rz', new GlslUniform('rz', GlslUniformType.mat4));

    return uniforms;
}


function _render() {
    theta[axis] += 2;

    let rx = Transform.rotateX(theta[0]);
    let ry = Transform.rotateY(theta[1]);
    let rz = Transform.rotateZ(theta[2]);

    renderObj.updateUniform('rx', rx.flatten());
    renderObj.updateUniform('ry', ry.flatten());
    renderObj.updateUniform('rz', rz.flatten());

    myWebGL.clear();
    myWebGL.render(renderObj);

    window.requestAnimationFrame(_render);
}


function _drawCube() {
    let attributes = getAttributes();
    let uniforms = getUniforms();

    renderObj = new RenderObject(vsSource, fsSource, myWebGL.constant.TRIANGLES, 36, attributes, uniforms);

    myWebGL.enable(myWebGL.constant.DEPTH_TEST);

    _render();
}


function drawCube(glId: string) {
    myWebGL = new MyWebGL(glId, 'webgl');
    _drawCube();
}


window.requestAnimationFrame(_render);

document.getElementById('x').onclick = function() {
    axis = 0;
}
document.getElementById('y').onclick = function() {
    axis = 1;
}
document.getElementById('z').onclick = function() {
    axis = 2;
}


export { drawCube };