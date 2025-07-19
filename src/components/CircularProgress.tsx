
"use client";

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  value: number;
  children?: React.ReactNode;
  className?: string;
}

export function CircularProgress({
  size = 100,
  strokeWidth = 10,
  value,
  children,
  className,
}: CircularProgressProps) {
  const viewBox = `0 0 ${size} ${size}`;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const dash = (value * circumference) / 100;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        className={`-rotate-90 transform ${className}`}
      >
        <circle
          className="text-secondary"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          className="text-primary"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - dash}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      {children && <div className="absolute">{children}</div>}
    </div>
  );
}
