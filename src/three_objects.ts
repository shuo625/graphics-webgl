import { MyWebGL } from './MyWebGL/core/MyWebGL';
import { GlslAttribute } from './MyWebGL/core/glsl/parameter/GlslAttribute';
import { GlslUniformType, GlslUniform } from './MyWebGL/core/glsl/parameter/GlslUniform';
import { Projection } from './MyWebGL/core/transform/Projection';
import { Transform } from './MyWebGL/core/transform/Transform';
import { RenderObject } from './MyWebGL/core/RenderObject';
import { MathLib } from './MyWebGL/MathLib/MathLib';
import { Matric } from './MyWebGL/MathLib/Matric';
import { ModelView } from './MyWebGL/core/transform/ModelView';
import { Vector } from './MyWebGL/MathLib/Vector';


const vsSourcePentagram = `
    attribute vec4 vPosition;

    uniform mat4 perspective;
    uniform mat4 translate;
    uniform mat4 modelView;
    uniform mat4 ortho;

    void main() {
        gl_Position = ortho * perspective * translate * modelView * vPosition;
    }
`;

const vsSourcePentagon = `
    attribute vec4 vPosition;

    uniform mat4 perspective;
    uniform mat4 translate;
    uniform mat4 modelView;
    uniform mat4 ortho;

    void main() {
        gl_Position = ortho * perspective * translate * modelView * vPosition;
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
        gl_FragColor = vec4(1, 1, 0,1);
    }
`;

const vsSourceCube = `
    attribute vec4 vPosition;
    attribute vec3 vNormal;

    varying vec3 L, N, E;

    uniform mat4 translate;
    uniform mat4 perspective;
    uniform mat4 modelView;
    uniform mat4 ortho;
    uniform vec4 lightPosition;

    void main() {
        vec3 light;
        vec3 pos = (modelView * translate * vPosition).xyz;

        if (lightPosition.z == 0.0) {
            L = normalize(lightPosition.xyz);
        } else {
            L = normalize(lightPosition).xyz - pos;
        }

        E = -normalize(pos);
        
        vec4 NN = vec4(vNormal, 0);
        N = normalize((modelView * translate * NN).xyz);

        gl_Position = ortho * perspective * modelView * translate * vPosition;
    }
`;

const fsSourceCube = `
    precision mediump float;

    varying vec3 N, L, E;

    uniform vec4 ambientProduct;
    uniform vec4 diffuseProduct;
    uniform vec4 specularProduct;
    uniform float shininess;

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

        fColor = ambient + diffuse + specular;
        fColor.a = 1.0;

        gl_FragColor = fColor;
    }
`;

const vsSouceSphere = `
    attribute vec4 vPosition;
    attribute vec3 vNormal;
    
    varying vec3 N, L, E;
    
    uniform mat4 modelView;
    uniform mat4 perspective;
    uniform vec4 lightPosition;
    uniform mat4 translate;
    uniform mat4 ortho;

    void main() {
        vec3 light;
        vec3 pos = (modelView * translate * vPosition).xyz;
        
        if(lightPosition.z == 0.0) {
            L = normalize(lightPosition.xyz);
        } else {
            L = normalize(lightPosition).xyz - pos;
        }
        
        E = -normalize(pos);

        vec4 NN = vec4(vNormal, 0.0);
        N = normalize((modelView * translate * NN).xyz);
        
        gl_Position = ortho * perspective * modelView * translate * vPosition;
    }
`;

const fsSouceSphere = `
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
        
        if(dot(L, N) < 0.0)
            specular = vec4(0.0, 0.0, 0.0, 1.0);

        fColor = ambient + diffuse +specular;
        fColor.a = 1.0;

        gl_FragColor = fColor;
    }
`;


// pentagram
const RADIUS = 1;

// cube
let cubePositions = [];
let cubeNormals = [];

// sphere
let spherePositions = [];
let sphereNormals = [];
let triangleNum = 0;

// webgl
let myWebGL: MyWebGL;

// projection
let modelView = ModelView.lookAt(new Vector([0, 0, 2]), new Vector([0, 0, 0]), new Vector([0, 1, 0]));
let perspective: Matric;
let ortho = Projection.ortho(-3.0, 3.0, -3.0, 3.0, -5.0, 5.0);

// light
let lightPosition = new Vector([0.0, 4.0, 0.0, 0.0]);
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


function getPentagramAttributes() {
    let positions = getPentagramPositions();
    let attributes = new Map<string, GlslAttribute>();
    attributes.set('vPosition', new GlslAttribute('vPosition', 2, positions));

    return attributes;
}


function getPentagonAttributes() {
    let positions = getPentagonPositions();
    let attributes = new Map<string, GlslAttribute>();
    attributes.set('vPosition', new GlslAttribute('vPosition', 2, positions));

    return attributes;
}


