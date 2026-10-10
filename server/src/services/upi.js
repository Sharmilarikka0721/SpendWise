// Parses UPI payment QR codes / links, e.g.
// upi://pay?pa=shop@okbank&pn=Chai%20Point&am=50&cu=INR&tn=Tea
export function parseUpi(raw) {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!/^upi:\/\/pay\?/i.test(value)) return null;
  let params;
  try { params = new URL(value.replace(/^upi:\/\//i, 'https://upi.local/')).searchParams; } catch { return null; }
  const pa = params.get('pa');
  if (!pa || !/^[\w.\-]{2,256}@[\w.\-]{2,64}$/.test(pa)) return null;
  const am = params.get('am');
  const amount = am && Number(am) > 0 ? Number(am) : null;
  const cur = params.get('cu');
  if (cur && cur.toUpperCase() !== 'INR') return null;
  return {
    upiId: pa,
    payeeName: (params.get('pn') || '').slice(0, 80) || pa,
    amount,
    note: (params.get('tn') || '').slice(0, 80),
    link: value
  };
}
