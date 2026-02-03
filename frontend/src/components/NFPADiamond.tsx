interface NFPADiamondProps {
  health?: number | null;
  fire?: number | null;
  reactivity?: number | null;
  special?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export default function NFPADiamond({
  health,
  fire,
  reactivity,
  special,
  size = 'md'
}: NFPADiamondProps) {
  const sizes = {
    sm: { diamond: 60, font: 'text-sm', specialFont: 'text-[8px]' },
    md: { diamond: 100, font: 'text-lg', specialFont: 'text-xs' },
    lg: { diamond: 140, font: 'text-2xl', specialFont: 'text-sm' }
  };

  const { diamond, font, specialFont } = sizes[size];
  const halfDiamond = diamond / 2;

  // If no ratings provided, show empty diamond
  const hasRatings = health !== null || fire !== null || reactivity !== null;

  if (!hasRatings && !special) {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: diamond, height: diamond }}
      >
        <div className="text-gray-400 text-xs text-center">No NFPA<br/>data</div>
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{ width: diamond, height: diamond }}
      title={`NFPA 704: Health ${health ?? '?'}, Fire ${fire ?? '?'}, Reactivity ${reactivity ?? '?'}${special ? `, Special: ${special}` : ''}`}
    >
      <svg
        width={diamond}
        height={diamond}
        viewBox={`0 0 ${diamond} ${diamond}`}
        className="transform rotate-45"
      >
        {/* Health - Blue (Left) */}
        <rect
          x={0}
          y={0}
          width={halfDiamond}
          height={halfDiamond}
          fill="#0066cc"
          stroke="#333"
          strokeWidth="1"
        />
        {/* Fire - Red (Top) */}
        <rect
          x={halfDiamond}
          y={0}
          width={halfDiamond}
          height={halfDiamond}
          fill="#cc0000"
          stroke="#333"
          strokeWidth="1"
        />
        {/* Reactivity - Yellow (Right) */}
        <rect
          x={halfDiamond}
          y={halfDiamond}
          width={halfDiamond}
          height={halfDiamond}
          fill="#ffcc00"
          stroke="#333"
          strokeWidth="1"
        />
        {/* Special - White (Bottom) */}
        <rect
          x={0}
          y={halfDiamond}
          width={halfDiamond}
          height={halfDiamond}
          fill="#ffffff"
          stroke="#333"
          strokeWidth="1"
        />
      </svg>

      {/* Numbers and text overlay - not rotated */}
      <div
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Health (Left) - Blue */}
        <div
          className={`absolute ${font} font-bold text-white`}
          style={{
            left: `${halfDiamond * 0.25}px`,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          {health ?? '?'}
        </div>

        {/* Fire (Top) - Red */}
        <div
          className={`absolute ${font} font-bold text-white`}
          style={{
            top: `${halfDiamond * 0.25}px`,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          {fire ?? '?'}
        </div>

        {/* Reactivity (Right) - Yellow */}
        <div
          className={`absolute ${font} font-bold text-black`}
          style={{
            right: `${halfDiamond * 0.25}px`,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          {reactivity ?? '?'}
        </div>

        {/* Special (Bottom) - White */}
        <div
          className={`absolute ${specialFont} font-bold text-black`}
          style={{
            bottom: `${halfDiamond * 0.25}px`,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          {special || ''}
        </div>
      </div>
    </div>
  );
}
