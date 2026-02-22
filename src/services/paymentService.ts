/**
 * Payment & SEO Service
 * Handles Razorpay payment flow and SEO settings API calls
 */

import api from './api';

// ============================================
// Types
// ============================================

export interface OrderData {
  orderId: string;
  amount: number;
  currency: string;
  razorpayKeyId: string;
  paymentId: string;
  planType: string;
  mockMode?: boolean;
}

export interface VerifyData {
  paymentId: string;
  invoiceNumber: string;
  amount: string;
  status: string;
  subscriptionStatus: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  isPro: boolean;
  alreadyProcessed?: boolean;
}

export interface PaymentRecord {
  _id: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  planType: string;
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  summary: {
    totalSpent: number;
    totalSpentFormatted: string;
    totalPayments: number;
    capturedPayments: number;
    failedPayments: number;
  };
}

// ============================================
// Payment Endpoints
// ============================================

/**
 * Create a Razorpay order for subscription payment
 */
export const createOrder = async (
  planType: 'monthly' | 'yearly' = 'monthly'
): Promise<{ success: boolean; data: OrderData }> => {
  const response = await api.post('/payment/create-order', { planType });
  return response.data;
};

/**
 * Verify payment after Razorpay checkout callback
 */
export const verifyPayment = async (data: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  mockPayment?: boolean;
  planType?: string;
}): Promise<{ success: boolean; message: string; data: VerifyData }> => {
  const response = await api.post('/payment/verify', data);
  return response.data;
};

/**
 * Get user's payment history (paginated)
 */
export const getPaymentHistory = async (
  page: number = 1
): Promise<PaymentHistoryResponse> => {
  const response = await api.get('/payment/history', { params: { page } });
  return response.data.data;
};

/**
 * Get invoice HTML for a specific payment
 */
export const getInvoice = async (
  paymentId: string
): Promise<{ invoiceHTML: string; invoiceNumber: string; paymentDate: string }> => {
  const response = await api.get(`/payment/invoice/${paymentId}`);
  return response.data.data;
};

// ============================================
// SEO Endpoints
// ============================================

/**
 * Get user's SEO settings
 */
export const getSEO = async () => {
  const response = await api.get('/seo');
  return response.data.data;
};

/**
 * Update SEO settings (supports FormData for image upload)
 */
export const updateSEO = async (data: FormData | Record<string, any>) => {
  const isFormData = data instanceof FormData;
  const response = await api.put('/seo', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

// ============================================
// Razorpay Checkout Helper
// ============================================

/**
 * Dynamically load Razorpay checkout script (singleton)
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag already exists
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    document.head.appendChild(script);
  });
};

/**
 * Open Razorpay checkout modal
 */
export const initiatePayment = async (options: {
  user: {
    fullName: string;
    email: string;
    phone: string;
  };
  planType?: 'monthly' | 'yearly';
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onError: (error: any) => void;
  onDismiss?: () => void;
}) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    options.onError(
      new Error('Failed to load payment gateway. Please try again.')
    );
    return;
  }

  const orderResponse = await createOrder(options.planType || 'monthly');
  const order = orderResponse.data;

  const razorpayOptions = {
    key: order.razorpayKeyId,
    amount: order.amount,
    currency: order.currency || 'INR',
    name: 'LinkVerse',
    description:
      options.planType === 'yearly'
        ? 'Pro Plan — Yearly Subscription'
        : 'Pro Plan — Monthly Subscription',
    order_id: order.orderId,
    prefill: {
      name: options.user.fullName,
      email: options.user.email,
      contact: options.user.phone,
    },
    theme: { color: '#6366f1' },
    handler: (response: any) => {
      options.onSuccess({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: () => options.onDismiss?.(),
      escape: true,
      confirm_close: true,
    },
    retry: { enabled: true, max_count: 3 },
  };

  const rzp = new (window as any).Razorpay(razorpayOptions);
  rzp.on('payment.failed', (response: any) =>
    options.onError(response.error)
  );
  rzp.open();
};