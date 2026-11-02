import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CENTRAL_IMAGE } from "@/data/gifts";

// Map the generated vintage eyeball onto the sphere undistorted: draw the
// image into the left half of a 2:1 canvas (fit to 512×512, centred) so its
// centre lands at the sphere's front (u=0.25 → +Z), with parchment filling the
// back hemisphere.
function loadEyeballTexture(onReady) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#efe9dc";
    ctx.fillRect(0, 0, 1024, 512);
    // Place the drawing across a ~105° × 105° cap on the front of the sphere (a
    // 300px square of the 512px front hemisphere). The rest of the sphere is
    // plain sclera and never shows through the lid gap.
    const side = 300;
    const dx = (512 - side) / 2;
    const dy = (512 - side) / 2;
    ctx.drawImage(img, dx, dy, side, side);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    onReady(tex);
  };
  img.src = CENTRAL_IMAGE;
}

// A 3D eyeball that stays centered and rotates so the iris tracks the cursor.
export default function Eye3D() {
  const containerRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const geo = new THREE.SphereGeometry(1.0, 64, 64);
    const mat = new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.6, metalness: 0 });
    const sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);
    const texRef = { current: null };
    loadEyeballTexture((tex) => {
      texRef.current = tex;
      mat.map = tex;
      mat.color.set(0xffffff);
      mat.needsUpdate = true;
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dir = new THREE.DirectionalLight(0xfff3e0, 0.65);
    dir.position.set(2, 2.5, 3);
    scene.add(dir);
    // fill from the lower front so the underside of the eyeball never falls
    // into shadow (that shadow is what read as a dark tint in the opening)
    const fill = new THREE.DirectionalLight(0xfff6e8, 0.55);
    fill.position.set(-1.5, -2.5, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xb8a888, 0.25);
    rim.position.set(-2, -1, -2);
    scene.add(rim);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MAX = 0.12; // ~7° — iris stays within the eyelid opening
    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      target.current.x = Math.max(-1, Math.min(1, dx)) * MAX;
      target.current.y = Math.max(-1, Math.min(1, dy)) * MAX;
    };
    if (!reduce) window.addEventListener("mousemove", onMove, { passive: true });

    let raf;
    const loop = () => {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      sphere.rotation.y = current.current.x;
      sphere.rotation.x = current.current.y;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      if (texRef.current) texRef.current.dispose();
      if (renderer.domElement.parentNode)
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  // Clipped to the almond eye-opening (see AlmondClip) so the sphere only
  // renders inside the lid gap, and multiplied exactly like the eyelid so the
  // drawing's paper drops away into the page instead of sitting inside the
  // opening as a hard white patch.
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ clipPath: "url(#eye-opening)", mixBlendMode: "multiply" }}
    />
  );
}