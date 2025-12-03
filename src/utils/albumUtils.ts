import type { AlbumSummary, AlbumDetails } from "../types/lastfm";

// Gets the best available album cover image from Last.fm image array

export const getAlbumCover = (images: AlbumSummary["image"] | AlbumDetails["image"]): string => {
  const largeImage = images.find((img) => img.size === "large" || img.size === "extralarge");
  const mediumImage = images.find((img) => img.size === "medium");
  return largeImage?.["#text"] || mediumImage?.["#text"] || images[0]?.["#text"] || "";
};

