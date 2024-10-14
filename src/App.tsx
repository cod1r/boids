import { useEffect, useRef } from "react";
import "./App.css";
import { Graphics } from "./Graphics";
import { Boid } from "./Boid";
// separation: steer to avoid crowding local flockmates
// alignment: steer towards the average heading of local flockmates
// cohesion: steer to move towards the average position (center of mass) of local flockmates
//
//
// make sure that the tail of the boids change along with how the head changes angle
// tail coords are always calculated relative to the head, distance wise and angle wise

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const graphics = useRef<Graphics | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      graphics.current = new Graphics(canvas);
      const gl = graphics.current.getGL();

      if (!gl) {
        throw Error("gl context is null");
      }

      const root = document.getElementById("root");
      if (!root) throw Error("no root element");

      canvas.width = root.clientWidth;
      canvas.height = root.clientHeight;
      graphics.current.setAspectRatio(canvas.height / canvas.width);

      gl.viewport(0, 0, canvas.width, canvas.height);

      const boids = Array<Boid>();
      for (let i = 0; i < 100; ++i) {
        const boid = new Boid(graphics.current);
        boids.push(boid);
      }
      const loop = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        boids.forEach((b) => {
          if (graphics.current === null) throw Error("graphics object is null");
          b.update(graphics.current);
          b.draw(graphics.current);
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
