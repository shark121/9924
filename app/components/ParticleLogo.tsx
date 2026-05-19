"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

interface ParticleLogoProps {
  src: string;
  particleCount?: number;
  sizeFactor?: number;
  className?: string;
}

export default function ParticleLogo({
  src,
  particleCount,
  sizeFactor = 0.9,
  className,
}: ParticleLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth <= 768;
    const PARTICLE_COUNT = particleCount ?? (isMobile ? 25000 : 60000);

    let width = container.clientWidth;
    let height = container.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
    camera.position.z = -50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0xffffff, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    function createTileTexture() {
      const size = 64;
      const gap = 3;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d")!;
      const imgData = ctx.createImageData(size, size);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const px = (i / 4) % size;
        const py = Math.floor(i / 4 / size);
        const inTile = px >= gap && px < size - gap && py >= gap && py < size - gap;
        if (inTile) {
          imgData.data[i] = 255;
          imgData.data[i + 1] = 255;
          imgData.data[i + 2] = 255;
          imgData.data[i + 3] = 255;
        } else {
          imgData.data[i + 3] = 0;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    const spriteTex = createTileTexture();

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSprite: { value: spriteTex },
        uSize: { value: 10.0 * pixelRatio },
        uOpacity: { value: 0.0 },
      },
      vertexShader: `
        attribute vec3 aColor;
        varying vec3 vColor;
        uniform float uSize;
        void main() {
          vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * (2.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform sampler2D uSprite;
        uniform float uTime;
        uniform float uOpacity;
        varying vec3 vColor;
        void main() {
          vec4 sprite = texture2D(uSprite, gl_PointCoord);
          if (sprite.a < 0.1) discard;
          float flicker = 0.96 + 0.04 * sin(uTime * 6.0 + gl_PointCoord.x * 10.0);
          gl_FragColor = vec4(vColor * flicker, sprite.a * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const prevTargets = new Float32Array(PARTICLE_COUNT * 3);
    const nextTargets = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const staggerOffsets = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      staggerOffsets[i] = Math.random();
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      colors[i * 3] = 0.1;
      colors[i * 3 + 1] = 0.1;
      colors[i * 3 + 2] = 0.1;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(geometry, particleMat);
    scene.add(particles);

    const morphProgress = { value: 1.0 };
    let logoPositions: Float32Array | null = null;

    function updateTargetsFromMorph() {
      const p = morphProgress.value;
      const staggerRange = 0.35;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const offset = staggerOffsets[i] * staggerRange;
        const localP = Math.max(0, Math.min(1, (p - offset) / (1.0 - staggerRange)));
        const t = localP;
        const ep = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        targetPositions[i3] = prevTargets[i3] + (nextTargets[i3] - prevTargets[i3]) * ep;
        targetPositions[i3 + 1] = prevTargets[i3 + 1] + (nextTargets[i3 + 1] - prevTargets[i3 + 1]) * ep;
        targetPositions[i3 + 2] = prevTargets[i3 + 2] + (nextTargets[i3 + 2] - prevTargets[i3 + 2]) * ep;
      }
    }

    function generateFromImage(imgSrc: string, count: number, sizeFactor = 1.0) {
      return new Promise<{ positions: Float32Array; colors: Float32Array }>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const c = document.createElement("canvas");
          const maxW = 512;
          const scale = Math.min(maxW / img.width, maxW / img.height);
          c.width = Math.floor(img.width * scale);
          c.height = Math.floor(img.height * scale);
          const ctx = c.getContext("2d")!;
          ctx.drawImage(img, 0, 0, c.width, c.height);
          const data = ctx.getImageData(0, 0, c.width, c.height).data;

          const candidates: { x: number; y: number; r: number; g: number; b: number }[] = [];
          for (let y = 0; y < c.height; y++) {
            for (let x = 0; x < c.width; x++) {
              const idx = (y * c.width + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const a = data[idx + 3];
              const brightness = (r + g + b) / 3;
              if (a > 128 && brightness < 200) {
                candidates.push({ x, y, r, g, b });
              }
            }
          }

          const pos: number[] = [];
          const cols: number[] = [];
          const imgAspect = c.width / c.height;
          const vFov = (camera.fov * Math.PI) / 180;
          const visibleH = 2 * 14 * Math.tan(vFov / 2);
          const visibleW = visibleH * camera.aspect;
          // Contain fit — whichever axis is the binding constraint scales the image.
          let worldW: number;
          let worldH: number;
          if (imgAspect > visibleW / visibleH) {
            worldW = visibleW * sizeFactor;
            worldH = worldW / imgAspect;
          } else {
            worldH = visibleH * sizeFactor;
            worldW = worldH * imgAspect;
          }

          for (let i = 0; i < count; i++) {
            const cand = candidates[Math.floor(Math.random() * candidates.length)];
            if (cand) {
              const px = (cand.x / c.width - 0.5) * worldW;
              const py = (0.5 - cand.y / c.height) * worldH;
              const pz = (Math.random() - 0.5) * 0.2;
              pos.push(px, py, pz);
              cols.push(cand.r / 255, cand.g / 255, cand.b / 255);
            } else {
              pos.push((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, 0);
              cols.push(0.1, 0.1, 0.1);
            }
          }
          resolve({
            positions: new Float32Array(pos),
            colors: new Float32Array(cols),
          });
        };
        img.onerror = () => {
          const fallback = new Float32Array(count * 3);
          const fc = new Float32Array(count * 3).fill(0.1);
          for (let i = 0; i < count * 3; i++) {
            fallback[i] = (Math.random() - 0.5) * 10;
          }
          resolve({ positions: fallback, colors: fc });
        };
        img.src = imgSrc;
      });
    }

    const mouse = { x: -999, y: -999, sx: -999, sy: -999 };
    function handleMouseMove(e: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    function handleMouseLeave() {
      mouse.x = -999;
      mouse.y = -999;
    }
    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mouseleave", handleMouseLeave);

    let resizeRO: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeRO = new ResizeObserver(() => {
        if (!container) return;
        width = container.clientWidth;
        height = container.clientHeight;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      });
      resizeRO.observe(container);
    }

    let rafId = 0;
    const clock = new THREE.Clock();

    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      mouse.sx += (mouse.x - mouse.sx) * 0.25;
      mouse.sy += (mouse.y - mouse.sy) * 0.25;

      const posArr = geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const dx = targetPositions[i3] - posArr[i3];
        const dy = targetPositions[i3 + 1] - posArr[i3 + 1];
        const dz = targetPositions[i3 + 2] - posArr[i3 + 2];
        velocities[i3] += dx * 0.03;
        velocities[i3 + 1] += dy * 0.03;
        velocities[i3 + 2] += dz * 0.03;

        if (logoPositions && mouse.x > -990) {
          // Visible half-extent at z=0 with z=14, fov=50: tan(25°)*14 ≈ 6.53
          const mx = mouse.sx * 6.53;
          const my = mouse.sy * 6.53;
          const distX = posArr[i3] - mx;
          const distY = posArr[i3 + 1] - my;
          const distSq = distX * distX + distY * distY;
          if (distSq < 16.0) {
            const force = (16.0 - distSq) * 0.0025;
            velocities[i3] += distX * force;
            velocities[i3 + 1] += distY * force;
            velocities[i3 + 2] += (Math.random() - 0.5) * force;
          }
        }

        velocities[i3] += Math.sin(t * 0.5 + posArr[i3] * 0.3) * 0.00008;
        velocities[i3 + 1] += Math.cos(t * 0.5 + posArr[i3 + 1] * 0.3) * 0.00008;

        velocities[i3] *= 0.85;
        velocities[i3 + 1] *= 0.85;
        velocities[i3 + 2] *= 0.85;

        posArr[i3] += velocities[i3];
        posArr[i3 + 1] += velocities[i3 + 1];
        posArr[i3 + 2] += velocities[i3 + 2];
      }
      geometry.attributes.position.needsUpdate = true;

      particleMat.uniforms.uTime.value = t;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

    let cancelled = false;
    generateFromImage(src, PARTICLE_COUNT, sizeFactor).then((result) => {
      if (cancelled) return;
      logoPositions = result.positions;
      for (let k = 0; k < PARTICLE_COUNT * 3; k++) {
        nextTargets[k] = result.positions[k];
        prevTargets[k] = positions[k];
        (geometry.attributes.aColor.array as Float32Array)[k] = result.colors[k];
      }
      geometry.attributes.aColor.needsUpdate = true;
      morphProgress.value = 0;

      gsap.to(camera.position, {
        z: 14,
        duration: 2.0,
        ease: "power2.inOut",
      });
      gsap.to(particleMat.uniforms.uOpacity, {
        value: 1.0,
        duration: 1.5,
        delay: 0.3,
      });
      gsap.to(morphProgress, {
        value: 1.0,
        duration: 2.0,
        ease: "power2.inOut",
        onUpdate: updateTargetsFromMorph,
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      resizeRO?.disconnect();
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(particleMat.uniforms.uOpacity);
      gsap.killTweensOf(morphProgress);
      geometry.dispose();
      particleMat.dispose();
      spriteTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [src, particleCount, sizeFactor]);

  return <div ref={containerRef} className={className} />;
}
