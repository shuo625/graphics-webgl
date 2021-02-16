import { MathLib } from './MyWebGL/MathLib/MathLib';
import { MyWebGL } from './MyWebGL/core/MyWebGL';
import { GlslAttribute } from './MyWebGL/core/glsl/parameter/GlslAttribute';
import { GlslUniform } from './MyWebGL/core/glsl/parameter/GlslUniform';
import { RenderObject } from './MyWebGL/core/RenderObject';


const vsSource = `
    attribute vec4 a_position;

    void main() {
        gl_Position = a_position;
    }
`;

const fsSourcePentagram = `
    precision mediump float;

    void main() {
        gl_FragColor = vec4(0, 0, 0, 1);
    }
`;

const fsSourcePentagon = `
    precision mediump float;

    void main() {
        gl_FragColor = vec4(1, 1, 0, 1);
    }
`;


const RADIUS = 1;


function getPloygonPositions(num: number, radius: number, startDegree: number, stepDegree: number) {
    let positions: Array<Array<number>> = [];
    for (let i = 0; i < num; i++) {
        let degree = startDegree + i * stepDegree;
        let x = radius * Math.cos(MathLib.degreeToRadians(degree));
        let y = radius * Math.sin(MathLib.degreeToRadians(degree));
        positions.push([x, y]);
    }

    return positions;
}


function getPentagramPositions() {
    const stepDegree = 360 / 5;
    const startDegree = stepDegree / 2;
    let pointsPositions = getPloygonPositions(5, RADIUS, startDegree, stepDegree);
    
    let positions: Array<number> = [];
    for (let i = 0; i < 3; i++) {
        positions.push(pointsPositions[i][0], pointsPositions[i][1]);
        positions.push(pointsPositions[i + 2][0], pointsPositions[i + 2][1]);
        if (i != 2) {
            positions.push(pointsPositions[i][0], pointsPositions[i][1]);
            positions.push(pointsPositions[i + 3][0], pointsPositions[i + 3][1]);
        }
    }

    return positions;
}


function getPentagonPositions() {
    const startDegree = 0;
    const stepDegree = 360 / 5;
    let pointsPositions: Array<Array<number>> = 
        getPloygonPositions(5, MathLib.sineTheorem(RADIUS, 126, 18), startDegree, stepDegree);

    let positions: Array<number> = [];
    
    for (let i = 0; i < 5; i++) {
        positions.push(pointsPositions[i][0], pointsPositions[i][1]);
        positions.push(pointsPositions[(i + 1) % 5][0], pointsPositions[(i + 1) % 5][1]);
        positions.push(0, 0);
    }

    return positions;
}


function getUniforms() {
    let uniforms = new Map<string, GlslUniform>();

    return uniforms;
}


function _drawPentagram(myWebGL: MyWebGL) {
    let positions = getPentagramPositions();
    let attributes = new Map<string, GlslAttribute>();
    attributes.set('a_position', new GlslAttribute('a_position', 2, positions));
    let uniforms = getUniforms();
    let rendeObj = new RenderObject(vsSource, fsSourcePentagram, myWebGL.constant.LINES, 10, attributes, uniforms);
    
    myWebGL.render(rendeObj);
}


function _drawPentagon(myWebGL: MyWebGL) {
    myWebGL.useProgram(vsSource, fsSourcePentagon);

    let positions = getPentagonPositions();
    let attributes = new Map<string, GlslAttribute>();
    attributes.set('a_position', new GlslAttribute('a_position', 2, positions));
    let uniforms = getUniforms();

    let rendeObj = new RenderObject(vsSource, fsSourcePentagon, myWebGL.constant.TRIANGLES, 15, attributes, uniforms);
    
    myWebGL.render(rendeObj);
}


function drawPentagram(glId: string) {
    let myWebGL = new MyWebGL(glId, 'webgl');

    _drawPentagon(myWebGL);
    _drawPentagram(myWebGL);

}


export { drawPentagram };