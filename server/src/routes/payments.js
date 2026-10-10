import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { parseUpi } from '../services/upi.js';

const router = Router();
router.use(requireAuth);

// Validates a scanned QR. SpendWise never moves money itself: the payment is completed
// in the user's own UPI app (GPay, PhonePe, Paytm...) and SpendWise records it afterwards.
router.post('/parse', (req, res) => {
  const parsed = parseUpi(req.body.qr);
  if (!parsed) return res.status(400).json({ error: 'This QR is not a supported UPI payment code.' });
  res.json({ payee: parsed });
});

export default router;
