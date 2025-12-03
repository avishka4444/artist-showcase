import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Box, Grid, Image, Text, Spinner, Center, Heading, IconButton, Button, HStack, Input } from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import { fetchArtistTopAlbums, fetchAlbumDetails } from "../../services/lastfm";
import type { AlbumSummary } from "../../types/lastfm";
import { useStore } from "../../store/useStore";
import { handleApiError } from "../../utils/errorHandler";

type SortOption = "name" | "year" | "default";

const ITEMS_PER_PAGE = 20;

const Home = () => {
  const { artist } = useStore();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: albums = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["artistTopAlbums", artist],
    queryFn: () => fetchArtistTopAlbums(artist),
    enabled: !!artist && artist.trim().length > 0,
  });

  const albumsToFetchYears = albums.slice(0, 20);
  const yearQueries = useQueries({
    queries: albumsToFetchYears.map((album) => ({
      queryKey: ["albumDetails", album.artist, album.name],
      queryFn: () => fetchAlbumDetails(album.artist, album.name),
      enabled: !!album.artist && !!album.name,
      staleTime: Infinity,
    })),
  });

  const albumsWithYears = useMemo(() => {
    return albums.map((album, index) => {
      if (index < yearQueries.length) {
        const yearData = yearQueries[index].data;
        if (yearData?.year) {
          return { ...album, year: yearData.year };
        }
      }
      return album;
    });
  }, [albums, yearQueries]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const getAlbumCover = (images: AlbumSummary["image"]) => {
    const largeImage = images.find((img) => img.size === "large" || img.size === "extralarge");
    const mediumImage = images.find((img) => img.size === "medium");
    return largeImage?.["#text"] || mediumImage?.["#text"] || images[0]?.["#text"] || "";
  };

  const extractYear = (album: AlbumSummary): string | null => {
    if (album.year) {
      return album.year;
    }
    const yearMatch = album.name.match(/\((\d{4})\)/);
    return yearMatch ? yearMatch[1] : null;
  };

  const sortedAlbums = useMemo(() => {
    if (sortBy === "default") {
      return albumsWithYears;
    }

    const albumsWithYear = albumsWithYears.map((album) => ({
      ...album,
      extractedYear: extractYear(album),
    }));

    if (sortBy === "year") {
      return [...albumsWithYear].sort((a, b) => {
        const yearA = a.extractedYear ? parseInt(a.extractedYear, 10) : 0;
        const yearB = b.extractedYear ? parseInt(b.extractedYear, 10) : 0;
        if (yearB === yearA) {
          return a.name.localeCompare(b.name);
        }
        return yearB - yearA;
      });
    }

    if (sortBy === "name") {
      return [...albumsWithYear].sort((a, b) => {
        const yearA = extractYear(a);
        const yearB = extractYear(b);
        const nameA = yearA ? a.name.replace(`(${yearA})`, "").trim() : a.name;
        const nameB = yearB ? b.name.replace(`(${yearB})`, "").trim() : b.name;
        return nameA.localeCompare(nameB);
      });
    }

    return albumsWithYears;
  }, [albumsWithYears, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  // pagination
  const totalPages = Math.ceil(sortedAlbums.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAlbums = sortedAlbums.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlayClick = (album: AlbumSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(album.url, "_blank");
  };

  const handleAlbumClick = (album: AlbumSummary) => {
    const encodedArtist = encodeURIComponent(album.artist);
    const encodedAlbum = encodeURIComponent(album.name);
    navigate(`/album/${encodedArtist}/${encodedAlbum}`);
  };

  const AlbumCard = ({ album, index, year, displayName, coverUrl }: { album: AlbumSummary; index: number; year: string | null; displayName: string; coverUrl: string }) => {
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <Box
            bg="gray.200"
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            display={coverUrl ? "none" : "flex"}
            alignItems="center"
            justifyContent="center"
            borderRadius="1rem"
          >
            <Text color="gray.400" fontSize="2xl">
              🎵
            </Text>
          </Box>
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
            {displayName}
          </Text>
          {year && (
            <Text fontSize="xs" color="gray.500">
              {year}
            </Text>
          )}
        </Box>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Center minH="400px">
        <Spinner size="xl" color="gray.500" />
      </Center>
    );
  }

  if (queryError) {
    return (
      <Center minH="400px">
        <Text color="red.500">{handleApiError(queryError)}</Text>
      </Center>
    );
  }

  return (
    <Box mb={12} px={4} maxW="1200px" mx="auto">
      {/* Search bar */}
      <Box mb={6} maxW="600px" mx="auto">
        <Box as="form" onSubmit={handleSearch} position="relative">
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
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6} flexDirection={{ base: "column", md: "row" }} gap={4}>
        <Heading as="h1" size="xl" color="gray.800">
          {artist} - Albums
        </Heading>
        {albumsWithYears.length > 0 && (
          <Box display="flex" alignItems="center" gap={2}>
            <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
              Sort by:
            </Text>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                padding: "8px 8px 8px 12px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "white",
                fontSize: "14px",
                width: "150px",
                cursor: "pointer",
                paddingRight: "24px",
                appearance: "none",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = "none";
              }}
            >
              <option value="default">Default</option>
              <option value="name">Name</option>
              <option value="year">Year</option>
            </select>
          </Box>
        )}
      </Box>

      {albums.length === 0 ? (
        <Center minH="400px">
          <Text color="gray.500">No albums found for this artist.</Text>
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
          {paginatedAlbums.map((album, index) => {
            const coverUrl = getAlbumCover(album.image);
            const year = extractYear(album);
            const displayName = year && album.name.includes(`(${year})`) 
              ? album.name.replace(`(${year})`, "").trim() 
              : album.name;

            return (
              <AlbumCard
                key={`${album.name}-${index}`}
                album={album}
                index={index}
                year={year}
                displayName={displayName}
                coverUrl={coverUrl}
              />
            );
          })}
        </Grid>
      )}

      {sortedAlbums.length > ITEMS_PER_PAGE && (
        <Box mt={16} mb={12} display="flex" justifyContent="center" alignItems="center">
          <HStack gap={2}>
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              size="md"
              bg="gray.100"
              color="black"
              _hover={{ bg: "gray.200" }}
              _disabled={{ bg: "gray.300", cursor: "not-allowed" }}
              width="40px"
              height="40px"
              padding={0}
            >
              <Icon icon="mdi:chevron-left" width="20" height="20" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    size="md"
                    bg={currentPage === page ? "gray.300" : "white"}
                    color="black"
                    border="1px solid"
                    borderColor={currentPage === page ? "gray.300" : "gray.200"}
                    _hover={{
                      bg: currentPage === page ? "gray.200" : "gray.50",
                      borderColor: currentPage === page ? "gray.200" : "gray.300",
                    }}
                    minW="40px"
                  >
                    {page}
                  </Button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return (
                  <Text key={page} color="gray.500" px={2}>
                    ...
                  </Text>
                );
              }
              return null;
            })}

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              size="md"
              bg="gray.100"
              color="black"
              _hover={{ bg: "gray.200" }}
              _disabled={{ bg: "gray.300", cursor: "not-allowed" }}
              width="40px"
              height="40px"
              padding={0}
            >
              <Icon icon="mdi:chevron-right" width="20" height="20" />
            </Button>
          </HStack>
        </Box>
      )}

      
    </Box>
  );
};

export default Home;
