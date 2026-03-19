// src/features/events/types/checkout.types.ts

export interface CheckoutItem {
  ProductID: string;
  ProductName: string;
  Quantity: number;
  Price: string;
}

export interface CheckoutData {
  ExpoID: string;
  Title: string;
  TotalPrice: string;
  PaymentID: string;
  Detail: CheckoutItem[];
}

export interface IncomeItem {
  Name: string;
  Type: string;
  Quantity: number;
  TotalPrice: string;
}

export interface IncomeData {
  TotalPrice: string;
  Detail: IncomeItem[];
}

export interface PaymentSummary {
  ExpoID: string;
  Title: string;
  TotalPrice: string;
  PaymentID: string | null;
  Status: 'pending' | 'paid';
}

export interface PaymentDetail {
  ExpoID: string;
  Title: string;
  TotalPrice: string;
  PaidBy: string;
  Firstname: string;
  Lastname: string;
  Email: string;
  PaymentMethod: string;
  Status: 'pending' | 'paid';
  Detail: CheckoutItem[];
}

export interface BankAccountRequest {
  recipient_name: string;
  entity_type: string;
  tax_id: string;
  tax_address: string;
  tax_email: string;
  phone: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  branch: string;
  verify_file: File;
}

export type CheckoutStep = 'summary' | 'payment' | 'income';