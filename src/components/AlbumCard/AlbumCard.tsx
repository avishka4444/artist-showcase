import { useState } from "react";
import { Box, Image, Text, IconButton } from "@chakra-ui/react";
import type { AlbumSummary } from "../../types/lastfm";
import { getAlbumCover } from "../../utils/albumUtils";
import { PlayIcon } from "../icons/PlayIcon";
import { MusicIcon } from "../icons/MusicIcon";
import { PLAY_BUTTON_SIZE, ICON_SIZE_LARGE } from "../../constants";

interface AlbumCardProps {
  album: AlbumSummary;
  index: number;
  year?: string | null;
  displayName?: string;
  onAlbumClick: (album: AlbumSummary) => void;
  onPlayClick: (album: AlbumSummary, e: React.MouseEvent) => void;
}

export const AlbumCard = ({
  album,
  index,
  year,
  displayName,
  onAlbumClick,
  onPlayClick,
}: AlbumCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const coverUrl = getAlbumCover(album.image);
  const showImage = coverUrl && !imageError;
  const finalDisplayName = displayName || album.name;

  return (
    <Box
      key={`${album.name}-${index}`}
      cursor="pointer"
      transform={isHovered ? "scale(1.05)" : "scale(1)"}
      transition="transform 0.3s ease"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onAlbumClick(album)}
    >
      <Box
        bg="gray.100"
        borderRadius="1rem"
        overflow="hidden"
        boxShadow={isHovered ? "xl" : "md"}
        transition="box-shadow 0.3s ease"
        mb={2}
        position="relative"
        width="100%"
        paddingBottom="100%"
      >
        {showImage ? (
          <Image
            src={coverUrl}
            alt={album.name}
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            objectFit="cover"
            borderRadius="1rem"
            transition="all 0.3s ease"
            onError={() => setImageError(true)}
          />
        ) : null}
        <Box
          bg="gray.200"
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          display={showImage ? "none" : "flex"}
          alignItems="center"
          justifyContent="center"
          borderRadius="1rem"
        >
          <MusicIcon size="md" />
        </Box>
        <Box
          position="absolute"
          bottom="12px"
          right="12px"
          opacity={isHovered ? 1 : 0}
          transition="opacity 0.3s ease"
          cursor="pointer"
          onClick={(e) => onPlayClick(album, e)}
          zIndex={10}
        >
          <IconButton
            aria-label="Play album"
            bg="gray.400"
            color="white"
            borderRadius="full"
            size="lg"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
            _hover={{
              bg: "gray.500",
              transform: "scale(1.1)",
            }}
            transition="all 0.2s ease"
            width={`${PLAY_BUTTON_SIZE}px`}
            height={`${PLAY_BUTTON_SIZE}px`}
          >
            <PlayIcon size={ICON_SIZE_LARGE} fill="black" />
          </IconButton>
        </Box>
      </Box>
      <Box>
        <Text
          fontWeight="semibold"
          fontSize="sm"
          color="gray.800"
          mb={1}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {finalDisplayName}
        </Text>
        {year && (
          <Text fontSize="xs" color="gray.500">
            {year}
          </Text>
        )}
        {!year && (
          <Text fontSize="xs" color="gray.500">
            {album.artist}
          </Text>
        )}
      </Box>
    </Box>
  );
};

