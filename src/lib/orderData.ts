export interface Order {
  orderId: string;
  retailerId: string;
  batchId: string;
  quantity: number;
  orderDate: Date;
  status: 'Pending' | 'Fulfilled' | 'Cancelled';
}

export interface Crate {
  crateId: string;
  batchId: string;
  quantity: number;
  createdAt: Date;
}

export interface Bill {
  billId: string;
  retailerId: string;
  items: BillItem[];
  totalAmount: number;
  createdAt: Date;
  uniqueCode: string;
}

export interface BillItem {
  batchId: string;
  crateId?: string;
  quantity: number;
  grade: string;
  pricePerKg: number;
  amount: number;
  productName?: string;
}

// Inventory tracking
export interface InventoryRecord {
  batchId: string;
  soldQuantity: number;
}

const STORAGE_KEY_ORDERS = 'agrovia_orders';
const STORAGE_KEY_CRATES = 'agrovia_crates';
const STORAGE_KEY_BILLS = 'agrovia_bills';
const STORAGE_KEY_INVENTORY = 'agrovia_inventory';

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function generateCrateId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CRT-${timestamp}-${random}`;
}

export function generateBillId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BILL-${timestamp}-${random}`;
}

export function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Inventory Management
export function getInventoryRecords(): InventoryRecord[] {
  const stored = localStorage.getItem(STORAGE_KEY_INVENTORY);
  if (!stored) return [];
  return JSON.parse(stored);
}

export function getSoldQuantity(batchId: string): number {
  const records = getInventoryRecords();
  const record = records.find(r => r.batchId === batchId);
  return record?.soldQuantity || 0;
}

export function getAvailableQuantity(batchId: string, totalQuantity: number): number {
  const sold = getSoldQuantity(batchId);
  return Math.max(0, totalQuantity - sold);
}

export function reduceInventory(batchId: string, quantity: number): boolean {
  const records = getInventoryRecords();
  const existingIndex = records.findIndex(r => r.batchId === batchId);
  
  if (existingIndex >= 0) {
    records[existingIndex].soldQuantity += quantity;
  } else {
    records.push({ batchId, soldQuantity: quantity });
  }
  
  localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(records));
  return true;
}

// Orders
export function getAllOrders(): Order[] {
  const stored = localStorage.getItem(STORAGE_KEY_ORDERS);
  if (!stored) return [];
  return JSON.parse(stored).map((o: any) => ({
    ...o,
    orderDate: new Date(o.orderDate)
  }));
}

export function addOrder(order: Order): void {
  const orders = getAllOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
}

export function updateOrderStatus(orderId: string, status: Order['status']): void {
  const orders = getAllOrders();
  const index = orders.findIndex(o => o.orderId === orderId);
  if (index !== -1) {
    orders[index].status = status;
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }
}

// Crates
export function getAllCrates(): Crate[] {
  const stored = localStorage.getItem(STORAGE_KEY_CRATES);
  if (!stored) return [];
  return JSON.parse(stored).map((c: any) => ({
    ...c,
    createdAt: new Date(c.createdAt)
  }));
}

export function addCrate(crate: Crate): void {
  const crates = getAllCrates();
  crates.push(crate);
  localStorage.setItem(STORAGE_KEY_CRATES, JSON.stringify(crates));
}

export function getCrateById(crateId: string): Crate | undefined {
  return getAllCrates().find(c => c.crateId === crateId);
}

// Bills
export function getAllBills(): Bill[] {
  const stored = localStorage.getItem(STORAGE_KEY_BILLS);
  if (!stored) return [];
  return JSON.parse(stored).map((b: any) => ({
    ...b,
    createdAt: new Date(b.createdAt)
  }));
}

export function addBill(bill: Bill): void {
  const bills = getAllBills();
  bills.push(bill);
  localStorage.setItem(STORAGE_KEY_BILLS, JSON.stringify(bills));
}

export function getBillByUniqueCode(code: string): Bill | undefined {
  return getAllBills().find(b => b.uniqueCode.toUpperCase() === code.toUpperCase());
}
