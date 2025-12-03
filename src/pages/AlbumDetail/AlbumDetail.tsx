import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  Box,
  Image,
  Text,
  Spinner,
  Center,
  Heading,
  Button,
  IconButton,
} from "@chakra-ui/react";
import {
  fetchAlbumDetails,
  fetchTrackInfo,
} from "../../services/lastfm";
import type { AlbumDetails } from "../../types/lastfm";
import { useStore } from "../../store/useStore";
import PlayCountGraph from "../../components/PlayCountGraph/PlayCountGraph";
import { handleApiError } from "../../utils/errorHandler";

const AlbumDetail = () => {
  const { artist, albumName } = useParams<{
    artist: string;
    albumName: string;
  }>();
  const navigate = useNavigate();
  const { addFavourite, removeFavourite, isFavourite } = useStore();

  const decodedArtist = artist ? decodeURIComponent(artist) : "";
  const decodedAlbum = albumName ? decodeURIComponent(albumName) : "";

  const {
    data: album,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["albumDetails", decodedArtist, decodedAlbum],
    queryFn: () => fetchAlbumDetails(decodedArtist, decodedAlbum),
    enabled: !!decodedArtist && !!decodedAlbum,
  });

  const tracksToFetch = album?.tracks.slice(0, 20) ?? [];
  const playcountQueries = useQueries({
    queries: tracksToFetch.map((track) => ({
      queryKey: ["trackInfo", album?.artist, track.name],
      queryFn: () => fetchTrackInfo(album!.artist, track.name),
      enabled: !!album?.artist && !!track.name,
    })),
  });

  const tracksWithPlaycount = useMemo(() => {
    const map = new Map<number, number>();
    playcountQueries.forEach((query, index) => {
      if (query.data !== null && query.data !== undefined) {
        map.set(index, query.data);
      }
    });
    return map;
  }, [playcountQueries]);

  const formatDuration = (durationSeconds?: number): string => {
    if (!durationSeconds || durationSeconds === 0) return "-";
    const minutes = Math.floor(durationSeconds / 60);
    const remainingSeconds = durationSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getAlbumCover = (images: AlbumDetails["image"]) => {
    const largeImage = images.find(
      (img) => img.size === "large" || img.size === "extralarge"
    );
    const mediumImage = images.find((img) => img.size === "medium");
    return largeImage?.["#text"] || mediumImage?.["#text"] || images[0]?.["#text"] || "";
  };

  if (isLoading) {
    return (
      <Center minH="400px">
        <Spinner size="xl" color="gray.500" />
      </Center>
    );
  }

  if (queryError || !album) {
    return (
      <Center minH="400px">
        <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
          <Text color="red.500">{queryError ? handleApiError(queryError) : "Album not found"}</Text>
          <Button onClick={() => navigate("/")} colorScheme="gray">
            Back to Home
          </Button>
        </Box>
      </Center>
    );
  }

  const coverUrl = getAlbumCover(album.image);

  return (
    <Box>
      <Box
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        gap={8}
        alignItems="flex-start"
      >
        <Box flexShrink={0}>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={album.name}
              width={{ base: "100%", md: "300px" }}
              maxW="300px"
              borderRadius="1rem"
              boxShadow="lg"
            />
          ) : (
            <Box
              bg="gray.200"
              width={{ base: "100%", md: "300px" }}
              height="300px"
              maxW="300px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="1rem"
            >
              <Text color="gray.400" fontSize="4xl">
                🎵
              </Text>
            </Box>
          )}
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap={4}
          flex="1"
        >
          <Box>
            <Heading as="h1" size="2xl" mb={2} color="gray.800">
              {album.name}
            </Heading>
            <Text fontSize="xl" color="gray.600" mb={4}>
              {album.artist}
            </Text>
            {album.year && (
              <Text fontSize="md" color="gray.500" mb={2}>
                Released: {album.year}
              </Text>
            )}
            {album.listeners && (
              <Text fontSize="sm" color="gray.500" mb={2}>
                Listeners: {parseInt(album.listeners, 10).toLocaleString()}
              </Text>
            )}
            {album.playcount && (
              <Text fontSize="sm" color="gray.500" mb={4}>
                Play count: {parseInt(album.playcount, 10).toLocaleString()}
              </Text>
            )}
          </Box>

          {album.wikiSummary && (
            <Box>
              <Text fontSize="sm" color="gray.700" lineHeight="tall">
                {album.wikiSummary.replace(/<[^>]*>/g, "").substring(0, 500)}
                {album.wikiSummary.length > 500 && "..."}
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      {album.tracks.length > 0 && (
        <Box mt={8}>
          <Heading as="h2" size="lg" mb={4} color="gray.800">
            Track List
          </Heading>
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
                    #
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
                    Track
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
                {album.tracks.map((track, index) => {
                  const isFav = isFavourite(track.name, album.artist);
                  const playcount = tracksWithPlaycount.get(index) ?? track.playcount;
                  const playcountDisplay = playcount !== undefined && playcount !== null && playcount > 0
                    ? playcount.toLocaleString()
                    : "-";
                  return (
                    <Box
                      as="tr"
                      key={`${track.name}-${index}`}
                      _hover={{ bg: "gray.50" }}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                    >
                      <Box as="td" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }} color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                        {index + 1}
                      </Box>
                      <Box as="td" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }}>
                        <Text
                          onClick={() => window.open(track.url, "_blank")}
                          color="gray.700"
                          _hover={{ textDecoration: "underline", color: "gray.900" }}
                          cursor="pointer"
                          fontWeight="medium"
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          {track.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500" display={{ base: "block", lg: "none" }} mt={0.5}>
                          {formatDuration(track.durationSeconds)} • {playcountDisplay} plays
                        </Text>
                      </Box>
                      <Box
                        as="td"
                        px={{ base: 2, md: 4 }}
                        py={{ base: 2, md: 3 }}
                        textAlign="right"
                        color="gray.600"
                        fontSize={{ base: "sm", md: "md" }}
                        display={{ base: "none", lg: "table-cell" }}
                      >
                        {formatDuration(track.durationSeconds)}
                      </Box>
                      <Box
                        as="td"
                        px={{ base: 2, md: 4 }}
                        py={{ base: 2, md: 3 }}
                        textAlign="right"
                        color="gray.600"
                        fontSize={{ base: "sm", md: "md" }}
                        display={{ base: "none", lg: "table-cell" }}
                      >
                        {playcountDisplay}
                      </Box>
                      <Box
                        as="td"
                        px={{ base: 2, md: 4 }}
                        py={{ base: 2, md: 3 }}
                        textAlign="center"
                      >
                        <Box display="flex" gap={2} justifyContent="center">
                          <IconButton
                            aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
                            size={{ base: "xs", md: "sm" }}
                            colorScheme={isFav ? "red" : "gray"}
                            variant="ghost"
                            borderRadius="md"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isFav) {
                                removeFavourite(track.name, album.artist);
                              } else {
                                addFavourite({
                                  name: track.name,
                                  artist: album.artist,
                                  album: album.name,
                                  durationSeconds: track.durationSeconds,
                                  url: track.url,
                                  playcount: tracksWithPlaycount.get(index) ?? track.playcount,
                                });
                              }
                            }}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill={isFav ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="2"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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
                              window.open(track.url, "_blank");
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
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {album.tracks.length > 0 && (
        <PlayCountGraph
          tracks={album.tracks}
          tracksWithPlaycount={tracksWithPlaycount}
        />
      )}
    </Box>
  );
};

export default AlbumDetail;
