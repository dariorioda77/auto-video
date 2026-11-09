import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig } from 'remotion';
import './fonts';
import { GeneratedVideo } from './generated/Scene';

export type SceneTiming = { start: number; duration: number };

export type MainProps = {
  scenes: SceneTiming[];
  totalFrames: number;
  hasVoice: boolean;
  hasMusic: boolean;
};

export const Main: React.FC<MainProps> = ({ scenes, hasVoice, hasMusic }) => {
  const { durationInFrames } = useVideoConfig();
  const base = hasVoice ? 0.12 : 0.45;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Il componente scritto da Claude */}
      <GeneratedVideo scenes={scenes} />

      {hasVoice && <Audio src={staticFile('voice.mp3')} />}

      {hasMusic && (
        <Audio
          src={staticFile('music.mp3')}
          loop
          volume={(f) =>
            interpolate(
              f,
              [0, 15, durationInFrames - 30, durationInFrames],
              [0, base, base, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            )
          }
        />
      )}
    </AbsoluteFill>
  );
};
