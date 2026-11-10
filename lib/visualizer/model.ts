export type Point = readonly [number, number];
export type Quad = readonly [Point, Point, Point, Point];
export type Stroke = { points: Point[]; size: number; erase: boolean };
export type Wall = {
  id: string;
  outline: Point[];
  holes?: Point[][];
  plane: Quad;
  strokes: Stroke[];
  material?: string;
  scale: number;
  rotation: number;
  intensity: number;
};
export type Project = {
  version: 1;
  image: string | Blob;
  title: string;
  walls: Wall[];
};
export type Material = {
  id: string;
  name: string;
  family: string;
  description?: string;
  image?: string;
  href?: string;
  texture?: string;
  photoSample?: {
    src: string;
    crop: readonly [number, number, number, number];
    name: string;
  };
  color?: string;
  pigment?: string;
};

export const visualizerPath = "/raumvisualisierer";
export const demoMaterials: Material[] = [
  {
    id: "study-sand",
    name: "Warmer Sand",
    family: "Strukturstudie",
    pigment: "#b8a389",
  },
  {
    id: "study-slate",
    name: "Grüner Schiefer",
    family: "Strukturstudie",
    pigment: "#647571",
  },
];

export function newWall(
  id: string,
  outline: Point[] = [],
  plane: Quad = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ],
): Wall {
  return {
    id,
    outline,
    plane,
    strokes: [],
    scale: 1,
    rotation: 0,
    intensity: 1,
  };
}

function prepared(
  id: string,
  polygon: Point[],
  plane: Quad,
  holes: Point[][] = [],
): Wall {
  const normalized = ([x, y]: Point): Point => [x / 640, y / 327];
  return {
    ...newWall(
      id,
      polygon.map(normalized),
      plane.map(normalized) as unknown as Quad,
    ),
    holes: holes.map((hole) => hole.map(normalized)),
  };
}

export const rooms: Project[] = [
  {
    version: 1,
    image: "/brand/spaces/dubai-apartment.webp",
    title: "Wohnraum · Dubai",
    walls: [
      prepared(
        "01",
        [
          [66, 0],
          [232, 0],
          [234, 33],
          [270, 42],
          [315, 42],
          [343, 28],
          [350, 0],
          [493, 0],
          [493, 44],
          [627, 44],
          [627, 184],
          [566, 182],
          [549, 183],
          [547, 197],
          [558, 226],
          [581, 254],
          [374, 254],
          [389, 179],
          [378, 172],
          [367, 222],
          [352, 222],
          [358, 189],
          [284, 187],
          [224, 186],
          [221, 142],
          [211, 140],
          [210, 187],
          [115, 190],
          [112, 174],
          [87, 180],
          [89, 204],
          [66, 211],
        ],
        [
          [66, 0],
          [627, 0],
          [627, 255],
          [66, 255],
        ],
        [
          [
            [472, 95],
            [481, 95],
            [481, 105],
            [472, 105],
          ],
        ],
      ),
      prepared(
        "02",
        [
          [32, 0],
          [65, 0],
          [65, 204],
          [58, 211],
          [32, 209],
        ],
        [
          [32, 0],
          [65, 0],
          [65, 209],
          [32, 228],
        ],
      ),
    ],
  },
  {
    version: 1,
    image: "/brand/about/travertine-kitchen.jpg",
    title: "Küche · Travertin",
    walls: [
      {
        ...newWall(
          "01",
          [
            [0, 0],
            [0.64, 0],
            [0.885, 0.21],
            [0.885, 0.25],
            [0.795, 0.27],
            [0.795, 0.535],
            [0.271, 0.504],
            [0.261, 0.587],
            [0, 0.57],
          ],
          [
            [0, -0.37],
            [0.885, 0.21],
            [0.885, 0.56],
            [0, 0.5],
          ],
        ),
        holes: [
          [
            [0.341, 0.239],
            [0.382, 0.23],
            [0.4, 0.193],
            [0.425, 0.195],
            [0.438, 0.341],
            [0.366, 0.333],
            [0.337, 0.284],
          ],
          [
            [0.568, 0.321],
            [0.645, 0.286],
            [0.675, 0.279],
            [0.691, 0.389],
            [0.636, 0.389],
            [0.643, 0.331],
            [0.58, 0.368],
          ],
          [
            [0.711, 0.376],
            [0.78, 0.35],
            [0.817, 0.344],
            [0.827, 0.419],
            [0.773, 0.418],
            [0.778, 0.377],
            [0.718, 0.409],
          ],
        ],
      },
    ],
  },
];
