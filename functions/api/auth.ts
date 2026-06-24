export const onRequestPost: PagesFunction<{ PASSWORD?: string }> = async (context) => {
  try {
    const { password } = await context.request.json() as { password?: string };
    const correctPassword = context.env.PASSWORD || "whitefox";
    if (password === correctPassword) {
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: false, message: '密码错误' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
};
