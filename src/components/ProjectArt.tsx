import { useState } from 'react';
import { ProjectItem } from '../data/portfolio';

export function ProjectArt({ type }: { type: ProjectItem['artType'] }) {
  switch (type) {
    case 'network':
      return (
        <svg viewBox="0 0 200 120" className="card__art" aria-hidden="true">
          <circle cx="100" cy="60" r="42" pathLength={1} />
          <circle cx="100" cy="60" r="22" pathLength={1} />
          <path d="M24 60 H176 M100 14 V106" pathLength={1} />
          <path d="M52 30 L100 60 L152 34 M62 92 L100 60 L144 88" pathLength={1} />
          <circle className="hl" cx="100" cy="60" r="5" />
          <circle className="hl" cx="152" cy="34" r="4" />
        </svg>
      );
    case 'webvuln':
      return (
        <svg viewBox="0 0 200 120" className="card__art" aria-hidden="true">
          <rect x="34" y="18" width="132" height="84" rx="6" pathLength={1} />
          <path d="M34 36 H166" pathLength={1} />
          <path d="M52 56 L68 68 L52 80 M78 80 H108" pathLength={1} />
          <path className="hl-line" d="M118 54 L148 84 M148 54 L118 84" pathLength={1} />
          <circle className="hl" cx="48" cy="27" r="3" />
        </svg>
      );
    case 'password':
      return (
        <svg viewBox="0 0 200 120" className="card__art" aria-hidden="true">
          <rect x="64" y="52" width="72" height="52" rx="6" pathLength={1} />
          <path d="M78 52 V38 A22 22 0 0 1 122 38 V52" pathLength={1} />
          <path d="M26 78 H54 M146 78 H174" pathLength={1} />
          <circle className="hl" cx="100" cy="74" r="5.5" />
          <path className="hl-line" d="M100 80 V91" pathLength={1} />
        </svg>
      );
    case 'wifi':
      return (
        <svg viewBox="0 0 200 120" className="card__art" aria-hidden="true">
          <path d="M36 52 A84 84 0 0 1 164 52" pathLength={1} />
          <path d="M56 68 A58 58 0 0 1 144 68" pathLength={1} />
          <path d="M76 84 A32 32 0 0 1 124 84" pathLength={1} />
          <circle className="hl" cx="100" cy="98" r="5.5" />
        </svg>
      );
    case 'automation':
      return (
        <svg viewBox="0 0 200 120" className="card__art" aria-hidden="true">
          <path d="M24 36 H76 L96 60 H176" pathLength={1} />
          <path d="M24 84 H76 L96 60" pathLength={1} />
          <path d="M158 46 L176 60 L158 74" pathLength={1} />
          <circle className="hl" cx="96" cy="60" r="5" />
          <circle className="hl" cx="44" cy="36" r="4" />
        </svg>
      );
    case 'ctf':
      return (
        <svg viewBox="0 0 200 120" className="card__art" aria-hidden="true">
          <path d="M100 14 L154 34 V64 C154 88 128 102 100 110 C72 102 46 88 46 64 V34 Z" pathLength={1} />
          <path d="M76 60 H124 M100 38 V84" pathLength={1} />
          <circle className="hl" cx="100" cy="60" r="5.5" />
        </svg>
      );
  }
}

interface PortraitFrameProps {
  portraitUrl: string;
  fullName: string;
}

export function PortraitFrame({ portraitUrl, fullName }: PortraitFrameProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(portraitUrl && !imgError);

  if (showImage) {
    return (
      <img
        src={portraitUrl}
        alt={`Portrait of ${fullName}`}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="portrait-plate">
      <div className="portrait-plate__top mono">
        <span>Identity Plate</span>
        <span>SK / 08</span>
      </div>

      <svg viewBox="0 0 240 240" className="portrait-plate__svg" aria-hidden="true">
        <circle cx="120" cy="120" r="96" fill="none" stroke="rgba(236,235,230,0.12)" strokeWidth="1" />
        <circle
          cx="120"
          cy="120"
          r="68"
          fill="none"
          stroke="rgba(236,235,230,0.2)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <circle cx="120" cy="120" r="38" fill="none" stroke="rgba(255,91,37,0.45)" strokeWidth="1.2" />
        <line x1="24" y1="120" x2="216" y2="120" stroke="rgba(236,235,230,0.09)" strokeWidth="1" />
        <line x1="120" y1="24" x2="120" y2="216" stroke="rgba(236,235,230,0.09)" strokeWidth="1" />
        <circle cx="188" cy="120" r="4" fill="#ff5b25" />
        <circle cx="120" cy="52" r="3" fill="#ecebe6" />
      </svg>

      <div className="portrait-plate__bottom">
        <div className="portrait-plate__monogram" aria-hidden="true">
          S.K<span>*</span>
        </div>
        <span className="mono">Coder · Sec</span>
      </div>
    </div>
  );
}
