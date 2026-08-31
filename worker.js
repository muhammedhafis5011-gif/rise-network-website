export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // -----------------------------
    // HEALTH CHECK
    // -----------------------------
    if (url.pathname === "/") {
      return json({
        success: true,
        message: "RISE NETWORK API is online"
      }, corsHeaders);
    }

    // -----------------------------
    // ADMIN LOGIN
    // -----------------------------
    if (url.pathname === "/api/login" && request.method === "POST") {
      try {
        const body = await request.json();

        if (!body.password) {
          return json({
            success: false,
            message: "Password required"
          }, corsHeaders, 400);
        }

        if (body.password !== env.ADMIN_PASSWORD) {
          return json({
            success: false,
            message: "Wrong password"
          }, corsHeaders, 401);
        }

        return json({
          success: true,
          message: "Login successful"
        }, corsHeaders);

      } catch {
        return json({
          success: false,
          message: "Invalid request"
        }, corsHeaders, 400);
      }
    }

    // -----------------------------
    // GET ANNOUNCEMENTS
    // -----------------------------
    if (url.pathname === "/api/announcements" && request.method === "GET") {
      const data = await env.RISE_KV.get("announcements", "json");

      return json({
        success: true,
        announcements: data || []
      }, corsHeaders);
    }

    // -----------------------------
    // CREATE ANNOUNCEMENT
    // -----------------------------
    if (url.pathname === "/api/announcements" && request.method === "POST") {
      try {
        const body = await request.json();

        if (body.password !== env.ADMIN_PASSWORD) {
          return json({
            success: false,
            message: "Unauthorized"
          }, corsHeaders, 401);
        }

        if (!body.title || !body.message) {
          return json({
            success: false,
            message: "Title and message are required"
          }, corsHeaders, 400);
        }

        const announcements =
          await env.RISE_KV.get("announcements", "json") || [];

        const announcement = {
          id: crypto.randomUUID(),
          title: String(body.title),
          message: String(body.message),
          type: body.type || "General",
          author: body.author || "RISE NETWORK",
          createdAt: new Date().toISOString()
        };

        announcements.unshift(announcement);

        await env.RISE_KV.put(
          "announcements",
          JSON.stringify(announcements)
        );

        return json({
          success: true,
          message: "Announcement created",
          announcement
        }, corsHeaders);

      } catch {
        return json({
          success: false,
          message: "Invalid request"
        }, corsHeaders, 400);
      }
    }

    // -----------------------------
    // DELETE ANNOUNCEMENT
    // -----------------------------
    if (url.pathname.startsWith("/api/announcements/") &&
        request.method === "DELETE") {

      try {
        const body = await request.json();

        if (body.password !== env.ADMIN_PASSWORD) {
          return json({
            success: false,
            message: "Unauthorized"
          }, corsHeaders, 401);
        }

        const id = url.pathname.split("/").pop();

        let announcements =
          await env.RISE_KV.get("announcements", "json") || [];

        const oldLength = announcements.length;

        announcements = announcements.filter(
          item => item.id !== id
        );

        if (announcements.length === oldLength) {
          return json({
            success: false,
            message: "Announcement not found"
          }, corsHeaders, 404);
        }

        await env.RISE_KV.put(
          "announcements",
          JSON.stringify(announcements)
        );

        return json({
          success: true,
          message: "Announcement deleted"
        }, corsHeaders);

      } catch {
        return json({
          success: false,
          message: "Invalid request"
        }, corsHeaders, 400);
      }
    }

    // -----------------------------
    // STAFF
    // -----------------------------
    if (url.pathname === "/api/staff" && request.method === "GET") {
      const staff = await env.RISE_KV.get("staff", "json");

      return json({
        success: true,
        staff: staff || []
      }, corsHeaders);
    }

    // ADD STAFF
    if (url.pathname === "/api/staff" && request.method === "POST") {
      try {
        const body = await request.json();

        if (body.password !== env.ADMIN_PASSWORD) {
          return json({
            success: false,
            message: "Unauthorized"
          }, corsHeaders, 401);
        }

        if (!body.name || !body.role) {
          return json({
            success: false,
            message: "Name and role are required"
          }, corsHeaders, 400);
        }

        const staff =
          await env.RISE_KV.get("staff", "json") || [];

        const member = {
          id: crypto.randomUUID(),
          name: String(body.name),
          role: String(body.role),
          createdAt: new Date().toISOString()
        };

        staff.push(member);

        await env.RISE_KV.put(
          "staff",
          JSON.stringify(staff)
        );

        return json({
          success: true,
          message: "Staff member added",
          member
        }, corsHeaders);

      } catch {
        return json({
          success: false,
          message: "Invalid request"
        }, corsHeaders, 400);
      }
    }

    // DELETE STAFF
    if (url.pathname.startsWith("/api/staff/") &&
        request.method === "DELETE") {

      try {
        const body = await request.json();

        if (body.password !== env.ADMIN_PASSWORD) {
          return json({
            success: false,
            message: "Unauthorized"
          }, corsHeaders, 401);
        }

        const id = url.pathname.split("/").pop();

        let staff =
          await env.RISE_KV.get("staff", "json") || [];

        const oldLength = staff.length;

        staff = staff.filter(
          member => member.id !== id
        );

        if (staff.length === oldLength) {
          return json({
            success: false,
            message: "Staff member not found"
          }, corsHeaders, 404);
        }

        await env.RISE_KV.put(
          "staff",
          JSON.stringify(staff)
        );

        return json({
          success: true,
          message: "Staff member removed"
        }, corsHeaders);

      } catch {
        return json({
          success: false,
          message: "Invalid request"
        }, corsHeaders, 400);
      }
    }

    // -----------------------------
    // SERVER STATUS
    // -----------------------------
    if (url.pathname === "/api/status" && request.method === "GET") {
      return json({
        success: true,
        online: true,
        server: "risesmp.online",
        java: true,
        bedrock: true,
        port: 25890
      }, corsHeaders);
    }

    // -----------------------------
    // 404
    // -----------------------------
    return json({
      success: false,
      message: "API endpoint not found"
    }, corsHeaders, 404);
  }
};


// JSON RESPONSE HELPER
function json(data, corsHeaders, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}
