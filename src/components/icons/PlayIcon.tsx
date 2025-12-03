interface PlayIconProps {
  size?: number;
  fill?: string;
}

export const PlayIcon = ({ size = 24, fill = "currentColor" }: PlayIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M8 5V19L19 12L8 5Z" fill={fill} />
    </svg>
  );
};

