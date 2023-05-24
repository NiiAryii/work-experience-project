type Shape = {
  width?: number;
  height?: number;
  depth?: number;
}

export type Vector3 = {
  x: number,
  y: number,
  z: number
}

export type Entity = {
  id: number;
  name: string;
  type: string;
  color?: string;
  opacity?: number;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  shape: Shape;
  grabable: boolean;
};