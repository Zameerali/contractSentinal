"use client";

import React, { useEffect, useRef } from "react";

interface RiskGaugeProps {
  score: number; // 0-100
  size?: number;
  label?: string;
}

export default function RiskGauge({
  score,
  size = 220,
  label,
}: RiskGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getVerdict = (s: number) => {
    if (s <= 25) return { text: "SAFE", color: "#10b981", glow: "#10b98140" };
    if (s <= 50)
      return { text: "LOW RISK", color: "#22d3ee", glow: "#22d3ee40" };
    if (s <= 70)
      return { text: "MEDIUM RISK", color: "#f59e0b", glow: "#f59e0b40" };
    if (s <= 85)
      return { text: "HIGH RISK", color: "#f97316", glow: "#f97316" };
    return { text: "CRITICAL", color: "#ef4444", glow: "#ef444440" };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * 0.65 * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * 0.65}px`;

    const cx = size / 2;
    const cy = size * 0.55;
    const radius = size * 0.4;
    const lineWidth = size * 0.06;

    // Animate
    let currentAngle = 0;
    const targetAngle = (score / 100) * Math.PI;
    const startTime = Date.now();
    const duration = 1200;

    const draw = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      currentAngle = targetAngle * eased;

      ctx.clearRect(0, 0, size, size);

      // Background arc
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI);
      ctx.strokeStyle = "#27272a";
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      // Gradient segments
      const segments = [
        { start: 0, end: 0.25, color: "#10b981" },
        { start: 0.25, end: 0.5, color: "#22d3ee" },
        { start: 0.5, end: 0.7, color: "#f59e0b" },
        { start: 0.7, end: 0.85, color: "#f97316" },
        { start: 0.85, end: 1, color: "#ef4444" },
      ];

      const filledRatio = currentAngle / Math.PI;
      segments.forEach((seg) => {
        if (filledRatio <= seg.start) return;
        const segStart = Math.PI + seg.start * Math.PI;
        const segEnd = Math.PI + Math.min(filledRatio, seg.end) * Math.PI;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, segStart, segEnd);
        ctx.strokeStyle = seg.color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.stroke();
      });

      // Glow effect at tip
      const verdict = getVerdict(score);
      const tipAngle = Math.PI + currentAngle;
      const tipX = cx + Math.cos(tipAngle) * radius;
      const tipY = cy + Math.sin(tipAngle) * radius;
      const glowGradient = ctx.createRadialGradient(
        tipX,
        tipY,
        0,
        tipX,
        tipY,
        lineWidth * 2,
      );
      glowGradient.addColorStop(0, verdict.glow);
      glowGradient.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(tipX, tipY, lineWidth * 2, 0, 2 * Math.PI);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Needle dot
      ctx.beginPath();
      ctx.arc(tipX, tipY, lineWidth * 0.5, 0, 2 * Math.PI);
      ctx.fillStyle = verdict.color;
      ctx.fill();

      if (progress < 1) requestAnimationFrame(draw);
    };

    draw();
  }, [score, size]);

  const verdict = getVerdict(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span
            className="text-4xl font-black tabular-nums"
            style={{ color: verdict.color }}
          >
            {score}
          </span>
          <span
            className="text-xs font-semibold tracking-widest"
            style={{ color: verdict.color }}
          >
            {verdict.text}
          </span>
        </div>
      </div>
      {label && <p className="mt-1 text-sm text-zinc-500">{label}</p>}
    </div>
  );
}
