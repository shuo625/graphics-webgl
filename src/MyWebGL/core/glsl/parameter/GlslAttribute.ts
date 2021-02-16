class GlslAttribute {
    name: string;
    size: number;
    buffer: Array<number>

    constructor(name: string, size: number, buffer: Array<number>) {
        this.name = name;
        this.size = size;
        this.buffer = buffer;
    }
}


export { GlslAttribute };