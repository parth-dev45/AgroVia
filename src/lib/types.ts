export type QualityGrade = 'A' | 'B' | 'C';
export type StorageType = 'Normal' | 'Cold';
export type FreshnessStatus = 'Fresh' | 'Consume Soon' | 'Expired';
export type Firmness = 'Low' | 'Medium' | 'High';

// Product types with emoji and details
export interface ProductType {
  id: string;
  name: string;
  emoji: string;
  category: 'Vegetable' | 'Fruit' | 'Leafy Green' | 'Root Vegetable';
  unit: string;
}

export const PRODUCTS: ProductType[] = [
  { id: 'tomato', name: 'Tomato', emoji: '', category: 'Vegetable', unit: 'kg' },
  { id: 'potato', name: 'Potato', emoji: '', category: 'Root Vegetable', unit: 'kg' },
  { id: 'onion', name: 'Onion', emoji: '', category: 'Vegetable', unit: 'kg' },
  { id: 'carrot', name: 'Carrot', emoji: '', category: 'Root Vegetable', unit: 'kg' },
  { id: 'cabbage', name: 'Cabbage', emoji: '', category: 'Leafy Green', unit: 'kg' },
  { id: 'spinach', name: 'Spinach', emoji: '', category: 'Leafy Green', unit: 'kg' },
  { id: 'broccoli', name: 'Broccoli', emoji: '', category: 'Vegetable', unit: 'kg' },
  { id: 'cauliflower', name: 'Cauliflower', emoji: '', category: 'Vegetable', unit: 'kg' },
  { id: 'capsicum', name: 'Capsicum', emoji: '', category: 'Vegetable', unit: 'kg' },
  { id: 'cucumber', name: 'Cucumber', emoji: '', category: 'Vegetable', unit: 'kg' },
  { id: 'eggplant', name: 'Eggplant', emoji: '', category: 'Vegetable', unit: 'kg' },
  { id: 'lettuce', name: 'Lettuce', emoji: '', category: 'Leafy Green', unit: 'kg' },
  { id: 'apple', name: 'Apple', emoji: '', category: 'Fruit', unit: 'kg' },
  { id: 'banana', name: 'Banana', emoji: '', category: 'Fruit', unit: 'dozen' },
  { id: 'orange', name: 'Orange', emoji: '', category: 'Fruit', unit: 'kg' },
  { id: 'mango', name: 'Mango', emoji: '', category: 'Fruit', unit: 'kg' },
  { id: 'grapes', name: 'Grapes', emoji: '', category: 'Fruit', unit: 'kg' },
  { id: 'watermelon', name: 'Watermelon', emoji: '', category: 'Fruit', unit: 'piece' },
  { id: 'strawberry', name: 'Strawberry', emoji: '', category: 'Fruit', unit: 'kg' },
  { id: 'pineapple', name: 'Pineapple', emoji: '', category: 'Fruit', unit: 'piece' },
];

export const getProductById = (id: string): ProductType | undefined => 
  PRODUCTS.find(p => p.id === id);

export interface Farmer {
  farmerId: string;
  farmerCode: string;
  name: string;
}

export interface Batch {
  batchId: string;
  cropType: string;
  harvestDate: Date;
  farmerId: string;
  quantity: number;
  qualityGrade: QualityGrade | null;
  createdAt: Date;
}

export interface QualityTest {
  testId: string;
  batchId: string;
  visualQuality: number; // 1-5
  freshnessDays: number;
  firmness: Firmness;
  finalGrade: QualityGrade;
  testDate: Date;
}

export interface Storage {
  batchId: string;
  storageType: StorageType;
  entryDate: Date;
  expectedShelfLife: number;
  expiryDate: Date;
}

export interface RetailStatus {
  batchId: string;
  sellByDate: Date;
  remainingDays: number;
  status: FreshnessStatus;
  saleAllowed: boolean;
}

export interface QRMapping {
  qrId: string;
  batchId: string;
  publicUrl: string;
}

export interface BatchWithDetails extends Batch {
  qualityTest?: QualityTest;
  storage?: Storage;
  retailStatus?: RetailStatus;
  qrMapping?: QRMapping;
  farmer?: Farmer;
}

// Shelf life rules (in days) - applies to all produce
export const SHELF_LIFE_RULES: Record<QualityGrade, { normal: number; cold: number }> = {
  A: { normal: 7, cold: 12 },
  B: { normal: 5, cold: 9 },
  C: { normal: 3, cold: 6 },
};

// Product-specific shelf life modifiers
export const PRODUCT_SHELF_LIFE_MODIFIER: Record<string, number> = {
  tomato: 1.0,
  potato: 3.0,      // Potatoes last much longer
  onion: 2.5,
  carrot: 2.0,
  cabbage: 1.5,
  spinach: 0.5,     // Leafy greens spoil faster
  broccoli: 0.8,
  cauliflower: 1.0,
  capsicum: 1.0,
  cucumber: 0.8,
  eggplant: 1.0,
  lettuce: 0.4,     // Very short shelf life
  apple: 2.0,
  banana: 0.6,
  orange: 2.0,
  mango: 0.8,
  grapes: 0.7,
  watermelon: 1.2,
  strawberry: 0.4,
  pineapple: 1.0,
};

// Base price per unit by product
export const BASE_PRICE_PER_UNIT: Record<string, number> = {
  tomato: 40,
  potato: 30,
  onion: 35,
  carrot: 45,
  cabbage: 25,
  spinach: 60,
  broccoli: 80,
  cauliflower: 50,
  capsicum: 70,
  cucumber: 35,
  eggplant: 45,
  lettuce: 55,
  apple: 120,
  banana: 50,
  orange: 80,
  mango: 150,
  grapes: 100,
  watermelon: 40,
  strawberry: 200,
  pineapple: 60,
};

// Grade multipliers for pricing
export const GRADE_MULTIPLIER: Record<QualityGrade, number> = {
  A: 1.2,
  B: 1.0,
  C: 0.7,
};

// Legacy price per kg (for backward compatibility)
export const PRICE_PER_KG: Record<QualityGrade, number> = {
  A: 12,
  B: 9,
  C: 6,
};

// Get price for a product based on grade
export const getProductPrice = (productId: string, grade: QualityGrade): number => {
  const basePrice = BASE_PRICE_PER_UNIT[productId] || 50;
  return Math.round(basePrice * GRADE_MULTIPLIER[grade]);
};
