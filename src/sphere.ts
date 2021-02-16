import { GlslAttribute } from './MyWebGL/core/glsl/parameter/GlslAttribute';
import { GlslUniform, GlslUniformType } from './MyWebGL/core/glsl/parameter/GlslUniform';
import { MyWebGL } from './MyWebGL/core/MyWebGL';
import { RenderObject } from './MyWebGL/core/RenderObject';
import { Vector } from './MyWebGL/MathLib/Vector';
import { ModelView } from './MyWebGL/core/transform/ModelView';
import { Projection } from './MyWebGL/core/transform/Projection';
import { Matric } from './MyWebGL/MathLib/Matric';
import { Transform } from './MyWebGL/core/transform/Transform';


const vsSouce = `
    attribute vec4 vPosition;
    attribute vec3 vNormal;

    varying vec3 N, L, E;
    
    uniform mat4 translate;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec4 lightPosition;

    void main() {
        vec3 light;
        vec3 pos = (modelViewMatrix * translate * vPosition).xyz;
        
        if(lightPosition.z == 0.0) {
            L = normalize(lightPosition.xyz);
        } else {
            L = normalize(lightPosition).xyz - pos;
        }
        
        E = -normalize(pos);

        vec4 NN = vec4(vNormal, 0);
        N = normalize((modelViewMatrix * translate * NN).xyz);
        
        gl_Position = projectionMatrix * modelViewMatrix * translate * vPosition;
    }
`;


const fsSouce = `
    precision mediump float;

    uniform vec4 ambientProduct;
    uniform vec4 diffuseProduct;
    uniform vec4 specularProduct;
    uniform float shininess;
    
    varying vec3 N, L, E;

    void main() {    
        vec4 fColor;
        
        vec3 H = normalize(L + E);
        vec4 ambient = ambientProduct;

        float Kd = max(dot(L, N), 0.0);
        vec4 diffuse = Kd * diffuseProduct;

        float Ks = pow(max(dot(N, H), 0.0), shininess);
        vec4 specular = Ks * specularProduct;
        
        if (dot(L, N) < 0.0)
            specular = vec4(0.0, 0.0, 0.0, 1.0);

        fColor = ambient + diffuse +specular;
        fColor.a = 1.0;

        gl_FragColor = fColor;
    }
`;


let myWebGL: MyWebGL;
let positions = [];
let normPositions = [];

let triangleNum = 0;

let modelView = ModelView.lookAt(new Vector([0, 0, 1]), new Vector([0, 0, 0]), new Vector([0, 1, 0]));
let projection = Projection.ortho(-3.0, 3.0, -3.0, 3.0, -10, 10);
let lightPosition = new Vector([0.0, 2.0, 0.0, 0.0]);


function triangle(a: Vector, b: Vector, c: Vector) {
    let t1 = b.substract(a);
    let t2 = c.substract(a);

    let norm: Vector = t2.cross(t1).normalize();

    normPositions = normPositions.concat(norm.getValues());
    normPositions = normPositions.concat(norm.getValues());
    normPositions = normPositions.concat(norm.getValues());

    positions = positions.concat(a.getValues());
    positions = positions.concat(b.getValues());
    positions = positions.concat(c.getValues());

    triangleNum += 1;
}


function divideTriangle(a: Vector, b: Vector, c: Vector, count: number) {
    if (count > 0) {
        let ab = a.mix(b, 0.5).normalize(true);
        let ac = a.mix(c, 0.5).normalize(true);
        let bc = b.mix(c, 0.5).normalize(true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    } else {
        triangle(a, b, c);
    }
}


function tetrahedron(a: Vector, b: Vector, c: Vector, d: Vector, n: number) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}


function getPositions() {
    let va = new Vector([0.0, 0.0, -1.0, 1]);
    let vb = new Vector([0.0, 0.942809, 0.333333, 1]);
    let vc = new Vector([-0.816497, -0.471405, 0.333333, 1]);
    let vd = new Vector([0.816497, -0.471405, 0.333333,1]);
    tetrahedron(va, vb, vc, vd, 5);
}


function getAttributes() {
    let attributes = new Map<string, GlslAttribute>();
    attributes.set('vPosition', new GlslAttribute('vPosition', 4, positions));
    attributes.set('vNormal', new GlslAttribute('vNormal', 3, normPositions));

    return attributes;
}


function getUniforms() {
    let uniforms = new Map<string, GlslUniform>();

    uniforms.set('modelViewMatrix', new GlslUniform('modelViewMatrix', GlslUniformType.mat4));
    uniforms.set('projectionMatrix', new GlslUniform('projectionMatrix', GlslUniformType.mat4));
    uniforms.set('lightPosition', new GlslUniform('lightPosition', GlslUniformType.vec4));

    uniforms.set('ambientProduct', new GlslUniform('ambientProduct', GlslUniformType.vec4));
    uniforms.set('diffuseProduct', new GlslUniform('diffuseProduct', GlslUniformType.vec4));
    uniforms.set('specularProduct', new GlslUniform('specularProduct', GlslUniformType.vec4));
    uniforms.set('shininess', new GlslUniform('shininess', GlslUniformType.float));

    uniforms.set('translate', new GlslUniform('translate', GlslUniformType.mat4));

    return uniforms;
}


function _drawSphere() {
    getPositions();
    let attributes = getAttributes();
    let uniforms = getUniforms();

    let renderObj = new RenderObject(vsSouce, fsSouce, myWebGL.constant.TRIANGLES, 
                                     triangleNum * 3, attributes, uniforms);

    let lightAmbient = new Vector([0.2, 0.2, 0.2, 1.0]);
    let lightDiffuse = new Vector([1.0, 1.0, 1.0, 1.0]);
    let lightSpecular = new Vector([1.0, 1.0, 1.0, 1.0]);
    let materialAmbient = new Vector([1.0, 0.0, 1.0, 1.0]);
    let materialDiffuse = new Vector([1.0, 0.8, 0.0, 1.0]);
    let materialSpecular = new Vector([1.0, 1.0, 1.0, 1.0]);
    let materialShininess = 20.0;

    let ambientProduct = lightAmbient.mult(materialAmbient);
    let diffuseProduct = lightDiffuse.mult(materialDiffuse);
    let specularProduct = lightSpecular.mult(materialSpecular);

    renderObj.updateUniform('ambientProduct', ambientProduct.flatten());
    renderObj.updateUniform('diffuseProduct', diffuseProduct.flatten());
    renderObj.updateUniform('specularProduct', specularProduct.flatten());
    renderObj.updateUniform('lightPosition', lightPosition.flatten());
    renderObj.updateUniform('shininess', materialShininess);

    

    renderObj.updateUniform('modelViewMatrix', modelView.flatten());
    renderObj.updateUniform('projectionMatrix', projection.flatten());

    let translate = Transform.translate(1, 0, 0);
    renderObj.updateUniform('translate', translate.flatten());

    myWebGL.render(renderObj);
}


function drawSphere(glId: string) {
    myWebGL = new MyWebGL(glId, 'wengl');
    myWebGL.enable(myWebGL.constant.DEPTH_TEST);

    _drawSphere();
}


export { drawSphere };