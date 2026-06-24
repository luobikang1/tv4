interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const data = await context.request.json();
  const { userId, type, content } = data as any;

  if (!DB) {
    return new Response('Database connection failed', { status: 500 });
  }

  try {
    await DB.prepare(
      'INSERT OR REPLACE INTO user_data (userId, type, content, updatedAt) VALUES (?, ?, ?, ?)'
    )
      .bind(userId, type, JSON.stringify(content), Date.now())
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response('Sync error: ' + error.message, { status: 500 });
  }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  const url = new URL(context.request.url);
  const userId = url.searchParams.get('userId');
  const type = url.searchParams.get('type');

  if (!DB) {
    return new Response('Database connection failed', { status: 500 });
  }

  try {
    const result = await DB.prepare(
      'SELECT content FROM user_data WHERE userId = ? AND type = ?'
    )
      .bind(userId, type)
      .first();

    return new Response(JSON.stringify(result || { content: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response('Fetch error: ' + error.message, { status: 500 });
  }
};
