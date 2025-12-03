import { Text } from "@chakra-ui/react";

interface MusicIconProps {
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "xl",
  md: "2xl",
  lg: "3xl",
  xl: "4xl",
};

export const MusicIcon = ({ size = "md" }: MusicIconProps) => {
  return (
    <Text color="gray.400" fontSize={sizeMap[size]} role="img" aria-label="Music icon">
      🎵
    </Text>
  );
};

