// src/features/events/api/checkoutApi.ts
import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type {
  CheckoutData, IncomeData, PaymentSummary,
  PaymentDetail, BankAccountRequest,
} from '../types/checkout.types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// GET /expo-payment/:expoID/get-payments
export async function getExpoPayments(expoID: string): Promise<PaymentSummary[]> {
  const res = await fetchWithAuth(`${API}/expo-payment/${expoID}/get-payments`);
  if (!res.ok) throw new Error('Failed to get payments');
  return res.json();
}

// POST /expo-payment/:expoID/checkout/closed_expo_fee
export async function getCheckoutDetail(expoID: string): Promise<CheckoutData> {
  const res = await fetchWithAuth(
    `${API}/expo-payment/${expoID}/checkout/closed_expo_fee`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error('Failed to get checkout');
  return res.json();
}

// GET /expo-payment/:expoID/get/closed_expo_fee
export async function getPaymentDetail(expoID: string): Promise<PaymentDetail> {
  const res = await fetchWithAuth(
    `${API}/expo-payment/${expoID}/get/closed_expo_fee`
  );
  if (!res.ok) throw new Error('Failed to get payment detail');
  return res.json();
}

// POST /expo-payment/:expoID/confirm-payment
export async function confirmPayment(
  expoID: string,
  paymentId: string,
  paymentMethod: 'QRscan' | 'Credit Card'
): Promise<{ message: string }> {
  const res = await fetchWithAuth(
    `${API}/expo-payment/${expoID}/confirm-payment`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId, payment_method: paymentMethod }),
    }
  );
  if (!res.ok) throw new Error('Failed to confirm payment');
  return res.json();
}

// GET /expo-payment/:expoID/income
export async function getIncome(expoID: string): Promise<IncomeData> {
  const res = await fetchWithAuth(`${API}/expo-payment/${expoID}/income`);
  if (!res.ok) throw new Error('Failed to get income');
  return res.json();
}

// POST /expo/:expoID/create-payment-account
export async function createPaymentAccount(
  expoID: string,
  data: BankAccountRequest
): Promise<{ message: string }> {
  const form = new FormData();
  form.append('recipient_name', data.recipient_name);
  form.append('entity_type', data.entity_type);
  form.append('tax_id', data.tax_id);
  form.append('tax_address', data.tax_address);
  form.append('tax_email', data.tax_email);
  form.append('phone', data.phone);
  form.append('bank_name', data.bank_name);
  form.append('account_number', data.account_number);
  form.append('account_name', data.account_name);
  form.append('branch', data.branch);
  form.append('verify_file', data.verify_file);
  const res = await fetchWithAuth(
    `${API}/expo/${expoID}/create-payment-account`,
    { method: 'POST', body: form }
  );
  if (!res.ok) throw new Error('Failed to create payment account');
  return res.json();
}