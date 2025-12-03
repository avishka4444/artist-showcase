import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface FavouriteTrack {
  name: string;
  artist: string;
  album: string;
  durationSeconds?: number;
  url: string;
  playcount?: number;
}

interface StoreState {
  artist: string;
  setArtist: (artist: string) => void;
  favourites: FavouriteTrack[];
  addFavourite: (track: FavouriteTrack) => void;
  removeFavourite: (trackName: string, artist: string) => void;
  isFavourite: (trackName: string, artist: string) => boolean;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      artist: "The Beatles",
      setArtist: (artist: string) => set({ artist }),

      favourites: [],
      addFavourite: (track: FavouriteTrack) => {
        const { favourites } = get();
        const exists = favourites.some(
          (f) => f.name === track.name && f.artist === track.artist
        );

        if (!exists) {
          set({ favourites: [...favourites, track] });
        }
      },

      removeFavourite: (trackName: string, artist: string) => {
        const { favourites } = get();
        set({
          favourites: favourites.filter(
            (f) => !(f.name === trackName && f.artist === artist)
          ),
        });
      },

      isFavourite: (trackName: string, artist: string) => {
        const { favourites } = get();
        return favourites.some(
          (f) => f.name === trackName && f.artist === artist
        );
      },
    }),
    {
      name: "melody-scope-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ favourites: state.favourites, artist: state.artist }),
    }
  )
);
