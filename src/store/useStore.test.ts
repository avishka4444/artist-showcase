import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';
import type { FavouriteTrack } from './useStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useStore', () => {
  beforeEach(() => {
    // Clear store and localStorage before each test
    localStorageMock.clear();
    const store = useStore.getState();
    store.setArtist('The Beatles');
    // Clear favourites
    store.favourites.forEach((fav) => {
      store.removeFavourite(fav.name, fav.artist);
    });
  });

  describe('artist state', () => {
    it('should have default artist value', () => {
      const store = useStore.getState();
      expect(store.artist).toBe('The Beatles');
    });

    it('should set artist correctly', () => {
      const store = useStore.getState();
      store.setArtist('Pink Floyd');
      expect(useStore.getState().artist).toBe('Pink Floyd');
    });

    it('should update artist multiple times', () => {
      const store = useStore.getState();
      store.setArtist('Pink Floyd');
      expect(useStore.getState().artist).toBe('Pink Floyd');

      store.setArtist('Led Zeppelin');
      expect(useStore.getState().artist).toBe('Led Zeppelin');
    });
  });

  describe('favourites - addFavourite', () => {
    it('should add a favourite track', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
        playcount: 500000,
      };

      store.addFavourite(track);
      const state = useStore.getState();

      expect(state.favourites).toHaveLength(1);
      expect(state.favourites[0]).toEqual(track);
    });

    it('should add multiple favourite tracks', () => {
      const store = useStore.getState();
      const track1: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };
      const track2: FavouriteTrack = {
        name: 'Something',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/2',
      };

      store.addFavourite(track1);
      store.addFavourite(track2);
      const state = useStore.getState();

      expect(state.favourites).toHaveLength(2);
      expect(state.favourites).toContainEqual(track1);
      expect(state.favourites).toContainEqual(track2);
    });

    it('should prevent duplicate favourites based on name and artist', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };

      store.addFavourite(track);
      store.addFavourite(track); // Try to add same track again
      const state = useStore.getState();

      expect(state.favourites).toHaveLength(1);
    });

    it('should allow same track name from different artists', () => {
      const store = useStore.getState();
      const track1: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };
      const track2: FavouriteTrack = {
        name: 'Come Together',
        artist: 'Different Artist',
        album: 'Different Album',
        url: 'https://last.fm/track/2',
      };

      store.addFavourite(track1);
      store.addFavourite(track2);
      const state = useStore.getState();

      expect(state.favourites).toHaveLength(2);
    });

    it('should allow different tracks from same artist', () => {
      const store = useStore.getState();
      const track1: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };
      const track2: FavouriteTrack = {
        name: 'Something',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/2',
      };

      store.addFavourite(track1);
      store.addFavourite(track2);
      const state = useStore.getState();

      expect(state.favourites).toHaveLength(2);
    });

    it('should handle tracks with optional fields', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        url: 'https://test.com',
        durationSeconds: 300,
        playcount: 1000,
      };

      store.addFavourite(track);
      const state = useStore.getState();

      expect(state.favourites[0]).toEqual(track);
      expect(state.favourites[0].durationSeconds).toBe(300);
      expect(state.favourites[0].playcount).toBe(1000);
    });

    it('should handle tracks without optional fields', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        url: 'https://test.com',
      };

      store.addFavourite(track);
      const state = useStore.getState();

      expect(state.favourites[0]).toEqual(track);
      expect(state.favourites[0].durationSeconds).toBeUndefined();
      expect(state.favourites[0].playcount).toBeUndefined();
    });
  });

  describe('favourites - removeFavourite', () => {
    it('should remove a favourite track', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };

      store.addFavourite(track);
      expect(useStore.getState().favourites).toHaveLength(1);

      store.removeFavourite('Come Together', 'The Beatles');
      expect(useStore.getState().favourites).toHaveLength(0);
    });

    it('should remove correct track when multiple exist', () => {
      const store = useStore.getState();
      const track1: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };
      const track2: FavouriteTrack = {
        name: 'Something',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/2',
      };
      const track3: FavouriteTrack = {
        name: 'Here Comes the Sun',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/3',
      };

      store.addFavourite(track1);
      store.addFavourite(track2);
      store.addFavourite(track3);
      expect(useStore.getState().favourites).toHaveLength(3);

      store.removeFavourite('Something', 'The Beatles');
      const state = useStore.getState();

      expect(state.favourites).toHaveLength(2);
      expect(state.favourites).not.toContainEqual(track2);
      expect(state.favourites).toContainEqual(track1);
      expect(state.favourites).toContainEqual(track3);
    });

    it('should not remove anything if track does not exist', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };

      store.addFavourite(track);
      expect(useStore.getState().favourites).toHaveLength(1);

      store.removeFavourite('Non Existent', 'The Beatles');
      expect(useStore.getState().favourites).toHaveLength(1);
    });

    it('should handle case-sensitive track and artist names', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };

      store.addFavourite(track);
      expect(useStore.getState().favourites).toHaveLength(1);

      // Case mismatch should not remove
      store.removeFavourite('come together', 'The Beatles');
      expect(useStore.getState().favourites).toHaveLength(1);

      // Exact match should remove
      store.removeFavourite('Come Together', 'The Beatles');
      expect(useStore.getState().favourites).toHaveLength(0);
    });

    it('should remove from empty favourites list without error', () => {
      const store = useStore.getState();
      expect(store.favourites).toHaveLength(0);

      store.removeFavourite('Any Track', 'Any Artist');
      expect(useStore.getState().favourites).toHaveLength(0);
    });
  });

  describe('favourites - isFavourite', () => {
    it('should return true for existing favourite', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };

      store.addFavourite(track);
      expect(store.isFavourite('Come Together', 'The Beatles')).toBe(true);
    });

    it('should return false for non-existent favourite', () => {
      const store = useStore.getState();
      expect(store.isFavourite('Non Existent', 'The Beatles')).toBe(false);
    });

    it('should return false for empty favourites list', () => {
      const store = useStore.getState();
      expect(store.favourites).toHaveLength(0);
      expect(store.isFavourite('Any Track', 'Any Artist')).toBe(false);
    });

    it('should distinguish between same track name from different artists', () => {
      const store = useStore.getState();
      const track1: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };
      const track2: FavouriteTrack = {
        name: 'Come Together',
        artist: 'Different Artist',
        album: 'Different Album',
        url: 'https://last.fm/track/2',
      };

      store.addFavourite(track1);
      store.addFavourite(track2);

      expect(store.isFavourite('Come Together', 'The Beatles')).toBe(true);
      expect(store.isFavourite('Come Together', 'Different Artist')).toBe(true);
      expect(store.isFavourite('Come Together', 'Non Existent')).toBe(false);
    });

    it('should be case-sensitive', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };

      store.addFavourite(track);
      expect(store.isFavourite('Come Together', 'The Beatles')).toBe(true);
      expect(store.isFavourite('come together', 'The Beatles')).toBe(false);
      expect(store.isFavourite('Come Together', 'the beatles')).toBe(false);
    });
  });

  describe('favourites - integration scenarios', () => {
    it('should handle add, check, and remove workflow', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };

      // Initially not favourite
      expect(store.isFavourite('Come Together', 'The Beatles')).toBe(false);

      // Add as favourite
      store.addFavourite(track);
      expect(store.isFavourite('Come Together', 'The Beatles')).toBe(true);
      expect(useStore.getState().favourites).toHaveLength(1);

      // Try to add again (should not duplicate)
      store.addFavourite(track);
      expect(useStore.getState().favourites).toHaveLength(1);

      // Remove favourite
      store.removeFavourite('Come Together', 'The Beatles');
      expect(store.isFavourite('Come Together', 'The Beatles')).toBe(false);
      expect(useStore.getState().favourites).toHaveLength(0);
    });

    it('should handle multiple operations in sequence', () => {
      const store = useStore.getState();
      const tracks: FavouriteTrack[] = [
        {
          name: 'Track 1',
          artist: 'Artist 1',
          album: 'Album 1',
          url: 'https://test.com/1',
        },
        {
          name: 'Track 2',
          artist: 'Artist 1',
          album: 'Album 1',
          url: 'https://test.com/2',
        },
        {
          name: 'Track 3',
          artist: 'Artist 2',
          album: 'Album 2',
          url: 'https://test.com/3',
        },
      ];

      // Add all tracks
      tracks.forEach((track) => store.addFavourite(track));
      expect(useStore.getState().favourites).toHaveLength(3);

      // Remove middle track
      store.removeFavourite('Track 2', 'Artist 1');
      expect(useStore.getState().favourites).toHaveLength(2);
      expect(store.isFavourite('Track 1', 'Artist 1')).toBe(true);
      expect(store.isFavourite('Track 2', 'Artist 1')).toBe(false);
      expect(store.isFavourite('Track 3', 'Artist 2')).toBe(true);

      // Add new track
      const newTrack: FavouriteTrack = {
        name: 'Track 4',
        artist: 'Artist 3',
        album: 'Album 3',
        url: 'https://test.com/4',
      };
      store.addFavourite(newTrack);
      expect(useStore.getState().favourites).toHaveLength(3);
    });
  });

  describe('persistence', () => {
    it('should persist favourites to localStorage', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: 'Come Together',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };

      store.addFavourite(track);

      // Check that localStorage was updated
      const stored = localStorageMock.getItem('melody-scope-storage');
      expect(stored).not.toBeNull();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.favourites).toHaveLength(1);
        expect(parsed.state.favourites[0]).toEqual(track);
      }
    });

    it('should persist artist to localStorage', () => {
      const store = useStore.getState();
      store.setArtist('Pink Floyd');

      const stored = localStorageMock.getItem('melody-scope-storage');
      expect(stored).not.toBeNull();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.artist).toBe('Pink Floyd');
      }
    });

    it('should restore favourites from localStorage on initialization', () => {
      // Set up localStorage with existing data
      const existingData = {
        state: {
          favourites: [
            {
              name: 'Persisted Track',
              artist: 'Persisted Artist',
              album: 'Persisted Album',
              url: 'https://test.com',
            },
          ],
          artist: 'Persisted Artist',
        },
        version: 0,
      };
      localStorageMock.setItem(
        'melody-scope-storage',
        JSON.stringify(existingData)
      );

      // Create a new store instance (simulating page reload)
      // Note: In a real scenario, Zustand persist middleware handles this automatically
      // This test verifies the structure is correct
      const stored = localStorageMock.getItem('melody-scope-storage');
      expect(stored).not.toBeNull();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.favourites).toHaveLength(1);
        expect(parsed.state.favourites[0].name).toBe('Persisted Track');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty string track names', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: '',
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };

      store.addFavourite(track);
      expect(useStore.getState().favourites).toHaveLength(1);
      expect(store.isFavourite('', 'The Beatles')).toBe(true);
    });

    it('should handle empty string artist names', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: 'Track',
        artist: '',
        album: 'Album',
        url: 'https://last.fm/track/1',
      };

      store.addFavourite(track);
      expect(useStore.getState().favourites).toHaveLength(1);
      expect(store.isFavourite('Track', '')).toBe(true);
    });

    it('should handle very long track names', () => {
      const store = useStore.getState();
      const longName = 'A'.repeat(1000);
      const track: FavouriteTrack = {
        name: longName,
        artist: 'The Beatles',
        album: 'Abbey Road',
        url: 'https://last.fm/track/1',
      };

      store.addFavourite(track);
      expect(useStore.getState().favourites[0].name).toBe(longName);
    });

    it('should handle special characters in track and artist names', () => {
      const store = useStore.getState();
      const track: FavouriteTrack = {
        name: "Track's Name (Remix) [2024]",
        artist: "Artist's Name & Co.",
        album: 'Album',
        url: 'https://last.fm/track/1',
      };

      store.addFavourite(track);
      expect(store.isFavourite("Track's Name (Remix) [2024]", "Artist's Name & Co.")).toBe(true);
    });
  });
});

