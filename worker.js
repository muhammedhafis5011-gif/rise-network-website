export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // TEMPORARY ADMIN SECRET TEST
    if (
      url.pathname === "/api/admin/login" &&
      request.method === "POST"
    ) {
      return Response.json({
        secretFound: !!env.ADMIN_PASSWORD,
        secretLength: env.ADMIN_PASSWORD
          ? env.ADMIN_PASSWORD.length
          : 0
      });
    }

    // Serve admin.html
    if (url.pathname === "/admin.html") {
      return env.ASSETS.fetch(
        new Request(
          new URL("/admin.html", request.url)
        )
      );
    }

    // Serve the website
    return env.ASSETS.fetch(request);
  }
};
