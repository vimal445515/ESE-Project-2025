export function salesReportHtml(salesReportData, orders) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sales Report</title>

  <!-- Bootstrap CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f5f6fa;
    }
    .kpi-card {
      border-radius: 10px;
      padding: 15px;
      background: #fff;
      margin-bottom: 15px;
    }
    table th, table td {
      font-size: 12px;
      padding: 8px;
    }
  </style>
</head>

<body class="p-4">

  <!-- SUMMARY SECTION -->
  <h3 class="mb-3">Sales Summary</h3>

  <div class="row mb-4">
    <div class="col">
      <div class="kpi-card">
        <strong>Total Orders</strong><br>
        ${salesReportData[0]?.totalOrder||0}
      </div>
    </div>

    <div class="col">
      <div class="kpi-card">
        <strong>Total Revenue</strong><br>
        ₹${salesReportData[0]?.netSales.toLocaleString('en-IN')||0}
      </div>
    </div>

    <div class="col">
      <div class="kpi-card">
        <strong>Total Discount</strong><br>
        ₹${salesReportData[0]?.overalDiscountAmount.toLocaleString('en-IN')||0}
      </div>
    </div>
  </div>

  <!-- TABLE SECTION -->
  <h4 class="mb-2">Order Details</h4>

  <table class="table table-bordered table-striped">
    <thead>
      <tr>
        <th>Date</th>
        <th>Order ID</th>
        <th>Customer</th>
        <th>Sub Total</th>
        <th>Discount</th>
        <th>Coupon</th>
        <th>Tax(GST)</th>
        <th>Final Amount</th>
      </tr>
    </thead>

    <tbody>
      ${ 
        orders?.map(order => `
        <tr>
          <td>${new Date(order?.createdAt).toISOString().slice(0, 10)}</td>
          <td>${order.orderId}</td>
          <td>${order.user[0].userName}</td>
          <td>₹${Math.floor(order.pricing.subTotal).toLocaleString('en-IN')}</td>
          <td>-₹${Math.floor(order.pricing.offerDiscount).toLocaleString('en-IN')}</td>
          <td>-₹${Math.floor(order.pricing.couponDiscount).toLocaleString('en-IN')}</td>
          <td>+₹${Math.floor(order.pricing.tax).toLocaleString('en-IN')}</td>
          <td><strong>₹${Math.floor(order.pricing.totalAmount).toLocaleString('en-IN')}</strong></td>
        </tr>
      `).join("")
      }
    </tbody>
  </table>

</body>
</html>`;
}