function getPentagramUniforms() {
    let uniforms = new Map<string, GlslUniform>();
    uniforms.set('translate', new GlslUniform('translate', GlslUniformType.mat4));
    uniforms.set('perspective', new GlslUniform('perspective', GlslUniformType.mat4));
    uniforms.set('modelView', new GlslUniform('modelView', GlslUniformType.mat4));
    uniforms.set('ortho', new GlslUniform('ortho', GlslUniformType.mat4));

    return uniforms;
}


function getPentagonUniforms() {
    let uniforms = new Map<string, GlslUniform>();
    uniforms.set('translate', new GlslUniform('translate', GlslUniformType.mat4));
    uniforms.set('perspective', new GlslUniform('perspective', GlslUniformType.mat4));
    uniforms.set('modelView', new GlslUniform('modelView', GlslUniformType.mat4));
    uniforms.set('ortho', new GlslUniform('ortho', GlslUniformType.mat4));

    return uniforms;
}


function drawPentagram() {
    let attributes = getPentagramAttributes();
    
    let uniforms = getPentagramUniforms();
    let rendeObj = new RenderObject(vsSourcePentagram, fsSourcePentagram, myWebGL.constant.LINES, 10, attributes, uniforms);
    
    let translate = Transform.translate(0, 0, 0);

    rendeObj.updateUniform('translate', translate.flatten());
    rendeObj.updateUniform('perspective', perspective.flatten());
    rendeObj.updateUniform('modelView', modelView.flatten());
    rendeObj.updateUniform('ortho', ortho.flatten());
    
    myWebGL.render(rendeObj);
}


function drawPentagon() {
    let attributes = getPentagonAttributes();
    let uniforms = getPentagonUniforms();

    let rendeObj = new RenderObject(vsSourcePentagon, fsSourcePentagon, myWebGL.constant.TRIANGLES, 15, attributes, uniforms);
    
    let translate = Transform.translate(0, 0, 0);

    rendeObj.updateUniform('translate', translate.flatten());
    rendeObj.updateUniform('perspective', perspective.flatten());
    rendeObj.updateUniform('modelView', modelView.flatten());
    rendeObj.updateUniform('ortho', ortho.flatten());

    myWebGL.render(rendeObj);
}


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

        let av = new Vector(vertexs[a]);
        let bv = new Vector(vertexs[b]);
        let cv = new Vector(vertexs[c]);

        let t1 = bv.substract(av);
        let t2 = cv.substract(bv);
        let normal = t1.cross(t2);

        cubePositions = cubePositions.concat(vertexs[a]);
        cubeNormals = cubeNormals.concat(normal.getValues());

        cubePositions = cubePositions.concat(vertexs[b]);
        cubeNormals = cubeNormals.concat(normal.getValues());

        cubePositions = cubePositions.concat(vertexs[c]);
        cubeNormals = cubeNormals.concat(normal.getValues());
        
        cubePositions = cubePositions.concat(vertexs[a]);
        cubeNormals = cubeNormals.concat(normal.getValues());
        
        cubePositions = cubePositions.concat(vertexs[c]);
        cubeNormals = cubeNormals.concat(normal.getValues());
        
        cubePositions = cubePositions.concat(vertexs[d]);
        cubeNormals = cubeNormals.concat(normal.getValues());
    }

    getPositions(1, 0, 3, 2);
    getPositions(2, 3, 7, 6);
    getPositions(3, 0, 4, 7);
    getPositions(6, 5, 1, 2);
    getPositions(4, 5, 6, 7);
    getPositions(5, 4, 0, 1);
}


function getCubeAttributes() {
    getCubePositions();
    
    let attributes = new Map<string, GlslAttribute>();
    attributes.set('vPosition', new GlslAttribute('vPosition', 3, cubePositions));
    attributes.set('vNormal', new GlslAttribute('vNormal', 3, cubeNormals));

    return attributes;
}


function getCubeUniforms() {
    let uniforms = new Map<string, GlslUniform>();

    uniforms.set('modelView', new GlslUniform('modelView', GlslUniformType.mat4));
    uniforms.set('translate', new GlslUniform('translate', GlslUniformType.mat4));
    uniforms.set('perspective', new GlslUniform('perspective', GlslUniformType.mat4));
    uniforms.set('ortho', new GlslUniform('ortho', GlslUniformType.mat4));
    uniforms.set('lightPosition', new GlslUniform('lightPosition', GlslUniformType.vec4));
    uniforms.set('ambientProduct', new GlslUniform('ambientProduct', GlslUniformType.vec4));
    uniforms.set('diffuseProduct', new GlslUniform('diffuseProduct', GlslUniformType.vec4));
    uniforms.set('specularProduct', new GlslUniform('specularProduct', GlslUniformType.vec4));
    uniforms.set('shininess', new GlslUniform('shininess', GlslUniformType.float));

    return uniforms;
}


