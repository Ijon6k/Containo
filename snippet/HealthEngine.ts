/**
 * MODULE: Health Scoring Engine
 * IMPLEMENTATION: Weighted Scoring System (WSS)
 * 
 * Digunakan untuk menghitung indeks kesehatan sistem berdasarkan 
 * stabilitas kontainer, kebersihan storage, dan kepadatan sumber daya.
 */

export const calculateHealthScore = (
  stability: number, // % kontainer yang tidak crash
  hygiene: number,   // % storage yang bersih (bebas dangling images)
  density: number    // % ketersediaan resource relatif terhadap kapasitas
) => {
  // Bobot penilaian (Weights)
  const W_STABILITY = 0.40;
  const W_HYGIENE = 0.30;
  const W_RESOURCES = 0.30;

  // Rumus WSS
  const totalScore = (stability * W_STABILITY) + 
                     (hygiene * W_HYGIENE) + 
                     (density * W_RESOURCES);
  
  return Math.round(totalScore);
};

export const getStabilityIndex = (containers: any[]) => {
  if (containers.length === 0) return 100;
  
  // Membedakan antara Manual Stop (ExitCode 0) dan Crash (ExitCode != 0)
  const crashes = containers.filter(c => 
    c.State.Status === 'exited' && c.State.ExitCode !== 0
  ).length;

  return ((containers.length - crashes) / containers.length) * 100;
};
