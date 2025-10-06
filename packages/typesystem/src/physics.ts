export type Collision = {
  name: string;
  type: 'collision' | 'static';
  vertices: number[];
  indices: number[];
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
};