function drawCube() {
    myWebGL.enable(myWebGL.constant.DELETE_STATUS);
    let attributes = getCubeAttributes();
    let uniforms = getCubeUniforms();
    let renderObject = new RenderObject(vsSourceCube, fsSourceCube, myWebGL.constant.TRIANGLES, 36, attributes, uniforms);

    let translate = Transform.translate(4, 0, 0);
    
    renderObject.updateUniform('translate', translate.flatten());
    renderObject.updateUniform('modelView', modelView.flatten());
    renderObject.updateUniform('perspective', perspective.flatten());
    renderObject.updateUniform('ortho', ortho.flatten());
    renderObject.updateUniform('lightPosition', lightPosition.flatten());
    renderObject.updateUniform('ambientProduct', ambientProduct.flatten());
    renderObject.updateUniform('diffuseProduct', diffuseProduct.flatten());
    renderObject.updateUniform('specularProduct', specularProduct.flatten());
    renderObject.updateUniform('shininess', materialShininess);

    myWebGL.render(renderObject);
}


function triangle(a: Vector, b: Vector, c: Vector) {
    let t1 = b.substract(a);
    let t2 = c.substract(a);

    let norm: Vector = t2.cross(t1).normalize();

    sphereNormals = sphereNormals.concat(norm.getValues());
    sphereNormals = sphereNormals.concat(norm.getValues());
    sphereNormals = sphereNormals.concat(norm.getValues());

    spherePositions = spherePositions.concat(a.getValues());
    spherePositions = spherePositions.concat(b.getValues());
    spherePositions = spherePositions.concat(c.getValues());

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


function getSpherePositions() {
    let va = new Vector([0.0, 0.0, -1.0, 1]);
    let vb = new Vector([0.0, 0.942809, 0.333333, 1]);
    let vc = new Vector([-0.816497, -0.471405, 0.333333, 1]);
    let vd = new Vector([0.816497, -0.471405, 0.333333,1]);
    tetrahedron(va, vb, vc, vd, 5);
}


function getSphereAttributes() {
    getSpherePositions();
    let attributes = new Map<string, GlslAttribute>();
    attributes.set('vPosition', new GlslAttribute('vPosition', 4, spherePositions));
    attributes.set('vNormal', new GlslAttribute('vNormal', 3, sphereNormals));

    return attributes;
}


function getSphereUniforms() {
    let uniforms = new Map<string, GlslUniform>();

    uniforms.set('modelView', new GlslUniform('modelView', GlslUniformType.mat4));
    uniforms.set('perspective', new GlslUniform('perspective', GlslUniformType.mat4));
    uniforms.set('translate', new GlslUniform('translate', GlslUniformType.mat4));
    uniforms.set('ortho', new GlslUniform('ortho', GlslUniformType.mat4));
    uniforms.set('lightPosition', new GlslUniform('lightPosition', GlslUniformType.vec4));

    uniforms.set('ambientProduct', new GlslUniform('ambientProduct', GlslUniformType.vec4));
    uniforms.set('diffuseProduct', new GlslUniform('diffuseProduct', GlslUniformType.vec4));
    uniforms.set('specularProduct', new GlslUniform('specularProduct', GlslUniformType.vec4));
    uniforms.set('shininess', new GlslUniform('shininess', GlslUniformType.float));

    return uniforms;
}


function drawSphere() {
    let attributes = getSphereAttributes();
    let uniforms = getSphereUniforms();

    let renderObj = new RenderObject(vsSouceSphere, fsSouceSphere, myWebGL.constant.TRIANGLES, 
                                     triangleNum * 3, attributes, uniforms);


    let translate = Transform.translate(-3.5, 0, 0);

    renderObj.updateUniform('ambientProduct', ambientProduct.flatten());
    renderObj.updateUniform('diffuseProduct', diffuseProduct.flatten());
    renderObj.updateUniform('specularProduct', specularProduct.flatten());
    renderObj.updateUniform('lightPosition', lightPosition.flatten());
    renderObj.updateUniform('shininess', materialShininess);
    renderObj.updateUniform('modelView', modelView.flatten());
    renderObj.updateUniform('perspective', perspective.flatten());
    renderObj.updateUniform('ortho', ortho.flatten());
    renderObj.updateUniform('translate', translate.flatten());

    myWebGL.render(renderObj);
}


function drawThreeObjects(glId: string) {
    myWebGL = new MyWebGL(glId, 'webgl');

    myWebGL.enable(myWebGL.constant.DEPTH_TEST);

    perspective = Projection.perspective(90, myWebGL.canvas.width / myWebGL.canvas.height, 0.3, 10);

    drawPentagon();
    drawPentagram();
    drawCube();
    drawSphere();
}


export { drawThreeObjects };