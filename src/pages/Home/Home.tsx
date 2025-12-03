import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Box, Grid, Text, Spinner, Center, Heading, Button, HStack, Input } from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import { fetchArtistTopAlbums, fetchAlbumDetails } from "../../services/lastfm";
import type { AlbumSummary } from "../../types/lastfm";
import { useStore } from "../../store/useStore";
import { handleApiError } from "../../utils/errorHandler";
import { AlbumCard } from "../../components/AlbumCard/AlbumCard";
import { ITEMS_PER_PAGE, MAX_ALBUMS_TO_FETCH_YEARS } from "../../constants";

type SortOption = "name" | "year" | "default";

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

  const albumsToFetchYears = albums.slice(0, MAX_ALBUMS_TO_FETCH_YEARS);
  const yearQueries = useQueries({
    queries: albumsToFetchYears.map((album) => ({
      queryKey: ["albumDetails", album.artist, album.name],
      queryFn: () => fetchAlbumDetails(album.artist, album.name),
      enabled: !!album.artist && !!album.name,
      staleTime: Infinity,
    })),
  });

  const isLoadingYears = yearQueries.some((query) => query.isLoading);

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


  if (isLoading || isLoadingYears) {
    return (
      <Center minH="400px">
        <Spinner size="xl" color="gray.500" aria-label="Loading albums" />
      </Center>
    );
  }

  if (queryError) {
    return (
      <Center minH="400px">
        <Text color="red.500" role="alert">
          {handleApiError(queryError)}
        </Text>
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
                onAlbumClick={handleAlbumClick}
                onPlayClick={handlePlayClick}
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
