import mongoose, { Document, Schema } from "mongoose";

export interface IStore extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: 'store' | 'office';
  description?: string;
  bannerImageUrl?: string;
  buildingLevel: number;
  location?: { x: number; y: number };
  marketingPitch?: {
    headline?: string;
    promoText?: string;
    ctaLink?: string;
    videoUrl?: string;
  };
  flyers: Array<{
    title: string;
    description?: string;
    imageUrl?: string;
    validUntil?: Date;
  }>;
  products: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['store', 'office'], default: 'store' },
    description: { type: String },
    bannerImageUrl: { type: String },
    buildingLevel: { type: Number, default: 1 },
    location: {
      x: { type: Number },
      y: { type: Number }
    },
    marketingPitch: {
      headline: { type: String },
      promoText: { type: String },
      ctaLink: { type: String },
      videoUrl: { type: String }
    },
    flyers: [{
      title: { type: String, required: true },
      description: { type: String },
      imageUrl: { type: String },
      validUntil: { type: Date }
    }],
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

storeSchema.index({ category: 1, isActive: 1 });
storeSchema.index({ buildingLevel: 1 });

export const Store = mongoose.model<IStore>("Store", storeSchema);