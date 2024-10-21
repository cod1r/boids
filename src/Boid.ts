import { Graphics } from "./Graphics";
import { calculateTailPointsGivenHeadPoint } from "./utils";
class Boid {
  x_vel: number;
  y_vel: number;
  buffer: WebGLBuffer | null;
  vertices: Float32Array;
  constructor(graphics: Graphics) {
    const gl = graphics.getGL();
    if (!gl) {
      throw Error("gl is null");
    }
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    const positionLocation = gl.getAttribLocation(graphics.program, "position");

    if (positionLocation === -1) {
      throw Error("position attribute -1");
    }

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 2 * 4, 0);
    gl.enableVertexAttribArray(positionLocation);

    const vertices = new Float32Array(2 * 3);

    const angle = Math.random() * 2 * Math.PI;
    this.x_vel = Math.cos(angle) / 480;
    this.y_vel = -Math.sin(angle) / 480;

    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;

    const { x2, y2, x3, y3 } = calculateTailPointsGivenHeadPoint({
      x,
      y,
      angle,
    });

    if (graphics.aspectRatio === undefined)
      throw Error("aspectRatio undefined");

    vertices[0] = x * graphics.aspectRatio;
    vertices[1] = y;

    vertices[2] = x2 * graphics.aspectRatio;
    vertices[3] = y2;

    vertices[4] = x3 * graphics.aspectRatio;
    vertices[5] = y3;

    this.vertices = vertices;

    gl.bufferData(gl.ARRAY_BUFFER, vertices.buffer, gl.DYNAMIC_DRAW);
  }
  update(graphics: Graphics, nearbyBoids?: Array<Boid>) {
    const gl = graphics.getGL();
    if (!gl) {
      throw Error("gl is null");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    this.vertices[0] += this.x_vel;
    this.vertices[1] += this.y_vel;
    // first two indices are the coords of the head of the triangle
    // second two indices is one of the coords of the tail
    // third two indices is the other one of the coords of the tail
    if (this.vertices[0] > 1 || this.vertices[0] < -1) {
      this.x_vel *= -1;
    }
    if (this.vertices[1] > 1 || this.vertices[1] < -1) {
      this.y_vel *= -1;
    }
    const mag = Math.sqrt(this.x_vel ** 2 + this.y_vel ** 2);
    // need to multiply by sign of y
    let facingAngle = Math.acos(this.x_vel / mag) * Math.sign(this.y_vel);
    if (this.x_vel === 0 && this.y_vel < 0) {
      facingAngle = (3 * Math.PI) / 2;
    } else if (this.x_vel === 0 && this.y_vel > 0) {
      facingAngle = Math.PI / 2;
    } else if (this.x_vel > 0 && this.y_vel == 0) {
      facingAngle = 0;
    } else if (this.x_vel < 0 && this.y_vel === 0) {
      facingAngle = Math.PI;
    }
    if (graphics.aspectRatio === undefined) {
      throw Error("aspectRatio is undefined");
    }
    const { x2, y2, x3, y3 } = calculateTailPointsGivenHeadPoint({
      // have to divide by the aspect ratio because the x value was multiplied by the aspect ratio in the constructor and then passed into the vertices array
      x: this.vertices[0] / graphics.aspectRatio,
      y: this.vertices[1],
      angle: facingAngle,
    });

    this.vertices[2] = x2 * graphics.aspectRatio;
    this.vertices[3] = y2;

    this.vertices[4] = x3 * graphics.aspectRatio;
    this.vertices[5] = y3;
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
  }
  draw(graphics: Graphics) {
    const gl = graphics.getGL();
    if (!gl) {
      throw Error("gl is null");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    const positionLocation = gl.getAttribLocation(graphics.program, "position");

    if (positionLocation === -1) {
      throw Error("position attribute -1");
    }

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 2 * 4, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  getVertices() {
    return this.vertices
  }
}

export { Boid };
