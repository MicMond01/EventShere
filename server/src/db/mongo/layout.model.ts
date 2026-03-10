import { Schema, model, Document } from "mongoose";

interface IVec3 {
  x: number;
  y: number;
  z: number;
}

interface ISceneObject {
  id: string;
  type: string;
  position: IVec3;
  rotation: IVec3;
  scale: IVec3;
  label?: string;
  isLocked: boolean;
}

interface IZone {
  id: string;
  name: string;
  type: string;
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

interface ISceneData {
  objects: ISceneObject[];
  zones: IZone[];
  seats: ISeat[];
  venueModelUrl?: string;
  gridSize: number;
}

export interface ILayoutDocument extends Document {
  eventId: string;
  name: string;
  versionNumber: number;
  isActive: boolean;
  sceneData: ISceneData;
  createdAt: Date;
  updatedAt: Date;
}

const Vec3Schema = new Schema<IVec3>(
  { x: Number, y: Number, z: Number },
  { _id: false },
);

const SceneObjectSchema = new Schema<ISceneObject>(
  {
    id: String,
    type: String,
    position: Vec3Schema,
    rotation: Vec3Schema,
    scale: Vec3Schema,
    label: String,
    isLocked: { type: Boolean, default: false },
  },
  { _id: false },
);

const ZoneSchema = new Schema<IZone>(
  {
    id: String,
    name: String,
    type: String,
    color: { type: String, default: "#3B82F6" },
    vertices: [{ x: Number, z: Number }],
  },
  { _id: false },
);

const SeatSchema = new Schema<ISeat>(
  {
    id: String,
    seatLabel: String,
    zoneId: String,
    category: { type: String, default: "general" },
    position: Vec3Schema,
    isAccessible: { type: Boolean, default: false },
  },
  { _id: false },
);

const LayoutSchema = new Schema<ILayoutDocument>(
  {
    eventId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    versionNumber: { type: Number, required: true },
    isActive: { type: Boolean, default: false },
    sceneData: {
      objects: [SceneObjectSchema],
      zones: [ZoneSchema],
      seats: [SeatSchema],
      venueModelUrl: String,
      gridSize: { type: Number, default: 0.5 },
    },
  },
  { timestamps: true },
);

export const Layout = model<ILayoutDocument>("Layout", LayoutSchema);
