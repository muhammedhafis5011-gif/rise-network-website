export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Admin login API
    if (url.pathname === "/api/admin/login" && request.method === "POST") {
      try {
        const body = await request.json();

        if (body.password !== env.ADMIN_PASSWORD) {
          return Response.json(
            { success: false, message: "Wrong password" },
            { status: 401 }
          );
        }

        return Response.json({
          success: true,
          message: "Login successful"
        });
      } catch {
        return Response.json(
          { success: false, message: "Invalid request" },
          { status: 400 }
        );
      }
    }

    // Serve admin.html
    if (url.pathname === "/admin.html") {
      return env.ASSETS.fetch(
        new Request(new URL("/admin.html", request.url))
      );
    }

    // Serve normal website
    return env.ASSETS.fetch(request);
  }
};
