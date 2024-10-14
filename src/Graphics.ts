class Graphics {
  gl: WebGL2RenderingContext | null;
  aspectRatio: number | undefined;
  program: WebGLProgram;
  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext("webgl2");
    if (this.gl === null) {
      throw Error("gl context is null");
    }
    const vertexShaderSrc = `
attribute vec3 position;
void main() {
gl_Position = vec4(position, 1.0);
}
`;
    const fragmentShaderSrc = `
void main() {
gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
    const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
    this.gl.shaderSource(vertexShader, vertexShaderSrc);
    this.gl.shaderSource(fragmentShader, fragmentShaderSrc);
    this.gl.compileShader(vertexShader);
    this.gl.compileShader(fragmentShader);

    this.program = this.gl.createProgram()!;
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
    this.gl.useProgram(this.program);
  }
  getGL() {
    return this.gl;
  }
  setAspectRatio(aspectRatio: number) {
    this.aspectRatio = aspectRatio;
  }
}
export { Graphics };
