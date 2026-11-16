// Core Business Rules & Weighted Gacha Engine Specification
// Enforces:
// 1. Minimum 25 categories (no maximum limit, 1..N integer mapping).
// 2. Strictly 5x5 grid (25 playable cells, ZERO Free Space).
// 3. Weighted Randomizer across the 10 exact Gacha animation effects.

export const MIN_CATEGORIES_REQUIRED = 25;

export const DEFAULT_CATEGORIES = [
  { number: 1, name: "Quantum Mechanics" },
  { number: 2, name: "Astrophysics & Nebulae" },
  { number: 3, name: "Deep Sea Hydrothermal Vents" },
  { number: 4, name: "Synthetic Biology" },
  { number: 5, name: "Neural Architecture" },
  { number: 6, name: "Cryptography & Zero-Knowledge" },
  { number: 7, name: "Plate Tectonics & Volcanology" },
  { number: 8, name: "Evolutionary Game Theory" },
  { number: 9, name: "Particle Accelerators" },
  { number: 10, name: "paleoclimatology" },
  { number: 11, name: "Molecular Gastronomy" },
  { number: 12, name: "Cybernetic Control Systems" },
  { number: 13, name: "Mycology & Fungal Networks" },
  { number: 14, name: "Orbital Mechanics" },
  { number: 15, name: "Epigenetics & Gene Regulation" },
  { number: 16, name: "Superconductivity" },
  { number: 17, name: "Computational Linguistics" },
  { number: 18, name: "Bioluminescent Ecosystems" },
  { number: 19, name: "Chaos Theory & Fractals" },
  { number: 20, name: "Exoplanet Atmospheres" },
  { number: 21, name: "Nanophotonics" },
  { number: 22, name: "Behavioral Economics" },
  { number: 23, name: "Fluid Dynamics & Turbulence" },
  { number: 24, name: "Archaeogenetics" },
  { number: 25, name: "Thermodynamics & Entropy" },
  { number: 26, name: "Bioacoustics & Cetaceans" },
  { number: 27, name: "Graph Theory & Topology" },
  { number: 28, name: "Stellar Nucleosynthesis" },
  { number: 29, name: "Immunotherapy & T-Cells" },
  { number: 30, name: "Metamaterials & Cloaking" },
  { number: 31, name: "Glaciology & Ice Cores" },
  { number: 32, name: "Neuromorphic Engineering" },
  { number: 33, name: "Ethnobotany & Alkaloids" },
  { number: 34, name: "Magnetohydrodynamics" },
  { number: 35, name: "Swarm Intelligence" },
  { number: 36, name: "Astrochemistry" },
  { number: 37, name: "Cellular Senescence" },
  { number: 38, name: "Quantum Teleportation" },
  { number: 39, name: "Seismology & Earth Mantle" },
  { number: 40, name: "Algorithmic Information Theory" },
  { number: 41, name: "Extremophile Microbiology" },
  { number: 42, name: "Marine Biology" },
  { number: 43, name: "Plasma Fusion Confinement" },
  { number: 44, name: "Cognitive Neuroscience" },
  { number: 45, name: "Crystallography" },
  { number: 46, name: "Aeroelasticity & Supersonics" },
  { number: 47, name: "Proteomics & Protein Folding" },
  { number: 48, name: "Dark Matter Halos" },
  { number: 49, name: "Stochastic Calculus" },
  { number: 50, name: "Planetary Terraform Modeling" },
];

/**
 * Weighted Gacha Animation Engine Specification (10 Exact Effects)
 * Weights sum to 100 for clear probability telemetry in the Host Dashboard.
 */
