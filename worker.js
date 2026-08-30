export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Home
    if (url.pathname === "/") {
      return new Response("RISE NETWORK API is running!", {
        headers: { "Content-Type": "text/plain" }
      });
    }

    // Admin API - get all players
    if (url.pathname === "/api/admin/players" && request.method === "GET") {
      const auth = request.headers.get("Authorization");

      if (!auth || auth !== `Bearer ${env.ADMIN_PASSWORD}`) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const result = await env.DB
        .prepare("SELECT * FROM players ORDER BY id DESC")
        .all();

      return Response.json(result.results);
    }

    // Add player
    if (url.pathname === "/api/admin/players" && request.method === "POST") {
      const auth = request.headers.get("Authorization");

      if (!auth || auth !== `Bearer ${env.ADMIN_PASSWORD}`) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
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

    // Delete player
    if (url.pathname.startsWith("/api/admin/players/") && request.method === "DELETE") {
      const auth = request.headers.get("Authorization");

      if (!auth || auth !== `Bearer ${env.ADMIN_PASSWORD}`) {
        return Response.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
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

    return Response.json(
      { error: "Not found" },
      { status: 404 }
    );
  }
};
