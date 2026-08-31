export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================
    // ADMIN LOGIN
    // =========================
    if (
      url.pathname === "/api/admin/login" &&
      request.method === "POST"
    ) {
      const data = await request.json();

      if (data.password === env.ADMIN_PASSWORD) {
        return Response.json({ success: true });
      }

      return Response.json(
        { success: false },
        { status: 401 }
      );
    }

    // =========================
    // ADMIN AUTH CHECK
    // =========================
    function isAdmin(request) {
      const auth = request.headers.get("Authorization");

      return auth === `Bearer ${env.ADMIN_PASSWORD}`;
    }

    // =========================
    // GET ANNOUNCEMENTS
    // =========================
    if (
      url.pathname === "/api/announcements" &&
      request.method === "GET"
    ) {
      const result = await env.DB
        .prepare(`
          SELECT *
          FROM announcements
          ORDER BY id DESC
        `)
        .all();

      return Response.json(result.results);
    }

    // =========================
    // ADD ANNOUNCEMENT
    // =========================
    if (
      url.pathname === "/api/admin/announcements" &&
      request.method === "POST"
    ) {
      if (!isAdmin(request)) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const data = await request.json();

      if (!data.title || !data.message) {
        return Response.json(
          { error: "Title and message are required" },
          { status: 400 }
        );
      }

      await env.DB
        .prepare(`
          INSERT INTO announcements
          (title, message)
          VALUES (?, ?)
        `)
        .bind(
          data.title,
          data.message
        )
        .run();

      return Response.json({
        success: true
      });
    }

    // =========================
    // DELETE ANNOUNCEMENT
    // =========================
    if (
      url.pathname.startsWith(
        "/api/admin/announcements/"
      ) &&
      request.method === "DELETE"
    ) {
      if (!isAdmin(request)) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const id =
        url.pathname.split("/").pop();

      await env.DB
        .prepare(`
          DELETE FROM announcements
          WHERE id = ?
        `)
        .bind(id)
        .run();

      return Response.json({
        success: true
      });
    }

    // =========================
    // ADMIN PAGE
    // =========================
    if (url.pathname === "/admin.html") {
      return env.ASSETS.fetch(request);
    }

    // =========================
    // WEBSITE
    // =========================
    return env.ASSETS.fetch(request);
  }
};
