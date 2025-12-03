import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchArtistTopAlbums,
  fetchAlbumDetails,
  searchTracks,
  searchAlbums,
  fetchTrackInfo,
} from './lastfm';
import { ApiError } from '../utils/errorHandler';

// Mock fetch globally
globalThis.fetch = vi.fn();

// Mock environment variable
vi.stubEnv('VITE_LASTFM_API_KEY', 'test-api-key');

describe('lastfm service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchArtistTopAlbums', () => {
    it('should fetch and transform artist top albums successfully', async () => {
      const mockResponse = {
        topalbums: {
          album: [
            {
              name: 'Abbey Road',
              artist: { name: 'The Beatles' },
              playcount: '1234567',
              url: 'https://last.fm/album/123',
              image: [
                { '#text': 'https://image.url', size: 'large' },
              ],
            },
            {
              name: 'Sgt. Pepper',
              artist: { name: 'The Beatles' },
              playcount: 987654,
              url: 'https://last.fm/album/456',
              image: [],
            },
          ],
        },
      };

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchArtistTopAlbums('The Beatles');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Abbey Road',
        artist: 'The Beatles',
        playcount: 1234567,
        url: 'https://last.fm/album/123',
        image: [{ '#text': 'https://image.url', size: 'large' }],
      });
      expect(result[1]).toEqual({
        name: 'Sgt. Pepper',
        artist: 'The Beatles',
        playcount: 987654,
        url: 'https://last.fm/album/456',
        image: [],
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('method=artist.gettopalbums'),
        expect.any(Object)
      );
    });

    it('should handle empty artist name', async () => {
      await expect(fetchArtistTopAlbums('')).rejects.toThrow(ApiError);
      await expect(fetchArtistTopAlbums('   ')).rejects.toThrow(ApiError);
    });

    it('should handle missing topalbums data', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await fetchArtistTopAlbums('The Beatles');
      expect(result).toEqual([]);
    });

    it('should handle missing album array', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ topalbums: {} }),
      });

      const result = await fetchArtistTopAlbums('The Beatles');
      expect(result).toEqual([]);
    });

    it('should normalize playcount from string to number', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          topalbums: {
            album: [
              {
                name: 'Test Album',
                artist: { name: 'Test Artist' },
                playcount: '500000',
                url: 'https://test.com',
                image: [],
              },
            ],
          },
        }),
      });

      const result = await fetchArtistTopAlbums('Test Artist');
      expect(result[0].playcount).toBe(500000);
    });

    it('should handle invalid playcount gracefully', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          topalbums: {
            album: [
              {
                name: 'Test Album',
                artist: { name: 'Test Artist' },
                playcount: 'invalid',
                url: 'https://test.com',
                image: [],
              },
            ],
          },
        }),
      });

      const result = await fetchArtistTopAlbums('Test Artist');
      expect(result[0].playcount).toBeUndefined();
    });

    it('should trim artist name', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ topalbums: { album: [] } }),
      });

      await fetchArtistTopAlbums('  The Beatles  ');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('artist=The+Beatles'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 6, message: 'Invalid API key' }),
      });

      await expect(fetchArtistTopAlbums('The Beatles')).rejects.toThrow(
        ApiError
      );
    });

    it('should handle HTTP errors', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(fetchArtistTopAlbums('The Beatles')).rejects.toThrow(
        ApiError
      );
    });
  });

  describe('fetchAlbumDetails', () => {
    it('should fetch and transform album details successfully', async () => {
      const mockResponse = {
        album: {
          name: 'Abbey Road',
          artist: 'The Beatles',
          url: 'https://last.fm/album/123',
          image: [{ '#text': 'https://image.url', size: 'large' }],
          listeners: '5000000',
          playcount: '10000000',
          tracks: {
            track: [
              {
                name: 'Come Together',
                duration: '259',
                url: 'https://last.fm/track/1',
                playcount: '500000',
              },
              {
                name: 'Something',
                duration: '182',
                url: 'https://last.fm/track/2',
                playcount: 400000,
              },
            ],
          },
          wiki: {
            summary: 'Great album',
            published: '1969-09-26',
          },
        },
      };

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchAlbumDetails('The Beatles', 'Abbey Road');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Abbey Road');
      expect(result?.artist).toBe('The Beatles');
      expect(result?.year).toBe('1969');
      expect(result?.tracks).toHaveLength(2);
      expect(result?.tracks[0]).toEqual({
        name: 'Come Together',
        durationSeconds: 259,
        url: 'https://last.fm/track/1',
        playcount: 500000,
      });
      expect(result?.tracks[1]).toEqual({
        name: 'Something',
        durationSeconds: 182,
        url: 'https://last.fm/track/2',
        playcount: 400000,
      });
    });

    it('should handle single track object (not array)', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          album: {
            name: 'Test Album',
            artist: 'Test Artist',
            url: 'https://test.com',
            image: [],
            tracks: {
              track: {
                name: 'Single Track',
                duration: '200',
                url: 'https://test.com/track',
                playcount: '100',
              },
            },
          },
        }),
      });

      const result = await fetchAlbumDetails('Test Artist', 'Test Album');
      expect(result?.tracks).toHaveLength(1);
      expect(result?.tracks[0].name).toBe('Single Track');
    });

    it('should handle missing tracks', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          album: {
            name: 'Test Album',
            artist: 'Test Artist',
            url: 'https://test.com',
            image: [],
          },
        }),
      });

      const result = await fetchAlbumDetails('Test Artist', 'Test Album');
      expect(result?.tracks).toEqual([]);
    });

    it('should handle empty artist name', async () => {
      await expect(fetchAlbumDetails('', 'Album')).rejects.toThrow(ApiError);
      await expect(fetchAlbumDetails('   ', 'Album')).rejects.toThrow(ApiError);
    });

    it('should handle empty album name', async () => {
      await expect(fetchAlbumDetails('Artist', '')).rejects.toThrow(ApiError);
      await expect(fetchAlbumDetails('Artist', '   ')).rejects.toThrow(ApiError);
    });

    it('should return null when album is not found', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await fetchAlbumDetails('The Beatles', 'Non Existent');
      expect(result).toBeNull();
    });

    it('should normalize duration from string to number', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          album: {
            name: 'Test Album',
            artist: 'Test Artist',
            url: 'https://test.com',
            image: [],
            tracks: {
              track: [
                {
                  name: 'Test Track',
                  duration: '300',
                  url: 'https://test.com/track',
                },
              ],
            },
          },
        }),
      });

      const result = await fetchAlbumDetails('Test Artist', 'Test Album');
      expect(result?.tracks[0].durationSeconds).toBe(300);
    });

    it('should handle invalid duration gracefully', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          album: {
            name: 'Test Album',
            artist: 'Test Artist',
            url: 'https://test.com',
            image: [],
            tracks: {
              track: [
                {
                  name: 'Test Track',
                  duration: 'invalid',
                  url: 'https://test.com/track',
                },
              ],
            },
          },
        }),
      });

      const result = await fetchAlbumDetails('Test Artist', 'Test Album');
      expect(result?.tracks[0].durationSeconds).toBeUndefined();
    });

    it('should extract year from published date', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          album: {
            name: 'Test Album',
            artist: 'Test Artist',
            url: 'https://test.com',
            image: [],
            wiki: {
              published: '2020-01-15',
            },
          },
        }),
      });

      const result = await fetchAlbumDetails('Test Artist', 'Test Album');
      expect(result?.year).toBe('2020');
    });
  });

  describe('searchTracks', () => {
    it('should search and transform tracks successfully', async () => {
      const mockResponse = {
        results: {
          trackmatches: {
            track: [
              {
                name: 'Come Together',
                artist: 'The Beatles',
                url: 'https://last.fm/track/1',
              },
              {
                name: 'Something',
                artist: 'The Beatles',
                url: 'https://last.fm/track/2',
              },
            ],
          },
        },
      };

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchTracks('come together');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Come Together',
        artist: 'The Beatles',
        url: 'https://last.fm/track/1',
        durationSeconds: undefined,
      });
    });

    it('should return empty array for empty query', async () => {
      const result = await searchTracks('');
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace-only query', async () => {
      const result = await searchTracks('   ');
      expect(result).toEqual([]);
    });

    it('should handle missing trackmatches', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: {} }),
      });

      const result = await searchTracks('test');
      expect(result).toEqual([]);
    });

    it('should handle missing track array', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: { trackmatches: {} } }),
      });

      const result = await searchTracks('test');
      expect(result).toEqual([]);
    });
  });

  describe('searchAlbums', () => {
    it('should search and transform albums successfully', async () => {
      const mockResponse = {
        results: {
          albummatches: {
            album: [
              {
                name: 'Abbey Road',
                artist: 'The Beatles',
                url: 'https://last.fm/album/1',
                image: [{ '#text': 'https://image.url', size: 'large' }],
              },
            ],
          },
        },
      };

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchAlbums('abbey road');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Abbey Road',
        artist: 'The Beatles',
        url: 'https://last.fm/album/1',
        image: [{ '#text': 'https://image.url', size: 'large' }],
      });
    });

    it('should return empty array for empty query', async () => {
      const result = await searchAlbums('');
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace-only query', async () => {
      const result = await searchAlbums('   ');
      expect(result).toEqual([]);
    });

    it('should handle missing albummatches', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: {} }),
      });

      const result = await searchAlbums('test');
      expect(result).toEqual([]);
    });
  });

  describe('fetchTrackInfo', () => {
    it('should fetch track playcount successfully', async () => {
      const mockResponse = {
        track: {
          name: 'Come Together',
          playcount: '500000',
        },
      };

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchTrackInfo('The Beatles', 'Come Together');

      expect(result).toBe(500000);
    });

    it('should normalize playcount from string to number', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          track: {
            name: 'Test Track',
            playcount: '123456',
          },
        }),
      });

      const result = await fetchTrackInfo('Artist', 'Test Track');
      expect(result).toBe(123456);
    });

    it('should return null when track is not found', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await fetchTrackInfo('Artist', 'Non Existent');
      expect(result).toBeNull();
    });

    it('should return null when playcount is missing', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          track: {
            name: 'Test Track',
          },
        }),
      });

      const result = await fetchTrackInfo('Artist', 'Test Track');
      expect(result).toBeNull();
    });

    it('should handle API errors gracefully and return null', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 6, message: 'Invalid API key' }),
      });

      const result = await fetchTrackInfo('Artist', 'Track');
      expect(result).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchTrackInfo('Artist', 'Track');
      expect(result).toBeNull();
    });

    it('should handle invalid playcount gracefully', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          track: {
            name: 'Test Track',
            playcount: 'invalid',
          },
        }),
      });

      const result = await fetchTrackInfo('Artist', 'Test Track');
      expect(result).toBeNull();
    });
  });

  describe('data normalization', () => {
    it('should handle various playcount formats', async () => {
      const testCases = [
        { input: '123456', expected: 123456 },
        { input: 123456, expected: 123456 },
        { input: '0', expected: 0 },
        { input: 0, expected: 0 },
        { input: undefined, expected: undefined },
        { input: null, expected: undefined },
      ];

      for (const testCase of testCases) {
        (globalThis.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            topalbums: {
              album: [
                {
                  name: 'Test Album',
                  artist: { name: 'Test Artist' },
                  playcount: testCase.input,
                  url: 'https://test.com',
                  image: [],
                },
              ],
            },
          }),
        });

        const result = await fetchArtistTopAlbums('Test Artist');
        if (testCase.expected === undefined) {
          expect(result[0].playcount).toBeUndefined();
        } else {
          expect(result[0].playcount).toBe(testCase.expected);
        }
      }
    });

    it('should handle various duration formats', async () => {
      const testCases = [
        { input: '300', expected: 300 },
        { input: 300, expected: 300 },
        { input: '0', expected: 0 },
        { input: 0, expected: 0 },
        { input: undefined, expected: undefined },
        { input: null, expected: undefined },
      ];

      for (const testCase of testCases) {
        (globalThis.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            album: {
              name: 'Test Album',
              artist: 'Test Artist',
              url: 'https://test.com',
              image: [],
              tracks: {
                track: [
                  {
                    name: 'Test Track',
                    duration: testCase.input,
                    url: 'https://test.com/track',
                  },
                ],
              },
            },
          }),
        });

        const result = await fetchAlbumDetails('Test Artist', 'Test Album');
        if (testCase.expected === undefined) {
          expect(result?.tracks[0].durationSeconds).toBeUndefined();
        } else {
          expect(result?.tracks[0].durationSeconds).toBe(testCase.expected);
        }
      }
    });
  });

  describe('error handling', () => {
    it('should handle fetch timeout', async () => {
      (globalThis.fetch as any).mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Aborted')), 100);
        });
      });

      // Mock AbortController
      const originalAbortController = globalThis.AbortController;
      globalThis.AbortController = vi.fn(() => ({
        abort: vi.fn(),
        signal: {} as AbortSignal,
      })) as any;

      await expect(fetchArtistTopAlbums('The Beatles')).rejects.toThrow();

      globalThis.AbortController = originalAbortController;
    });

    it('should handle missing API key', async () => {
      vi.stubEnv('VITE_LASTFM_API_KEY', '');

      // Need to re-import the module to get the new env value
      // For this test, we'll just verify the error is thrown
      // In a real scenario, you might need to use vi.resetModules()
      await expect(fetchArtistTopAlbums('The Beatles')).rejects.toThrow(
        ApiError
      );

      // Restore API key
      vi.stubEnv('VITE_LASTFM_API_KEY', 'test-api-key');
    });
  });
});

