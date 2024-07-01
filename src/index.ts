const canvas = document.getElementById("canvas")! as HTMLCanvasElement

const gl = canvas.getContext("webgl")

if (!gl) {
  throw Error("gl context is null")
}

canvas.width = window.innerWidth
canvas.height = window.innerHeight
gl.viewport(0, 0, canvas.width, canvas.height)


const vertexShaderSrc = `
attribute vec3 position;
void main() {
  gl_Position = vec4(position, 1.0);
}
`
const fragmentShaderSrc = `
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`

const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
gl.shaderSource(vertexShader, vertexShaderSrc)
gl.shaderSource(fragmentShader, fragmentShaderSrc)
gl.compileShader(vertexShader)
gl.compileShader(fragmentShader)

const program = gl.createProgram()!
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)
gl.linkProgram(program)
gl.useProgram(program)

const buffer = gl.createBuffer()!
gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

const positionLocation = gl.getAttribLocation(program, "position")

if (positionLocation === -1) {
  throw Error("position attribute -1")
}

gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 2 * 4, 0)
gl.enableVertexAttribArray(positionLocation)

let vertices = new Float32Array(2 * 3)
vertices[0] = 0.0
vertices[1] = 0.5

vertices[2] = 0.0
vertices[3] = 0.0

vertices[4] = 0.5
vertices[5] = 0.0

gl.bufferData(gl.ARRAY_BUFFER, vertices.buffer, gl.DYNAMIC_DRAW)

const loop = () => {
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
