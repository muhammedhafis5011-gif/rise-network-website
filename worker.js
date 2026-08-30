export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API: Get players
    if (url.pathname === "/api/admin/players" && request.method === "GET") {
      const auth = request.headers.get("Authorization");

      if (!auth || auth !== `Bearer ${env.ADMIN_PASSWORD}`) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const result = await env.DB
        .prepare("SELECT * FROM players ORDER BY id DESC")
        .all();

      return Response.json(result.results);
    }

    // API: Add player
    if (url.pathname === "/api/admin/players" && request.method === "POST") {
      const auth = request.headers.get("Authorization");

      if (!auth || auth !== `Bearer ${env.ADMIN_PASSWORD}`) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

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
        success: true,
        message: "Player added"
      });
    }

    // API: Delete player
    if (
      url.pathname.startsWith("/api/admin/players/") &&
      request.method === "DELETE"
    ) {
      const auth = request.headers.get("Authorization");

      if (!auth || auth !== `Bearer ${env.ADMIN_PASSWORD}`) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const id = url.pathname.split("/").pop();

      await env.DB
        .prepare("DELETE FROM players WHERE id = ?")
        .bind(id)
        .run();

      return Response.json({
        success: true,
        message: "Player deleted"
      });
    }

    // Serve index.html / admin.html and other files
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};
