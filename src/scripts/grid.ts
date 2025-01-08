
const COLORS = [
  // [235, 106, 130],
  // [159, 90, 110],
  [242, 196, 180],
  [125, 175, 156],
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sketch = any
const drawLine = (ctx: Sketch, x: number, y: number, angle: number, size: number) => {
  const v = ctx.createVector(1, 0).rotate(angle);
  const p = ctx.createVector(x, y);
  const start = p.copy().sub(v.copy().mult(size / 2));
  const end = p.copy().add(v.copy().mult(size / 2));
  ctx.strokeWeight(2);
  ctx.stroke(169, 251, 215);
  ctx.line(start.x, start.y, end.x, end.y);
  ctx.stroke(...COLORS[0]);
  ctx.strokeWeight(1);
  ctx.fill(...COLORS[0]);
  ctx.ellipse(end.x, end.y, 3);
};

function angleLerp(a0: number, a1: number, t: number) {
  const max = Math.PI * 2;

  function shortAngleDist() {
    const da = Math.sign(a1 - a0) * (Math.abs(a1 - a0) % max);
    return Math.sign(a1 - a0) * ((2 * Math.abs(da)) % max) - da;
  }
  return a0 + shortAngleDist() * t;
}

export class Grid {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  p5: any
  numColumns: number
  numRows: number
  grid: number[][]
  cellSize: number = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(height: number, width: number, cellSize: number, p5: any) {
    Object.assign(this, { height, width, cellSize });
    this.p5 = p5
    this.numColumns = Math.round(width / cellSize);
    this.numRows = Math.round(height / cellSize);
    this.grid = Array(this.numRows)
      .fill(null)
      .map(() => Array(this.numColumns).fill(0));
  }

  getCell(r: number, c: number) {
    if (r < this.numRows && r >= 0 && c < this.numColumns && c >= 0) {
      return this.grid[r][c];
    }
  }

  setCell(r: number, c: number, value: number) {
    if (r < this.numRows && r >= 0 && c < this.numColumns && c >= 0) {
      this.grid[r][c] = value;
    }
  }

  getCellIndex(x: number, y: number) {
    return [~~(x / this.cellSize), ~~(y / this.cellSize)];
  }

  getField(x: number, y: number) {
    const [ix, iy] = this.getCellIndex(x, y);
    const alphax = (x % this.cellSize) / this.cellSize;
    const alphay = (y % this.cellSize) / this.cellSize;

    return angleLerp(
      angleLerp(this.getCell(iy, ix) ?? -1, this.getCell(iy, ix + 1) ?? -1, alphax),
      angleLerp(this.getCell(iy + 1, ix) ?? -1, this.getCell(iy + 1, ix + 1) ?? -1, alphax),
      alphay
    );
  }

  crawl(cb: (r: number, c: number) => void) {
    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numColumns; c++) {
        cb(r, c);
      }
    }
  }

  _update(noiseScale: number, x: number, y: number) {
    this.crawl((r, c) => {
      // const angle = (r / this.numRows) * Math.PI;
      // const angle =
      //   this.p5.noise(c * noiseScale, r * noiseScale) * angleScale;
      const dX = x - (c + 0.5) * this.cellSize;
      const dY = y - (r + 0.5) * this.cellSize;

      const angle = Math.atan2(dX, dY);
      this.setCell(r, c, angle);
    });
  }
  update(noiseScale: number, angleScale: number) {
    this.crawl((r, c) => {
      const angle =
        this.p5.noise(c * noiseScale, r * noiseScale) * Math.PI * angleScale;
      this.setCell(r, c, angle);
    });
  }

  debug() {
    const ctx = this.p5
    this.crawl((r, c) => {
      drawLine(
        ctx,
        (c + 0.5) * this.cellSize,
        (r + 0.5) * this.cellSize,
        this.getCell(r, c) ?? -1,
        this.cellSize * 0.5
      );
    });
  }
}
