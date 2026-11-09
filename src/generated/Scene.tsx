// QUESTO FILE VIENE SOVRASCRITTO A OGNI VIDEO con il codice scritto da Claude.
// Il contenuto qui sotto è un esempio funzionante, usato anche come riferimento nel prompt.
import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
const fontFamily = 'Montserrat';

type Props = { scenes: { start: number; duration: number }[] };

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const angle = interpolate(frame, [0, 600], [135, 225]);
  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(${angle}deg, #0f172a 0%, #312e81 55%, #7c3aed 100%)` }}
    />
  );
};

const Title: React.FC<{ text: string; sub?: string }> = ({ text, sub }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 90, opacity: exit }}>
      <div
        style={{
          fontFamily,
          fontWeight: 800,
          fontSize: 104,
          lineHeight: 1.08,
          color: '#fff',
          textAlign: 'center',
          transform: `translateY(${(1 - enter) * 80}px) scale(${0.9 + enter * 0.1})`,
          opacity: enter,
        }}
      >
        {text}
      </div>
      {sub && (
        <div
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 52,
            color: '#c4b5fd',
            marginTop: 40,
            textAlign: 'center',
            opacity: interpolate(frame, [12, 24], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          {sub}
        </div>
      )}
    </AbsoluteFill>
  );
};

const Bullet: React.FC<{ items: string[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: 100, gap: 48 }}>
      {items.map((t, i) => {
        const s = spring({ frame: frame - i * 12, fps, config: { damping: 16 } });
        return (
          <div
            key={t}
            style={{
              fontFamily,
              fontWeight: 800,
              fontSize: 72,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 36,
              opacity: s,
              transform: `translateX(${(1 - s) * -120}px)`,
            }}
          >
            <span
              style={{
                width: 84,
                height: 84,
                borderRadius: 24,
                background: '#a78bfa',
                color: '#1e1b4b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 52,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            {t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  const p = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 90 }}>
      <div
        style={{
          fontFamily,
          fontWeight: 800,
          fontSize: 88,
          color: '#fff',
          textAlign: 'center',
          opacity: p,
          transform: `scale(${pulse})`,
        }}
      >
        Salva il video
        <br />e provalo oggi
      </div>
    </AbsoluteFill>
  );
};

export const GeneratedVideo: React.FC<Props> = ({ scenes }) => (
  <AbsoluteFill>
    <Background />
    <Sequence from={scenes[0].start} durationInFrames={scenes[0].duration}>
      <Title text="3 abitudini che ti cambiano la mattina" sub="La seconda la salti sempre" />
    </Sequence>
    <Sequence from={scenes[1].start} durationInFrames={scenes[1].duration}>
      <Bullet items={['Acqua appena sveglio', 'Niente telefono 20 min', 'Luce naturale']} />
    </Sequence>
    <Sequence from={scenes[2].start} durationInFrames={scenes[2].duration}>
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
