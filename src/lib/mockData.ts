import { Farmer, Batch, QualityTest, Storage, RetailStatus, QRMapping, BatchWithDetails, QualityGrade, StorageType, PRODUCTS } from './types';
import { calculateExpiryDate, calculateRemainingDays, determineFreshnessStatus, isSaleAllowed, generateBatchId, generateQRId } from './freshness';
import { subDays, addDays } from 'date-fns';

// Initial mock farmers
const initialFarmers: Farmer[] = [
  { farmerId: 'F001', farmerCode: 'FRM-A1X', name: 'Farmer A' },
  { farmerId: 'F002', farmerCode: 'FRM-B2Y', name: 'Farmer B' },
  { farmerId: 'F003', farmerCode: 'FRM-C3Z', name: 'Farmer C' },
];

function createMockBatch(
  farmerId: string,
  daysAgo: number,
  quantity: number,
  grade: QualityGrade,
  storageType: StorageType,
  productId: string = 'tomato'
): BatchWithDetails {
  const batchId = generateBatchId();
  const harvestDate = subDays(new Date(), daysAgo);
  const expiryDate = calculateExpiryDate(harvestDate, grade, storageType, productId);
  const remainingDays = calculateRemainingDays(expiryDate);
  const status = determineFreshnessStatus(remainingDays);

  const batch: Batch = {
    batchId,
    cropType: productId, // Store productId, not name
    harvestDate,
    farmerId,
    quantity,
    qualityGrade: grade,
    createdAt: harvestDate,
  };

  const qualityTest: QualityTest = {
    testId: `TEST-${batchId}`,
    batchId,
    visualQuality: grade === 'A' ? 5 : grade === 'B' ? 3 : 2,
    freshnessDays: grade === 'A' ? 7 : grade === 'B' ? 5 : 3,
    firmness: grade === 'A' ? 'High' : grade === 'B' ? 'Medium' : 'Low',
    finalGrade: grade,
    testDate: harvestDate,
  };

  const storage: Storage = {
    batchId,
    storageType,
    entryDate: harvestDate,
    expectedShelfLife: expiryDate.getTime() - harvestDate.getTime(),
    expiryDate,
  };

  const retailStatus: RetailStatus = {
    batchId,
    sellByDate: expiryDate,
    remainingDays,
    status,
    saleAllowed: isSaleAllowed(status),
  };

  const qrMapping: QRMapping = {
    qrId: generateQRId(),
    batchId,
    publicUrl: `/scan/${batchId}`,
  };

  return {
    ...batch,
    qualityTest,
    storage,
    retailStatus,
    qrMapping,
    farmer: initialFarmers.find(f => f.farmerId === farmerId),
  };
}

// Create initial mock data with varied products
const initialBatches: BatchWithDetails[] = [
  createMockBatch('F001', 2, 50, 'A', 'Cold', 'tomato'),       // Fresh tomatoes
  createMockBatch('F002', 5, 30, 'B', 'Normal', 'potato'),     // Potatoes (long shelf life)
  createMockBatch('F001', 8, 25, 'A', 'Normal', 'spinach'),    // Expired spinach (short shelf life)
  createMockBatch('F003', 1, 40, 'A', 'Cold', 'apple'),        // Very Fresh apples
  createMockBatch('F002', 4, 35, 'B', 'Cold', 'carrot'),       // Fresh carrots
  createMockBatch('F003', 3, 20, 'C', 'Normal', 'banana'),     // Consume soon bananas
  createMockBatch('F001', 6, 45, 'B', 'Cold', 'onion'),        // Fresh onions
  createMockBatch('F002', 0, 60, 'A', 'Cold', 'mango'),        // Just harvested mangoes
];

// Storage keys
const STORAGE_KEY_BATCHES = 'agrovia_batches';
const STORAGE_KEY_FARMERS = 'agrovia_farmers';

// Initialize storage if empty
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY_BATCHES)) {
    localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(initialBatches));
  }
  if (!localStorage.getItem(STORAGE_KEY_FARMERS)) {
    localStorage.setItem(STORAGE_KEY_FARMERS, JSON.stringify(initialFarmers));
  }
}

// Get all batches with updated status
export function getAllBatches(): BatchWithDetails[] {
  initializeStorage();
  const batches: BatchWithDetails[] = JSON.parse(localStorage.getItem(STORAGE_KEY_BATCHES) || '[]');
  
  // Update remaining days and status dynamically
  return batches.map(batch => {
    if (batch.storage && batch.retailStatus) {
      const remainingDays = calculateRemainingDays(new Date(batch.storage.expiryDate));
      const status = determineFreshnessStatus(remainingDays);
      return {
        ...batch,
        harvestDate: new Date(batch.harvestDate),
        createdAt: new Date(batch.createdAt),
        storage: {
          ...batch.storage,
          entryDate: new Date(batch.storage.entryDate),
          expiryDate: new Date(batch.storage.expiryDate),
        },
        retailStatus: {
          ...batch.retailStatus,
          remainingDays,
          status,
          saleAllowed: isSaleAllowed(status),
          sellByDate: new Date(batch.retailStatus.sellByDate),
        },
        qualityTest: batch.qualityTest ? {
          ...batch.qualityTest,
          testDate: new Date(batch.qualityTest.testDate),
        } : undefined,
      };
    }
    return batch;
  });
}

// Get batch by ID
export function getBatchById(batchId: string): BatchWithDetails | undefined {
  const batches = getAllBatches();
  return batches.find(b => b.batchId === batchId);
}

// Get all farmers
export function getAllFarmers(): Farmer[] {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEY_FARMERS) || '[]');
}

// Add new batch
export function addBatch(batch: BatchWithDetails): void {
  const batches = getAllBatches();
  batches.push(batch);
  localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(batches));
}

// Add new farmer
export function addFarmer(farmer: Farmer): void {
  const farmers = getAllFarmers();
  farmers.push(farmer);
  localStorage.setItem(STORAGE_KEY_FARMERS, JSON.stringify(farmers));
}

// Get analytics data
export function getAnalytics() {
  const batches = getAllBatches();
  const totalBatches = batches.length;
  const expiredBatches = batches.filter(b => b.retailStatus?.status === 'Expired').length;
  const freshBatches = batches.filter(b => b.retailStatus?.status === 'Fresh').length;
  const consumeSoonBatches = batches.filter(b => b.retailStatus?.status === 'Consume Soon').length;
  
  // Calculate total quantity
  const totalQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);
  const expiredQuantity = batches
    .filter(b => b.retailStatus?.status === 'Expired')
    .reduce((sum, b) => sum + b.quantity, 0);
  
  // Estimate waste prevented (assuming 30% of consume soon would have expired without tracking)
  const potentialWastePrevented = Math.round(consumeSoonBatches * 0.3 * 25); // avg 25kg per batch
  
  // Average shelf life by grade
  const gradeStats = {
    A: batches.filter(b => b.qualityGrade === 'A').length,
    B: batches.filter(b => b.qualityGrade === 'B').length,
    C: batches.filter(b => b.qualityGrade === 'C').length,
  };

  return {
    totalBatches,
    expiredBatches,
    freshBatches,
    consumeSoonBatches,
    totalQuantity,
    expiredQuantity,
    potentialWastePrevented,
    gradeStats,
    preventedSalesCount: expiredBatches, // Expired items blocked from sale
  };
}

// Reset to initial data
export function resetData(): void {
  localStorage.removeItem(STORAGE_KEY_BATCHES);
  localStorage.removeItem(STORAGE_KEY_FARMERS);
  initializeStorage();
}