export const GACHA_EFFECTS = [
  {
    id: 'WEIGHTED_RANDOM',
    name: 'Weighted Randomizer (Auto)',
    badge: 'RNG ENGINE',
    weight: 0,
    description: 'Uses the weighted probability table across all 10 Gacha effects.',
    color: 'from-cyan-400 to-emerald-400',
  },
  {
    id: 'NORMAL',
    name: '1. Normal',
    badge: '22% WEIGHT',
    weight: 22,
    description: 'Smooth ease-out deceleration into the target slot.',
    color: 'from-sky-400 to-blue-500',
  },
  {
    id: 'SPEEDSTER',
    name: '2. Speedster',
    badge: '12% WEIGHT',
    weight: 12,
    description: 'Fast high-velocity spin with a sudden stop.',
    color: 'from-red-500 to-orange-500',
  },
  {
    id: 'BOUNCE',
    name: '3. Bounce',
    badge: '12% WEIGHT',
    weight: 12,
    description: 'Overshoot the target by 2 slots and bounce back.',
    color: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'SLIDE',
    name: '4. Slide',
    badge: '10% WEIGHT',
    weight: 10,
    description: 'Stop early (3 slots before target), then slide smoothly into the target.',
    color: 'from-teal-400 to-cyan-500',
  },
  {
    id: 'TEASE',
    name: '5. Tease',
    badge: '10% WEIGHT',
    weight: 10,
    description: 'Stop on the edge between slots, slowly snap to center.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'SNAIL',
    name: '6. Snail',
    badge: '8% WEIGHT',
    weight: 8,
    description: 'Extremely slow, suspenseful ease-out.',
    color: 'from-purple-400 to-indigo-500',
  },
  {
    id: 'GLITCH',
    name: '7. Glitch',
    badge: '8% WEIGHT',
    weight: 8,
    description: 'Visual stutter/warp across 3 slots before snapping to target.',
    color: 'from-fuchsia-500 to-cyan-400',
  },
  {
    id: 'FAKE_OUT',
    name: '8. Fake Out',
    badge: '7% WEIGHT',
    weight: 7,
    description: 'Stop completely at the wrong number, wait 1 sec, then drop to the correct one.',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'ARROW_TROLL',
    name: '9. Arrow Troll',
    badge: '6% WEIGHT',
    weight: 6,
    description: 'Wheel stops incorrectly. The target arrow moves to an adjacent slot and drags the correct item down to the center.',
    color: 'from-lime-400 to-emerald-500',
  },
  {
    id: 'ARROW_CHASE',
    name: '10. Arrow Chase',
    badge: '5% WEIGHT',
    weight: 5,
    description: 'Wheel stops correctly. The target arrow moves away, and the wheel spins again to catch it.',
    color: 'from-rose-500 to-amber-400',
  },
];

/**
 * Selects one of the 10 Gacha effects using the weighted distribution table.
 */
export function rollWeightedGachaEffect() {
  const pool = GACHA_EFFECTS.filter((e) => e.id !== 'WEIGHTED_RANDOM');
  const totalWeight = pool.reduce((acc, item) => acc + item.weight, 0);
  let randomNum = Math.random() * totalWeight;

  for (const effect of pool) {
    if (randomNum < effect.weight) {
      return effect.id;
    }
    randomNum -= effect.weight;
  }
  return 'NORMAL';
}

/**
 * Formats a category item strictly according to the Wheel UI Data Rendering Rule:
 * "The 3D Spinning Wheel MUST display both the Category Name and the Number combined as a single string (e.g., 'Marine Biology (42)')"
 */
export function formatWheelLabel(category) {
  if (!category) return '';
  return `${category.name} (${category.number})`;
}

/**
 * Parses and validates raw text or CSV input into a dynamic list of categories (1 to N).
 * Enforces the Business Rule: Minimum of 25 categories required, no maximum limit.
 */
