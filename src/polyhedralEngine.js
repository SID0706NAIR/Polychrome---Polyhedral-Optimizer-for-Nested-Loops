/**
 * Polyhedral Optimization Engine
 * Handles the math for iteration domains and transformations.
 */

export const TRANSFORMATIONS = {
  IDENTITY: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  SKEW: [[1, 1, 0], [0, 1, 0], [0, 0, 1]],
  INTERCHANGE_IJ: [[0, 1, 0], [1, 0, 0], [0, 0, 1]],
  MATMUL_IKJ: [[1, 0, 0], [0, 0, 1], [0, 1, 0]], // Swaps j and k
};

/**
 * Maps a point (i, j, k) through a 3x3 transformation matrix T.
 */
export const transformPoint = (point, matrix) => {
  const [i, j, k] = point;
  const newI = matrix[0][0] * i + matrix[0][1] * j + (matrix[0][2] || 0) * k;
  const newJ = matrix[1][0] * i + matrix[1][1] * j + (matrix[1][2] || 0) * k;
  const newK = (matrix[2]?.[0] || 0) * i + (matrix[2]?.[1] || 0) * j + (matrix[2]?.[2] || 1) * k;
  return [newI, newJ, newK];
};

/**
 * Generates the iteration domain points for a 2D or 3D nested loop.
 */
export const generateIterationDomain = (iMin, iMax, jMin, jMax, kMin = 0, kMax = 0, type = 'rectangular') => {
  const points = [];
  
  if (type === 'diamond') {
    const N = iMax || 4;
    for (let i = -N; i <= N; i++) {
      for (let j = -(N - Math.abs(i)); j <= (N - Math.abs(i)); j++) {
        for (let k = -(N - Math.abs(i) - Math.abs(j)); k <= (N - Math.abs(i) - Math.abs(j)); k++) {
          points.push({
            id: `${i}-${j}-${k}`,
            original: [i, j, k],
            current: [i, j, k],
          });
        }
      }
    }
    return points;
  }

  // Rectangular domain
  for (let i = iMin; i <= iMax; i++) {
    for (let j = jMin; j <= jMax; j++) {
      if (kMax > kMin || kMax > 0) {
        for (let k = kMin; k <= kMax; k++) {
          points.push({
            id: `${i}-${j}-${k}`,
            original: [i, j, k],
            current: [i, j, k],
          });
        }
      } else {
        points.push({
          id: `${i}-${j}-0`,
          original: [i, j, 0],
          current: [i, j, 0],
        });
      }
    }
  }
  return points;
};

/**
 * Applies a transformation and tiling to the domain.
 */
export const applyOptimization = (points, matrix) => {
  return points.map(p => {
    return {
      ...p,
      current: transformPoint(p.original, matrix)
    };
  });
};

export const getMatrixLatex = (matrix) => {
  return `T = \\begin{bmatrix} ${matrix[0][0]} & ${matrix[0][1]} & ${matrix[0][2] || 0} \\\\ ${matrix[1][0]} & ${matrix[1][1]} & ${matrix[1][2] || 0} \\\\ ${matrix[2]?.[0] || 0} & ${matrix[2]?.[1] || 0} & ${matrix[2]?.[2] || 1} \\end{bmatrix}`;
};

export const getInequalityLatex = (iMax, jMax, kMax, domainType = 'rectangular') => {
  if (domainType === 'diamond') {
    return `\\mathcal{D} = \\{ (i, j, k) \\in \\mathbb{Z}^3 \\mid |i| + |j| + |k| \\le ${iMax} \\}`;
  }
  if (kMax > 0) {
    return `\\mathcal{D} = \\{ (i, j, k) \\in \\mathbb{Z}^3 \\mid 0 \\le i < ${iMax}, 0 \\le j < ${jMax}, 0 \\le k < ${kMax} \\}`;
  }
  return `\\mathcal{D} = \\{ (i, j) \\in \\mathbb{Z}^2 \\mid 0 \\le i < ${iMax}, 0 \\le j < ${jMax} \\}`;
};

/**
 * Generates optimized C code based on the transformation matrix and domain type.
 */
export const generateOptimizedCode = (iMax, jMax, kMax, matrix, domainType = 'rectangular') => {
  const isMatrix = (m) => JSON.stringify(matrix) === JSON.stringify(m);

  if (domainType === 'diamond') {
    if (isMatrix(TRANSFORMATIONS.IDENTITY)) {
      return `for (int i = -${iMax}; i <= ${iMax}; i++) {\n  for (int j = -( ${iMax} - abs(i)); j <= (${iMax} - abs(i)); j++) {\n    for (int k = -(${iMax} - abs(i) - abs(j)); k <= (${iMax} - abs(i) - abs(j)); k++) {\n      S(i, j, k);\n    }\n  }\n}`;
    }
    if (isMatrix(TRANSFORMATIONS.SKEW)) {
       return `// Skewed Diamond Domain\nfor (int ip = -${iMax}; ip <= ${iMax}; ip++) {\n  for (int jp = ip - (${iMax} - abs(ip)); jp <= ip + (${iMax} - abs(ip)); jp++) {\n    int j = jp - ip;\n    for (int k = -(${iMax} - abs(ip) - abs(j)); k <= (${iMax} - abs(ip) - abs(j)); k++) {\n      S(ip, j, k);\n    }\n  }\n}`;
    }
    return "// Complex transformation on diamond domain: use polyhedral code generator (e.g. CLooG)";
  }

  // Rectangular cases
  if (isMatrix(TRANSFORMATIONS.IDENTITY)) {
    const kLoop = kMax > 0 ? `\n    for (int k = 0; k < ${kMax}; k++) {\n      C[i][j] += A[i][k] * B[k][j];\n    }` : `\n    S(i, j);`;
    return `for (int i = 0; i < ${iMax}; i++) {\n  for (int j = 0; j < ${jMax}; j++) {${kLoop}\n  }\n}`;
  }

  if (isMatrix(TRANSFORMATIONS.MATMUL_IKJ)) {
    return `// Optimized for Cache Locality (i, k, j order)\nfor (int i = 0; i < ${iMax}; i++) {\n  for (int k = 0; k < ${kMax}; k++) {\n    for (int j = 0; j < ${jMax}; j++) {\n      C[i][j] += A[i][k] * B[k][j];\n    }\n  }\n}`;
  }

  if (isMatrix(TRANSFORMATIONS.SKEW)) {
    return `// Loop Skewing (i, j+i)\nfor (int ip = 0; ip < ${iMax}; ip++) {\n  for (int jp = ip; jp < ip + ${jMax}; jp++) {\n    S(ip, jp - ip);\n  }\n}`;
  }

  if (isMatrix(TRANSFORMATIONS.INTERCHANGE_IJ)) {
    const kLoop = kMax > 0 ? `\n    for (int k = 0; k < ${kMax}; k++) {\n      C[i][j] += A[i][k] * B[k][j];\n    }` : `\n    S(j, i);`;
    return `for (int j = 0; j < ${jMax}; j++) {\n  for (int i = 0; i < ${iMax}; i++) {${kLoop}\n  }\n}`;
  }

  return "// Transformation code generation not implemented for this matrix.";
};
