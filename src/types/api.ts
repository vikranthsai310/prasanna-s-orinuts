/**
 * API Types
 * TypeScript interfaces for all API request/response types
 */

// ============================================================================
// Base API Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthUser {
  uid: string;
  email: string | null;
  name?: string;
  phone?: string;
  role?: 'user' | 'admin';
  emailVerified?: boolean;
}

// ============================================================================
// Payment Types (Razorpay)
// ============================================================================

export interface RazorpayOrderRequest {
  amount: number; // in paise (multiply by 100)
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentRequest extends RazorpayPaymentVerification {
  orderId?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  orderId?: string;
  paymentId?: string;
  error?: string;
}

// ============================================================================
// Shipping Types (Shiprocket)
// ============================================================================

export interface ShippingAddress {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface CalculateShippingRequest {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number; // in kg
  cod?: boolean;
  declared_value?: number;
}

export interface ShippingRate {
  courier_company_id: number;
  courier_name: string;
  freight_charge: number;
  cod_charges: number;
  other_charges: number;
  rate: number;
  etd: string;
}

export interface CalculateShippingResponse {
  success: boolean;
  rates?: ShippingRate[];
  error?: string;
}

export interface CreateShipmentRequest {
  order_id: string;
  order_date: string;
  pickup_location?: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country?: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing?: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: ShipmentItem[];
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface ShipmentItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: number;
}

export interface CreateShipmentResponse {
  success: boolean;
  shipment_id?: number;
  order_id?: string;
  awb_code?: string;
  courier_company_id?: number;
  courier_name?: string;
  error?: string;
}

export interface TrackShipmentRequest {
  shipment_id?: string;
  awb_code?: string;
}

export interface ShipmentStatus {
  current_status: string;
  shipment_status: string;
  awb_code: string;
  courier_name: string;
  origin: string;
  destination: string;
  delivered_date?: string;
  expected_date?: string;
  scans?: ShipmentScan[];
}

export interface ShipmentScan {
  date: string;
  activity: string;
  location: string;
  status?: string;
}

export interface TrackShipmentResponse {
  success: boolean;
  tracking_data?: ShipmentStatus;
  error?: string;
}

// ============================================================================
// Order Types
// ============================================================================

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  weight?: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: 'Prepaid' | 'COD';
  shippingCharge?: number;
  discount?: number;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: 'Prepaid' | 'COD';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  shipmentId?: string;
  awbCode?: string;
  trackingUrl?: string;
  shippingCharge?: number;
  discount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order?: Order;
  razorpayOrder?: RazorpayOrderResponse;
  error?: string;
}

// ============================================================================
// Product Types
// ============================================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  category: string;
  stock: number;
  weight?: number; // in kg
  unit?: string;
  featured?: boolean;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
  timestamp?: number;
}

export interface PageViewEvent {
  page_path: string;
  page_title: string;
  page_location?: string;
}

export interface AddToCartEvent {
  currency: string;
  value: number;
  items: {
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }[];
}

export interface PurchaseEvent {
  currency: string;
  value: number;
  transaction_id: string;
  shipping?: number;
  tax?: number;
  items: {
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }[];
}
