/**
 * Type definition for the order message payload
 */
export interface OrderCreatedEvent {
  orderId: string;
  userEmail: string;
  productId: string;
  quantity: number;
  price: number;
  shippingAddress: string;
  paymentMethod: string;
  timestamp: string;
}

export interface OrderCreatedEventPayload {
  userEmail: string;
  productId: string;
  quantity: number;
  price: number;
  shippingAddress: string;
  paymentMethod: string;
  sendUserUpdate: boolean;
}
