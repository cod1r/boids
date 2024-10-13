import { useEffect, useRef } from "react";
import "./App.css";
// separation: steer to avoid crowding local flockmates
// alignment: steer towards the average heading of local flockmates
// cohesion: steer to move towards the average position (center of mass) of local flockmates
//
//
// make sure that the tail of the boids change along with how the head changes angle
// tail coords are always calculated relative to the head, distance wise and angle wise
const OFFSET_ANGLE = (165 * Math.PI) / 180;
const DIFF_BETWEEN_TAILS_ANGLE = Math.PI / 6;

const RATIO = 0.05;
function calculateTailPointsGivenHeadPoint({
  x,
  y,
  angle,
}: {
  x: number;
  y: number;
  angle: number;
}) {
  const x2 = RATIO * Math.cos(angle + OFFSET_ANGLE) + x;
  const y2 = RATIO * Math.sin(angle + OFFSET_ANGLE) + y;

  const x3 =
    RATIO * Math.cos(angle + OFFSET_ANGLE + DIFF_BETWEEN_TAILS_ANGLE) + x;
  const y3 =
    RATIO * Math.sin(angle + OFFSET_ANGLE + DIFF_BETWEEN_TAILS_ANGLE) + y;
  return { x2, y2, x3, y3 };
}
function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const gl = canvas.getContext("webgl2");

      if (!gl) {
        throw Error("gl context is null");
      }

      const root = document.getElementById("root");
      if (!root) throw Error("no root element");

      canvas.width = root.clientWidth;
      canvas.height = root.clientHeight;

      gl.viewport(0, 0, canvas.width, canvas.height);

      const ASPECT_RATIO = canvas.height / canvas.width;

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

      const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(vertexShader, vertexShaderSrc);
      gl.shaderSource(fragmentShader, fragmentShaderSrc);
      gl.compileShader(vertexShader);
      gl.compileShader(fragmentShader);

      const program = gl.createProgram()!;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      class Boid {
        x_vel: number;
        y_vel: number;
        buffer: ReturnType<typeof gl.createBuffer>;
        vertices: Float32Array;
        constructor() {
          if (!gl) {
            throw Error("gl is null");
          }
          this.buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

          const positionLocation = gl.getAttribLocation(program, "position");

          if (positionLocation === -1) {
            throw Error("position attribute -1");
          }

          gl.vertexAttribPointer(
            positionLocation,
            2,
            gl.FLOAT,
            false,
            2 * 4,
            0,
          );
          gl.enableVertexAttribArray(positionLocation);

          const vertices = new Float32Array(2 * 3);

          const angle = Math.random() * 2 * Math.PI;
          this.x_vel = Math.cos(angle) / 240;
          this.y_vel = -Math.sin(angle) / 240;

          const x = Math.random() * 2 - 1;
          const y = Math.random() * 2 - 1;

          const { x2, y2, x3, y3 } = calculateTailPointsGivenHeadPoint({
            x,
            y,
            angle,
          });

          vertices[0] = x * ASPECT_RATIO;
          vertices[1] = y;

          vertices[2] = x2 * ASPECT_RATIO;
          vertices[3] = y2;

          vertices[4] = x3 * ASPECT_RATIO;
          vertices[5] = y3;

          this.vertices = vertices;

          gl.bufferData(gl.ARRAY_BUFFER, vertices.buffer, gl.DYNAMIC_DRAW);
        }
        update() {
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
          const { x2, y2, x3, y3 } = calculateTailPointsGivenHeadPoint({
            // have to divide by the aspect ratio because the x value was multiplied by the aspect ratio in the constructor and then passed into the vertices array
            x: this.vertices[0] / ASPECT_RATIO,
            y: this.vertices[1],
            angle: facingAngle,
          });

          this.vertices[2] = x2 * ASPECT_RATIO;
          this.vertices[3] = y2;

          this.vertices[4] = x3 * ASPECT_RATIO;
          this.vertices[5] = y3;
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        }
        draw() {
          if (!gl) {
            throw Error("gl is null");
          }
          gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
          const positionLocation = gl.getAttribLocation(program, "position");

          if (positionLocation === -1) {
            throw Error("position attribute -1");
          }

          gl.vertexAttribPointer(
            positionLocation,
            2,
            gl.FLOAT,
            false,
            2 * 4,
            0,
          );
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      }
      const boids = Array<Boid>();
      for (let i = 0; i < 100; ++i) {
        const boid = new Boid();
        boids.push(boid);
      }
      const loop = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        boids.forEach((b) => {
          b.update();
          b.draw();
        });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }, []);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
