import { useEffect, useRef } from "react";
import "./App.css";

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

      const RATIO = 0.05;
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

          this.x_vel = -Math.cos(angle + Math.PI / 12) / 60;
          this.y_vel = -Math.sin(angle + Math.PI / 12) / 60;

          const x = Math.random() * 2 - 1;
          const y = Math.random() * 2 - 1;

          const x2 = RATIO * Math.cos(angle) + x;
          const y2 = RATIO * Math.sin(angle) + y;

          const x3 = RATIO * Math.cos(angle + Math.PI / 6) + x;
          const y3 = RATIO * Math.sin(angle + Math.PI / 6) + y;

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
          for (let i = 0; i < this.vertices.length; i += 2) {
            this.vertices[i] += this.x_vel;
            this.vertices[i + 1] += this.y_vel;
          }
          // first two indices are the coords of the head of the triangle
          // second two indices is one of the coords of the tail
          // third two indices is the other one of the coords of the tail
          if (this.vertices[0] > 1 || this.vertices[0] < -1) {
            this.x_vel *= -1;
            // whenever x velocity changes, we just flip the tail around the y axis
            const diffx1 = this.vertices[0] - this.vertices[2];
            const diffx2 = this.vertices[0] - this.vertices[4];
            this.vertices[2] = this.vertices[0] + diffx1;
            this.vertices[4] = this.vertices[0] + diffx2;
          }
          if (this.vertices[1] > 1 || this.vertices[1] < -1) {
            this.y_vel *= -1;
            // whenever y velocity changes, we just flip the tail around the x axis
            const diffy1 = this.vertices[1] - this.vertices[3];
            const diffy2 = this.vertices[1] - this.vertices[5];
            this.vertices[3] = this.vertices[1] + diffy1;
            this.vertices[5] = this.vertices[1] + diffy2;
          }
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
      for (let i = 0; i < 200; ++i) {
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
    <>
      <canvas ref={canvasRef}></canvas>
    </>
  );
}

export default App;