export function parseAndValidateCategories(rawText) {
  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // Strip optional CSV header if first line looks like "number,category" or "id,name"
  if (lines.length > 0 && /^(id|num|number|no)\s*[,;|]\s*(category|name|title)/i.test(lines[0])) {
    lines.shift();
  }

  const parsed = lines
    .map((rawLine) => {
      // Strip optional leading index like "42, Marine Biology" or "42 - Marine Biology" or "42. Marine Biology"
      // Also strip trailing "(42)" if user pasted formatted strings
      const withoutPrefix = rawLine.replace(/^\d+\s*[,.\-:|]\s*/, '').trim();
      return withoutPrefix;
    })
    .filter(Boolean)
    .map((name, idx) => ({
      number: idx + 1, // Automatically assigns unique integer 1 to N
      name,
    }));

  if (parsed.length < MIN_CATEGORIES_REQUIRED) {
    return {
      valid: false,
      error: `Validation Failed: Host must upload a minimum of ${MIN_CATEGORIES_REQUIRED} categories (received ${parsed.length}). There is no maximum limit.`,
      categories: parsed,
    };
  }

  return {
    valid: true,
    error: null,
    categories: parsed,
  };
}

/**
 * Generates a strictly 5x5 Bingo Board (exactly 25 playable cells) sampled from the 1..N category pool.
 * Strictly NO "Free Space" in the center (index 12 is a normal playable number cell).
 */
export function generateBingoBoard(categories) {
  const pool = [...categories];
  // Fisher-Yates unbiased shuffle across all N categories
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Strictly 25 playable cells, no Free Space
  return pool.slice(0, 25).map((item, idx) => ({
    index: idx,
    number: item.number,
    name: item.name,
  }));
}

/**
 * 12 Winning Lines for the 5x5 Bingo Grid (5 Horizontal, 5 Vertical, 2 Diagonal).
 */
export const WINNING_LINES = [
  // 5 Horizontal Rows
  { id: 'ROW-1', type: 'HORIZONTAL', indices: [0, 1, 2, 3, 4] },
  { id: 'ROW-2', type: 'HORIZONTAL', indices: [5, 6, 7, 8, 9] },
  { id: 'ROW-3', type: 'HORIZONTAL', indices: [10, 11, 12, 13, 14] },
  { id: 'ROW-4', type: 'HORIZONTAL', indices: [15, 16, 17, 18, 19] },
  { id: 'ROW-5', type: 'HORIZONTAL', indices: [20, 21, 22, 23, 24] },
  // 5 Vertical Columns
  { id: 'COL-1', type: 'VERTICAL', indices: [0, 5, 10, 15, 20] },
  { id: 'COL-2', type: 'VERTICAL', indices: [1, 6, 11, 16, 21] },
  { id: 'COL-3', type: 'VERTICAL', indices: [2, 7, 12, 17, 22] },
  { id: 'COL-4', type: 'VERTICAL', indices: [3, 8, 13, 18, 23] },
  { id: 'COL-5', type: 'VERTICAL', indices: [4, 9, 14, 19, 24] },
  // 2 Diagonals
  { id: 'DIAG-MAIN', type: 'DIAGONAL', indices: [0, 6, 12, 18, 24] },
  { id: 'DIAG-ANTI', type: 'DIAGONAL', indices: [4, 8, 12, 16, 20] },
];

export function evaluateBingoWin(board, drawnNumbers) {
  if (!board || board.length !== 25) {
    return { isBingo: false, winningLines: [], winningTileIndices: [] };
  }
  const drawnSet = new Set(drawnNumbers);
  const winningLines = [];
  const winningTileIndicesSet = new Set();

  for (const line of WINNING_LINES) {
    const isLineComplete = line.indices.every((tileIdx) => {
      const cell = board[tileIdx];
      return cell && drawnSet.has(cell.number);
    });
    if (isLineComplete) {
      winningLines.push(line);
      line.indices.forEach((idx) => winningTileIndicesSet.add(idx));
    }
  }

  return {
    isBingo: winningLines.length > 0,
    winningLines,
    winningTileIndices: Array.from(winningTileIndicesSet),
  };
}
