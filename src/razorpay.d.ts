declare module 'razorpay' {
  interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    notes: Record<string, string>;
    status: string;
  }

  interface RazorpayInstance {
    orders: {
      create(options: {
        amount: number;
        currency: string;
        receipt: string;
        notes?: Record<string, string>;
      }): Promise<RazorpayOrder>;
      fetch(orderId: string): Promise<RazorpayOrder>;
    };
  }

  interface RazorpayConfig {
    key_id: string;
    key_secret: string;
  }

  const Razorpay: new (config: RazorpayConfig) => RazorpayInstance;
  export default Razorpay;
}
