export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ADMIN LOGIN
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

    // GET PLAYERS
    if (
      url.pathname === "/api/admin/players" &&
      request.method === "GET"
    ) {
      const result = await env.DB
        .prepare(
          "SELECT * FROM players ORDER BY points DESC"
        )
        .all();

      return Response.json(result.results);
    }

    // ADD PLAYER
    if (
      url.pathname === "/api/admin/players" &&
      request.method === "POST"
    ) {
      const data = await request.json();

      if (!data.name) {
        return Response.json(
          { error: "Player name required" },
          { status: 400 }
        );
      }

      await env.DB
        .prepare(
          "INSERT INTO players (name, points, wins) VALUES (?, ?, ?)"
        )
        .bind(
          data.name,
          Number(data.points || 0),
          Number(data.wins || 0)
        )
        .run();

      return Response.json({
        success: true
      });
    }

    // DELETE PLAYER
    if (
      url.pathname.startsWith("/api/admin/players/") &&
      request.method === "DELETE"
    ) {
      const id = url.pathname.split("/").pop();

      await env.DB
        .prepare(
          "DELETE FROM players WHERE id = ?"
        )
        .bind(id)
        .run();

      return Response.json({
        success: true
      });
    }

    // ADMIN PAGE
    if (url.pathname === "/admin.html") {
      return env.ASSETS.fetch(request);
    }

    // WEBSITE
    return env.ASSETS.fetch(request);
  }
};
