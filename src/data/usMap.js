// US map generated from simplified boundary polygons, rasterized to 80x50 grid
// Uses point-in-polygon test against continental US outline + Great Lakes cutouts

// Continental US outer boundary — a SIMPLE (non-self-intersecting) polygon
// Traces clockwise from NW Washington, down Pacific coast, along southern border,
// up Atlantic coast, across northern border back to start.
// Great Lakes carved as separate "hole" polygons.
const US_OUTER = [
  // Pacific Northwest
  [-124.7,48.4],[-123.2,48.2],[-122.8,48.0],[-122.8,49.0],
  // Northern border (west to east, straight line at ~49°N)
  [-120.0,49.0],[-117.0,49.0],[-116.0,49.0],[-110.0,49.0],
  [-104.0,49.0],[-100.0,49.0],[-97.0,49.0],
  // Minnesota/Wisconsin border dips south
  [-97.0,48.0],[-96.5,46.0],[-96.5,43.5],
  [-92.0,43.5],[-92.5,44.0],[-92.5,45.5],
  [-92.0,46.5],[-91.5,47.0],[-90.0,47.5],[-89.5,47.0],
  [-88.0,46.5],[-87.0,46.5],[-86.5,46.5],[-85.5,47.0],
  [-84.5,46.5],[-84.0,46.0],[-83.5,45.5],
  [-82.5,44.5],[-82.5,43.0],[-83.0,42.0],[-82.5,41.5],
  // Lake Erie south shore / northern OH-PA-NY border
  [-81.0,41.5],[-80.5,42.0],[-79.8,42.5],[-79.0,43.3],
  // NY northern border
  [-76.5,43.5],[-76.0,44.0],[-74.5,45.0],[-73.5,45.0],
  [-71.0,45.0],[-69.0,47.3],[-67.0,47.3],[-67.0,44.8],
  // New England coast
  [-69.8,43.5],[-70.0,42.5],[-70.5,42.0],[-71.0,41.5],
  [-72.0,41.0],[-73.8,40.5],
  // Mid-Atlantic coast
  [-74.0,39.5],[-75.0,39.0],[-75.5,38.5],[-76.0,38.0],
  [-75.8,37.0],[-75.5,36.0],[-76.0,35.5],
  // Carolina coast
  [-77.5,34.5],[-78.5,33.9],[-79.5,33.0],[-80.8,32.1],
  [-81.5,31.2],[-81.0,30.5],
  // Florida
  [-80.5,28.5],[-80.2,27.0],[-80.0,25.8],[-80.5,25.2],
  [-81.5,26.0],[-82.0,27.5],[-82.5,29.0],[-83.5,29.8],
  // Gulf coast
  [-84.5,30.0],[-85.5,30.0],[-86.5,30.4],[-87.5,30.3],
  [-88.5,30.2],[-89.0,29.2],[-89.5,29.0],[-91.0,29.0],
  [-93.0,29.5],[-93.8,29.7],[-94.5,29.5],[-95.0,29.2],
  [-96.5,28.5],[-97.0,27.8],[-97.2,26.0],
  // Texas coast/border
  [-99.0,26.4],[-100.0,28.0],[-101.5,29.8],[-103.0,29.0],
  [-104.0,29.5],[-106.5,31.5],[-106.5,31.8],
  // Southern border
  [-108.2,31.3],[-111.0,31.3],[-114.7,32.5],[-116.5,32.5],
  [-117.2,32.7],
  // California coast
  [-118.5,34.0],[-119.5,34.5],[-120.5,35.0],[-121.0,35.5],
  [-122.0,36.8],[-122.5,37.8],[-123.8,38.5],
  [-124.2,40.0],[-124.4,42.0],[-124.0,43.0],
  [-123.8,46.2],[-124.5,46.3],[-124.7,48.4],
];

