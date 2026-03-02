import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const NUM_STARS = 300;
    const SPEED = 0.3;
    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // Create stars
    const stars: Star[] = Array.from({ length: NUM_STARS }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * width,
      px: 0,
      py: 0,
    }));

    function project(star: Star) {
      const factor = width / 2 / star.z;
      return {
        sx: star.x * factor + width / 2,
        sy: star.y * factor + height / 2,
        size: Math.max(0.5, (1 - star.z / width) * 3),
        opacity: 1 - star.z / width,
      };
    }

    function draw() {
      ctx!.fillStyle = "rgba(4, 4, 20, 0.15)";
      ctx!.fillRect(0, 0, width, height);

      for (const star of stars) {
        const { sx, sy, size, opacity } = project(star);

        // Draw tail
        ctx!.beginPath();
        ctx!.moveTo(star.px, star.py);
        ctx!.lineTo(sx, sy);
        ctx!.strokeStyle = `rgba(130, 200, 255, ${opacity * 0.4})`;
        ctx!.lineWidth = size * 0.5;
        ctx!.stroke();

        // Draw star dot
        ctx!.beginPath();
        ctx!.arc(sx, sy, size, 0, Math.PI * 2);
        const gradient = ctx!.createRadialGradient(sx, sy, 0, sx, sy, size * 2);
        gradient.addColorStop(0, `rgba(200, 240, 255, ${opacity})`);
        gradient.addColorStop(1, "rgba(100, 180, 255, 0)");
        ctx!.fillStyle = gradient;
        ctx!.fill();

        // Save previous position
        star.px = sx;
        star.py = sy;

        // Move star
        star.z -= SPEED;
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          star.z = width;
          const init = project(star);
          star.px = init.sx;
          star.py = init.sy;
        }
      }
    }

    // Initial clear
    ctx.fillStyle = "#04041a";
    ctx.fillRect(0, 0, width, height);

    // Initialize px, py
    for (const star of stars) {
      const { sx, sy } = project(star);
      star.px = sx;
      star.py = sy;
    }

    function animate() {
      draw();
      animId = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = "#04041a";
      ctx.fillRect(0, 0, width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-field-canvas" />;
}
