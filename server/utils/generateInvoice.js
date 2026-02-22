/**
 * Invoice Generation Utility
 *
 * Generates a printable HTML invoice for LinkVerse Pro subscription payments.
 * Styled with inline CSS for consistent rendering across browsers
 * and when opened in a new tab for printing.
 */

/**
 * Generate an HTML invoice string for a payment
 *
 * @param {Object} paymentData - Payment details
 * @param {string} paymentData.invoiceNumber - Invoice number (e.g., "LV-2024-00001")
 * @param {number} paymentData.amount - Amount in paise (e.g., 4900)
 * @param {string} paymentData.transactionId - Razorpay payment ID
 * @param {string} paymentData.orderId - Razorpay order ID
 * @param {string} paymentData.method - Payment method (upi, card, etc.)
 * @param {string} paymentData.planType - "monthly" or "yearly"
 * @param {Date|string} paymentData.date - Payment date
 * @param {string} paymentData.status - Payment status
 *
 * @param {Object} userData - Customer details
 * @param {string} userData.fullName - Customer name
 * @param {string} userData.email - Customer email
 * @param {string} [userData.phone] - Customer phone
 * @param {string} [userData.username] - Customer username
 * @param {string} [userData.city] - Customer city
 * @param {string} [userData.state] - Customer state
 *
 * @returns {string} Complete HTML string for the invoice
 */
