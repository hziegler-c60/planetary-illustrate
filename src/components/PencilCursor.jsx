import { useEffect, useRef } from "react";

// A custom pencil cursor that drags a temporary graphite trail (~1s).
// Only active on hover-capable (pointer) devices; touch devices keep the native cursor.
export default function PencilCursor() {
  const canvasRef = useRef(null);
  const tipRef = useRef(null);
  const pointsRef = useRef([]);
  const visibleRef = useRef(false);

  useEffect(() => {
    const hoverOK = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hoverOK) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    document.body.style.cursor = "none";

    let overImage = false;

    const onMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const el = e.target instanceof Element ? e.target : null;
      // the easel plate trades the pencil for a paintbrush of its own
      const brushing = !!el && !!el.closest("[data-brush-cursor]");
      if (tipRef.current) {
        tipRef.current.style.transform = `translate(${x}px, ${y}px)`;
        tipRef.current.style.opacity = brushing ? "0" : "1";
      }
      visibleRef.current = true;

      // graphite is laid down everywhere except across the plate and the easel:
      // over them the stroke lifts, so the trail ends at the edge and resumes past
      const onPicture = brushing || (!!el && !!el.closest("[data-pencil-stop]"));
      const pts = pointsRef.current;
      if (onPicture !== overImage) {
        overImage = onPicture;
        pts.push({ brk: true, t: performance.now() });
      }
      if (reduce || onPicture) return;

      const last = pts[pts.length - 1];
      // throttle: only add a point if moved a little, to keep the trail soft
      if (!last || last.brk || Math.hypot(x - last.x, y - last.y) > 1.5) {
        pts.push({ x, y, t: performance.now() });
        if (pts.length > 220) pts.shift();
      }
    };

    const onLeave = () => {
      if (tipRef.current) tipRef.current.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    const render = () => {
      const now = performance.now();
      const pts = pointsRef.current;
      while (pts.length && now - pts[0].t > 1000) pts.shift();
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (pts.length > 1) {
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i - 1];
          const p1 = pts[i];
          if (p0.brk || p1.brk) continue; // the stroke was lifted over the plate
          const age = (now - p1.t) / 1000; // 0..1
          const alpha = Math.max(0, 0.45 * (1 - age));
          const width = Math.max(0.4, 2.4 * (1 - age));
          ctx.strokeStyle = `rgba(45, 40, 35, ${alpha})`;
          ctx.lineWidth = width;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(render);
    };
    if (!reduce) raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 60 }}
      />
      <div
        ref={tipRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none"
        style={{ zIndex: 70, opacity: 0, willChange: "transform" }}
      >
        <svg
          width="30"
          height="30"
          viewBox="-6 -6 36 36"
          style={{ overflow: "visible", display: "block" }}
        >
          <g transform="rotate(45)">
            {/* graphite tip at origin */}
            <polygon points="-1.6,0 1.6,0 0,4.5" fill="#2d2d2d" />
            {/* wood cone */}
            <polygon points="-1.6,4.5 1.6,4.5 2.6,7.5 -2.6,7.5" fill="#e8c9a0" stroke="#8B4513" strokeWidth="0.4" />
            {/* shaft */}
            <rect x="-2.6" y="7.5" width="5.2" height="15" fill="#f0b34a" stroke="#8B4513" strokeWidth="0.4" />
            <line x1="-2.6" y1="10" x2="2.6" y2="10" stroke="#8B4513" strokeWidth="0.3" opacity="0.5" />
            {/* ferrule */}
            <rect x="-2.7" y="22.5" width="5.4" height="2.4" fill="#a8a29a" stroke="#5a5148" strokeWidth="0.3" />
            {/* eraser */}
            <rect x="-2.4" y="24.9" width="4.8" height="3.4" rx="1" fill="#c98a8a" stroke="#8B4513" strokeWidth="0.3" />
          </g>
        </svg>
      </div>
    </>
  );
}