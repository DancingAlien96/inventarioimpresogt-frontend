type Variant = "cubes" | "box" | "chart" | "wave";

export default function NeonIllustration({
  variant = "cubes",
  className = "w-full h-auto",
}: {
  variant?: Variant;
  className?: string;
}) {
  if (variant === "cubes") return <Cubes className={className} />;
  if (variant === "box") return <Box className={className} />;
  if (variant === "chart") return <Chart className={className} />;
  return <Wave className={className} />;
}

function Cubes({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#0080ff" />
        </linearGradient>
        <linearGradient id="magentaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff00aa" />
          <stop offset="100%" stopColor="#aa0080" />
        </linearGradient>
        <linearGradient id="darkSide" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1a35" />
          <stop offset="100%" stopColor="#0a0a1a" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Floor grid */}
      <g opacity="0.15" stroke="#00f0ff" strokeWidth="0.5">
        <path d="M 50 320 L 200 240 L 350 320 L 200 400 Z" fill="none" />
        <path d="M 100 290 L 200 240" />
        <path d="M 200 240 L 300 290" />
        <path d="M 125 305 L 275 305" stroke="#ff00aa" />
      </g>

      {/* Cubo grande cyan */}
      <g filter="url(#glow)">
        <path d="M 100 200 L 180 160 L 260 200 L 180 240 Z" fill="url(#cyanGrad)" opacity="0.9" />
        <path d="M 100 200 L 100 280 L 180 320 L 180 240 Z" fill="url(#darkSide)" stroke="#00f0ff" strokeWidth="1.5" />
        <path d="M 180 240 L 260 200 L 260 280 L 180 320 Z" fill="#12122a" stroke="#00f0ff" strokeWidth="1.5" />
      </g>

      {/* Cubo mediano magenta flotando */}
      <g filter="url(#glow)" transform="translate(0, -10)">
        <path d="M 240 110 L 300 80 L 360 110 L 300 140 Z" fill="url(#magentaGrad)" opacity="0.9" />
        <path d="M 240 110 L 240 170 L 300 200 L 300 140 Z" fill="url(#darkSide)" stroke="#ff00aa" strokeWidth="1.5" />
        <path d="M 300 140 L 360 110 L 360 170 L 300 200 Z" fill="#12122a" stroke="#ff00aa" strokeWidth="1.5" />
      </g>

      {/* Cubo pequeño cyan flotando arriba */}
      <g filter="url(#glow)" transform="translate(0, 5)">
        <path d="M 60 80 L 100 60 L 140 80 L 100 100 Z" fill="url(#cyanGrad)" opacity="0.85" />
        <path d="M 60 80 L 60 120 L 100 140 L 100 100 Z" fill="url(#darkSide)" stroke="#00f0ff" strokeWidth="1.5" />
        <path d="M 100 100 L 140 80 L 140 120 L 100 140 Z" fill="#12122a" stroke="#00f0ff" strokeWidth="1.5" />
      </g>

      {/* Particulas */}
      <circle cx="50" cy="160" r="2" fill="#00f0ff" opacity="0.7" />
      <circle cx="370" cy="220" r="2" fill="#ff00aa" opacity="0.7" />
      <circle cx="320" cy="340" r="1.5" fill="#00f0ff" opacity="0.5" />
      <circle cx="80" cy="350" r="1.5" fill="#ff00aa" opacity="0.5" />
    </svg>
  );
}

function Box({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 300 300" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#ff00aa" />
        </linearGradient>
        <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow2)">
        <path d="M 80 110 L 150 70 L 220 110 L 150 150 Z" fill="url(#boxTop)" opacity="0.85" />
        <path d="M 80 110 L 80 200 L 150 240 L 150 150 Z" fill="#12122a" stroke="#00f0ff" strokeWidth="1.5" />
        <path d="M 150 150 L 220 110 L 220 200 L 150 240 Z" fill="#1a1a35" stroke="#ff00aa" strokeWidth="1.5" />
      </g>
      <circle cx="40" cy="60" r="2" fill="#00f0ff" />
      <circle cx="260" cy="80" r="2" fill="#ff00aa" />
      <circle cx="250" cy="260" r="1.5" fill="#00f0ff" />
    </svg>
  );
}

function Chart({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 300 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bar1" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00f0ff" />
        </linearGradient>
        <linearGradient id="bar2" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff00aa" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff00aa" />
        </linearGradient>
      </defs>
      <rect x="40" y="120" width="30" height="60" rx="3" fill="url(#bar1)" />
      <rect x="85" y="80" width="30" height="100" rx="3" fill="url(#bar2)" />
      <rect x="130" y="100" width="30" height="80" rx="3" fill="url(#bar1)" />
      <rect x="175" y="50" width="30" height="130" rx="3" fill="url(#bar2)" />
      <rect x="220" y="90" width="30" height="90" rx="3" fill="url(#bar1)" />
      <line x1="30" y1="180" x2="270" y2="180" stroke="#3a3a70" strokeWidth="1" />
    </svg>
  );
}

function Wave({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 300 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 50 Q 75 10 150 50 T 300 50" fill="none" stroke="#00f0ff" strokeWidth="2" opacity="0.7" />
      <path d="M 0 60 Q 75 100 150 60 T 300 60" fill="none" stroke="#ff00aa" strokeWidth="2" opacity="0.7" />
    </svg>
  );
}
