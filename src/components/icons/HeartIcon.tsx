interface HeartIconProps {
  size?: number;
  filled?: boolean;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export const HeartIcon = ({
  size = 24,
  filled = false,
  fill = "currentColor",
  stroke = "currentColor",
  strokeWidth = 2,
}: HeartIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? fill : "none"}
      stroke={stroke}
      strokeWidth={strokeWidth}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
};

