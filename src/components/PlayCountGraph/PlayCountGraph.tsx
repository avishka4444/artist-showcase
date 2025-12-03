import { useMemo, memo } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import type { TrackSummary } from "../../types/lastfm";

interface PlayCountGraphProps {
  tracks: TrackSummary[];
  tracksWithPlaycount: Map<number, number>;
}

const PlayCountGraph = memo(({
  tracks,
  tracksWithPlaycount,
}: PlayCountGraphProps) => {
  const barHeight = 30;
  const barSpacing = 10;
  const rightPadding = 100;
  const topPadding = 20;
  const bottomPadding = 20;

  const tracksWithData = useMemo(
    () =>
      tracks
        .map((track, index) => ({
          name: track.name,
          playcount: tracksWithPlaycount.get(index) ?? track.playcount ?? 0,
          index,
        }))
        .filter((t) => t.playcount > 0)
        .sort((a, b) => b.playcount - a.playcount)
        .slice(0, 10),
    [tracks, tracksWithPlaycount]
  );

  const { chartWidth, chartHeight, maxPlaycount, leftPadding } = useMemo(() => {
    if (tracksWithData.length === 0) {
      return {
        chartWidth: 600,
        chartHeight: 200,
        maxPlaycount: 0,
        leftPadding: 200,
      };
    }

    const max = Math.max(...tracksWithData.map((t) => t.playcount));
    const height = tracksWithData.length * (barHeight + barSpacing) + topPadding + bottomPadding;
    const maxNameLength = Math.max(...tracksWithData.map((t) => t.name.length));
    const estimatedWidth = maxNameLength * 9 + 30;
    const leftPad = Math.max(estimatedWidth, 300);
    const width = Math.max(1200, leftPad + 600);

    return {
      chartWidth: width,
      chartHeight: height,
      maxPlaycount: max,
      leftPadding: leftPad,
    };
  }, [tracksWithData]);

  if (tracksWithData.length === 0) {
    return (
      <Box mt={8}>
        <Heading as="h2" size="lg" mb={4} color="gray.800">
          Most Played Tracks
        </Heading>
        <Box textAlign="center" py={8}>
          <Text color="gray.500">No play count data available</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box mt={8}>
      <Heading as="h2" size="lg" mb={4} color="gray.800">
        Most Played Tracks
      </Heading>
      <Box bg="white" p={4} borderRadius="md" border="1px solid" borderColor="gray.200" width="100%">
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMinYMid meet"
          style={{ overflow: 'visible' }}
        >
          {/* X-axis */}
          <line
            x1={leftPadding}
            y1={chartHeight - bottomPadding}
            x2={chartWidth - rightPadding}
            y2={chartHeight - bottomPadding}
            stroke="#9CA3AF"
            strokeWidth="2"
          />

          {/* Y-axis */}
          <line
            x1={leftPadding}
            y1={topPadding}
            x2={leftPadding}
            y2={chartHeight - bottomPadding}
            stroke="#9CA3AF"
            strokeWidth="2"
          />

          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const x = leftPadding + (chartWidth - leftPadding - rightPadding) * ratio;
            return (
              <line
                key={ratio}
                x1={x}
                y1={topPadding}
                x2={x}
                y2={chartHeight - bottomPadding}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Horizontal bars */}
          {tracksWithData.map((track, idx) => {
            const y = topPadding + idx * (barHeight + barSpacing);
            const barWidth = maxPlaycount > 0 
              ? ((track.playcount / maxPlaycount) * (chartWidth - leftPadding - rightPadding))
              : 0;

            return (
              <g key={`${track.name}-${idx}`}>
                {/* Bar */}
                <rect
                  x={leftPadding}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#6B9BD1"
                  rx="4"
                />
                {/* Track name label */}
                <text
                  x={leftPadding - 15}
                  y={y + barHeight / 2}
                  textAnchor="end"
                  fontSize="12"
                  fill="gray.700"
                  dominantBaseline="middle"
                  style={{ 
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {track.name}
                </text>
                {/* Play count label */}
                <text
                  x={leftPadding + barWidth + 10}
                  y={y + barHeight / 2}
                  textAnchor="start"
                  fontSize="11"
                  fill="gray.600"
                  dominantBaseline="middle"
                  fontWeight="medium"
                >
                  {track.playcount.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const x = leftPadding + (chartWidth - leftPadding - rightPadding) * ratio;
            const value = Math.round(maxPlaycount * ratio);
            return (
              <text
                key={ratio}
                x={x}
                y={chartHeight - bottomPadding + 20}
                textAnchor="middle"
                fontSize="10"
                fill="gray.500"
              >
                {value.toLocaleString()}
              </text>
            );
          })}
        </svg>
      </Box>
    </Box>
  );
});

PlayCountGraph.displayName = "PlayCountGraph";

export default PlayCountGraph;

