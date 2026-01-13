import { QualityGrade, StorageType, FreshnessStatus, SHELF_LIFE_RULES, PRODUCT_SHELF_LIFE_MODIFIER } from './types';
import { differenceInDays, addDays } from 'date-fns';

export function calculateShelfLife(grade: QualityGrade, storageType: StorageType, productId?: string): number {
  const baseShelfLife = storageType === 'Cold' 
    ? SHELF_LIFE_RULES[grade].cold 
    : SHELF_LIFE_RULES[grade].normal;
  
  // Apply product-specific modifier if available
  const modifier = productId ? (PRODUCT_SHELF_LIFE_MODIFIER[productId] || 1.0) : 1.0;
  return Math.round(baseShelfLife * modifier);
}

export function calculateExpiryDate(harvestDate: Date, grade: QualityGrade, storageType: StorageType, productId?: string): Date {
  const shelfLife = calculateShelfLife(grade, storageType, productId);
  return addDays(harvestDate, shelfLife);
}

export function calculateRemainingDays(expiryDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return differenceInDays(expiry, today);
}

export function determineFreshnessStatus(remainingDays: number): FreshnessStatus {
  if (remainingDays > 3) return 'Fresh';
  if (remainingDays >= 1) return 'Consume Soon';
  return 'Expired';
}

export function isSaleAllowed(status: FreshnessStatus): boolean {
  return status !== 'Expired';
}

export function calculateDaysSinceHarvest(harvestDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const harvest = new Date(harvestDate);
  harvest.setHours(0, 0, 0, 0);
  return differenceInDays(today, harvest);
}

export function determineGradeFromVisualAndFirmness(
  visualQuality: number, 
  firmness: 'Low' | 'Medium' | 'High'
): QualityGrade {
  const firmnessScore = firmness === 'High' ? 2 : firmness === 'Medium' ? 1 : 0;
  const totalScore = visualQuality + firmnessScore;
  
  if (totalScore >= 6) return 'A';
  if (totalScore >= 4) return 'B';
  return 'C';
}

export function generateBatchId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BTH-${timestamp}-${random}`;
}

export function generateQRId(): string {
  return `QR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}