// Great Lakes simplified polygons (to be carved out)
const LAKE_SUPERIOR = [
  [-92.1,46.8],[-91.0,46.5],[-89.5,46.5],[-88.5,46.5],
  [-87.5,46.5],[-86.5,46.5],[-85.5,46.8],[-84.8,46.5],
  [-84.5,46.8],[-84.8,47.5],[-86.0,47.5],[-87.5,47.2],
  [-89.0,47.5],[-90.5,47.8],[-92.0,47.2],[-92.1,46.8],
];

const LAKE_MICHIGAN = [
  [-87.8,42.0],[-87.5,42.5],[-87.0,43.5],[-86.8,44.0],
  [-86.2,44.8],[-85.5,45.5],[-85.5,46.0],[-86.5,45.8],
  [-87.0,45.0],[-87.5,44.0],[-87.8,43.5],[-88.0,42.5],
  [-87.8,42.0],
];

const LAKE_HURON = [
  [-84.0,43.5],[-83.5,44.0],[-83.0,44.5],[-82.5,44.8],
  [-82.0,45.0],[-81.5,45.5],[-82.0,46.0],[-82.8,46.0],
  [-83.5,45.5],[-84.0,45.0],[-84.5,44.5],[-84.5,43.5],
  [-84.0,43.5],
];

const LAKE_ERIE = [
  [-83.5,41.5],[-83.0,41.8],[-82.5,42.0],[-81.5,42.0],
  [-81.0,42.3],[-80.5,42.5],[-79.8,42.8],[-79.0,42.8],
  [-79.0,42.3],[-80.0,42.0],[-81.0,41.5],[-82.0,41.3],
  [-83.5,41.5],
];

const LAKE_ONTARIO = [
  [-79.5,43.2],[-79.0,43.5],[-77.5,43.5],[-76.5,43.5],
  [-76.2,43.8],[-76.5,44.0],[-77.5,44.0],[-78.5,43.5],
  [-79.5,43.2],
];

const GREAT_LAKES = [LAKE_SUPERIOR, LAKE_MICHIGAN, LAKE_HURON, LAKE_ERIE, LAKE_ONTARIO];

function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

const GRID_W = 80;
const GRID_H = 50;
const LON_MIN = -125;
const LON_MAX = -66;
const LAT_MIN = 24;
const LAT_MAX = 50;

function generateGrid() {
  const grid = [];
  for (let row = 0; row < GRID_H; row++) {
    const cells = [];
    for (let col = 0; col < GRID_W; col++) {
      const lon = LON_MIN + (col + 0.5) * (LON_MAX - LON_MIN) / GRID_W;
      const lat = LAT_MAX - (row + 0.5) * (LAT_MAX - LAT_MIN) / GRID_H;
      let land = pointInPoly(lon, lat, US_OUTER);
      // Carve out Great Lakes
      if (land) {
        for (const lake of GREAT_LAKES) {
          if (pointInPoly(lon, lat, lake)) {
            land = false;
            break;
          }
        }
      }
      cells.push(land ? 1 : 0);
    }
    grid.push(cells);
  }
  return grid;
}

const US_MAP_GRID = generateGrid();

const ALASKA_GRID = [
  "00011111100000",
  "00111111110000",
  "01111111111000",
  "11111111111100",
  "01111111111110",
  "00111111111100",
  "00011111110000",
  "00001111000000",
].map(row => row.split('').map(Number));

const HAWAII_GRID = [
  "00000011",
  "00001111",
  "00111110",
  "00011000",
].map(row => row.split('').map(Number));

export function geoToGrid(lon, lat) {
  const gx = Math.round((lon - LON_MIN) / (LON_MAX - LON_MIN) * (GRID_W - 1));
  const gy = Math.round((LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * (GRID_H - 1));
  return { gridX: Math.max(0, Math.min(GRID_W - 1, gx)), gridY: Math.max(0, Math.min(GRID_H - 1, gy)) };
}

export { US_MAP_GRID, ALASKA_GRID, HAWAII_GRID };
