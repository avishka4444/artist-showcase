import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Text,
  Spinner,
  Center,
  Heading,
  Input,
  Grid,
  Image,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import { searchTracks, searchAlbums } from "../../services/lastfm";
import type { AlbumSummary } from "../../types/lastfm";
import { useStore } from "../../store/useStore";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addFavourite, removeFavourite, isFavourite } = useStore();
  const query = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [activeTab, setActiveTab] = useState<"tracks" | "albums">("tracks");

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const {
    data: tracks = [],
    isLoading: tracksLoading,
  } = useQuery({
    queryKey: ["searchTracks", query],
    queryFn: () => searchTracks(query),
    enabled: !!query.trim(),
  });

  const {
    data: albums = [],
    isLoading: albumsLoading,
  } = useQuery({
    queryKey: ["searchAlbums", query],
    queryFn: () => searchAlbums(query),
    enabled: !!query.trim(),
  });

  const loading = tracksLoading || albumsLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getAlbumCover = (images: AlbumSummary["image"]) => {
    const largeImage = images.find((img) => img.size === "large" || img.size === "extralarge");
    const mediumImage = images.find((img) => img.size === "medium");
    return largeImage?.["#text"] || mediumImage?.["#text"] || images[0]?.["#text"] || "";
  };

  const handleAlbumClick = (album: AlbumSummary) => {
    const encodedArtist = encodeURIComponent(album.artist);
    const encodedAlbum = encodeURIComponent(album.name);
    navigate(`/album/${encodedArtist}/${encodedAlbum}`);
  };

  const handlePlayClick = (album: AlbumSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(album.url, "_blank");
  };

  const AlbumCard = ({ album, index, coverUrl }: { album: AlbumSummary; index: number; coverUrl: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <Box
        key={`${album.name}-${index}`}
        cursor="pointer"
        transform={isHovered ? "scale(1.05)" : "scale(1)"}
        transition="transform 0.3s ease"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => handleAlbumClick(album)}
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
          {coverUrl ? (
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
            />
          ) : (
            <Box
              bg="gray.200"
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="1rem"
            >
              <Text color="gray.400" fontSize="2xl">
                🎵
              </Text>
            </Box>
          )}
          <Box
            position="absolute"
            bottom="12px"
            right="12px"
            opacity={isHovered ? 1 : 0}
            transition="opacity 0.3s ease"
            cursor="pointer"
            onClick={(e) => handlePlayClick(album, e)}
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
              width="45px"
              height="45px"
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 5V19L19 12L8 5Z"
                  fill="black"
                />
              </svg>
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
            {album.name}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {album.artist}
          </Text>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Heading as="h1" size="xl" mb={6} color="gray.800">
        Search
      </Heading>

      <Box as="form" onSubmit={handleSearch} mb={6} position="relative">
        <Box position="absolute" left="20px" top="50%" transform="translateY(-50%)" zIndex={1} pointerEvents="none">
          <Icon icon="mdi:magnify" width="20" height="20" color="#9CA3AF" />
        </Box>
        <Input
          placeholder="Search for song or album by name"
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

      {loading ? (
        <Center minH="400px">
          <Spinner size="xl" color="gray.500" />
        </Center>
      ) : query.trim() ? (
        <>
          <Box display="flex" gap={4} alignItems="center" mb={6}>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("tracks")}
              color={activeTab === "tracks" ? "gray.700" : "gray.600"}
              borderRadius="md"
              _hover={{ bg: "gray.100", color: "gray.700" }}
            >
              Tracks ({tracks.length})
            </Button>
            <Text color="gray.400">|</Text>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("albums")}
              color={activeTab === "albums" ? "gray.700" : "gray.600"}
              borderRadius="md"
              _hover={{ bg: "gray.100", color: "gray.700" }}
            >
              Albums ({albums.length})
            </Button>
          </Box>

          {activeTab === "tracks" ? (
            <Box>
              {tracks.length === 0 ? (
                <Center minH="200px">
                  <Text color="gray.500">No tracks found.</Text>
                </Center>
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
                          <Box as="th" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }} textAlign="left" fontWeight="semibold" color="gray.700" borderBottom="1px solid" borderColor="gray.200" fontSize={{ base: "sm", md: "md" }}>
                            Track
                          </Box>
                          <Box as="th" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }} textAlign="left" fontWeight="semibold" color="gray.700" borderBottom="1px solid" borderColor="gray.200" fontSize={{ base: "sm", md: "md" }}>
                            Artist
                          </Box>
                          <Box as="th" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }} textAlign="right" fontWeight="semibold" color="gray.700" borderBottom="1px solid" borderColor="gray.200" fontSize={{ base: "sm", md: "md" }}>
                            Actions
                          </Box>
                        </Box>
                      </Box>
                      <Box as="tbody">
                        {tracks.map((track, index) => {
                          const isFav = track.artist ? isFavourite(track.name, track.artist) : false;
                          return (
                            <Box
                              as="tr"
                              key={`${track.name}-${index}`}
                              _hover={{ bg: "gray.50" }}
                              borderBottom="1px solid"
                              borderColor="gray.100"
                            >
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
                              </Box>
                              <Box as="td" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }} color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                                {track.artist || "-"}
                              </Box>
                              <Box as="td" px={{ base: 2, md: 4 }} py={{ base: 2, md: 3 }} textAlign="right">
                                <Box display="flex" gap={2} justifyContent="flex-end">
                                  <IconButton
                                    aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
                                    size={{ base: "xs", md: "sm" }}
                                    colorScheme={isFav ? "red" : "gray"}
                                    variant="ghost"
                                    borderRadius="md"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (track.artist) {
                                        if (isFav) {
                                          removeFavourite(track.name, track.artist);
                                        } else {
                                          addFavourite({
                                            name: track.name,
                                            artist: track.artist,
                                            album: "Unknown Album",
                                            durationSeconds: track.durationSeconds,
                                            url: track.url,
                                            playcount: track.playcount,
                                          });
                                        }
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
              )}
            </Box>
          ) : (
            <Box>
              {albums.length === 0 ? (
                <Center minH="200px">
                  <Text color="gray.500">No albums found.</Text>
                </Center>
              ) : (
                <Grid
                  templateColumns={{
                    base: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                    xl: "repeat(5, 1fr)",
                  }}
                  gap={6}
                >
                  {albums.map((album, index) => {
                    const coverUrl = getAlbumCover(album.image);
                    return (
                      <AlbumCard
                        key={`${album.name}-${index}`}
                        album={album}
                        index={index}
                        coverUrl={coverUrl}
                      />
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}
        </>
      ) : (
        <Center minH="400px">
          <Text color="gray.500">Search to find tracks and albums</Text>
        </Center>
      )}
    </Box>
  );
};

export default Search;

