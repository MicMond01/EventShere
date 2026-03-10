import mongoose, { Schema, Document } from 'mongoose';

export interface ILayoutDocument extends Document {
  eventId: string;
  name: string;
  versionNumber: number;
  isActive: boolean;
  sceneData: {
    objects: any[];
    zones: any[];
    seats: any[];
    venueModelUrl?: string;
    gridSize: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SceneObjectSchema = new Schema({
  id:       { type: String, required: true },
  type:     { type: String, required: true },
  position: { x: Number, y: Number, z: Number },
  rotation: { x: Number, y: Number, z: Number },
  scale:    { x: Number, y: Number, z: Number },
  label:    String,
  isLocked: { type: Boolean, default: false },
}, { _id: false });

const ZoneSchema = new Schema({
  id:       { type: String, required: true },
  name:     { type: String, required: true },
  type:     { type: String, required: true },
  color:    { type: String, default: '#3B82F6' },
  vertices: [{ x: Number, z: Number }],
}, { _id: false });

const SeatSchema = new Schema({
  id:          { type: String, required: true },
  seatLabel:   { type: String, required: true },
  zoneId:      { type: String, required: true },
  category:    { type: String, default: 'general' },
  position:    { x: Number, y: Number, z: Number },
  isAccessible:{ type: Boolean, default: false },
}, { _id: false });

const LayoutSchema = new Schema<ILayoutDocument>(
  {
    eventId:       { type: String, required: true, index: true },
    name:          { type: String, required: true },
    versionNumber: { type: Number, required: true, default: 1 },
    isActive:      { type: Boolean, default: false },
    sceneData: {
      objects:        [SceneObjectSchema],
      zones:          [ZoneSchema],
      seats:          [SeatSchema],
      venueModelUrl:  String,
      gridSize:       { type: Number, default: 0.5 },
    },
  },
  { timestamps: true }
);

// Only one active layout per event
LayoutSchema.index({ eventId: 1, isActive: 1 });

export const Layout = mongoose.model<ILayoutDocument>('Layout', LayoutSchema);
