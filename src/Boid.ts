import { Graphics } from "./Graphics";
import { calculateTailPointsGivenHeadPoint, BOID_NEARBY_AMT_LIMIT } from "./utils";
class Boid {
  x_vel: number;
  y_vel: number;
  buffer: WebGLBuffer | null;
  vertices: Float32Array;
  immunity_from_change: number;
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
    this.x_vel = Math.cos(angle) * 0.005;
    this.y_vel = -Math.sin(angle) * 0.005;

    this.immunity_from_change = 0;

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
  update(graphics: Graphics, nearbyBoids: Array<Boid>) {
    const average_heading = nearbyBoids.reduce((acc, boid) => [acc[0] + boid.x_vel / nearbyBoids.length, acc[1] + boid.y_vel / nearbyBoids.length], [0, 0])
    const gl = graphics.getGL();
    if (!gl) {
      throw Error("gl is null");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    if (nearbyBoids.length <= BOID_NEARBY_AMT_LIMIT && this.immunity_from_change < 0.4) {
      const CHANGE_RATE = 0.05
      const diffX = average_heading[0] - this.x_vel
      const diffY = average_heading[1] - this.y_vel
      this.x_vel += CHANGE_RATE * diffX
      this.y_vel += CHANGE_RATE * diffY
    }
    const magnitude = Math.sqrt(this.x_vel * this.x_vel + this.y_vel * this.y_vel)
    if (magnitude < 0.002) {
      //0.05 * 0.05 = constant * this.x_vel ** 2 + constant * this.y_vel ** 2
      //0.05 ** 2 = constant * this.x_vel * constant * this.x_vel + constant * this.y_vel * constant * this.y_vel
      //0.05 ** 2 = constant**2 * this.x_vel**2 + constant**2 * this.y_vel**2
      //0.05 ** 2 = constant**2 * (this.x_vel**2 + this.y_vel**2)
      //0.05 ** 2 / (this.x_vel**2 + this.y_vel**2) = constant**2
      this.x_vel *= Math.sqrt(0.002 ** 2 / (this.x_vel ** 2 + this.y_vel**2))
      this.y_vel *= Math.sqrt(0.002 ** 2 / (this.x_vel ** 2 + this.y_vel**2))
    }
    if (nearbyBoids.length > BOID_NEARBY_AMT_LIMIT && this.immunity_from_change < 0.1) {
      const average_heading_copy = [...average_heading]
      const temp = average_heading_copy[0];
      average_heading_copy[0] = average_heading_copy[1];
      average_heading_copy[0] = temp;

      // the below if expression divides because it covers the cases of
      // positive over positive which needs to convert to one of the
      // numerator or denominator being negative
      //
      // negative over negative which results in the same thing as above
      //
      // if the division expression is negative, then both needs to be positive or
      // both needs to be negative
      const CHANGE_RATE = 0.1
      if (average_heading_copy[1] / average_heading_copy[0] >= 0) {
        //if (randomToDecideWhatWayToTurn < 0.5) {
        //  this.x_vel += CHANGE_RATE * (-this.x_vel - this.x_vel);
        //} else {
          this.y_vel += CHANGE_RATE * (-average_heading_copy[1] - this.y_vel);
        //}
      } else {
        //if (randomToDecideWhatWayToTurn < 0.5) {
          if (average_heading_copy[0] < 0) {
            this.x_vel += CHANGE_RATE * (-average_heading_copy[0] - this.x_vel);
          }
          if (average_heading_copy[1] < 0) {
            this.y_vel += CHANGE_RATE * (-average_heading_copy[1] - this.y_vel);
          }
        //} else {
        //  if (this.x_vel > 0) {
        //    this.x_vel += CHANGE_RATE * (-this.x_vel - this.x_vel);
        //  }
        //  if (this.y_vel > 0) {
        //    this.y_vel += CHANGE_RATE * (-this.y_vel - this.y_vel);
        //  }
        //}
      }
    }
    this.vertices[0] += this.x_vel;
    this.vertices[1] += this.y_vel;
    // first two indices are the coords of the head of the triangle
    // second two indices is one of the coords of the tail
    // third two indices is the other one of the coords of the tail
    if (this.vertices[0] > 1 || this.vertices[0] < -1) {
      this.immunity_from_change *= 1.2;
      this.x_vel *= -1;
    }
    if (this.vertices[1] > 1 || this.vertices[1] < -1) {
      this.immunity_from_change *= 1.2;
      this.y_vel *= -1;
    }
    this.immunity_from_change *= 0.9875
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
