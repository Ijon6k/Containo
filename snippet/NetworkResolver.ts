/**
 * MODULE: Dynamic Network Resolver
 * FUNCTION: Deteksi otomatis port Web UI secara cerdas (Heuristic)
 */

export const resolveWebPort = (portsString: string, networkMode?: string) => {
  // Daftar port prioritas standar aplikasi Web
  const PRIORITY_PORTS = [80, 443, 9000, 9443, 3000, 8080];

  // Kasus 1: Port sudah ter-mapping secara eksplisit
  if (portsString && portsString !== 'N/A') {
    const portPairs = portsString.split(',').map(p => p.trim());
    
    for (const p of PRIORITY_PORTS) {
      const found = portPairs.find(pair => pair.endsWith(`:${p}`));
      if (found) return found.split(':')[0]; // Mengembalikan host port
    }
    
    // Fallback: ambil mapping pertama
    return portPairs[0].split(':')[0];
  }

  // Kasus 2: Mode Host (tidak ada mapping di Docker API)
  if (networkMode === 'host') {
    // Di sini sistem bisa memberikan rekomendasi berdasarkan common ports
    return null; // Memerlukan input manual sebagai pengaman
  }

  return null;
};
