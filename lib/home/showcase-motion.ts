// Reconstructed from rendered measurements of Bellucci's public gallery at
// stationary scroll positions. This is an independent native-scroll timeline.
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const outQuad = (value: number) => 1 - (1 - clamp(value)) ** 2;
const outCubic = (value: number) => 1 - (1 - clamp(value)) ** 3;

export function getShowcaseMotion(progress: number) {
  const p = clamp(progress);
  // The requested opening zoom happens before pinning, leaving the measured
  // Bellucci timeline (progress 0–1) unchanged.
  const entrance = outCubic((progress + 0.55) / 0.55);
  // The two inner upper images enter together; the lower/outer images overlap.
  const entrances = [
    { start: 0.44, distance: -120 }, // far left
    { start: 0.28, distance: -80 }, // upper left
    { start: 0.52, distance: -120 }, // lower left
    { start: 0.28, distance: 80 }, // upper right
    { start: 0.36, distance: 80 }, // lower right
    { start: 0.44, distance: 120 }, // far right
  ];
  return {
    centerOpacity: entrance,
    centerScale:
      progress < 0 ? 0.9 + 0.6 * entrance : 1.5 - 0.5 * outQuad(p / 0.8),
    portrait: outQuad((p - 0.24) / 0.56),
    sides: entrances.map(({ start, distance }) => {
      const opacity = outCubic((p - start) / 0.48);
      return { opacity, shift: distance * (1 - opacity) };
    }),
  };
}
