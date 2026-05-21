const express = require('express');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/* ── Daraja Sandbox Credentials ─────────────────────────────────────────
   Register at https://developer.safaricom.co.ke → My Apps → Create App
   Make sure the app has the "Lipa Na M-Pesa Sandbox" product enabled.
   ──────────────────────────────────────────────────────────────────── */
const CONSUMER_KEY    = process.env.DARAJA_KEY    || 's07ABPX0NREOOp7olGWKY82BEhxQdT9VGyxG4uqtslcQxr1h';
const CONSUMER_SECRET = process.env.DARAJA_SECRET || 'oMjNO3Cp5tnjLUBznKqzmdU7RnAHam31w0wzvtrH33M68XXRyDd6Ddg4BfctDr95';

/* Sandbox test shortcode + passkey (Safaricom-provided, do not change) */
const SHORTCODE = '174379';
const PASSKEY   = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

/* Use https://webhook.site to get a free test callback URL */
const CALLBACK_URL = process.env.CALLBACK_URL || 'https://webhook.site/YOUR_UNIQUE_ID';

const BASE = 'https://sandbox.safaricom.co.ke';

/* ── Helpers ─────────────────────────────────────────────────────────── */
async function getToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res  = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token error ${res.status}: ${text}`);
  }
  const { access_token } = await res.json();
  return access_token;
}

function nowTimestamp() {
  /* YYYYMMDDHHmmss */
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

function makePassword(ts) {
  return Buffer.from(`${SHORTCODE}${PASSKEY}${ts}`).toString('base64');
}

/* ── STK Push ────────────────────────────────────────────────────────── */
app.post('/api/stkpush', async (req, res) => {
  const { phone, amount, accountRef = 'Onyxhawk' } = req.body;
  if (!phone || !amount) {
    return res.status(400).json({ error: 'phone and amount are required' });
  }
  try {
    const token = await getToken();
    const ts    = nowTimestamp();
    const body  = {
      BusinessShortCode: SHORTCODE,
      Password:          makePassword(ts),
      Timestamp:         ts,
      TransactionType:   'CustomerPayBillOnline',
      Amount:            Math.ceil(Number(amount)),
      PartyA:            phone,
      PartyB:            SHORTCODE,
      PhoneNumber:       phone,
      CallBackURL:       CALLBACK_URL,
      AccountReference:  accountRef,
      TransactionDesc:   'Onyxhawk Cleaning Service',
    };
    const result = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await result.json();
    console.log('STK push response:', data);
    res.json(data);
  } catch (err) {
    console.error('STK push error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── STK Push Status Query ───────────────────────────────────────────── */
app.post('/api/stkquery', async (req, res) => {
  const { checkoutRequestId } = req.body;
  if (!checkoutRequestId) {
    return res.status(400).json({ error: 'checkoutRequestId is required' });
  }
  try {
    const token = await getToken();
    const ts    = nowTimestamp();
    const body  = {
      BusinessShortCode: SHORTCODE,
      Password:          makePassword(ts),
      Timestamp:         ts,
      CheckoutRequestID: checkoutRequestId,
    };
    const result = await fetch(`${BASE}/mpesa/stkpushquery/v1/query`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await result.json();
    console.log('STK query response:', data);
    res.json(data);
  } catch (err) {
    console.error('STK query error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── M-Pesa Callback (receives payment result) ───────────────────────── */
app.post('/api/callback', (req, res) => {
  const body = req.body?.Body?.stkCallback;
  if (body) {
    const { ResultCode, ResultDesc, CheckoutRequestID } = body;
    console.log(`Callback — [${CheckoutRequestID}] code=${ResultCode} desc="${ResultDesc}"`);
    if (ResultCode === 0) {
      const items = body.CallbackMetadata?.Item || [];
      const get   = (name) => items.find(i => i.Name === name)?.Value;
      console.log(`  Amount: ${get('Amount')}, Receipt: ${get('MpesaReceiptNumber')}, Phone: ${get('PhoneNumber')}`);
    }
  }
  res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Daraja proxy running → http://localhost:${PORT}`);
  console.log(`Using shortcode: ${SHORTCODE} (sandbox)`);
});
