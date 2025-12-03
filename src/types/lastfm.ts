export interface LastfmImage {
  "#text": string;
  size: string;
}

export interface AlbumSummary {
  name: string;
  artist: string;
  playcount?: number;
  url: string;
  image: LastfmImage[];
  year?: string;
}

export interface TrackSummary {
  name: string;
  durationSeconds?: number;
  url: string;
  playcount?: number;
  artist?: string;
}

export interface AlbumDetails {
  name: string;
  artist: string;
  url: string;
  image: LastfmImage[];
  listeners?: string;
  playcount?: string;
  tracks: TrackSummary[];
  wikiSummary?: string;
  year?: string;
}

