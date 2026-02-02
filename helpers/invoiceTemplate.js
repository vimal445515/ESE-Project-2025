export function invoiceHTML(order) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice</title>
  <style>
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      background: #f4f6f8;
      padding: 30px;
      color: #333;
    }

    .invoice-box {
      max-width: 900px;
      margin: auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 35px;
    }

    .header h1 {
      margin: 0;
      color: #0d6efd;
      font-size: 32px;
    }

    .company-details {
      text-align: right;
      font-size: 14px;
      line-height: 1.6;
    }

    .badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      background: #e7f1ff;
      color: #0d6efd;
      margin-top: 8px;
    }

    .section {
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 6px;
    }

    .two-column {
      display: flex;
      justify-content: space-between;
      gap: 40px;
      font-size: 14px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    table thead th {
      background: #0d6efd;
      color: #ffffff;
      padding: 12px;
      text-align: left;
    }

    table tbody td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }

    .text-right {
      text-align: right;
    }

    .summary {
      width: 320px;
      margin-left: auto;
      margin-top: 20px;
    }

    .summary table td {
      padding: 10px;
    }

    .summary .total-row td {
      font-weight: bold;
      font-size: 16px;
      border-top: 2px solid #333;
    }

    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 13px;
      color: #6c757d;
    }
  </style>
</head>

<body>
  <div class="invoice-box">

    <!-- HEADER -->
    <div class="header">
      <div>
        <h1>INVOICE</h1>
        <p>
          <strong>Order ID:</strong> ${order.orderId}<br />
          <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div class="company-details">
        <strong>SES Pvt Ltd</strong><br />
        Kerala, India<br />
        eseproject2025@gmail.com<br />
      </div>
    </div>

    <!-- BILL TO & PAYMENT -->
    <div class="section">
      <div class="two-column">
        <div>
          <div class="section-title">Bill To</div>
          <p>
            <strong>${order.address.userName}</strong><br />
            ${order.address?.companyName||''}<br />
            ${order.address.address}<br />
            ${order.address.district}, ${order.address.state} - ${order.address.pinCode}<br />
            ${order.address.country}<br />
            Phone: ${order.address.phoneNumber||""}<br />
            Email: ${order.address.email}
          </p>
        </div>

        <div>
          <div class="section-title">Payment Details</div>
          <p>
            <strong>Method:</strong> ${order.payment.method.toUpperCase()}<br />
            <strong>Status:</strong> ${order.orderStatus.toUpperCase()}
          </p>
        </div>
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <div class="section">
      <div class="section-title">Order Items</div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Price</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.productName}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">₹${(item.price).toFixed(2)}</td>
              <td class="text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <!-- PRICE SUMMARY -->
    <div class="summary">
      <table>
       <tr>
          <td>SubTotal</td>
          <td class="text-right">₹${(order.pricing.subTotal).toFixed(2)} (Before discount)</td>
        </tr>
        <tr>
          <td>Discount</td>
          <td class="text-right">₹${(order.pricing.discount).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Tax</td>
          <td class="text-right">₹${(order.pricing.tax).toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td>Total Amount</td>
          <td class="text-right">₹${(order.pricing.totalAmount).toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div style="clear: both;"></div>

    <!-- FOOTER -->
    <div class="footer">
      Thank you for shopping with us 💙 <br />
    </div>

  </div>
</body>
</html>
`;
}
