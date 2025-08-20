interface OrderEmailData {
  customerName: string
  customerEmail: string
  orderId: string
  orderItems: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  shippingAddress: string
}

export function generateOrderConfirmationEmail(data: OrderEmailData): string {
  const itemsHtml = data.orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin: 0;">Order Confirmation</h1>
        <p style="margin: 10px 0 0 0; color: #666;">Thank you for your order!</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Order Details</h2>
        <p><strong>Order ID:</strong> #${data.orderId.slice(-8)}</p>
        <p><strong>Customer:</strong> ${data.customerName}</p>
        <p><strong>Email:</strong> ${data.customerEmail}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #333;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
              <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6;">Quantity</th>
              <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #333;">Shipping Address</h3>
        <p style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 10px 0;">${data.shippingAddress}</p>
      </div>

      <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px; text-align: center;">
        <h3 style="margin: 0 0 10px 0;">Total Amount: $${data.totalAmount.toFixed(2)}</h3>
        <p style="margin: 0; opacity: 0.9;">We'll send you a shipping confirmation once your order is on its way.</p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
        <p>Thank you for shopping with us!</p>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </body>
    </html>
  `
}

// Mock email sending function (in production, integrate with a service like Resend, SendGrid, etc.)
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    // In a real application, you would integrate with an email service
    console.log("📧 Order confirmation email would be sent to:", data.customerEmail)
    console.log("Email content:", generateOrderConfirmationEmail(data))

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}
