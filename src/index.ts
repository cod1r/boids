const canvas = document.getElementById("canvas")! as HTMLCanvasElement

const gl = canvas.getContext("webgl")

if (!gl) {
  throw Error("gl context is null")
}

canvas.width = window.innerWidth
canvas.height = window.innerHeight
gl.viewport(0, 0, 800, 800)


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

const RATIO = 0.1
class Boid {
  buffer: ReturnType<typeof gl.createBuffer>;
  constructor() {
    if (!gl) {
      throw Error("gl is null")
    }
    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)

    const positionLocation = gl.getAttribLocation(program, "position")

    if (positionLocation === -1) {
      throw Error("position attribute -1")
    }

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 2 * 4, 0)
    gl.enableVertexAttribArray(positionLocation)

    let vertices = new Float32Array(2 * 3)

    const angle = Math.random() * 2 * Math.PI

    const x = Math.random() * 2 - 1
    const y = Math.random() * 2 - 1

    const x2 = RATIO * Math.cos(angle) + x
    const y2 = RATIO * Math.sin(angle) + y

    const x3 = RATIO * Math.cos(angle + Math.PI / 6) + x
    const y3 = RATIO * Math.sin(angle + Math.PI / 6) + y

    vertices[0] = x
    vertices[1] = y

    vertices[2] = x2
    vertices[3] = y2

    vertices[4] = x3
    vertices[5] = y3

    gl.bufferData(gl.ARRAY_BUFFER, vertices.buffer, gl.DYNAMIC_DRAW)

  }
  draw() {
    if (!gl) {
      throw Error("gl is null")
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    const positionLocation = gl.getAttribLocation(program, "position")

    if (positionLocation === -1) {
      throw Error("position attribute -1")
    }

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 2 * 4, 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
}
const boids = Array<Boid>()
for (let i = 0; i < 100; ++i) {
  const boid = new Boid()
  boids.push(boid)
}
const loop = () => {
  gl.clear(gl.COLOR_BUFFER_BIT)
  boids.forEach(b => {
    b.draw()
  })
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
