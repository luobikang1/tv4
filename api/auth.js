export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { password } = req.body;
  const correctPassword = process.env.PASSWORD || "whitefox";
  if (password === correctPassword) {
    return res.status(200).json({ success: true });
  }
  return res.status(401).json({ success: false, message: '密码错误' });
}
