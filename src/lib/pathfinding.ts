// A* Pathfinding with dynamic downsampling, BFS snap, and path smoothing

const MAX_GRID_SIZE = 300;

export interface Point {
  x: number; // row
  y: number; // col
}

// Build a binary grid from image data with dynamic downsampling
export function buildGrid(
  imageData: ImageData,
  imgWidth: number,
  imgHeight: number
): { grid: Uint8Array[]; scale: number; gridW: number; gridH: number } {
  const scale = Math.max(1, Math.ceil(Math.max(imgWidth, imgHeight) / MAX_GRID_SIZE));
  const gridW = Math.ceil(imgWidth / scale);
  const gridH = Math.ceil(imgHeight / scale);

  const grid: Uint8Array[] = [];
  for (let r = 0; r < gridH; r++) {
    const row = new Uint8Array(gridW);
    for (let c = 0; c < gridW; c++) {
      const px = Math.min(c * scale, imgWidth - 1);
      const py = Math.min(r * scale, imgHeight - 1);
      const idx = (py * imgWidth + px) * 4;
      const brightness = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
      row[c] = brightness < 180 ? 1 : 0; // dark = wall
    }
    grid.push(row);
  }
  return { grid, scale, gridW, gridH };
}

// BFS snap to nearest walkable cell
export function findNearestWalkable(
  grid: Uint8Array[],
  point: Point,
  gridH: number,
  gridW: number,
  maxRadius = 30
): Point | null {
  if (point.x >= 0 && point.x < gridH && point.y >= 0 && point.y < gridW && grid[point.x][point.y] === 0) {
    return point;
  }
  const queue: Point[] = [point];
  const visited = new Set<string>();
  visited.add(`${point.x},${point.y}`);

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const dist = Math.abs(cur.x - point.x) + Math.abs(cur.y - point.y);
    if (dist > maxRadius) continue;

    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const key = `${nx},${ny}`;
      if (nx >= 0 && nx < gridH && ny >= 0 && ny < gridW && !visited.has(key)) {
        visited.add(key);
        if (grid[nx][ny] === 0) return { x: nx, y: ny };
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return null;
}

// Ramer-Douglas-Peucker path smoothing
function perpendicularDist(p: Point, a: Point, b: Point): number {
  const dx = b.y - a.y;
  const dy = b.x - a.x;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
  return Math.abs(dx * (a.x - p.x) - (a.y - p.y) * dy) / len;
}

export function simplifyPath(path: Point[], epsilon = 1.5): Point[] {
  if (path.length <= 2) return path;
  let maxDist = 0;
  let maxIdx = 0;
  for (let i = 1; i < path.length - 1; i++) {
    const d = perpendicularDist(path[i], path[0], path[path.length - 1]);
    if (d > maxDist) { maxDist = d; maxIdx = i; }
  }
  if (maxDist > epsilon) {
    const left = simplifyPath(path.slice(0, maxIdx + 1), epsilon);
    const right = simplifyPath(path.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [path[0], path[path.length - 1]];
}

// Create an inline Web Worker for A* computation
export function createPathfindingWorker(): Worker {
  const workerCode = `
    const DIRS = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
    const COSTS = [1,1,1,1,1.414,1.414,1.414,1.414];

    function astar(grid, gridH, gridW, start, end) {
      if (grid[start[0]][start[1]] === 1 || grid[end[0]][end[1]] === 1) return [];

      // Simple binary heap using array
      const open = [[0, start[0], start[1]]]; // [f, x, y]
      const g = new Float32Array(gridH * gridW).fill(Infinity);
      const parent = new Int32Array(gridH * gridW).fill(-1);
      const idx = (x, y) => x * gridW + y;

      g[idx(start[0], start[1])] = 0;

      while (open.length > 0) {
        // Find min f
        let minI = 0;
        for (let i = 1; i < open.length; i++) {
          if (open[i][0] < open[minI][0]) minI = i;
        }
        const [, cx, cy] = open.splice(minI, 1)[0];
        const ci = idx(cx, cy);

        if (cx === end[0] && cy === end[1]) {
          // Reconstruct
          const path = [];
          let cur = ci;
          while (cur !== -1) {
            path.push([Math.floor(cur / gridW), cur % gridW]);
            cur = parent[cur];
          }
          return path.reverse();
        }

        for (let d = 0; d < 8; d++) {
          const nx = cx + DIRS[d][0], ny = cy + DIRS[d][1];
          if (nx < 0 || nx >= gridH || ny < 0 || ny >= gridW || grid[nx][ny] === 1) continue;
          const ni = idx(nx, ny);
          const ng = g[ci] + COSTS[d];
          if (ng < g[ni]) {
            g[ni] = ng;
            parent[ni] = ci;
            const h = Math.sqrt((nx-end[0])**2 + (ny-end[1])**2);
            open.push([ng + h, nx, ny]);
          }
        }
      }
      return [];
    }

    self.onmessage = function(e) {
      const { grid, gridH, gridW, start, end } = e.data;
      const path = astar(grid, gridH, gridW, start, end);
      self.postMessage({ path });
    };
  `;
  const blob = new Blob([workerCode], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
}
