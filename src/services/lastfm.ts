import { ApiError, logError } from "../utils/errorHandler";
import type { LastfmImage, AlbumSummary, TrackSummary, AlbumDetails } from "../types/lastfm";

const API_BASE = "https://ws.audioscrobbler.com/2.0/";

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY as string;

if (!API_KEY) {
  if (import.meta.env.DEV) {
    console.warn("VITE_LASTFM_API_KEY is not set. Last.fm calls will fail.");
  }
}

const LASTFM_METHODS = {
  TOP_ALBUMS: "artist.gettopalbums",
  ALBUM_INFO: "album.getinfo",
  TRACK_SEARCH: "track.search",
  ALBUM_SEARCH: "album.search",
  TRACK_INFO: "track.getinfo",
} as const;

const normalizePlaycount = (pc?: string | number): number | undefined => {
  if (pc == null) return undefined;
  if (typeof pc === "number") return pc;
  const n = parseInt(pc, 10);
  return Number.isNaN(n) ? undefined : n;
};

const normalizeDuration = (duration?: string | number): number | undefined => {
  if (duration == null) return undefined;
  if (typeof duration === "number") return duration;
  const n = parseInt(duration, 10);
  return Number.isNaN(n) ? undefined : n;
};

async function callLastfm<T>(params: Record<string, string>): Promise<T> {
  if (!API_KEY) {
    throw new ApiError("Last.fm API key is not configured");
  }

  const url = new URL(API_BASE);

  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("format", "json");

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url.toString(), {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new ApiError(
        `Last.fm request failed with status ${res.status}`,
        res.status
      );
    }

    const data = (await res.json()) as T;

    if (data && typeof data === "object" && "error" in data) {
      const errorData = data as { error?: number; message?: string };
      const errorMessage = errorData.message || "Unknown error";
      throw new ApiError(`Last.fm API error: ${errorMessage}`);
    }

    return data;
  } catch (error) {
    logError(error, "callLastfm");
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, undefined, error);
    }
    throw new ApiError("Failed to fetch data from Last.fm API", undefined, error);
  }
}

export type { LastfmImage, AlbumSummary, TrackSummary, AlbumDetails } from "../types/lastfm";

interface ArtistTopAlbumsResponse {
  topalbums?: {
    album?: Array<{
      name: string;
      artist: { name: string };
      playcount?: number | string;
      url: string;
      image: LastfmImage[];
    }>;
  };
}

interface AlbumInfoResponse {
  album?: {
    name: string;
    artist: string;
    url: string;
    image: LastfmImage[];
    listeners?: string;
    playcount?: string;
    tracks?: {
      track:
        | {
            name: string;
            duration: string;
            url: string;
            playcount?: number | string;
          }
        | Array<{
            name: string;
            duration: string;
            url: string;
            playcount?: number | string;
          }>;
    };
    wiki?: {
      summary?: string;
      published?: string;
    };
  };
}

interface TrackSearchResponse {
  results?: {
    trackmatches?: {
      track?: Array<{
        name: string;
        artist: string;
        url: string;
      }>;
    };
  };
}

interface AlbumSearchResponse {
  results?: {
    albummatches?: {
      album?: Array<{
        name: string;
        artist: string;
        url: string;
        image: LastfmImage[];
      }>;
    };
  };
}

interface TrackInfoResponse {
  track?: {
    name: string;
    playcount?: string | number;
  };
}

export async function fetchArtistTopAlbums(
  artist: string
): Promise<AlbumSummary[]> {
  if (!artist || !artist.trim()) {
    throw new ApiError("Artist name cannot be empty");
  }

  const data = await callLastfm<ArtistTopAlbumsResponse>({
    method: LASTFM_METHODS.TOP_ALBUMS,
    artist: artist.trim(),
  });

  const albums = data.topalbums?.album ?? [];

  return albums.map((a) => ({
    name: a.name,
    artist: a.artist?.name ?? artist,
    playcount: normalizePlaycount(a.playcount),
    url: a.url,
    image: a.image ?? [],
  }));
}

export async function fetchAlbumDetails(
  artist: string,
  album: string
): Promise<AlbumDetails | null> {
  if (!artist || !artist.trim()) {
    throw new ApiError("Artist name cannot be empty");
  }
  if (!album || !album.trim()) {
    throw new ApiError("Album name cannot be empty");
  }

  const data = await callLastfm<AlbumInfoResponse>({
    method: LASTFM_METHODS.ALBUM_INFO,
    artist: artist.trim(),
    album: album.trim(),
  });

  if (!data.album) return null;

  const tracksRaw = data.album.tracks?.track;

  const tracksArray = Array.isArray(tracksRaw)
    ? tracksRaw
    : tracksRaw
    ? [tracksRaw]
    : [];

  const tracks: TrackSummary[] = tracksArray.map((t) => ({
    name: t.name,
    durationSeconds: normalizeDuration(t.duration),
    url: t.url,
    playcount: normalizePlaycount(t.playcount),
  }));

  const publishedDate = data.album.wiki?.published;
  const year = publishedDate ? new Date(publishedDate).getFullYear().toString() : undefined;

  return {
    name: data.album.name,
    artist: data.album.artist,
    url: data.album.url,
    image: data.album.image ?? [],
    listeners: data.album.listeners,
    playcount: data.album.playcount,
    tracks,
    wikiSummary: data.album.wiki?.summary,
    year,
  };
}

export async function searchTracks(query: string): Promise<TrackSummary[]> {
  if (!query.trim()) return [];

  const data = await callLastfm<TrackSearchResponse>({
    method: LASTFM_METHODS.TRACK_SEARCH,
    track: query,
  });

  const matches = data.results?.trackmatches?.track ?? [];

  return matches.map((t) => ({
    name: t.name,
    durationSeconds: undefined,
    url: t.url,
    artist: t.artist,
  }));
}

export async function searchAlbums(query: string): Promise<AlbumSummary[]> {
  if (!query.trim()) return [];

  const data = await callLastfm<AlbumSearchResponse>({
    method: LASTFM_METHODS.ALBUM_SEARCH,
    album: query,
  });

  const matches = data.results?.albummatches?.album ?? [];

  return matches.map((a) => ({
    name: a.name,
    artist: a.artist,
    url: a.url,
    image: a.image ?? [],
  }));
}

export async function fetchTrackInfo(
  artist: string,
  track: string
): Promise<number | null> {
  try {
    const data = await callLastfm<TrackInfoResponse>({
      method: LASTFM_METHODS.TRACK_INFO,
      artist,
      track,
    });

    if (!data.track) return null;

    const playcount = normalizePlaycount(data.track.playcount);
    return playcount ?? null;
  } catch (error) {
    logError(error, "fetchTrackInfo");
    return null;
  }
}
