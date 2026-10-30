import { useEffect, useRef } from 'react';

interface HeroCanvasProps {
  reducedMotion: boolean;
}

export function HeroCanvas({ reducedMotion }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let gap = 24;
    let cols = 0;
    let rows = 0;
    let ox = 0;
    let oy = 0;
    const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999 };
    let running = false;
    let inView = true;
    let raf = 0;

    const INK = '#ecebe6';
    const ACC = '#ff5b25';

    function resize() {
      if (!canvas || !ctx) return;
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      if (w === 0 || h === 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = w < 700 ? 20 : 24;
      cols = Math.ceil(w / gap) + 1;
      rows = Math.ceil(h / gap) + 1;
      ox = (w - (cols - 1) * gap) / 2;
      oy = (h - (rows - 1) * gap) / 2;
    }

    function draw(t: number) {
      if (!ctx || w === 0 || h === 0) return;
      ctx.clearRect(0, 0, w, h);
      mouse.sx += (mouse.x - mouse.sx) * 0.12;
      mouse.sy += (mouse.y - mouse.sy) * 0.12;

      const period = 15000;
      const p = (t % period) / period;
      const cx = -0.3 * w + p * 1.6 * w;
      const mid = h * 0.56;
      const amp = Math.min(h * 0.2, 170);
      const sigma = Math.max(w * 0.11, 90);
      const k = (Math.PI * 2) / Math.max(w * 0.06, 55);
      const band = gap * 0.8;
      const R = 170;

      for (let i = 0; i < cols; i++) {
        const x = ox + i * gap;
        const dx = x - cx;
        const env = Math.exp(-(dx * dx) / (2 * sigma * sigma));
        const y0 = mid + amp * env * Math.cos(k * dx) + Math.sin(x * 0.006 + t * 0.0005) * 10;
        for (let j = 0; j < rows; j++) {
          const y = oy + j * gap;
          const d = y - y0;
          const lit = Math.exp(-(d * d) / (2 * band * band));
          const mx = x - mouse.sx;
          const my = y - mouse.sy;
          const md = Math.sqrt(mx * mx + my * my);
          const m = md < R ? 1 - md / R : 0;
          let px = x;
          let py = y;
          if (m > 0) {
            px += (mx / (md || 1)) * m * 12;
            py += (my / (md || 1)) * m * 12;
          }
          const strong = lit * (0.2 + 0.8 * env);
          const a = 0.07 + strong * 0.8 + m * 0.35;
          const s = 1.2 + strong * 1.8 + m * 1.4;
          ctx.globalAlpha = a > 1 ? 1 : a;
          ctx.fillStyle = env * lit > 0.22 ? ACC : INK;
          ctx.fillRect(px - s / 2, py - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;
    }

    function loop(t: number) {
      draw(t);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reducedMotion) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    if (reducedMotion) {
      draw(15000 * 0.45);
    } else {
      start();
    }

    const onResize = () => {
      resize();
      if (reducedMotion) draw(15000 * 0.45);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const onVisibility = () => {
      if (document.hidden || !inView) stop();
      else start();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('visibilitychange', onVisibility);

    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView && !document.hidden) start();
        else stop();
      });
      io.observe(canvas);
    }

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      if (io) io.disconnect();
    };
  }, [reducedMotion]);

  return <canvas className="hero__field" id="field" ref={canvasRef} aria-hidden="true" />;
}
