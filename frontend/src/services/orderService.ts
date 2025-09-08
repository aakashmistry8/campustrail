import { Product } from '../types/Product';

export interface CartItem {
  product: Product;
  qty: number;
}

export interface OrderItem {
  id: string;
  title: string;
  unitPrice: number;
  depositAmount: number;
  quantity: number;
  lineTotal: number;
  gearItemId?: string;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  depositTotal: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  userEmail: string;
}

export interface PlaceOrderRequest {
  items: CartItem[];
  userEmail: string;
}

export interface PlaceOrderResponse {
  success: boolean;
  orderId?: string;
  error?: string;
}

class OrderService {
  private getStorageKey(userEmail: string): string {
    return `orders_${userEmail}`;
  }

  private generateOrderId(): string {
    return `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOrderItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserOrders(userEmail: string): Order[] {
    try {
      const ordersJson = localStorage.getItem(this.getStorageKey(userEmail));
      return ordersJson ? JSON.parse(ordersJson) : [];
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
      return [];
    }
  }

  private saveUserOrders(userEmail: string, orders: Order[]): void {
    try {
      localStorage.setItem(this.getStorageKey(userEmail), JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders to localStorage:', error);
    }
  }

  async placeOrder(request: PlaceOrderRequest): Promise<PlaceOrderResponse> {
    try {
      if (!request.items || request.items.length === 0) {
        return { success: false, error: 'Cart is empty' };
      }

      if (!request.userEmail) {
        return { success: false, error: 'User email is required' };
      }

      // Convert cart items to order items
      const orderItems: OrderItem[] = request.items.map(cartItem => ({
        id: this.generateOrderItemId(),
        title: cartItem.product.name,
        unitPrice: cartItem.product.price,
        depositAmount: cartItem.product.deposit || 0,
        quantity: cartItem.qty,
        lineTotal: cartItem.product.price * cartItem.qty,
        gearItemId: cartItem.product.id
      }));

      // Calculate totals
      const total = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const depositTotal = orderItems.reduce((sum, item) => sum + (item.depositAmount * item.quantity), 0);

      // Create order
      const order: Order = {
        id: this.generateOrderId(),
        status: 'created',
        total,
        depositTotal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: orderItems,
        userEmail: request.userEmail
      };

      // Save to localStorage (in real app, this would be an API call)
      const existingOrders = this.getUserOrders(request.userEmail);
      const updatedOrders = [order, ...existingOrders];
      this.saveUserOrders(request.userEmail, updatedOrders);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update order status to paid (simulating successful payment)
      order.status = 'paid';
      order.updatedAt = new Date().toISOString();
      this.saveUserOrders(request.userEmail, updatedOrders);

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error('Error placing order:', error);
      return { success: false, error: 'Failed to place order. Please try again.' };
    }
  }

  async getOrderHistory(userEmail: string): Promise<Order[]> {
    // In a real app, this would be an API call to the backend
    return this.getUserOrders(userEmail);
  }

  async getOrder(orderId: string, userEmail: string): Promise<Order | null> {
    const orders = this.getUserOrders(userEmail);
    return orders.find(order => order.id === orderId) || null;
  }

  // Method to simulate different order statuses for demo
  async updateOrderStatus(orderId: string, userEmail: string, status: string): Promise<boolean> {
    try {
      const orders = this.getUserOrders(userEmail);
      const orderIndex = orders.findIndex(order => order.id === orderId);
      
      if (orderIndex === -1) {
        return false;
      }

      orders[orderIndex].status = status;
      orders[orderIndex].updatedAt = new Date().toISOString();
      this.saveUserOrders(userEmail, orders);
      
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  // Clear all orders for a user (for testing purposes)
  clearOrderHistory(userEmail: string): void {
    localStorage.removeItem(this.getStorageKey(userEmail));
  }
}

export const orderService = new OrderService();
