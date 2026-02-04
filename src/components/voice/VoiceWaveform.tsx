import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { VoiceState } from '@/types/voice';

interface VoiceWaveformProps {
  audioLevel: number;
  isActive: boolean;
  state: VoiceState | 'idle';
  className?: string;
}

export const VoiceWaveform = ({
  audioLevel,
  isActive,
  state,
  className,
}: VoiceWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const barsRef = useRef<number[]>(Array(24).fill(5));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const barCount = barsRef.current.length;
      const gap = 3;
      const barWidth = (width - (barCount - 1) * gap) / barCount;
      const maxBarHeight = height * 0.85;
      const minBarHeight = 4;

      // Update bars based on state
      barsRef.current = barsRef.current.map((bar, i) => {
        if (!isActive) {
          return minBarHeight;
        }

        let targetHeight: number;

        if (state === 'VOICE_STATE_SPEAKING') {
          // Smooth wave pattern for speaking
          const time = Date.now() / 150;
          const wave = Math.sin(time + i * 0.4) * 0.5 + 0.5;
          targetHeight = minBarHeight + wave * maxBarHeight * 0.7;
        } else if (state === 'VOICE_STATE_LISTENING' || state === 'VOICE_STATE_RECEIVING') {
          // React to audio level when listening
          const normalizedLevel = audioLevel / 100;
          const variation = Math.random() * 0.3 + 0.7;
          targetHeight = minBarHeight + normalizedLevel * maxBarHeight * variation;
        } else if (state === 'VOICE_STATE_PROCESSING') {
          // Pulsing pattern for processing
          const time = Date.now() / 300;
          const pulse = Math.sin(time + i * 0.3) * 0.3 + 0.4;
          targetHeight = minBarHeight + pulse * maxBarHeight * 0.5;
        } else {
          targetHeight = minBarHeight;
        }

        // Smooth transition
        return bar + (targetHeight - bar) * 0.15;
      });

      // Draw bars with gradient - use actual colors since Canvas doesn't support CSS variables
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#7c3aed'); // Primary color
      gradient.addColorStop(1, 'rgba(124, 58, 237, 0.6)'); // Primary with opacity
      ctx.fillStyle = gradient;

      barsRef.current.forEach((barHeight, i) => {
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;
        const radius = Math.min(barWidth / 2, barHeight / 2);

        ctx.beginPath();
        // Use roundRect if available, otherwise fall back to regular rect
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, radius);
        } else {
          // Fallback for older browsers
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + barWidth - radius, y);
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
          ctx.lineTo(x + barWidth, y + barHeight - radius);
          ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
          ctx.lineTo(x + radius, y + barHeight);
          ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
        }
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isActive, state]);

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <canvas
        ref={canvasRef}
        width={240}
        height={60}
        className="rounded-lg"
      />
    </div>
  );
};

export default VoiceWaveform;
