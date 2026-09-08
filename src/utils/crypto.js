// In-browser Web Crypto API helpers
export async function computeSHA256(content) {
  const encoder = new TextEncoder();
  const data = encoder.encode(typeof content === 'string' ? content : JSON.stringify(content));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function formatHash(hash, length = 8) {
  if (!hash) return '';
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

// Generate simple deterministic SVG QR-like pattern for document fingerprint
export function generateQRMatrix(seedStr) {
  const size = 15;
  const matrix = Array(size).fill(0).map(() => Array(size).fill(0));
  
  // Finder patterns at 3 corners
  const drawFinder = (startX, startY) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (r === 0 || r === 4 || c === 0 || c === 4 || (r >= 1 && r <= 3 && c >= 1 && c <= 3)) {
          matrix[startY + r][startX + c] = 1;
        }
      }
    }
  };
  
  drawFinder(0, 0);
  drawFinder(size - 5, 0);
  drawFinder(0, size - 5);
  
  // Fill remaining cells with pseudo-random bits from seed
  let hashVal = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hashVal = ((hashVal << 5) - hashVal) + seedStr.charCodeAt(i);
    hashVal |= 0;
  }
  
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 6 && c < 6) || (r < 6 && c >= size - 6) || (r >= size - 6 && c < 6)) {
        continue;
      }
      const bit = ((hashVal >> ((r * size + c) % 31)) & 1);
      matrix[r][c] = (bit ^ (r % 2 === 0 ? 1 : 0));
    }
  }
  return matrix;
}
