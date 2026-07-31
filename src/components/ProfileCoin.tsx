'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Press_Start_2P } from 'next/font/google';
import * as THREE from 'three';

const pressStart2P = Press_Start_2P({ weight: '400', subsets: ['latin'] });

type Props = {
  size?: number;
  thickness?: number;
  slices?: number;
  src?: string;
  className?: string;
};

type BubbleMsg = 'psst' | 'nudge' | 'woah';

export default function ProfileCoin({
  size = 200,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  thickness: _thickness,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  slices: _slices,
  src = '/profile.jpg',
  className = '',
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const coinRef = useRef<THREE.Group | null>(null);
  const rafRef = useRef<number>(0);

  // Rotation physics
  const ryRef = useRef(0);
  const targetRy = useRef(0);
  // Initialized lazily in effects that use it to avoid calling Date.now() during render
  const idleAtRef = useRef(0);

  // Drag state
  const dragging = useRef(false);
  const lastX = useRef(0);
  const accDx = useRef(0);

  // Bubble state
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleMsg, setBubbleMsg] = useState<BubbleMsg>('psst');
  const hasInteracted = useRef(false);
  const introPlayed = useRef(false);
  const woahTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Init Three.js scene
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const W = size;
    const H = size;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene + camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 3.2;

    const radius = 1;
    const thickness = 0.18;
    const segments = 128;

    // Edge: per facet, wide light stripe + narrow dark stripe + gray
    const SLICES = 80;
    const lightW = 2, darkW = 1, grayW = 1;
    const edgeCanvas = document.createElement('canvas');
    edgeCanvas.width = SLICES * (lightW + darkW);
    edgeCanvas.height = 1;
    const ectx = edgeCanvas.getContext('2d')!;
    for (let i = 0; i < SLICES; i++) {
      const x = i * (lightW + darkW + grayW);
      ectx.fillStyle = 'rgb(230,230,230)';
      ectx.fillRect(x, 0, lightW, 1);
      ectx.fillStyle = 'rgb(144,144,144)';
      ectx.fillRect(x + lightW, 0, darkW, 1);
      ectx.fillStyle = 'rgb(200,200,200)';
      ectx.fillRect(x + lightW + darkW, 0, grayW, 1);
    }
    const edgeTex = new THREE.CanvasTexture(edgeCanvas);
    edgeTex.colorSpace = THREE.SRGBColorSpace;
    edgeTex.minFilter = THREE.NearestFilter;
    edgeTex.magFilter = THREE.NearestFilter;

    const silverMat = new THREE.MeshBasicMaterial({ map: edgeTex });

    // Helper: build a composite silver+photo canvas texture
    function makeFaceTex(mirror: boolean): THREE.CanvasTexture {
      const faceSize = 512;
      const canvas = document.createElement('canvas');
      canvas.width = faceSize;
      canvas.height = faceSize;
      const ctx = canvas.getContext('2d')!;

      const cx0 = faceSize / 2, cy0 = faceSize / 2;
      const photoR = faceSize * 0.44;
      const outerR = faceSize / 2;

      // Silver radial gradient, only on the outer ring (annulus)
      const gx = mirror ? faceSize * 0.62 : faceSize * 0.38;
      const gy = faceSize * 0.32;
      const gradR = Math.max(
        Math.hypot(gx, gy), Math.hypot(faceSize - gx, gy),
        Math.hypot(gx, faceSize - gy), Math.hypot(faceSize - gx, faceSize - gy),
      );
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gradR);
      grad.addColorStop(0,    '#f0f0f0');
      grad.addColorStop(0.22, '#c8c8c8');
      grad.addColorStop(0.52, '#909090');
      grad.addColorStop(0.80, '#404040');
      grad.addColorStop(1.0,  '#0f172a');

      // Clip to annular ring: outer circle minus inner photo circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx0, cy0, outerR, 0, Math.PI * 2);
      ctx.arc(cx0, cy0, photoR, 0, Math.PI * 2, true);
      ctx.clip('evenodd');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, faceSize, faceSize);

      // Inset box-shadow on the outer ring only
      const topHL = ctx.createLinearGradient(0, 0, 0, faceSize * 0.14);
      topHL.addColorStop(0, 'rgba(255,255,255,0.4)');
      topHL.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = topHL;
      ctx.fillRect(0, 0, faceSize, faceSize);

      const botSH = ctx.createLinearGradient(0, faceSize * 0.86, 0, faceSize);
      botSH.addColorStop(0, 'rgba(0,0,0,0)');
      botSH.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = botSH;
      ctx.fillRect(0, 0, faceSize, faceSize);
      ctx.restore();

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;

      // Load photo async, draw into inner circle with natural colors (no overlay)
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const r = photoR;
        const cx = faceSize / 2;
        const cy = faceSize / 2;
        ctx.save();
        if (mirror) {
          ctx.translate(faceSize, 0);
          ctx.scale(-1, 1);
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        const aspect = img.naturalWidth / img.naturalHeight;
        let sw = r * 2, sh = r * 2;
        if (aspect > 1) { sw = sh * aspect; }
        else             { sh = sw / aspect; }
        const upShift = (sh - r * 2) * 0.08;
        ctx.drawImage(img, cx - r, cy - r - upShift, sw, sh);
        ctx.restore();
        tex.needsUpdate = true;
      };
      img.src = src;

      return tex;
    }

    const frontTex = makeFaceTex(false);
    const backTex  = makeFaceTex(true);

    const frontMat = new THREE.MeshBasicMaterial({ map: frontTex });
    const backMat  = new THREE.MeshBasicMaterial({ map: backTex });

    // Build coin group
    const group = new THREE.Group();

    // Edge, 64-sided flat polygon cylinder
    const edgeGeo  = new THREE.CylinderGeometry(radius, radius, thickness, 64, 1, true);
    const edgeMesh = new THREE.Mesh(edgeGeo, silverMat);
    edgeMesh.rotation.x = Math.PI / 2;
    group.add(edgeMesh);

    // Front face
    const frontGeo  = new THREE.CircleGeometry(radius * 0.999, segments);
    const frontMesh = new THREE.Mesh(frontGeo, frontMat);
    frontMesh.position.z = thickness / 2 + 0.001;
    group.add(frontMesh);

    // Back face, rotated 180° so it faces backward
    const backGeo  = new THREE.CircleGeometry(radius * 0.999, segments);
    const backFaceMesh = new THREE.Mesh(backGeo, backMat);
    backFaceMesh.rotation.y = Math.PI;
    backFaceMesh.position.z = -(thickness / 2 + 0.001);
    group.add(backFaceMesh);

    scene.add(group);
    coinRef.current = group;

    // Intro spin
    targetRy.current = Math.PI * 2.2;
    idleAtRef.current = Date.now() + 700;
    const introT = setTimeout(() => {
      targetRy.current = 0;
      idleAtRef.current = Date.now() + 1200;
      setTimeout(() => {
        introPlayed.current = true;
        setBubbleVisible(true);
        setBubbleMsg('psst');
      }, 300);
    }, 700);

    // Animation loop
    const tick = () => {
      const coin = coinRef.current;
      if (coin) {
        if (Date.now() > idleAtRef.current) {
          targetRy.current *= 0.98;
          if (Math.abs(targetRy.current) < 0.001) targetRy.current = 0;
          ryRef.current *= 0.88;
        } else {
          ryRef.current += (targetRy.current - ryRef.current) * 0.18;
        }
        coin.rotation.y = ryRef.current;
      }
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(introT);
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [size, src]);

  // Pointer events
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      lastX.current = e.clientX;
      accDx.current = 0;
      if (!hasInteracted.current) {
        hasInteracted.current = true;
        if (bubbleMsg !== 'woah') setBubbleVisible(false);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      accDx.current += Math.abs(dx);
      if (accDx.current < 8) return;
      targetRy.current += dx * 0.04;
      idleAtRef.current = Date.now() + 3000;
      if (Math.abs(dx) > 10) {
        if (woahTimerRef.current) clearTimeout(woahTimerRef.current);
        setBubbleMsg('woah');
        setBubbleVisible(true);
        woahTimerRef.current = setTimeout(() => setBubbleVisible(false), 3000);
      }
    };

    const onUp = () => { dragging.current = false; accDx.current = 0; };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [bubbleMsg]);

  // Auto-hide bubble (skip woah)
  useEffect(() => {
    if (!bubbleVisible || bubbleMsg === 'woah') return;
    const t = setTimeout(() => setBubbleVisible(false), 3000);
    return () => clearTimeout(t);
  }, [bubbleVisible, bubbleMsg]);

  // Re-show bubble every 10s until first interaction
  useEffect(() => {
    if (bubbleVisible || hasInteracted.current || !introPlayed.current) return;
    const t = setTimeout(() => {
      setBubbleMsg(prev => (prev === 'psst' ? 'nudge' : 'psst'));
      setBubbleVisible(true);
    }, 10000);
    return () => clearTimeout(t);
  }, [bubbleVisible]);

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}
    >
      {/* Soft glow behind coin */}
      <div style={{
        position: 'absolute',
        inset: -18,
        borderRadius: '999px',
        background: 'radial-gradient(closest-side, rgba(120,120,255,0.18), transparent 70%)',
        filter: 'blur(16px)',
        pointerEvents: 'none',
      }} />

      {/* Three.js canvas mount */}
      <div
        ref={mountRef}
        style={{ width: size, height: size, cursor: 'grab', touchAction: 'pan-y', userSelect: 'none' }}
      />

      {/* Dialogue bubble */}
      <AnimatePresence>
        {bubbleVisible && (
          <motion.div
            key={bubbleMsg}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15, ease: [0.3, 0.7, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: `${-size * 0.13}px`,
              left: `${-size * 0.61}px`,
              width: `${size * 1.45}px`,
              transformOrigin: '75% 95%',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            <div style={{ position: 'relative' }}>
              <img src="/DialogueBubble.png" alt="" style={{ width: '100%', display: 'block' }} />
              <div style={{
                position: 'absolute', top: '10%', left: '8%', right: '8%', bottom: '28%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{
                  margin: 0, width: '100%', textAlign: 'center',
                  fontSize: `${Math.max(7, size * 0.038)}px`,
                  lineHeight: 1.8, color: '#1a1a2e',
                  fontFamily: pressStart2P.style.fontFamily,
                  overflowWrap: 'break-word',
                }}>
                  {bubbleMsg === 'psst' && 'pssst, spin me'}
                  {bubbleMsg === 'nudge' && <>If there was someone<br />who could spin me</>}
                  {bubbleMsg === 'woah' && <>Woooah,<br />careful cowboy.</>}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
