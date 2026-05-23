/**
 * Judul PI:
 * Agregasi Status Multi-Kontainer pada Antarmuka Dashboard
 *
 * BAB 3:
 * 3.4.1 Perancangan Sistem Pemantauan (Dashboard Overview)
 *
 * Deskripsi:
 * Mengkalkulasi skor kesehatan (Health Score) sistem dari seluruh
 * array kontainer dan images. Fungsi ini mendeteksi jumlah kontainer 
 * yang crash (exit code != 0) dan penumpukan images kosong (dangling).
 */

export const getSystemHealth = async (containers: any[], images: any[]) => {
  let crashCount = 0;
  
  // Mencari anomali kontainer yang gagal berjalan
  containers.forEach(c => {
    const isExited = c.State === 'exited';
    const exitCode = parseInt(c.Status?.match(/Exited \((\d+)\)/)?.[1] || '0');
    if (isExited && exitCode !== 0) crashCount++;
  });

  const breakdown = {
    stability: Math.max(0, 40 - (crashCount * 10)),
    hygiene: Math.max(0, 30 - (images.filter(img => !img.RepoTags || img.RepoTags.includes('<none>:<none>')).length * 3)),
    resources: Math.max(0, 30 - (containers.length > 20 ? 10 : 0))
  };
  
  const healthScore = breakdown.stability + breakdown.hygiene + breakdown.resources;
  return { healthScore, breakdown, crashCount };
};
