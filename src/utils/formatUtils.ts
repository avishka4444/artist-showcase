// Formats duration in seconds to MM:SS format

export const formatDuration = (durationSeconds?: number): string => {
  if (!durationSeconds || durationSeconds === 0) return "-";
  const minutes = Math.floor(durationSeconds / 60);
  const remainingSeconds = durationSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

