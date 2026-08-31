export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Admin login
    if (url.pathname === "/api/admin/login" && request.method === "POST") {
      const data = await request.json();

      if (data.password === env.ADMIN_PASSWORD) {
        return Response.json({ success: true });
      }

      return Response.json(
        { success: false },
        { status: 401 }
      );
    }

    // Admin page
    if (url.pathname === "/admin.html") {
      return env.ASSETS.fetch(request);
    }

    // Main website + other files
    return env.ASSETS.fetch(request);
  }
};
