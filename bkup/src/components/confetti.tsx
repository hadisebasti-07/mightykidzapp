'use client';

import React, { useRef, useEffect } from 'react';

const colors = ['#F2C366', '#E0574F', '#F5E2C3', '#FFFFFF'];

interface ConfettiParticle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  angle: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const particles = useRef<ConfettiParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const createParticles = () => {
      const particleCount = 200;
      const newParticles: ConfettiParticle[] = [];
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          w: Math.random() * 10 + 5,
          h: Math.random() * 20 + 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          angle: Math.random() * 2 * Math.PI,
          speed: Math.random() * 3 + 2,
          rotation: Math.random() * 2 * Math.PI,
          rotationSpeed: Math.random() * 0.1 - 0.05,
          opacity: Math.random() * 0.5 + 0.5,
        });
      }
      particles.current = newParticles;
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p, index) => {
        p.y += p.speed;
        p.x += Math.sin(p.y / 20) * 2;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) {
          particles.current.splice(index, 1);
        }

        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (particles.current.length > 0) {
        animationFrameId.current = requestAnimationFrame(draw);
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    createParticles();
    draw();

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
};
