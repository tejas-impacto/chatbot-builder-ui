interface OnboardingIllustrationProps {
  step: number;
}

const OnboardingIllustration = ({ step }: OnboardingIllustrationProps) => {
  const illustrations = {
    1: (
      // Company Profile - Building/Identity
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Background decorations */}
        <circle cx="60" cy="100" r="8" fill="hsl(var(--primary))" opacity="0.3" />
        <circle cx="340" cy="80" r="6" fill="hsl(var(--brand-cyan))" opacity="0.5" />
        <circle cx="80" cy="320" r="10" fill="hsl(var(--brand-cyan))" opacity="0.4" />
        <path d="M350 120 L360 130 L350 140" stroke="hsl(var(--brand-cyan))" strokeWidth="3" fill="none" />
        
        {/* Main building/company icon */}
        <g transform="translate(100, 80)">
          {/* Building shadow */}
          <rect x="20" y="30" width="160" height="180" rx="12" fill="hsl(var(--primary))" opacity="0.2" />
          
          {/* Main building */}
          <rect x="10" y="20" width="160" height="180" rx="12" fill="hsl(var(--primary))" />
          
          {/* Windows grid */}
          <rect x="30" y="50" width="30" height="30" rx="4" fill="hsl(var(--brand-cyan))" />
          <rect x="75" y="50" width="30" height="30" rx="4" fill="white" opacity="0.9" />
          <rect x="120" y="50" width="30" height="30" rx="4" fill="white" opacity="0.9" />
          
          <rect x="30" y="95" width="30" height="30" rx="4" fill="white" opacity="0.9" />
          <rect x="75" y="95" width="30" height="30" rx="4" fill="hsl(var(--brand-cyan))" />
          <rect x="120" y="95" width="30" height="30" rx="4" fill="white" opacity="0.9" />
          
          <rect x="30" y="140" width="30" height="30" rx="4" fill="white" opacity="0.9" />
          <rect x="75" y="140" width="30" height="30" rx="4" fill="white" opacity="0.9" />
          <rect x="120" y="140" width="30" height="30" rx="4" fill="hsl(var(--brand-cyan))" />
          
          {/* Door */}
          <rect x="70" y="175" width="40" height="25" rx="4" fill="hsl(var(--brand-cyan))" opacity="0.8" />
        </g>
        
        {/* Floating elements */}
        <g transform="translate(280, 180)">
          <rect x="0" y="0" width="60" height="70" rx="8" fill="white" stroke="hsl(var(--border))" strokeWidth="2" />
          <rect x="8" y="12" width="30" height="6" rx="2" fill="hsl(var(--primary))" />
          <rect x="8" y="24" width="44" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.3" />
          <rect x="8" y="34" width="38" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.3" />
          <rect x="8" y="44" width="44" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.3" />
        </g>
        
        {/* Target/audience icon */}
        <g transform="translate(60, 220)">
          <circle cx="30" cy="30" r="25" fill="hsl(var(--brand-cyan))" opacity="0.2" />
          <circle cx="30" cy="30" r="18" fill="hsl(var(--brand-cyan))" opacity="0.4" />
          <circle cx="30" cy="30" r="10" fill="hsl(var(--brand-cyan))" />
        </g>
      </svg>
    ),
    2: (
      // Bot Configuration - Settings/Chat
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <circle cx="350" cy="100" r="8" fill="hsl(var(--brand-cyan))" opacity="0.5" />
        <circle cx="50" cy="280" r="10" fill="hsl(var(--primary))" opacity="0.3" />
        <path d="M60 100 L70 110 L60 120" stroke="hsl(var(--brand-cyan))" strokeWidth="3" fill="none" />
        
        {/* Main chat/bot interface */}
        <g transform="translate(80, 60)">
          {/* Phone/device frame */}
          <rect x="0" y="0" width="160" height="260" rx="20" fill="hsl(var(--primary))" />
          <rect x="8" y="20" width="144" height="220" rx="12" fill="white" />
          
          {/* Header */}
          <rect x="8" y="20" width="144" height="40" rx="12" fill="hsl(var(--primary))" opacity="0.1" />
          <circle cx="32" cy="40" r="12" fill="hsl(var(--primary))" />
          <rect x="50" y="34" width="60" height="6" rx="3" fill="hsl(var(--primary))" opacity="0.5" />
          <rect x="50" y="44" width="40" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.3" />
          
          {/* Chat bubbles */}
          <rect x="16" y="72" width="90" height="28" rx="14" fill="hsl(var(--primary))" />
          <rect x="22" y="82" width="50" height="4" rx="2" fill="white" opacity="0.9" />
          
          <rect x="60" y="110" width="85" height="35" rx="14" fill="hsl(var(--muted))" />
          <rect x="68" y="120" width="60" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.4" />
          <rect x="68" y="130" width="45" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.3" />
          
          <rect x="16" y="155" width="100" height="28" rx="14" fill="hsl(var(--primary))" />
          <rect x="22" y="165" width="70" height="4" rx="2" fill="white" opacity="0.9" />
          
          {/* Input area */}
          <rect x="16" y="200" width="128" height="32" rx="16" fill="hsl(var(--muted))" />
          <circle cx="132" cy="216" r="10" fill="hsl(var(--brand-cyan))" />
        </g>
        
        {/* Settings gear */}
        <g transform="translate(260, 140)">
          <circle cx="40" cy="40" r="35" fill="hsl(var(--brand-cyan))" opacity="0.2" />
          <circle cx="40" cy="40" r="25" fill="hsl(var(--brand-cyan))" />
          {/* Gear teeth */}
          <rect x="36" y="10" width="8" height="14" rx="2" fill="hsl(var(--brand-cyan))" />
          <rect x="36" y="56" width="8" height="14" rx="2" fill="hsl(var(--brand-cyan))" />
          <rect x="10" y="36" width="14" height="8" rx="2" fill="hsl(var(--brand-cyan))" />
          <rect x="56" y="36" width="14" height="8" rx="2" fill="hsl(var(--brand-cyan))" />
          <circle cx="40" cy="40" r="12" fill="white" />
        </g>
        
        {/* Shield/compliance */}
        <g transform="translate(260, 240)">
          <path d="M40 10 L70 25 L70 55 Q70 80 40 95 Q10 80 10 55 L10 25 Z" fill="hsl(var(--primary))" opacity="0.8" />
          <path d="M28 55 L38 68 L58 42" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>
    ),
    3: (
      // Knowledge Base - Documents/Upload
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <circle cx="60" cy="120" r="8" fill="hsl(var(--brand-cyan))" opacity="0.4" />
        <circle cx="340" cy="280" r="10" fill="hsl(var(--primary))" opacity="0.3" />
        <path d="M50 280 L60 290 L50 300" stroke="hsl(var(--brand-cyan))" strokeWidth="3" fill="none" />
        
        {/* Cloud background */}
        <g transform="translate(60, 60)">
          <ellipse cx="140" cy="80" rx="100" ry="60" fill="hsl(var(--primary))" opacity="0.1" />
          <ellipse cx="90" cy="90" rx="60" ry="40" fill="hsl(var(--primary))" opacity="0.1" />
          <ellipse cx="200" cy="90" rx="55" ry="35" fill="hsl(var(--primary))" opacity="0.1" />
        </g>
        
        {/* Main document stack */}
        <g transform="translate(100, 100)">
          {/* Back document */}
          <rect x="30" y="20" width="140" height="180" rx="10" fill="hsl(var(--primary))" opacity="0.3" />
          
          {/* Middle document */}
          <rect x="15" y="10" width="140" height="180" rx="10" fill="hsl(var(--primary))" opacity="0.6" />
          
          {/* Front document */}
          <rect x="0" y="0" width="140" height="180" rx="10" fill="hsl(var(--primary))" />
          
          {/* Document content */}
          <rect x="15" y="25" width="50" height="10" rx="4" fill="hsl(var(--brand-cyan))" />
          <rect x="15" y="50" width="110" height="6" rx="3" fill="white" opacity="0.9" />
          <rect x="15" y="65" width="110" height="6" rx="3" fill="white" opacity="0.7" />
          <rect x="15" y="80" width="90" height="6" rx="3" fill="white" opacity="0.7" />
          <rect x="15" y="95" width="100" height="6" rx="3" fill="white" opacity="0.7" />
          
          {/* Thumbnail areas */}
          <rect x="15" y="115" width="50" height="45" rx="6" fill="white" opacity="0.3" />
          <rect x="75" y="115" width="50" height="45" rx="6" fill="white" opacity="0.3" />
        </g>
        
        {/* Upload arrow */}
        <g transform="translate(260, 120)">
          <circle cx="40" cy="40" r="35" fill="hsl(var(--brand-cyan))" opacity="0.2" />
          <circle cx="40" cy="40" r="28" fill="hsl(var(--brand-cyan))" />
          <path d="M40 55 L40 25 M28 37 L40 25 L52 37" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
        
        {/* Small floating files */}
        <g transform="translate(270, 220)">
          <rect x="0" y="0" width="50" height="60" rx="6" fill="white" stroke="hsl(var(--border))" strokeWidth="2" />
          <rect x="8" y="10" width="25" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.5" />
          <rect x="8" y="20" width="34" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.3" />
          <rect x="8" y="28" width="30" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.3" />
          <rect x="8" y="36" width="34" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.3" />
        </g>
        
        <g transform="translate(60, 280)">
          <rect x="0" y="0" width="45" height="55" rx="5" fill="white" stroke="hsl(var(--border))" strokeWidth="2" />
          <rect x="6" y="8" width="20" height="4" rx="2" fill="hsl(var(--brand-cyan))" opacity="0.6" />
          <rect x="6" y="18" width="33" height="3" rx="1" fill="hsl(var(--brand-cyan))" opacity="0.3" />
          <rect x="6" y="26" width="28" height="3" rx="1" fill="hsl(var(--brand-cyan))" opacity="0.3" />
        </g>
        
        {/* AI brain icon */}
        <g transform="translate(280, 300)">
          <circle cx="25" cy="25" r="22" fill="hsl(var(--primary))" opacity="0.2" />
          <circle cx="25" cy="25" r="16" fill="hsl(var(--primary))" />
          <circle cx="20" cy="22" r="3" fill="white" opacity="0.9" />
          <circle cx="30" cy="22" r="3" fill="white" opacity="0.9" />
          <path d="M18 32 Q25 38 32 32" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
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