const generateInvoice = (paymentData, userData) => {
  // Amount calculations
  const totalInRupees = paymentData.amount / 100;
  const gstRate = 18;
  const subtotal = (totalInRupees / (1 + gstRate / 100)).toFixed(2);
  const gstAmount = (totalInRupees - parseFloat(subtotal)).toFixed(2);

  // Format date
  const paymentDate = new Date(paymentData.date);
  const formattedDate = paymentDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Plan details
  const isYearly = paymentData.planType === 'yearly';
  const planLabel = isYearly ? 'Yearly' : 'Monthly';
  const planDescription = isYearly
    ? 'LinkVerse Pro — Yearly Subscription (12 months)'
    : 'LinkVerse Pro — Monthly Subscription';

  // Payment method display
  const methodMap = {
    upi: 'UPI',
    card: 'Credit/Debit Card',
    netbanking: 'Net Banking',
    wallet: 'Wallet',
    emi: 'EMI',
    paylater: 'Pay Later',
    bank_transfer: 'Bank Transfer',
    mock: 'Demo Payment',
    online: 'Online Payment',
  };
  const paymentMethod =
    methodMap[paymentData.method] || paymentData.method || 'Online Payment';

  // Customer address
  const addressParts = [userData.city, userData.state].filter(Boolean);
  const customerAddress = addressParts.length > 0 ? addressParts.join(', ') : '';

  // Status styling
  const statusClass =
    paymentData.status === 'captured'
      ? 'status-captured'
      : paymentData.status === 'refunded'
      ? 'status-refunded'
      : paymentData.status === 'failed'
      ? 'status-failed'
      : 'status-captured';

  const statusLabel =
    paymentData.status === 'captured' ? 'PAID' : (paymentData.status || 'PAID').toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${paymentData.invoiceNumber} — LinkVerse</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333333;
      background: #f5f5f5;
      padding: 20px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }
    .invoice-header {
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      color: #ffffff;
      padding: 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .company-info h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }
    .company-info p {
      font-size: 13px;
      opacity: 0.9;
      line-height: 1.6;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h2 {
      font-size: 32px;
      font-weight: 300;
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-bottom: 8px;
    }
    .invoice-title p {
      font-size: 14px;
      opacity: 0.9;
    }
    .invoice-body {
      padding: 40px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      gap: 20px;
    }
    .info-box {
      flex: 1;
    }
    .info-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #6366f1;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .info-box p {
      font-size: 14px;
      color: #555555;
      line-height: 1.8;
    }
    .info-box p strong {
      color: #333333;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table thead th {
      background: #f8f9fa;
      padding: 14px 16px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #666666;
      font-weight: 600;
      border-bottom: 2px solid #e9ecef;
    }
    .items-table thead th:last-child {
      text-align: right;
    }
    .items-table tbody td {
      padding: 16px;
      font-size: 14px;
      color: #555555;
      border-bottom: 1px solid #f0f0f0;
    }
    .items-table tbody td:last-child {
      text-align: right;
      font-weight: 500;
    }
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    .totals-table {
      width: 300px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      color: #666666;
    }
    .totals-row.total {
      border-top: 2px solid #6366f1;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 700;
      color: #333333;
    }
    .totals-row .label { color: #888888; }
    .totals-row.total .label { color: #333333; }
    .payment-info {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .payment-info h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #6366f1;
      margin-bottom: 12px;
      font-weight: 600;
    }
    .payment-info-grid {
      display: flex;
      gap: 30px;
      flex-wrap: wrap;
    }
    .payment-info-item { font-size: 13px; }
    .payment-info-item .label { color: #888888; margin-bottom: 2px; }
    .payment-info-item .value { color: #333333; font-weight: 500; }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-captured { background: #d1fae5; color: #065f46; }
    .status-failed { background: #fee2e2; color: #991b1b; }
    .status-refunded { background: #dbeafe; color: #1e40af; }
    .invoice-footer {
      padding: 30px 40px;
      background: #fafafa;
      border-top: 1px solid #f0f0f0;
      text-align: center;
    }
    .invoice-footer p {
      font-size: 12px;
      color: #999999;
      line-height: 1.8;
    }
    .invoice-footer .brand {
      color: #6366f1;
      font-weight: 600;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-container { box-shadow: none; border-radius: 0; }
      .invoice-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    .print-button {
      display: block;
      max-width: 800px;
      margin: 20px auto;
      text-align: right;
    }
    .print-button button {
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      font-weight: 500;
    }
    .print-button button:hover { background: #4f46e5; }
    @media (max-width: 600px) {
      .invoice-header { flex-direction: column; gap: 20px; padding: 24px; }
      .invoice-title { text-align: left; }
      .info-row { flex-direction: column; gap: 20px; }
      .invoice-body { padding: 24px; }
      .payment-info-grid { flex-direction: column; gap: 12px; }
    }
  </style>
</head>
<body>
  <div class="print-button no-print">
    <button onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="invoice-container">
    <div class="invoice-header">
      <div class="company-info">
        <h1>LinkVerse</h1>
        <p>LinkVerse Technologies Pvt. Ltd.</p>
        <p>Mumbai, Maharashtra, India</p>
        <p>GSTIN: XXXXXXXXXXXXXXXXXXXX</p>
        <p>Email: billing@linkverse.com</p>
      </div>
      <div class="invoice-title">
        <h2>Invoice</h2>
        <p><strong>${paymentData.invoiceNumber}</strong></p>
        <p>${formattedDate}</p>
      </div>
    </div>

    <div class="invoice-body">
      <div class="info-row">
        <div class="info-box">
          <h3>Bill To</h3>
          <p><strong>${userData.fullName}</strong></p>
          <p>${userData.email}</p>
          ${userData.phone ? `<p>+91 ${userData.phone}</p>` : ''}
          ${customerAddress ? `<p>${customerAddress}</p>` : ''}
          ${userData.username ? `<p>@${userData.username}</p>` : ''}
        </div>
        <div class="info-box">
          <h3>Invoice Details</h3>
          <p><strong>Invoice No:</strong> ${paymentData.invoiceNumber}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Status:</strong>
            <span class="status-badge ${statusClass}">${statusLabel}</span>
          </p>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Period</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${planDescription}</strong><br>
              <span style="font-size: 12px; color: #888;">Unlimited links, custom themes, analytics, SEO, priority support</span>
            </td>
            <td>${planLabel}</td>
            <td>1</td>
            <td>₹${subtotal}</td>
          </tr>
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals-table">
          <div class="totals-row">
            <span class="label">Subtotal</span>
            <span>₹${subtotal}</span>
          </div>
          <div class="totals-row">
            <span class="label">GST @ ${gstRate}%</span>
            <span>₹${gstAmount}</span>
          </div>
          <div class="totals-row total">
            <span class="label">Total</span>
            <span>₹${totalInRupees.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="payment-info">
        <h3>Payment Information</h3>
        <div class="payment-info-grid">
          <div class="payment-info-item">
            <div class="label">Payment Method</div>
            <div class="value">${paymentMethod}</div>
          </div>
          <div class="payment-info-item">
            <div class="label">Transaction ID</div>
            <div class="value" style="font-family: monospace; font-size: 12px;">${paymentData.transactionId || 'N/A'}</div>
          </div>
          <div class="payment-info-item">
            <div class="label">Order ID</div>
            <div class="value" style="font-family: monospace; font-size: 12px;">${paymentData.orderId || 'N/A'}</div>
          </div>
          <div class="payment-info-item">
            <div class="label">Payment Date</div>
            <div class="value">${formattedDate}</div>
          </div>
          <div class="payment-info-item">
            <div class="label">Currency</div>
            <div class="value">INR (₹)</div>
          </div>
        </div>
      </div>
    </div>

    <div class="invoice-footer">
      <p>This is a computer-generated invoice and does not require a signature.</p>
      <p>For any queries regarding this invoice, please contact <strong>billing@linkverse.com</strong></p>
      <p style="margin-top: 12px;">
        <span class="brand">LinkVerse</span> — Ek Link, Sabke Liye! | Made with ❤️ in India 🇮🇳
      </p>
      <p>© ${new Date().getFullYear()} LinkVerse Technologies Pvt. Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`.trim();
};

module.exports = { generateInvoice };