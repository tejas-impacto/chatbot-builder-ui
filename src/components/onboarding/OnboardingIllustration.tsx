interface OnboardingIllustrationProps {
  step: number;
}

const OnboardingIllustration = ({ step }: OnboardingIllustrationProps) => {
  // Different illustration elements based on step
  const illustrations = {
    1: (
      // Business Identity - Hand filling form
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Background decorations */}
        <circle cx="80" cy="120" r="8" fill="hsl(var(--primary))" opacity="0.3" />
        <circle cx="320" cy="80" r="6" fill="hsl(var(--accent))" opacity="0.5" />
        <path d="M340 100 L350 110 L340 120" stroke="hsl(var(--brand-cyan))" strokeWidth="3" fill="none" />
        <circle cx="100" cy="320" r="10" fill="hsl(var(--brand-cyan))" opacity="0.4" />
        
        {/* Main clipboard/form */}
        <g transform="translate(120, 80)">
          {/* Clipboard back */}
          <rect x="0" y="20" width="160" height="200" rx="12" fill="hsl(var(--primary))" opacity="0.8" />
          
          {/* Clipboard front */}
          <rect x="10" y="30" width="140" height="180" rx="8" fill="hsl(var(--primary))" />
          
          {/* Form lines */}
          <rect x="25" y="55" width="80" height="12" rx="4" fill="hsl(var(--brand-cyan))" />
          <rect x="25" y="80" width="110" height="8" rx="3" fill="white" opacity="0.9" />
          <rect x="25" y="100" width="110" height="8" rx="3" fill="white" opacity="0.9" />
          <rect x="25" y="120" width="90" height="8" rx="3" fill="white" opacity="0.9" />
          <rect x="25" y="140" width="100" height="8" rx="3" fill="white" opacity="0.9" />
          <rect x="25" y="160" width="70" height="8" rx="3" fill="white" opacity="0.9" />
          
          {/* Decorative circles */}
          <circle cx="135" cy="90" r="8" fill="white" opacity="0.6" />
          <circle cx="135" cy="115" r="8" fill="white" opacity="0.6" />
        </g>

        {/* Hand holding pen */}
        <g transform="translate(180, 200)">
          {/* Arm/sleeve */}
          <ellipse cx="80" cy="120" rx="60" ry="35" fill="#C9A799" />
          <path d="M30 100 Q60 80 100 90 L120 140 Q80 160 40 140 Z" fill="#B8453A" />
          
          {/* Hand */}
          <ellipse cx="55" cy="85" rx="45" ry="30" fill="#B8453A" />
          <ellipse cx="30" cy="70" rx="20" ry="12" fill="#B8453A" />
          
          {/* Fingers */}
          <ellipse cx="80" cy="60" rx="12" ry="25" fill="#B8453A" transform="rotate(20 80 60)" />
          <ellipse cx="60" cy="55" rx="10" ry="22" fill="#B8453A" transform="rotate(10 60 55)" />
          <ellipse cx="42" cy="55" rx="9" ry="20" fill="#B8453A" transform="rotate(-5 42 55)" />
          
          {/* Pen */}
          <rect x="15" y="20" width="8" height="60" rx="2" fill="#1a1a1a" transform="rotate(-30 15 20)" />
          <polygon points="5,65 15,85 25,65" fill="#FFD700" transform="rotate(-30 15 75)" />
        </g>
      </svg>
    ),
    2: (
      // What You Do - Target/audience
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <circle cx="60" cy="100" r="8" fill="hsl(var(--primary))" opacity="0.3" />
        <circle cx="340" cy="300" r="10" fill="hsl(var(--brand-cyan))" opacity="0.4" />
        <path d="M50 300 L60 310 L50 320" stroke="hsl(var(--accent))" strokeWidth="3" fill="none" />
        
        {/* Target circles */}
        <circle cx="200" cy="200" r="120" fill="hsl(var(--primary))" opacity="0.1" />
        <circle cx="200" cy="200" r="90" fill="hsl(var(--primary))" opacity="0.2" />
        <circle cx="200" cy="200" r="60" fill="hsl(var(--primary))" opacity="0.4" />
        <circle cx="200" cy="200" r="30" fill="hsl(var(--primary))" />
        
        {/* People icons around */}
        <g transform="translate(100, 100)">
          <circle cx="0" cy="0" r="15" fill="hsl(var(--brand-cyan))" />
          <circle cx="0" cy="-25" r="10" fill="hsl(var(--brand-cyan))" />
        </g>
        <g transform="translate(300, 150)">
          <circle cx="0" cy="0" r="15" fill="hsl(var(--accent))" />
          <circle cx="0" cy="-25" r="10" fill="hsl(var(--accent))" />
        </g>
        <g transform="translate(120, 280)">
          <circle cx="0" cy="0" r="15" fill="hsl(var(--primary))" opacity="0.6" />
          <circle cx="0" cy="-25" r="10" fill="hsl(var(--primary))" opacity="0.6" />
        </g>
        <g transform="translate(280, 280)">
          <circle cx="0" cy="0" r="15" fill="hsl(var(--brand-cyan))" opacity="0.7" />
          <circle cx="0" cy="-25" r="10" fill="hsl(var(--brand-cyan))" opacity="0.7" />
        </g>
        
        {/* Arrow pointing to center */}
        <path d="M320 80 Q280 120 230 170" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeDasharray="8 4" />
        <polygon points="230,170 240,160 245,175" fill="hsl(var(--primary))" />
      </svg>
    ),
    3: (
      // Support & Customer - Chat bubbles
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <circle cx="350" cy="100" r="8" fill="hsl(var(--brand-cyan))" opacity="0.5" />
        <circle cx="50" cy="280" r="10" fill="hsl(var(--primary))" opacity="0.3" />
        
        {/* Main chat bubble */}
        <g transform="translate(80, 100)">
          <rect x="0" y="0" width="200" height="120" rx="20" fill="hsl(var(--primary))" />
          <polygon points="40,120 60,150 80,120" fill="hsl(var(--primary))" />
          
          {/* Message lines */}
          <rect x="20" y="25" width="120" height="10" rx="5" fill="white" opacity="0.9" />
          <rect x="20" y="45" width="160" height="10" rx="5" fill="white" opacity="0.7" />
          <rect x="20" y="65" width="100" height="10" rx="5" fill="white" opacity="0.7" />
          <rect x="20" y="85" width="140" height="10" rx="5" fill="white" opacity="0.7" />
        </g>
        
        {/* Response bubble */}
        <g transform="translate(120, 240)">
          <rect x="0" y="0" width="180" height="80" rx="16" fill="hsl(var(--brand-cyan))" opacity="0.3" />
          <rect x="0" y="0" width="180" height="80" rx="16" stroke="hsl(var(--brand-cyan))" strokeWidth="2" fill="none" />
          
          {/* Message lines */}
          <rect x="15" y="20" width="100" height="8" rx="4" fill="hsl(var(--primary))" opacity="0.5" />
          <rect x="15" y="38" width="150" height="8" rx="4" fill="hsl(var(--primary))" opacity="0.3" />
          <rect x="15" y="56" width="80" height="8" rx="4" fill="hsl(var(--primary))" opacity="0.3" />
        </g>
        
        {/* Floating icons */}
        <circle cx="320" cy="180" r="25" fill="hsl(var(--accent))" opacity="0.2" />
        <text x="320" y="188" textAnchor="middle" fontSize="24">💬</text>
        
        <circle cx="60" cy="160" r="20" fill="hsl(var(--primary))" opacity="0.2" />
        <text x="60" y="167" textAnchor="middle" fontSize="18">📧</text>
      </svg>
    ),
    4: (
      // Compliance & Risk - Shield
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <circle cx="80" cy="80" r="8" fill="hsl(var(--brand-cyan))" opacity="0.4" />
        <circle cx="320" cy="320" r="10" fill="hsl(var(--primary))" opacity="0.3" />
        <path d="M340 80 L350 90 L340 100" stroke="hsl(var(--accent))" strokeWidth="3" fill="none" />
        
        {/* Main shield */}
        <g transform="translate(100, 60)">
          <path 
            d="M100 0 L180 30 L180 120 Q180 200 100 240 Q20 200 20 120 L20 30 Z" 
            fill="hsl(var(--primary))" 
            opacity="0.9"
          />
          <path 
            d="M100 20 L160 45 L160 115 Q160 180 100 215 Q40 180 40 115 L40 45 Z" 
            fill="hsl(var(--primary))"
          />
          
          {/* Checkmark */}
          <path 
            d="M70 120 L90 145 L135 90" 
            stroke="white" 
            strokeWidth="12" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
        </g>
        
        {/* Document icons */}
        <g transform="translate(280, 150)">
          <rect x="0" y="0" width="50" height="65" rx="6" fill="white" stroke="hsl(var(--border))" strokeWidth="2" />
          <rect x="8" y="12" width="34" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.4" />
          <rect x="8" y="22" width="28" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.3" />
          <rect x="8" y="32" width="34" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.3" />
          <rect x="8" y="42" width="20" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.3" />
        </g>
        
        {/* Lock icon */}
        <g transform="translate(50, 240)">
          <rect x="10" y="25" width="40" height="35" rx="6" fill="hsl(var(--brand-cyan))" />
          <path d="M18 25 L18 15 Q30 -5 42 15 L42 25" stroke="hsl(var(--brand-cyan))" strokeWidth="6" fill="none" />
          <circle cx="30" cy="42" r="6" fill="white" />
        </g>
      </svg>
    ),
    5: (
      // Sales & Lead - Graph/growth
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <circle cx="350" cy="100" r="8" fill="hsl(var(--primary))" opacity="0.3" />
        <circle cx="50" cy="300" r="10" fill="hsl(var(--brand-cyan))" opacity="0.4" />
        
        {/* Chart background */}
        <rect x="60" y="80" width="280" height="220" rx="16" fill="white" stroke="hsl(var(--border))" strokeWidth="2" />
        
        {/* Grid lines */}
        <line x1="80" y1="120" x2="320" y2="120" stroke="hsl(var(--border))" strokeDasharray="4 4" />
        <line x1="80" y1="160" x2="320" y2="160" stroke="hsl(var(--border))" strokeDasharray="4 4" />
        <line x1="80" y1="200" x2="320" y2="200" stroke="hsl(var(--border))" strokeDasharray="4 4" />
        <line x1="80" y1="240" x2="320" y2="240" stroke="hsl(var(--border))" strokeDasharray="4 4" />
        
        {/* Bars */}
        <rect x="100" y="200" width="30" height="70" rx="4" fill="hsl(var(--primary))" opacity="0.4" />
        <rect x="150" y="170" width="30" height="100" rx="4" fill="hsl(var(--primary))" opacity="0.6" />
        <rect x="200" y="140" width="30" height="130" rx="4" fill="hsl(var(--primary))" opacity="0.8" />
        <rect x="250" y="110" width="30" height="160" rx="4" fill="hsl(var(--primary))" />
        
        {/* Growth arrow */}
        <path d="M90 250 Q150 220 200 180 Q250 140 290 100" stroke="hsl(var(--brand-cyan))" strokeWidth="4" fill="none" />
        <polygon points="290,100 275,108 282,120" fill="hsl(var(--brand-cyan))" transform="rotate(-45 290 100)" />
        
        {/* Percentage badge */}
        <g transform="translate(300, 60)">
          <rect x="0" y="0" width="60" height="30" rx="15" fill="hsl(var(--accent))" opacity="0.2" />
          <text x="30" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="hsl(var(--accent))">+127%</text>
        </g>
        
        {/* Floating icons */}
        <circle cx="80" cy="340" r="20" fill="hsl(var(--primary))" opacity="0.2" />
        <text x="80" y="347" textAnchor="middle" fontSize="18">📈</text>
      </svg>
    ),
    6: (
      // Documents Upload - File/cloud
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <circle cx="60" cy="120" r="8" fill="hsl(var(--brand-cyan))" opacity="0.4" />
        <circle cx="340" cy="280" r="10" fill="hsl(var(--primary))" opacity="0.3" />
        <path d="M50 280 L60 290 L50 300" stroke="hsl(var(--accent))" strokeWidth="3" fill="none" />
        
        {/* Cloud background */}
        <g transform="translate(80, 100)">
          <ellipse cx="120" cy="100" rx="100" ry="70" fill="hsl(var(--primary))" opacity="0.15" />
          <ellipse cx="80" cy="110" rx="60" ry="45" fill="hsl(var(--primary))" opacity="0.15" />
          <ellipse cx="170" cy="110" rx="55" ry="40" fill="hsl(var(--primary))" opacity="0.15" />
        </g>
        
        {/* Main document */}
        <g transform="translate(130, 120)">
          <rect x="0" y="0" width="140" height="180" rx="12" fill="hsl(var(--primary))" />
          
          {/* Document content */}
          <rect x="15" y="20" width="60" height="10" rx="4" fill="hsl(var(--brand-cyan))" />
          <rect x="15" y="45" width="110" height="8" rx="3" fill="white" opacity="0.9" />
          <rect x="15" y="60" width="110" height="8" rx="3" fill="white" opacity="0.7" />
          <rect x="15" y="75" width="90" height="8" rx="3" fill="white" opacity="0.7" />
          <rect x="15" y="90" width="100" height="8" rx="3" fill="white" opacity="0.7" />
          
          {/* Decorative elements */}
          <rect x="15" y="120" width="50" height="40" rx="6" fill="white" opacity="0.3" />
          <rect x="75" y="120" width="50" height="40" rx="6" fill="white" opacity="0.3" />
        </g>
        
        {/* Upload arrow */}
        <g transform="translate(200, 80)">
          <circle cx="0" cy="0" r="25" fill="hsl(var(--accent))" opacity="0.3" />
          <path d="M0 12 L0 -12 M-10 -2 L0 -12 L10 -2" stroke="hsl(var(--accent))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
        
        {/* Small decorative files */}
        <g transform="translate(80, 260)">
          <rect x="0" y="0" width="35" height="45" rx="4" fill="white" stroke="hsl(var(--border))" strokeWidth="2" />
          <rect x="5" y="8" width="20" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.4" />
          <rect x="5" y="14" width="25" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.3" />
        </g>
        
        <g transform="translate(290, 240)">
          <rect x="0" y="0" width="35" height="45" rx="4" fill="white" stroke="hsl(var(--border))" strokeWidth="2" />
          <rect x="5" y="8" width="20" height="3" rx="1" fill="hsl(var(--brand-cyan))" opacity="0.4" />
          <rect x="5" y="14" width="25" height="3" rx="1" fill="hsl(var(--brand-cyan))" opacity="0.3" />
        </g>
      </svg>
    ),
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="w-full max-w-md animate-fade-in">
        {illustrations[step as keyof typeof illustrations] || illustrations[1]}
      </div>
    </div>
  );
};

export default OnboardingIllustration;
