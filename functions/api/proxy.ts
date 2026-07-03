export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url');
  if (!targetUrl) return new Response('Missing url', { status: 400 });

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': new URL(targetUrl).origin,
      },
      redirect: 'follow',
    });

    const { readable, writable } = new TransformStream();
    response.body?.pipeTo(writable);

    const newResponse = new Response(readable, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers)
    });

    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', '*');
    newResponse.headers.delete('X-Frame-Options');
    newResponse.headers.delete('Content-Security-Policy');
    newResponse.headers.delete('Content-Type'); // Let browser infer or set it correctly

    // For M3U8 files, we might need to ensure the correct content-type if the source is wrong
    if (targetUrl.includes('.m3u8')) {
      newResponse.headers.set('Content-Type', 'application/vnd.apple.mpegurl');
    }

    return newResponse;
  } catch (error: any) {
    return new Response('Proxy Error: ' + error.message, { status: 500 });
  }
};
