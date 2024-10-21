import { useEffect, useRef } from "react";
import "./App.css";
import { Graphics } from "./Graphics";
import { Boid } from "./Boid";
import { BOID_NEARBY_DIST } from "./utils";
// separation: steer to avoid crowding local flockmates
// alignment: steer towards the average heading of local flockmates
// cohesion: steer to move towards the average position (center of mass) of local flockmates
//
//
// next step: implement cohesion

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const graphics = useRef<Graphics | null>(null);
  const pause = useRef<boolean>(false)
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
          if (!pause.current) {
            const v = b.getVertices()
            const nearby = boids.filter(b2 => {
              const v2 = b2.getVertices()
              const dist = Math.sqrt((v2[0] - v[0]) ** 2 + (v2[1] - v[1]) ** 2)
              if (dist <= BOID_NEARBY_DIST) {
                return true
              }
              return false
            })
            b.update(graphics.current, nearby);
          }
          b.draw(graphics.current);
        });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} onClick={() => {
        pause.current = !pause.current
      }}></canvas>
    </div>
  );
}

export default App;
