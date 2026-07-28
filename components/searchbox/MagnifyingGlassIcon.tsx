type MagnifyingGlassIconProps = {
  size?: number;
};

export default function MagnifyingGlassIcon({ size = 16 }: MagnifyingGlassIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <line x1="11.1" y1="11.1" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}