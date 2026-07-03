import axios from 'axios';
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url');
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': new URL(url).origin
      }
    });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', url.includes('.m3u8') ? 'application/vnd.apple.mpegurl' : response.headers['content-type']);
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send('Proxy Error: ' + error.message);
  }
}
