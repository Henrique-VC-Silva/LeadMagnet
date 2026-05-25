import mongoose, { Schema } from "mongoose";

// Connection URI
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || "mongodb://localhost:27017/leadmagnet";

if (!mongoose.connection.readyState) {
  mongoose.connect(MONGODB_URI).catch((err) => {
    console.error("MongoDB connection error:", err);
  });
}

// 1. Campaign Schema
const CampaignSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  primaryColor: { type: String, default: "#c5a059" },
  secondaryColor: { type: String, default: "#f1f1f1" },
  backgroundImage: { type: String, default: null },
  logo: { type: String, default: null },
  copyTitle: { type: String, default: null },
  copySubtitle: { type: String, default: null },
  copyButton: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  defaultLanguage: { type: String, default: "pt-pt", enum: ["pt-pt", "en", "es", "fr"] },
}, { timestamps: true });

// 2. Prize Schema
const PrizeSchema = new Schema({
  name: { type: String, required: true },
  weight: { type: Number, default: 1 },
  stock: { type: Number, default: 0 },
  code: { type: String, default: null },
  isNoPrize: { type: Boolean, default: false },
  campaignId: { type: String, default: null },
}, { timestamps: true });

// 3. Lead Schema
const LeadSchema = new Schema({
  email: { type: String, required: true, index: true },
  name: { type: String, default: null },
  phone: { type: String, default: null },
  campaignId: { type: String, default: null },
  consent: { type: Boolean, default: false },
  consentAt: { type: Date, default: Date.now },
  wonPrizeId: { type: String, default: null },
}, { timestamps: true });

// 4. Setting Schema
const SettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
}, { timestamps: true });

// Model Compilation
export const Campaign = mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema);
export const Prize = mongoose.models.Prize || mongoose.model("Prize", PrizeSchema);
export const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
export const Setting = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);

// Export types under the exact same name for perfect TS integration
export interface Campaign {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundImage: string | null;
  logo: string | null;
  copyTitle: string | null;
  copySubtitle: string | null;
  copyButton: string | null;
  isActive: boolean;
  defaultLanguage: string;
  createdAt: Date;
  updatedAt: Date;
  prizes?: Prize[];
  leads?: Lead[];
}

export interface Prize {
  id: string;
  name: string;
  weight: number;
  stock: number;
  code: string | null;
  isNoPrize: boolean;
  campaignId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  campaignId: string | null;
  consent: boolean;
  consentAt: Date;
  wonPrizeId: string | null;
  createdAt: Date;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}
