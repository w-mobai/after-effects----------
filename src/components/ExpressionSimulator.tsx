/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { ExpressionItem } from '../types';
import { Play, Pause, RotateCcw, Sliders, Activity, Info } from 'lucide-react';

interface ExpressionSimulatorProps {
  expression: ExpressionItem;
}

export const ExpressionSimulator: React.FC<ExpressionSimulatorProps> = ({ expression }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  // Parameter states, dynamically extracted based on simulationType
  const [param1, setParam1] = useState(0);
  const [param2, setParam2] = useState(0);
  const [param3, setParam3] = useState(0);

  // Mouse / interactive position for simulation
  const [mousePos, setMousePos] = useState({ x: 150, y: 100 });
  const [isDragging, setIsDragging] = useState(false);

  // Graph history values
  const graphHistoryRef = useRef<number[]>([]);

  // Initialize sliders according to expression type
  useEffect(() => {
    graphHistoryRef.current = [];
    if (expression.simulationType === 'wiggle') {
      setParam1(3); // frequency
      setParam2(45); // amplitude
    } else if (expression.simulationType === 'bounce') {
      setParam1(0.06); // amp
      setParam2(3.5); // freq
      setParam3(4.0); // decay
    } else if (expression.simulationType === 'timeSpeed') {
      setParam1(120); // speed
    } else if (expression.simulationType === 'delay') {
      setParam1(0.12); // delay in seconds
    } else if (expression.simulationType === 'linear' || expression.simulationType === 'ease') {
      setParam1(50); // Input slider value (0-100)
    } else if (expression.simulationType === 'clamp') {
      setParam1(50); // min range
      setParam2(250); // max range
    } else if (expression.simulationType === 'sinCos') {
      setParam1(4); // frequency / speed
      setParam2(60); // amplitude / radius
    } else if (expression.simulationType === 'length') {
      setParam1(180); // sens distance
    } else if (expression.simulationType === 'seedRandom') {
      setParam1(5); // seed
      setParam2(1); // 1 = timeless, 0 = flicker
    } else if (expression.simulationType === 'velocity') {
      setParam1(0.15); // stretch factor
    } else if (expression.simulationType === 'index') {
      setParam1(24); // vertical gap
    }
  }, [expression.simulationType]);

  // RequestAnimationFrame Loop
  useEffect(() => {
    let animationId: number;
    let lastT = performance.now();

    const loop = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastT) / 1000;
        setTime((prev) => prev + delta);
      }
      lastT = now;
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  // Redraw Canvas whenever parameters, time or mouse changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Adapt width to parent container
    if (containerRef.current) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = 240;
    }

    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;

    // Clear canvas
    ctx.fillStyle = '#0f0f13';
    ctx.fillRect(0, 0, w, h);

    // Draw AE style Grid
    ctx.strokeStyle = '#1e1e24';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw coordinate axes
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX, 0); ctx.lineTo(centerX, h);
    ctx.moveTo(0, centerY); ctx.lineTo(w, centerY);
    ctx.stroke();

    // Visual State Variables
    let currentVal = 0; // For graph logging

    // Helper for adding value to scrolling graph
    const logValue = (v: number) => {
      graphHistoryRef.current.push(v);
      if (graphHistoryRef.current.length > 120) {
        graphHistoryRef.current.shift();
      }
    };

    // --- EXECUTE SIMULATION ACCORDING TO TYPE ---
    const type = expression.simulationType;

    if (type === 'wiggle') {
      // Wiggle: Perlin-like 2D noise simulation
      const freq = param1;
      const amp = param2;

      // Pseudo-random noise generation based on sine sum
      const dx = Math.sin(time * freq) * Math.cos(time * freq * 0.7) * amp;
      const dy = Math.cos(time * freq * 1.2) * Math.sin(time * freq * 0.45) * amp;

      const posX = centerX + dx;
      const posY = centerY + dy;

      currentVal = Math.sqrt(dx * dx + dy * dy);
      logValue(dx); // Log the x deviation

      // Draw anchor path trail
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < graphHistoryRef.current.length; i++) {
        const offsetIdx = graphHistoryRef.current.length - 1 - i;
        const trailX = centerX + graphHistoryRef.current[offsetIdx];
        const trailY = centerY + Math.sin(offsetIdx * 0.1) * Math.cos(offsetIdx * 0.12) * amp;
        if (i === 0) ctx.moveTo(trailX, trailY);
        else ctx.lineTo(trailX, trailY);
      }
      ctx.stroke();

      // Draw original reference anchor
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Wiggled Object (Layer Anchor point)
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(posX, posY, 14, 0, Math.PI * 2);
      ctx.shadowColor = '#a78bfa';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Crosshairs for wiggled object
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(posX - 22, posY); ctx.lineTo(posX + 22, posY);
      ctx.moveTo(posX, posY - 22); ctx.lineTo(posX, posY + 22);
      ctx.stroke();

      // Label text
      ctx.fillStyle = '#a78bfa';
      ctx.font = '10px monospace';
      ctx.fillText(`Offset: [${dx.toFixed(1)}, ${dy.toFixed(1)}]`, posX + 25, posY + 4);

    } else if (type === 'timeSpeed') {
      // Rotation driven by time
      const speed = param1;
      const angle = (time * speed * Math.PI) / 180;

      // Draw a rotating HUD element
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);

      // Rotating disc
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 1.5);
      ctx.stroke();

      // Radial pointer
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(50, 0);
      ctx.stroke();

      // Orbiting little satellite
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(50, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Static ticks
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 65, 0, Math.PI * 2);
      ctx.stroke();

      currentVal = (time * speed) % 360;
      logValue(currentVal);

      ctx.fillStyle = '#60a5fa';
      ctx.font = '10px monospace';
      ctx.fillText(`角度: ${currentVal.toFixed(1)}°`, centerX - 35, centerY + 85);

    } else if (type === 'loopOutCycle' || type === 'loopOutPingpong' || type === 'loopIn') {
      // Timeline cyclical loop out/in simulation
      const duration = 2.0; // Seconds of full loop
      let localTime = time % duration;
      let cycleCount = Math.floor(time / duration);

      let animX = 0;
      let curveVal = 0;

      // Draw simple standard keys timeline
      const startX = w * 0.2;
      const endX = w * 0.8;
      const distance = endX - startX;

      // Normal keyframes are A: at t=0, x=0; B: at t=2.0, x=distance
      if (type === 'loopOutCycle') {
        const tRatio = localTime / duration;
        animX = startX + tRatio * distance;
        curveVal = tRatio * 100;
      } else if (type === 'loopOutPingpong') {
        const isForward = cycleCount % 2 === 0;
        const tRatio = localTime / duration;
        animX = isForward ? (startX + tRatio * distance) : (endX - tRatio * distance);
        curveVal = isForward ? (tRatio * 100) : ((1 - tRatio) * 100);
      } else { // loopIn
        // Loops beforehand, but here we simulate pre-loop
        const preLoopTime = time < 4.0 ? (time % duration) : duration;
        const tRatio = preLoopTime / duration;
        animX = startX + tRatio * distance;
        curveVal = tRatio * 100;
      }

      logValue(curveVal);

      // Draw Timeline track
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, centerY);
      ctx.lineTo(endX, centerY);
      ctx.stroke();

      // Keyframes markers
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      // Keyframe 1
      ctx.moveTo(startX, centerY - 6); ctx.lineTo(startX + 6, centerY); ctx.lineTo(startX, centerY + 6); ctx.lineTo(startX - 6, centerY); ctx.closePath(); ctx.fill();
      // Keyframe 2
      ctx.moveTo(endX, centerY - 6); ctx.lineTo(endX + 6, centerY); ctx.lineTo(endX, centerY + 6); ctx.lineTo(endX - 6, centerY); ctx.closePath(); ctx.fill();

      // Keyframe indicators
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '9px monospace';
      ctx.fillText('第 1 关键帧', startX - 25, centerY - 15);
      ctx.fillText('第 2 关键帧', endX - 25, centerY - 15);

      // Loop moving node
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(animX, centerY, 12, 0, Math.PI * 2);
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Status HUD
      ctx.fillStyle = '#34d399';
      ctx.font = '11px monospace';
      ctx.fillText(`时间 (time): ${time.toFixed(2)}s`, startX, centerY + 40);
      ctx.fillText(`循环模式: ${type === 'loopOutCycle' ? 'Cycle 首尾循环' : type === 'loopOutPingpong' ? 'Pingpong 来回循环' : 'LoopIn 前置循环'}`, startX, centerY + 58);

    } else if (type === 'delay') {
      // ValueAtTime Delay Follower
      const delay = param1;
      const numFollowers = 5;

      // Leader follows a smooth infinity curve or mouse pos
      let leaderX = centerX + Math.sin(time * 2.5) * (w * 0.35);
      let leaderY = centerY + Math.cos(time * 5.0) * 40;

      if (isDragging) {
        leaderX = mousePos.x;
        leaderY = mousePos.y;
      }

      // Log leadership coordinates
      logValue(leaderY - centerY);

      // History trail of positions to sample from
      const posHistory: { x: number; y: number; t: number }[] = [];
      const historyLength = 100;
      const historyRef = (canvas as any)._posHistory || [];
      
      historyRef.push({ x: leaderX, y: leaderY, t: time });
      if (historyRef.length > historyLength) historyRef.shift();
      (canvas as any)._posHistory = historyRef;

      // Draw followers from history matching time - delay * idx
      for (let i = numFollowers; i >= 1; i--) {
        const delaySec = i * delay;
        // Search back in history
        const targetTime = time - delaySec;
        let sample = historyRef[0] || { x: leaderX, y: leaderY };
        
        // Find closest frame
        for (let j = historyRef.length - 1; j >= 0; j--) {
          if (historyRef[j].t <= targetTime) {
            sample = historyRef[j];
            break;
          }
        }

        // Draw delayed follower
        const alpha = 1.0 - (i / (numFollowers + 1));
        ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sample.x, sample.y, 14 - i * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Connector line
        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sample.x, sample.y);
        // Find next closer follower
        let nextSample = { x: leaderX, y: leaderY };
        const nextTargetTime = time - (i - 1) * delay;
        for (let j = historyRef.length - 1; j >= 0; j--) {
          if (historyRef[j].t <= nextTargetTime) {
            nextSample = historyRef[j];
            break;
          }
        }
        ctx.lineTo(nextSample.x, nextSample.y);
        ctx.stroke();
      }

      // Draw Leader
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(leaderX, leaderY, 15, 0, Math.PI * 2);
      ctx.shadowColor = '#fda4af';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.fillText('LEADER', leaderX - 16, leaderY + 3);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px monospace';
      ctx.fillText('拖拽红色球或观看其路径延迟效果', 15, 25);

    } else if (type === 'linear' || type === 'ease') {
      // Linear vs Ease mapping demo
      const sliderVal = param1; // 0 to 100 (Driver Slider)
      
      // Calculate output position
      const minOutX = w * 0.25;
      const maxOutX = w * 0.75;
      const deltaOut = maxOutX - minOutX;

      // Linear mapping
      const linearRatio = sliderVal / 100;
      const linearX = minOutX + linearRatio * deltaOut;

      // Ease mapping (smoothstep Hermite interpolation)
      const t = sliderVal / 100;
      const easeRatio = t * t * (3 - 2 * t);
      const easeX = minOutX + easeRatio * deltaOut;

      currentVal = type === 'linear' ? linearRatio * 100 : easeRatio * 100;
      logValue(currentVal);

      // Draw horizontal tracks
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(minOutX, centerY - 25); ctx.lineTo(maxOutX, centerY - 25);
      ctx.moveTo(minOutX, centerY + 25); ctx.lineTo(maxOutX, centerY + 25);
      ctx.stroke();

      // Limits markers
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 2;
      ctx.strokeRect(minOutX - 2, centerY - 45, 4, 90);
      ctx.strokeRect(maxOutX - 2, centerY - 45, 4, 90);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px monospace';
      ctx.fillText('输出下限 0%', minOutX - 30, centerY - 55);
      ctx.fillText('输出上限 100%', maxOutX - 30, centerY - 55);

      // Draw Linear ball (Red)
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(linearX, centerY - 25, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Linear', linearX - 18, centerY - 40);

      // Draw Ease ball (Purple)
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(easeX, centerY + 25, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Ease', easeX - 12, centerY + 10);

      // Draw virtual Input Slider representation
      ctx.fillStyle = '#10b981';
      ctx.font = '11px font-mono';
      ctx.fillText(`控制滑块 (Slider Input Value): ${sliderVal.toFixed(0)}`, minOutX, centerY + 75);

    } else if (type === 'clamp') {
      // Clamp: restricts motion boundary
      const minLimit = param1;
      const maxLimit = param2;

      // Virtual driver sweeps back and forth
      const sweepX = centerX + Math.sin(time * 2) * (w * 0.4);
      const clampedX = Math.max(centerX - minLimit, Math.min(centerX + maxLimit, sweepX));

      logValue(clampedX - centerX);

      // Draw limits walls
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
      ctx.fillRect(0, 0, centerX - minLimit, h);
      ctx.fillRect(centerX + maxLimit, 0, w - (centerX + maxLimit), h);

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - minLimit, 0); ctx.lineTo(centerX - minLimit, h);
      ctx.moveTo(centerX + maxLimit, 0); ctx.lineTo(centerX + maxLimit, h);
      ctx.stroke();

      // Labels of boundaries
      ctx.fillStyle = '#fca5a5';
      ctx.font = '10px monospace';
      ctx.fillText('最小值临界 (Min clamp)', centerX - minLimit + 10, 20);
      ctx.fillText('最大值临界 (Max clamp)', centerX + maxLimit - 120, 20);

      // Draw actual driver path indicator (unclamped)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(sweepX, centerY - 30, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(sweepX, centerY - 30, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('原始输入 (unclamped)', sweepX - 45, centerY - 45);

      // Draw clamped moving layer (Green)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(clampedX, centerY + 20, 16, 0, Math.PI * 2);
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(clampedX, centerY + 20, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px font-mono';
      ctx.fillText('受限图层 (Clamped)', clampedX - 45, centerY + 48);

    } else if (type === 'seedRandom') {
      // seedRandom: static grid heights generator
      const seed = param1;
      const timeless = param2 === 1; // 1 means fixed

      // Generate heights array
      const numBars = 10;
      const barWidth = 30;
      const gap = 12;
      const totalWidth = numBars * barWidth + (numBars - 1) * gap;
      const startX = centerX - totalWidth / 2;

      logValue(timeless ? seed : Math.random() * 100);

      // Custom pseudo random hash based on index and seed
      const getHash = (idx: number) => {
        if (timeless) {
          // Pure hash based on seed and index
          const val = Math.sin(idx * 123.45 + seed * 987.65) * 4321.09;
          return (val - Math.floor(val));
        } else {
          // Dynamic over time
          return Math.random();
        }
      };

      for (let i = 0; i < numBars; i++) {
        const hRatio = getHash(i);
        const barH = 30 + hRatio * 110;
        const xPos = startX + i * (barWidth + gap);
        const yPos = centerY + 50 - barH;

        ctx.fillStyle = timeless ? 'rgba(59, 130, 246, 0.7)' : 'rgba(168, 85, 247, 0.7)';
        ctx.fillRect(xPos, yPos, barWidth, barH);
        
        ctx.strokeStyle = timeless ? '#60a5fa' : '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(xPos, yPos, barWidth, barH);

        // Draw seed label
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '8px monospace';
        ctx.fillText(`#${i}`, xPos + 10, centerY + 65);
      }

      ctx.fillStyle = '#e4e4e7';
      ctx.font = '11px monospace';
      ctx.fillText(`种子种子 (Seed): ${seed} | 独立静态 (Timeless): ${timeless ? 'TRUE (静止随机)' : 'FALSE (随机闪烁)'}`, startX, 25);

    } else if (type === 'sinCos') {
      // Sin and Cos combining circular orbit
      const freq = param1;
      const radius = param2;

      // Calculate orbiting coords
      const dx = Math.cos(time * freq) * radius;
      const dy = Math.sin(time * freq) * radius;

      const posX = centerX + dx;
      const posY = centerY + dy;

      logValue(dx);

      // Draw orbiting circular track
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Projection lines to X and Y axes
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'; // Cos (Red) on X-axis
      ctx.beginPath();
      ctx.moveTo(posX, posY);
      ctx.lineTo(posX, centerY);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'; // Sin (Blue) on Y-axis
      ctx.beginPath();
      ctx.moveTo(posX, posY);
      ctx.lineTo(centerX, posY);
      ctx.stroke();

      // Orbiting object (Green)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(posX, posY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting center anchor
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f87171';
      ctx.font = '10px monospace';
      ctx.fillText(`Math.cos: ${dx.toFixed(1)}`, centerX - 120, centerY - radius - 15);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`Math.sin: ${dy.toFixed(1)}`, centerX + radius + 15, centerY + 25);

    } else if (type === 'length') {
      // Dynamic distance reaction
      const sensDistance = param1; // 180px

      // Target following infinity loop or drag
      let targetX = centerX + Math.sin(time * 1.5) * 110;
      let targetY = centerY + Math.cos(time * 0.8) * 50;

      if (isDragging) {
        targetX = mousePos.x;
        targetY = mousePos.y;
      }

      // Main sensor layer located in center
      const dist = Math.sqrt(Math.pow(targetX - centerX, 2) + Math.pow(targetY - centerY, 2));

      // Interpolation to compute size/opacity based on distance
      // If close (dist=0), scale=100%, opacity=100%
      // If far (dist=sensDistance), scale=20%, opacity=20%
      const reactionScale = Math.max(15, Math.min(65, (1.0 - (dist / sensDistance)) * 50 + 15));
      const reactionOpacity = Math.max(0.15, Math.min(1.0, 1.0 - (dist / sensDistance)));

      logValue(dist);

      // Draw sensor range boundary circles
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sensDistance, 0, Math.PI * 2);
      ctx.stroke();

      // Draw radar sweep line
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Draggable target object (Red dot)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fca5a5';
      ctx.font = '10px monospace';
      ctx.fillText('拖拽目标 A', targetX + 12, targetY + 4);

      // Main reacting layer in center (Purple box)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.fillStyle = `rgba(168, 85, 247, ${reactionOpacity})`;
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.rect(-reactionScale / 2, -reactionScale / 2, reactionScale, reactionScale);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#c084fc';
      ctx.font = '10px monospace';
      ctx.fillText(`距离 (Distance): ${dist.toFixed(1)}px`, 15, h - 35);
      ctx.fillText(`自适应不透明度: ${(reactionOpacity * 100).toFixed(0)}%`, 15, h - 18);

    } else if (type === 'bounce') {
      // Bounce decay physics simulation
      const amp = param1;   // strength factor, e.g. 0.06
      const freq = param2;  // freq cycles, e.g. 3.5
      const decay = param3; // decay damping factor, e.g. 4.0

      // Simulate keyframes at t = 1.0 (ball drops and stops at CTI=1.0s)
      const dropTime = 1.0;
      let bounceY = 40; // baseline height above ground

      const groundY = centerY + 30;
      const initHeight = groundY - 140;

      if (time < dropTime) {
        // Fall down linearly
        const tRatio = time / dropTime;
        bounceY = initHeight + tRatio * (groundY - initHeight);
      } else {
        // Apply Inertial Bounce physics equation
        const elapsed = time - dropTime;
        const velocity = 350; // virtual impact velocity
        
        // Equation: value + velocity * amp * sin(freq * t * 2 * PI) / exp(decay * t)
        const wiggleAmp = velocity * amp * Math.sin(freq * elapsed * 2 * Math.PI);
        const decayFactor = Math.exp(decay * elapsed);
        const bounceOffset = wiggleAmp / decayFactor;

        bounceY = groundY + bounceOffset;
        currentVal = bounceOffset;
      }

      logValue(currentVal);

      // Draw Ground plane
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.15, groundY);
      ctx.lineTo(w * 0.85, groundY);
      ctx.stroke();

      // Bouncing circle (Organic Q-弹 ball)
      const radius = 14;
      let squashX = radius;
      let squashY = radius;

      // Squash and stretch logic based on displacement
      if (time >= dropTime) {
        const elapsed = time - dropTime;
        const stretchAmount = (currentVal * 0.15) / Math.exp(decay * elapsed * 0.5);
        squashX = radius - stretchAmount;
        squashY = radius + stretchAmount;
      }

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(centerX, bounceY - squashY, Math.abs(squashX), Math.abs(squashY), 0, 0, Math.PI * 2);
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(centerX, bounceY - squashY, Math.abs(squashX), Math.abs(squashY), 0, 0, Math.PI * 2);
      ctx.stroke();

      // UI Instructions
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px monospace';
      ctx.fillText(`时间: ${time.toFixed(2)}s (在 1.0s 产生弹性碰撞)`, w * 0.15, centerY - 65);
      
      // Auto reset after 3.5 seconds
      if (time > 4.5) {
        setTime(0);
      }

    } else if (type === 'lookAt') {
      // LookAt: arrow/eyeball rotating to gaze target
      let targetX = centerX + Math.sin(time * 1.5) * 110;
      let targetY = centerY + Math.cos(time * 1.2) * 60;

      if (isDragging) {
        targetX = mousePos.x;
        targetY = mousePos.y;
      }

      // Compute angle
      const angle = Math.atan2(targetY - centerY, targetX - centerX);

      logValue(angle * 180 / Math.PI);

      // Draw target red orb
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fca5a5';
      ctx.font = '10px monospace';
      ctx.fillText('凝视点 (Target)', targetX + 12, targetY + 4);

      // Draw tracking pupil eyeball in center
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Eye outer sclera
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 3.5;
      ctx.fillStyle = '#1e1e24';
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupil rotates to lookAt
      ctx.rotate(angle);

      // Iris (Blue)
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(12, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Black pupil inner
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(14, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Glare highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(17, -4, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px monospace';
      ctx.fillText('鼠标拖拽红色目标，观察眼球和注视方向联动', 15, 25);

    } else if (type === 'velocity') {
      // Squash and stretch based on drag velocity
      const stretchFactor = param1;

      let targetX = centerX + Math.sin(time * 3) * 100;
      let targetY = centerY + Math.cos(time * 1.5) * 50;

      if (isDragging) {
        targetX = mousePos.x;
        targetY = mousePos.y;
      }

      // Compute velocity (dx/dt) based on current minus previous position
      const prevX = (canvas as any)._prevX || targetX;
      const prevY = (canvas as any)._prevY || targetY;
      
      const velX = targetX - prevX;
      const velY = targetY - prevY;
      const velocity = Math.sqrt(velX * velX + velY * velY);

      (canvas as any)._prevX = targetX;
      (canvas as any)._prevY = targetY;

      logValue(velocity);

      // Squash and stretch math
      const baseRadius = 15;
      const stretchAmt = velocity * stretchFactor;
      const squashedW = baseRadius + stretchAmt * 1.5;
      const squashedH = Math.max(5, baseRadius - stretchAmt * 0.6);

      // Angle of velocity vector
      const moveAngle = Math.atan2(velY, velX);

      // Draw the squashed/stretched moving ball
      ctx.save();
      ctx.translate(targetX, targetY);
      ctx.rotate(moveAngle);

      // Gradient fill representing speed heat
      const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, squashedW);
      grad.addColorStop(0, '#f43f5e');
      grad.addColorStop(1, '#881337');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.ellipse(0, 0, squashedW, squashedH, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, squashedW, squashedH, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      ctx.fillStyle = '#fda4af';
      ctx.font = '10px monospace';
      ctx.fillText(`瞬时速度: ${velocity.toFixed(1)} px/帧`, 15, h - 18);
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('鼠标猛烈拖拽红色小球看它被拉伸变形的效果！', 15, 25);

    } else if (type === 'index') {
      // index based layer staircase offsets
      const gap = param1;

      // Draw 6 stacked "After Effects Layers" blocks
      const numLayers = 6;
      logValue(gap);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px monospace';
      ctx.fillText('图层索引 (Index) 决定了下方图层自动偏离前一个图层的像素值', 15, 25);

      for (let i = 1; i <= numLayers; i++) {
        // Base coordinate + (index - 1) * gap
        const offsetMultiplier = (i - 1) * gap;
        const cardX = centerX - 120 + offsetMultiplier * 1.2;
        const cardY = centerY - 50 + offsetMultiplier;

        // Is highlighted on CTI or index?
        const isSelectedLayer = i === 3;

        ctx.fillStyle = isSelectedLayer ? 'rgba(139, 92, 246, 0.45)' : 'rgba(39, 39, 42, 0.65)';
        ctx.strokeStyle = isSelectedLayer ? '#a78bfa' : '#52525b';
        ctx.lineWidth = isSelectedLayer ? 2 : 1;

        // Draw isometric AE solid layer card representation
        ctx.beginPath();
        ctx.moveTo(cardX, cardY);
        ctx.lineTo(cardX + 160, cardY);
        ctx.lineTo(cardX + 130, cardY + 28);
        ctx.lineTo(cardX - 30, cardY + 28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Layer anchor point center
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cardX + 65, cardY + 14, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw Layer details index label
        ctx.fillStyle = isSelectedLayer ? '#f5f5f7' : '#a1a1aa';
        ctx.font = '9px font-mono';
        ctx.fillText(`[图层 ${i}] Index: ${i}`, cardX + 10, cardY + 17);
        if (isSelectedLayer) {
          ctx.fillStyle = '#c084fc';
          ctx.fillText(`Y Offset: (3-1) * ${gap} = ${offsetMultiplier}px`, cardX + 10, cardY + 38);
        }
      }
    }

    // --- DRAW LIVE GRAPHICS WAVEFORM PLOTTER ---
    const drawWaveform = () => {
      const gW = 120;
      const gH = 45;
      const gX = w - gW - 15;
      const gY = h - gH - 15;

      // Background box for graph
      ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
      ctx.fillRect(gX, gY, gW, gH);
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.strokeRect(gX, gY, gW, gH);

      // Label
      ctx.fillStyle = '#71717a';
      ctx.font = '8px monospace';
      ctx.fillText('实时曲线 (Live Curve)', gX + 5, gY - 4);

      // Plot the values
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const history = graphHistoryRef.current;
      if (history.length > 0) {
        // Find min/max in history for self-scaling
        let maxVal = Math.max(...history);
        let minVal = Math.min(...history);
        if (maxVal === minVal) {
          maxVal += 1; minVal -= 1;
        }
        const range = maxVal - minVal;

        for (let i = 0; i < history.length; i++) {
          const val = history[i];
          const x = gX + (i / 120) * gW;
          // Scale to fit graph height
          const y = gY + gH - ((val - minVal) / range) * gH;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    drawWaveform();

  }, [expression, time, param1, param2, param3, mousePos, isPlaying, isDragging]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Check which parameters apply
  const getSliders = () => {
    const type = expression.simulationType;
    if (type === 'wiggle') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>频率 (Freq - 每秒抖动次数)</span>
              <span className="text-violet-400 font-semibold">{param1} Hz</span>
            </label>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={param1}
              onChange={(e) => setParam1(parseFloat(e.target.value))}
              className="w-full accent-violet-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>振幅 (Amp - 抖动像素范围)</span>
              <span className="text-violet-400 font-semibold">{param2} px</span>
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={param2}
              onChange={(e) => setParam2(parseInt(e.target.value))}
              className="w-full accent-violet-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      );
    } else if (type === 'bounce') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>振幅强度 (amp)</span>
              <span className="text-amber-400 font-semibold">{param1.toFixed(3)}</span>
            </label>
            <input
              type="range"
              min="0.01"
              max="0.15"
              step="0.005"
              value={param1}
              onChange={(e) => setParam1(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>回弹频率 (freq)</span>
              <span className="text-amber-400 font-semibold">{param2.toFixed(1)} Hz</span>
            </label>
            <input
              type="range"
              min="1.0"
              max="7.0"
              step="0.2"
              value={param2}
              onChange={(e) => setParam2(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>衰减阻尼 (decay)</span>
              <span className="text-amber-400 font-semibold">{param3.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.2"
              value={param3}
              onChange={(e) => setParam3(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      );
    } else if (type === 'timeSpeed') {
      return (
        <div className="max-w-md">
          <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
            <span>时间自增速度 (时间 * 系数)</span>
            <span className="text-blue-400 font-semibold">{param1} 度/秒</span>
          </label>
          <input
            type="range"
            min="30"
            max="360"
            step="10"
            value={param1}
            onChange={(e) => setParam1(parseInt(e.target.value))}
            className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      );
    } else if (type === 'delay') {
      return (
        <div className="max-w-md">
          <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
            <span>延迟跟随时间 (Delay Seconds)</span>
            <span className="text-pink-400 font-semibold">{param1.toFixed(2)} 秒</span>
          </label>
          <input
            type="range"
            min="0.04"
            max="0.40"
            step="0.02"
            value={param1}
            onChange={(e) => setParam1(parseFloat(e.target.value))}
            className="w-full accent-pink-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      );
    } else if (type === 'linear' || type === 'ease') {
      return (
        <div>
          <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
            <span>输入控制滑块 (模拟 Slider 状态)</span>
            <span className="text-emerald-400 font-semibold">{param1.toFixed(0)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={param1}
            onChange={(e) => setParam1(parseInt(e.target.value))}
            className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-[10px] text-zinc-500 mt-1 font-sans">
            * 拖动滑块查看 Linear (匀速) 与 Ease (缓加速缓减速) 的位移轨迹差异，这就是缓动的魅力。
          </p>
        </div>
      );
    } else if (type === 'clamp') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>向左最小限制距离 (从中心算起)</span>
              <span className="text-red-400 font-semibold">{param1} px</span>
            </label>
            <input
              type="range"
              min="30"
              max="200"
              step="5"
              value={param1}
              onChange={(e) => setParam1(parseInt(e.target.value))}
              className="w-full accent-red-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>向右最大限制距离 (从中心算起)</span>
              <span className="text-red-400 font-semibold">{param2} px</span>
            </label>
            <input
              type="range"
              min="30"
              max="200"
              step="5"
              value={param2}
              onChange={(e) => setParam2(parseInt(e.target.value))}
              className="w-full accent-red-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      );
    } else if (type === 'sinCos') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>震荡频率 (摇摆旋转速度)</span>
              <span className="text-teal-400 font-semibold">{param1} rad/s</span>
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={param1}
              onChange={(e) => setParam1(parseFloat(e.target.value))}
              className="w-full accent-teal-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>轨道半径 (amp)</span>
              <span className="text-teal-400 font-semibold">{param2} px</span>
            </label>
            <input
              type="range"
              min="30"
              max="100"
              step="2"
              value={param2}
              onChange={(e) => setParam2(parseInt(e.target.value))}
              className="w-full accent-teal-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      );
    } else if (type === 'length') {
      return (
        <div className="max-w-md">
          <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
            <span>感应半径影响范围</span>
            <span className="text-purple-400 font-semibold">{param1} 像素</span>
          </label>
          <input
            type="range"
            min="80"
            max="300"
            step="10"
            value={param1}
            onChange={(e) => setParam1(parseInt(e.target.value))}
            className="w-full accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      );
    } else if (type === 'seedRandom') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>随机种子编号 (Seed)</span>
              <span className="text-blue-400 font-semibold">{param1}</span>
            </label>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={param1}
              onChange={(e) => setParam1(parseInt(e.target.value))}
              className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>随机流模式</span>
              <span className="text-blue-400 font-semibold">
                {param2 === 1 ? '静态固定 (Timeless)' : '动态刷新 (Flickering)'}
              </span>
            </label>
            <div className="flex gap-2">
              <button
                id="btn-timeless-true"
                onClick={() => setParam2(1)}
                className={`flex-1 py-1 text-xs rounded border transition-all cursor-pointer ${
                  param2 === 1
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                静止一次
              </button>
              <button
                id="btn-timeless-false"
                onClick={() => setParam2(0)}
                className={`flex-1 py-1 text-xs rounded border transition-all cursor-pointer ${
                  param2 === 0
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                每帧波动
              </button>
            </div>
          </div>
        </div>
      );
    } else if (type === 'velocity') {
      return (
        <div className="max-w-md">
          <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
            <span>拉伸挤压强烈因子</span>
            <span className="text-rose-400 font-semibold">{param1.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.05"
            max="0.45"
            step="0.05"
            value={param1}
            onChange={(e) => setParam1(parseFloat(e.target.value))}
            className="w-full accent-rose-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      );
    } else if (type === 'index') {
      return (
        <div className="max-w-md">
          <label className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
            <span>阶梯图层 Y 轴间距系数</span>
            <span className="text-purple-400 font-semibold">{param1} 像素</span>
          </label>
          <input
            type="range"
            min="10"
            max="45"
            step="1"
            value={param1}
            onChange={(e) => setParam1(parseInt(e.target.value))}
            className="w-full accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      );
    }

    // Default Fallback: Just display a small explanation that this is auto running
    return (
      <div className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-zinc-400" />
        此表达式为 AE 核心自动化算法，无需配置参数，可在上方视口中实时预览其完美的效果运行。
      </div>
    );
  };

  return (
    <div className="w-full bg-zinc-900/60 rounded-xl border border-zinc-800/80 p-5 overflow-hidden">
      {/* Simulation Stage Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
            LIVE 实时图形渲染器
          </span>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
          <button
            id="btn-play-pause-simulation"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition cursor-pointer"
            title={isPlaying ? '暂停仿真' : '开始仿真'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            id="btn-reset-simulation"
            onClick={() => {
              setTime(0);
              graphHistoryRef.current = [];
            }}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition cursor-pointer"
            title="复位时间轴"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3 bg-zinc-800" />
          <span className="text-[10px] text-zinc-500 font-mono select-none">
            CTI: {time.toFixed(2)}s
          </span>
        </div>
      </div>

      {/* Actual Drawing Canvas Container */}
      <div
        ref={containerRef}
        className="w-full relative bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800/60 cursor-crosshair group shadow-inner"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="block w-full transition-shadow duration-300"
        />

        {/* Drag instructions popup */}
        {(expression.simulationType === 'delay' ||
          expression.simulationType === 'length' ||
          expression.simulationType === 'lookAt' ||
          expression.simulationType === 'velocity') && (
          <div className="absolute bottom-3 left-3 bg-zinc-900/90 text-[10px] text-violet-300 border border-violet-500/20 px-2 py-1 rounded font-mono pointer-events-none opacity-80 select-none group-hover:opacity-100 transition-opacity">
            💡 支持在此舞台中用鼠标点击并拖拽以交互控制
          </div>
        )}
      </div>

      {/* Sliders Controller Board */}
      <div className="mt-5 p-4 bg-zinc-950/40 rounded-lg border border-zinc-800/40">
        <div className="flex items-center gap-1.5 mb-3 text-zinc-300 font-medium text-xs font-mono">
          <Sliders className="w-3.5 h-3.5 text-violet-400" />
          <span>AE 效果控制面板 (Effect Controls)</span>
        </div>
        {getSliders()}
      </div>
    </div>
  );
};
