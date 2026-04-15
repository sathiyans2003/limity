const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PRO_AMOUNT = 100; // ₹1 for testing (100 paise)

// @POST /api/payment/create-order
const createOrder = async (req, res) => {
  try {
    const options = {
      amount: PRO_AMOUNT,
      currency: 'INR',
      receipt: `limitly_${req.user.id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save order to DB
    await db.query(
      'INSERT INTO payment_orders (user_id, razorpay_order_id, amount) VALUES (?, ?, ?)',
      [req.user.id, order.id, PRO_AMOUNT]
    );

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      user: { name: req.user.name, email: req.user.email },
      amount: PRO_AMOUNT,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Payment initiation failed.' });
  }
};

// @POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Update payment order
    await db.query(
      'UPDATE payment_orders SET razorpay_payment_id = ?, status = ? WHERE razorpay_order_id = ?',
      [razorpay_payment_id, 'paid', razorpay_order_id]
    );

    // Upgrade user to Pro and set expiry (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.query(
      'UPDATE users SET plan = ?, razorpay_subscription_id = ?, plan_expires_at = ? WHERE id = ?',
      ['pro', razorpay_payment_id, expiresAt, req.user.id]
    );

    res.json({
      success: true,
      message: '🎉 Payment successful! You are now on Pro plan!',
      plan: 'pro',
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Payment verification error.' });
  }
};

// @GET /api/payment/status
const getPaymentStatus = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT plan FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, plan: rows[0].plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentStatus };
