export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  // Basic validation to prevent arbitrary protocol usage, though fetch usually handles this
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    return new Response('Invalid protocol', { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': new URL(targetUrl).origin,
      },
    });

    // Create a new response to modify headers
    const { readable, writable } = new TransformStream();
    response.body?.pipeTo(writable);

    const newResponse = new Response(readable, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers)
    });

    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, User-Agent');

    // Remove security headers that might prevent embedding
    newResponse.headers.delete('X-Frame-Options');
    newResponse.headers.delete('Content-Security-Policy');

    return newResponse;
  } catch (error: any) {
    return new Response('Proxy error: ' + error.message, { status: 500 });
  }
};
