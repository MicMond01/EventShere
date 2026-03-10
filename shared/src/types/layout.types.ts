export type ZoneType =
  | 'seating'
  | 'high_table'
  | 'stage'
  | 'dance_floor'
  | 'vendor'
  | 'walkway'
  | 'registration'
  | 'photography'
  | 'custom';

export interface ILayout {
  id: string;
  eventId: string;
  name: string;
  versionNumber: number;
  isActive: boolean;
  sceneData: ISceneData;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISceneData {
  objects: ISceneObject[];
  zones: IZone[];
  seats: ISeat[];
  venueModelUrl?: string;
  gridSize: number;
}

export interface ISceneObject {
  id: string;
  type: string;
  position: IVec3;
  rotation: IVec3;
  scale: IVec3;
  label?: string;
  isLocked: boolean;
}

export interface IZone {
  id: string;
  name: string;
  type: ZoneType;
  color: string;
  vertices: { x: number; z: number }[];
}

export interface ISeat {
  id: string;
  seatLabel: string;
  zoneId: string;
  category: string;
  position: IVec3;
  isAccessible: boolean;
}

export interface IVec3 {
  x: number;
  y: number;
  z: number;
}
