/**
 * Polyhedral Optimization Engine
 * Handles the math for iteration domains and transformations.
 */

export const TRANSFORMATIONS = {
  IDENTITY: [[1, 0], [0, 1]],
  SKEW: [[1, 1], [0, 1]],
  INTERCHANGE: [[0, 1], [1, 0]],
  REVERSE: [[-1, 0], [0, 1]], // Simple reversal of outer loop
};

/**
 * Maps a point (i, j) through a transformation matrix T.
 * @param {number[]} point [i, j]
 * @param {number[][]} matrix 2x2 matrix
 * @returns {number[]} transformed point
 */
export const transformPoint = (point, matrix) => {
  const [i, j] = point;
  const newI = matrix[0][0] * i + matrix[0][1] * j;
  const newJ = matrix[1][0] * i + matrix[1][1] * j;
  return [newI, newJ];
};

/**
 * Generates the iteration domain points for a 2D nested loop.
 */
export const generateIterationDomain = (iMin, iMax, jMin, jMax) => {
  const points = [];
  for (let i = iMin; i <= iMax; i++) {
    for (let j = jMin; j <= jMax; j++) {
      points.push({
        id: `${i}-${j}`,
        original: [i, j, 0],
        current: [i, j, 0],
      });
    }
  }
  return points;
};

/**
 * Applies a transformation and tiling to the domain.
 */
export const applyOptimization = (points, matrix, tileSize = 0) => {
  return points.map(p => {
    const [ti, tj] = transformPoint(p.original, matrix);
    
    // If tiling is active, we can visualize it by slightly shifting or coloring
    // For now, let's just return the transformed coordinates
    return {
      ...p,
      current: [ti, tj, 0]
    };
  });
};

export const getMatrixLatex = (matrix) => {
  return `\\begin{bmatrix} ${matrix[0][0]} & ${matrix[0][1]} \\\\ ${matrix[1][0]} & ${matrix[1][1]} \\end{bmatrix}`;
};

export const getInequalityLatex = (iMax, jMax) => {
  return `\\mathcal{D} = \\{ (i, j) \\in \\mathbb{Z}^2 \\mid 0 \\le i < ${iMax}, 0 \\le j < ${jMax} \\}`;
};

/**
 * Generates optimized C code based on the transformation matrix.
 */
export const generateOptimizedCode = (iMax, jMax, matrix) => {
  const isMatrix = (m) => JSON.stringify(matrix) === JSON.stringify(m);

  if (isMatrix(TRANSFORMATIONS.IDENTITY)) {
    return `for (int i = 0; i < ${iMax}; i++) {\n  for (int j = 0; j < ${jMax}; j++) {\n    S(i, j);\n  }\n}`;
  }

  if (isMatrix(TRANSFORMATIONS.SKEW)) {
    // i' = i, j' = i + j
    return `for (int ip = 0; ip < ${iMax}; ip++) {\n  for (int jp = ip; jp < ip + ${jMax}; jp++) {\n    S(ip, jp - ip);\n  }\n}`;
  }

  if (isMatrix(TRANSFORMATIONS.INTERCHANGE)) {
    return `for (int j = 0; j < ${jMax}; j++) {\n  for (int i = 0; i < ${iMax}; i++) {\n    S(i, j);\n  }\n}`;
  }

  if (isMatrix(TRANSFORMATIONS.REVERSE)) {
    return `for (int i = ${iMax - 1}; i >= 0; i--) {\n  for (int j = 0; j < ${jMax}; j++) {\n    S(i, j);\n  }\n}`;
  }

  return "// Transformation code generation not implemented.";
};
