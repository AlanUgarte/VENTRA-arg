export interface User {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'CASHIER';
  isSuperAdmin: boolean;
  createdAt: string;
  tenant: Tenant;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  taxId?: string;
  subscription: Subscription;
}

export interface Subscription {
  plan: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  trialEndsAt: string;
  currentPeriodEnd?: string;
}

export interface Rubro {
  id: string;
  name: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  barcode?: string;
  rubroId: string;
  rubro: Rubro;
  costoBase: number;
  descCompra: number;
  ganancia: number;
  stock: number;
  isActive: boolean;
  // Computed by backend
  costoReal: number;
  precioVenta: number;
  gananciaUnit: number;
}

export interface SaleLine {
  id: string;
  productId?: string;
  productName: string;
  rubroName: string;
  priceUnit: number;
  costUnit: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  orderNumber: number;
  type: 'CASH' | 'CREDIT';
  discountPct: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  createdAt: string;
  lines: SaleLine[];
  user: { id: string; name: string };
  customer?: { id: string; name: string };
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  isActive: boolean;
  balance: number;
  credits: Credit[];
  payments: CustomerPayment[];
}

export interface Credit {
  id: string;
  customerId: string;
  discountPct: number;
  createdAt: string;
  currentValue: number;
  lines: CreditLine[];
}

export interface CreditLine {
  id: string;
  productId?: string;
  productName: string;
  priceSnap: number;
  quantity: number;
}

export interface CustomerPayment {
  id: string;
  amount: number;
  method: string;
  reference?: string;
  paidAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  isActive: boolean;
  _count?: { invoices: number };
}

export interface SupplierInvoice {
  id: string;
  supplierId: string;
  supplier: { id: string; name: string };
  invoiceNumber: string;
  condition: string;
  issuedAt: string;
  dueAt?: string;
  amount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  paid: number;
  saldo: number;
  isOverdue: boolean;
  payments: SupplierPayment[];
}

export interface SupplierPayment {
  id: string;
  amount: number;
  method: string;
  reference?: string;
  paidAt: string;
}

export interface ReportOverview {
  totalFacturado: number;
  totalGanancia: number;
  totalCosto: number;
  totalUnidades: number;
  totalVentas: number;
  ticketPromedio: number;
  totalPorCobrar: number;
  margenPct: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  order: number;
}
