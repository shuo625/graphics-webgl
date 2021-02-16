enum GlslUniformType {
    mat4 = 0,
    vec4,
    mat3,
    vec3,
    float
}


class GlslUniform {
    name: string;
    value: any;
    type: GlslUniformType;

    constructor(name: string, type: GlslUniformType) {
        this.name = name;
        this.type = type;
    }

    update(value: any) {
        this.value = value;
    }
}


export { GlslUniformType, GlslUniform };