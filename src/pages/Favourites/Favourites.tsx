import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  Heading,
  Input,
  IconButton,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import { useStore } from "../../store/useStore";

const Favourites = () => {
  const { favourites, removeFavourite } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFavourites = useMemo(
    () =>
      favourites.filter(
        (track) =>
          track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.album.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [favourites, searchQuery]
  );

  const formatDuration = (durationSeconds?: number): string => {
    if (!durationSeconds || durationSeconds === 0) return "-";
    const minutes = Math.floor(durationSeconds / 60);
    const remainingSeconds = durationSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleTrackClick = (track: typeof favourites[0]) => {
    const encodedArtist = encodeURIComponent(track.artist);
    const encodedAlbum = encodeURIComponent(track.album);
    navigate(`/album/${encodedArtist}/${encodedAlbum}`);
  };

  return (
    <Box>
      <Heading as="h1" size="xl" mb={6} color="gray.800">
        Favourites
      </Heading>

      <Box mb={6} position="relative">
        <Box position="absolute" left="20px" top="50%" transform="translateY(-50%)" zIndex={1} pointerEvents="none">
          <Icon icon="mdi:magnify" width="20" height="20" color="#9CA3AF" />
        </Box>
        <Input
          placeholder="Search favourites by title, album, or artist"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="md"
          bg="white"
          border="1px solid"
          borderColor="gray.300"
          borderRadius="full"
          pl={12}
          pr={6}
          py={6}
          _focus={{ borderColor: "gray.500", boxShadow: "0 0 0 1px gray.500" }}
          _placeholder={{ color: "gray.400" }}
        />
      </Box>

      {favourites.length === 0 ? (
        <Box textAlign="center" py={12}>
          <Text color="gray.500" fontSize="lg" mb={2}>
            No favourites yet
          </Text>
          <Text color="gray.400" fontSize="sm">
            Add songs to your favourites from album details or search results
          </Text>
        </Box>
      ) : filteredFavourites.length === 0 ? (
        <Box textAlign="center" py={12}>
          <Text color="gray.500">No favourites match your search.</Text>
        </Box>
      ) : (
        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          overflow="hidden"
        >
          <Box as="table" width="100%" borderCollapse="collapse">
            <Box as="thead" bg="gray.100">
              <Box as="tr">
                <Box
                  as="th"
                  px={{ base: 2, md: 4 }}
                  py={{ base: 2, md: 3 }}
                  textAlign="left"
                  fontWeight="semibold"
                  color="gray.700"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  Title
                </Box>
                <Box
                  as="th"
                  px={{ base: 2, md: 4 }}
                  py={{ base: 2, md: 3 }}
                  textAlign="left"
                  fontWeight="semibold"
                  color="gray.700"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  fontSize={{ base: "sm", md: "md" }}
                  display={{ base: "none", md: "table-cell" }}
                >
                  Album
                </Box>
                <Box
                  as="th"
                  px={{ base: 2, md: 4 }}
                  py={{ base: 2, md: 3 }}
                  textAlign="left"
                  fontWeight="semibold"
                  color="gray.700"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  Artist
                </Box>
                <Box
                  as="th"
                  px={{ base: 2, md: 4 }}
                  py={{ base: 2, md: 3 }}
                  textAlign="right"
                  fontWeight="semibold"
                  color="gray.700"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  fontSize={{ base: "sm", md: "md" }}
                  display={{ base: "none", lg: "table-cell" }}
                >
                  Duration
                </Box>
                <Box
                  as="th"
                  px={{ base: 2, md: 4 }}
                  py={{ base: 2, md: 3 }}
                  textAlign="right"
                  fontWeight="semibold"
                  color="gray.700"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  fontSize={{ base: "sm", md: "md" }}
                  display={{ base: "none", lg: "table-cell" }}
                >
                  Plays
                </Box>
                <Box
                  as="th"
                  px={{ base: 2, md: 4 }}
                  py={{ base: 2, md: 3 }}
                  textAlign="center"
                  fontWeight="semibold"
                  color="gray.700"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  Actions
                </Box>
              </Box>
            </Box>
            <Box as="tbody">
              {filteredFavourites.map((track, index) => (
                <Box
                  as="tr"
                  key={`${track.name}-${track.artist}-${index}`}
                  _hover={{ bg: "gray.50" }}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  cursor="pointer"
                  onClick={() => handleTrackClick(track)}
                >
                  <Box as="td" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }}>
                    <Text fontWeight="medium" color="gray.800" fontSize={{ base: "sm", md: "md" }}>
                      {track.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500" display={{ base: "block", md: "none" }} mt={1}>
                      {track.album}
                    </Text>
                    <Text fontSize="xs" color="gray.500" display={{ base: "block", lg: "none" }} mt={0.5}>
                      {formatDuration(track.durationSeconds)} • {track.playcount ? track.playcount.toLocaleString() : "-"} plays
                    </Text>
                  </Box>
                  <Box as="td" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }} color="gray.600" fontSize={{ base: "sm", md: "md" }} display={{ base: "none", md: "table-cell" }}>
                    {track.album}
                  </Box>
                  <Box as="td" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }} color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                    {track.artist}
                  </Box>
                  <Box as="td" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }} textAlign="right" color="gray.600" fontSize={{ base: "sm", md: "md" }} display={{ base: "none", lg: "table-cell" }}>
                    {formatDuration(track.durationSeconds)}
                  </Box>
                  <Box as="td" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }} textAlign="right" color="gray.600" fontSize={{ base: "sm", md: "md" }} display={{ base: "none", lg: "table-cell" }}>
                    {track.playcount
                      ? track.playcount.toLocaleString()
                      : "-"}
                  </Box>
                  <Box
                    as="td"
                    px={{ base: 2, md: 4 }}
                    py={{ base: 2, md: 3 }}
                    textAlign="center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Box display="flex" gap={2} justifyContent="center">
                      <IconButton
                        aria-label="Remove from favourites"
                        size={{ base: "xs", md: "sm" }}
                        colorScheme="red"
                        variant="ghost"
                        borderRadius="md"
                        onClick={() => removeFavourite(track.name, track.artist)}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                          />
                        </svg>
                      </IconButton>
                      <IconButton
                        aria-label="Play track"
                        size={{ base: "xs", md: "sm" }}
                        colorScheme="gray"
                        variant="ghost"
                        borderRadius="full"
                        border="1px solid"
                        borderColor="gray.300"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (track.url) {
                            window.open(track.url, "_blank");
                          }
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 5V19L19 12L8 5Z"
                            fill="currentColor"
                          />
                        </svg>
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Favourites;

