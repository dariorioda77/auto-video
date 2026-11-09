import React from 'react';
import { Composition } from 'remotion';
import { Main, MainProps } from './Main';

// Valori di prova per Remotion Studio. In produzione arrivano da props.json,
// generato da scripts/prepare.py con le durate reali della voce narrante.
const defaultProps: MainProps = {
  scenes: [
    { start: 0, duration: 90 },
    { start: 90, duration: 90 },
    { start: 180, duration: 120 },
  ],
  totalFrames: 300,
  hasVoice: false,
  hasMusic: false,
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Video"
    component={Main}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={defaultProps.totalFrames}
    defaultProps={defaultProps}
    calculateMetadata={({ props }) => ({ durationInFrames: props.totalFrames })}
  />
);
