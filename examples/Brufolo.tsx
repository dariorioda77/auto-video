// ESEMPIO DI RIFERIMENTO per Claude: video illustrato che MOSTRA ciò che la voce dice.
// Tema: perché non spremere i brufoli. 4 scene.
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

type Props = { scenes: { start: number; duration: number }[] };

const SKIN = '#f2c4a8';
const DERMIS = '#e89a86';
const DEEP = '#c96f6a';
const PUS = '#fff3c4';
const RED = '#e5484d';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Sottotitolo grande con parola chiave evidenziata
const Caption: React.FC<{ text: string; hl?: string; delay?: number }> = ({ text, hl, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 13 } });
  const parts = hl ? text.split(hl) : [text];
  return (
    <div
      style={{
        position: 'absolute', top: 230, left: 70, right: 70, textAlign: 'center',
        fontFamily: 'Montserrat', fontWeight: 900, fontSize: 84, lineHeight: 1.1, color: '#fff',
        textShadow: '0 6px 24px rgba(0,0,0,.45)', opacity: s, transform: `scale(${0.85 + s * 0.15})`,
      }}
    >
      {parts[0]}
      {hl && <span style={{ color: '#ffd23f' }}>{hl}</span>}
      {parts[1]}
    </div>
  );
};

// Sezione di pelle con poro infiammato. `press` 0→1 = dita che premono, `burst` 0→1 = rottura in profondità
const SkinSection: React.FC<{ press: number; burst: number; zoom: number }> = ({ press, burst, zoom }) => {
  const frame = useCurrentFrame();
  const bulge = 1 + press * 0.25;
  const fingerX = 250 - press * 120;
  return (
    <svg viewBox="0 0 1080 1100" style={{ position: 'absolute', top: 620, width: 1080, height: 1100, transform: `scale(${zoom})`, transformOrigin: '540px 300px' }}>
      <rect x="0" y="300" width="1080" height="160" fill={SKIN} />
      <rect x="0" y="460" width="1080" height="320" fill={DERMIS} />
      <rect x="0" y="780" width="1080" height="320" fill={DEEP} />
      <text x="40" y="400" fontFamily="Poppins" fontWeight={600} fontSize="34" fill="#7a4a3a">Epidermide</text>
      <text x="40" y="560" fontFamily="Poppins" fontWeight={600} fontSize="34" fill="#6b2f2a">Derma</text>
      {/* poro e brufolo */}
      <path d={`M490 300 Q540 ${300 - 90 * bulge} 590 300 Z`} fill={RED} />
      <ellipse cx="540" cy={420} rx={70 * bulge} ry={110 * bulge} fill={PUS} stroke={RED} strokeWidth="10" />
      {/* infezione spinta in profondità */}
      {[...Array(14)].map((_, i) => {
        const a = (i / 14) * Math.PI + Math.PI * 0.05;
        const r = burst * (180 + (i % 3) * 70);
        return (
          <circle key={i} cx={540 + Math.cos(a) * r} cy={480 + Math.sin(a) * r * 1.1}
            r={14 + (i % 2) * 6} fill={RED} opacity={burst * (0.6 + 0.4 * Math.sin(frame / 5 + i))} />
        );
      })}
      {/* dita */}
      <rect x={540 - fingerX - 90} y={150 + press * 60} width="180" height="140" rx="70" fill="#f7d3bc" stroke="#d9a58a" strokeWidth="6" />
      <rect x={540 + fingerX - 90} y={150 + press * 60} width="180" height="140" rx="70" fill="#f7d3bc" stroke="#d9a58a" strokeWidth="6" />
    </svg>
  );
};

// Scena 1 — HOOK: zoom aggressivo sul brufolo già dal frame 0, flash rosso
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 40], [1.6, 1.05], { ...clamp, easing: Easing.out(Easing.cubic) });
  const flash = interpolate(frame, [0, 6], [0.6, 0], clamp);
  return (
    <AbsoluteFill style={{ background: '#1b0f12' }}>
      <SkinSection press={0} burst={0} zoom={zoom} />
      <Caption text="Fermati prima di spremerlo" hl="Fermati" />
      <AbsoluteFill style={{ background: RED, opacity: flash }} />
    </AbsoluteFill>
  );
};

// Scena 2 — la pressione spinge il pus verso il basso
const Press: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const press = interpolate(frame, [10, durationInFrames * 0.6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const burst = interpolate(frame, [durationInFrames * 0.55, durationInFrames], [0, 1], clamp);
  const shake = burst > 0 ? Math.sin(frame * 2.2) * 6 * (1 - burst) : 0;
  return (
    <AbsoluteFill style={{ background: '#1b0f12', transform: `translateX(${shake}px)` }}>
      <SkinSection press={press} burst={burst} zoom={1.05} />
      <Caption text="Spingi l'infezione più in profondità" hl="più in profondità" />
    </AbsoluteFill>
  );
};

// Scena 3 — conseguenze, una alla volta (nessun numero inventato)
const Scar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    { t: 'Più infiammazione', c: RED },
    { t: 'Macchie scure', c: '#8b5a3c' },
    { t: 'Cicatrici', c: '#ffd23f' },
  ];
  return (
    <AbsoluteFill style={{ background: '#1b0f12', alignItems: 'center', justifyContent: 'center', gap: 60, paddingTop: 200 }}>
      <Caption text="Il risultato?" hl="risultato" />
      {items.map((it, i) => {
        const s = spring({ frame: frame - 6 - i * 16, fps, config: { damping: 11 } });
        return (
          <div key={it.t} style={{ display: 'flex', alignItems: 'center', gap: 36, opacity: s, transform: `scale(${0.6 + s * 0.4})` }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', background: it.c, boxShadow: `0 0 ${40 * s}px ${it.c}` }} />
            <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 76, color: '#fff' }}>{it.t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Scena 4 — cosa fare invece + chiamata all'azione
const Fix: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = ['Impacco caldo 10 minuti', 'Patch all\'idrocolloide', 'Mani lontane dal viso'];
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(160deg,#0f2a24,#14532d)', justifyContent: 'center', padding: 90, gap: 46 }}>
      <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 80, color: '#fff', marginBottom: 20 }}>Fai così:</div>
      {items.map((t, i) => {
        const s = spring({ frame: frame - 8 - i * 14, fps, config: { damping: 14 } });
        return (
          <div key={t} style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 64, color: '#fff', opacity: s, transform: `translateX(${(1 - s) * 140}px)`, display: 'flex', gap: 28, alignItems: 'center' }}>
            <span style={{ fontSize: 70, color: '#4ade80' }}>✓</span>{t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const GeneratedVideo: React.FC<Props> = ({ scenes }) => {
  const parts = [Hook, Press, Scar, Fix];
  return (
    <AbsoluteFill style={{ background: '#1b0f12' }}>
      {parts.map((Part, i) => (
        <Sequence key={i} from={scenes[i].start} durationInFrames={scenes[i].duration}>
          <Part />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
