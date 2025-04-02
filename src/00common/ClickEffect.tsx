import Lottie from 'lottie-react';
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';


interface Effect {
  id: number;
  x: number;
  y: number;
}

export interface ClickEffectRef {
  trigger: (x: number, y: number) => void;
}

interface ClickEffectProps {
  animationData: object;
  size?: number;
  duration?: number; // 삭제 시간
}

export const ClickEffect = forwardRef<ClickEffectRef, ClickEffectProps>(
  ({ animationData, size = 100, duration = 1000 }, ref) => {
    const [effects, setEffects] = useState<Effect[]>([]);
    const idRef = useRef(0);

    useImperativeHandle(ref, () => ({
      trigger: (x: number, y: number) => {
        const id = idRef.current++;
        setEffects((prev) => [...prev, { id, x, y }]);
        setTimeout(() => {
          setEffects((prev) => prev.filter((e) => e.id !== id));
        }, duration);
      },
    }));

    return (
      <div className="fixed inset-0 pointer-events-none">
        {effects.map((effect) => (
          <Lottie
            key={effect.id}
            animationData={animationData}
            loop={false}
            autoplay
            style={{
              position: 'absolute',
              top: effect.y - size / 2,
              left: effect.x - size / 2,
              width: size,
              height: size,
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
    );
  }
);
