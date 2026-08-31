export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) =>
      Response.json(data, {
        status,
        headers: {
          "Cache-Control": "no-store"
        }
      });

    // =========================
    // CORS / OPTIONS
    // =========================

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }

    // =========================
    // ADMIN AUTH
    // =========================

    function isAdmin(request) {
      const auth = request.headers.get("Authorization");

      if (!auth || !env.ADMIN_PASSWORD) {
        return false;
      }

      return auth === `Bearer ${env.ADMIN_PASSWORD}`;
    }

    function unauthorized() {
      return json(
        {
          success: false,
          error: "Unauthorized"
        },
        401
      );
    }

    // =========================
    // ADMIN LOGIN
    // =========================

    if (
      url.pathname === "/api/admin/login" &&
      request.method === "POST"
    ) {
      try {
        const data = await request.json();

        if (
          !data.password ||
          data.password !== env.ADMIN_PASSWORD
        ) {
          return json(
            {
              success: false
            },
            401
          );
        }

        return json({
          success: true
        });
      } catch {
        return json(
          {
            success: false,
            error: "Invalid request"
          },
          400
        );
      }
    }

    // =====================================================
    // ANNOUNCEMENTS
    // =====================================================

    // PUBLIC - GET ANNOUNCEMENTS

    if (
      url.pathname === "/api/announcements" &&
      request.method === "GET"
    ) {
      try {
        const result = await env.DB
          .prepare(`
            SELECT
              id,
              title,
              message,
              created_at
            FROM announcements
            ORDER BY id DESC
          `)
          .all();

        return json(result.results || []);
      } catch (error) {
        return json(
          {
            error: "Failed to load announcements"
          },
          500
        );
      }
    }

    // ADMIN - CREATE ANNOUNCEMENT

    if (
      url.pathname === "/api/admin/announcements" &&
      request.method === "POST"
    ) {
      if (!isAdmin(request)) {
        return unauthorized();
      }

      try {
        const data = await request.json();

        const title = String(data.title || "").trim();
        const message = String(data.message || "").trim();

        if (!title || !message) {
          return json(
            {
              error: "Title and message are required"
            },
            400
          );
        }

        const result = await env.DB
          .prepare(`
            INSERT INTO announcements
              (title, message)
            VALUES
              (?, ?)
          `)
          .bind(title, message)
          .run();

        return json({
          success: true,
          id: result.meta?.last_row_id || null
        });
      } catch {
        return json(
          {
            error: "Failed to create announcement"
          },
          500
        );
      }
    }

    // ADMIN - DELETE ANNOUNCEMENT

    if (
      url.pathname.startsWith(
        "/api/admin/announcements/"
      ) &&
      request.method === "DELETE"
    ) {
      if (!isAdmin(request)) {
        return unauthorized();
      }

      const id = url.pathname
        .split("/")
        .pop();

      if (!/^\d+$/.test(id)) {
        return json(
          {
            error: "Invalid announcement ID"
          },
          400
        );
      }

      try {
        await env.DB
          .prepare(`
            DELETE FROM announcements
            WHERE id = ?
          `)
          .bind(id)
          .run();

        return json({
          success: true
        });
      } catch {
        return json(
          {
            error: "Failed to delete announcement"
          },
          500
        );
      }
    }

    // =====================================================
    // STAFF
    // =====================================================

    // PUBLIC - GET STAFF

    if (
      url.pathname === "/api/staff" &&
      request.method === "GET"
    ) {
      try {
        const result = await env.DB
          .prepare(`
            SELECT
              id,
              username,
              role,
              display_order,
              active
            FROM staff_members
            WHERE active = 1
            ORDER BY display_order ASC, id ASC
          `)
          .all();

        return json(result.results || []);
      } catch {
        return json(
          {
            error: "Failed to load staff"
          },
          500
        );
      }
    }

    // ADMIN - GET ALL STAFF

    if (
      url.pathname === "/api/admin/staff" &&
      request.method === "GET"
    ) {
      if (!isAdmin(request)) {
        return unauthorized();
      }

      try {
        const result = await env.DB
          .prepare(`
            SELECT
              id,
              username,
              role,
              display_order,
              active,
              created_at
            FROM staff_members
            ORDER BY display_order ASC, id ASC
          `)
          .all();

        return json(result.results || []);
      } catch {
        return json(
          {
            error: "Failed to load staff"
          },
          500
        );
      }
    }

    // ADMIN - ADD STAFF

    if (
      url.pathname === "/api/admin/staff" &&
      request.method === "POST"
    ) {
      if (!isAdmin(request)) {
        return unauthorized();
      }

      try {
        const data = await request.json();

        const username =
          String(data.username || "").trim();

        const role =
          String(data.role || "").trim();

        const displayOrder =
          Number.isFinite(Number(data.display_order))
            ? Number(data.display_order)
            : 0;

        if (!username || !role) {
          return json(
            {
              error: "Username and role are required"
            },
            400
          );
        }

        const result = await env.DB
          .prepare(`
            INSERT INTO staff_members
              (username, role, display_order, active)
            VALUES
              (?, ?, ?, 1)
          `)
          .bind(
            username,
            role,
            displayOrder
          )
          .run();

        return json({
          success: true,
          id: result.meta?.last_row_id || null
        });
      } catch {
        return json(
          {
            error: "Failed to add staff member"
          },
          500
        );
      }
    }

    // ADMIN - EDIT STAFF

    if (
      url.pathname.startsWith("/api/admin/staff/") &&
      request.method === "PUT"
    ) {
      if (!isAdmin(request)) {
        return unauthorized();
      }

      const id = url.pathname
        .split("/")
        .pop();

      if (!/^\d+$/.test(id)) {
        return json(
          {
            error: "Invalid staff ID"
          },
          400
        );
      }

      try {
        const data = await request.json();

        const username =
          String(data.username || "").trim();

        const role =
          String(data.role || "").trim();

        const displayOrder =
          Number.isFinite(Number(data.display_order))
            ? Number(data.display_order)
            : 0;

        const active =
          data.active === false ||
          data.active === 0
            ? 0
            : 1;

        if (!username || !role) {
          return json(
            {
              error: "Username and role are required"
            },
            400
          );
        }

        await env.DB
          .prepare(`
            UPDATE staff_members
            SET
              username = ?,
              role = ?,
              display_order = ?,
              active = ?
            WHERE id = ?
          `)
          .bind(
            username,
            role,
            displayOrder,
            active,
            id
          )
          .run();

        return json({
          success: true
        });
      } catch {
        return json(
          {
            error: "Failed to update staff member"
          },
          500
        );
      }
    }

    // ADMIN - DELETE STAFF

    if (
      url.pathname.startsWith("/api/admin/staff/") &&
      request.method === "DELETE"
    ) {
      if (!isAdmin(request)) {
        return unauthorized();
      }

      const id = url.pathname
        .split("/")
        .pop();

      if (!/^\d+$/.test(id)) {
        return json(
          {
            error: "Invalid staff ID"
          },
          400
        );
      }

      try {
        await env.DB
          .prepare(`
            DELETE FROM staff_members
            WHERE id = ?
          `)
          .bind(id)
          .run();

        return json({
          success: true
        });
      } catch {
        return json(
          {
            error: "Failed to delete staff member"
          },
          500
        );
      }
    }

    // =====================================================
    // SERVER STATUS
    // =====================================================

    // PUBLIC - GET SERVER STATUS

    if (
      url.pathname === "/api/server-status" &&
      request.method === "GET"
    ) {
      try {
        const result = await env.DB
          .prepare(`
            SELECT
              id,
              status,
              player_count,
              max_players,
              motd,
              updated_at
            FROM server_status
            WHERE id = 1
          `)
          .first();

        return json(
          result || {
            id: 1,
            status: "offline",
            player_count: 0,
            max_players: 100,
            motd: "RISE NETWORK"
          }
        );
      } catch {
        return json(
          {
            error: "Failed to load server status"
          },
          500
        );
      }
    }

    // ADMIN - UPDATE SERVER STATUS

    if (
      url.pathname === "/api/admin/server-status" &&
      request.method === "PUT"
    ) {
      if (!isAdmin(request)) {
        return unauthorized();
      }

      try {
        const data = await request.json();

        const status =
          String(data.status || "offline")
            .toLowerCase();

        const allowedStatuses = [
          "online",
          "offline",
          "maintenance"
        ];

        if (!allowedStatuses.includes(status)) {
          return json(
            {
              error: "Invalid server status"
            },
            400
          );
        }

        const playerCount =
          Math.max(
            0,
            Number(data.player_count) || 0
          );

        const maxPlayers =
          Math.max(
            1,
            Number(data.max_players) || 100
          );

        const motd =
          String(
            data.motd || "RISE NETWORK"
          ).trim();

        await env.DB
          .prepare(`
            UPDATE server_status
            SET
              status = ?,
              player_count = ?,
              max_players = ?,
              motd = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
          `)
          .bind(
            status,
            playerCount,
            maxPlayers,
            motd
          )
          .run();

        return json({
          success: true
        });
      } catch {
        return json(
          {
            error: "Failed to update server status"
          },
          500
        );
      }
    }

    // =====================================================
    // GAMEMODES
    // =====================================================

    // PUBLIC - GET GAMEMODES

    if (
      url.pathname === "/api/gamemodes" &&
      request.method === "GET"
    ) {
      try {
        const result = await env.DB
          .prepare(`
            SELECT
              id,
              name,
              description,
              status,
              display_order
            FROM gamemodes
            ORDER BY display_order ASC, id ASC
          `)
          .all();

        return json(result.results || []);
      } catch {
        return json(
          {
            error: "Failed to load gamemodes"
          },
          500
        );
      }
    }

    // ADMIN - GET GAMEMODES

    if (
      url.pathname === "/api/admin/gamemodes" &&
      request.method === "GET"
    ) {
      if (!isAdmin(request)) {
        return unauthorized();
      }

      try {
        const result = await env.DB
          .prepare(`
            SELECT
              id,
              name,
              description,
              status,
              display_order,
              created_at
            FROM gamemodes
            ORDER BY display_order ASC, id ASC
          `)
          .all();

        return json(result.results || []);
      } catch {
        return json(
          {
            error: "Failed to load gamemodes"
          },
          500
        );
      }
    }

    // ADMIN - ADD GAMEMODE

    if (
      url.pathname === "/api/admin/gamemodes" &&
      request.method === "POST"
    ) {
      if (!isAdmin(request)) {
        return unauthorized();
      }

      try {
        const data = await request.json();

        const name =
          String(data.name || "").trim();

        const description =
          String(data.description || "").trim();

        const status =
          String(
            data.status || "available"
          ).trim();

        const displayOrder =
          Number.isFinite(Number(data.display_order))
            ? Number(data.display_order)
            : 0;

        if (!name) {
          return json(
            {
              error: "Gamemode name is required"
            },
            400
          );
        }

        await env.DB
          .prepare(`
            INSERT INTO gamemodes
              (name, description, status, display_order)
            VALUES
              (?, ?, ?, ?)
          `)
          .bind(
            name,
            description,
            status,
            displayOrder
          )
          .run();

        return json({
          success: true
        });
      } catch {
        return json(
          {
            error: "Failed to add gamemode"
          },
          500
        );
      }
    }

    // ADMIN - EDIT GAMEMODE

    if (
      url.pathname.startsWith("/api/admin/gamemodes/") &&
      request.method === "PUT"
    ) {
      if (!isAdmin(request)) {
        return unauthorized();
      }

      const id = url.pathname
        .split("/")
        .pop();

      if (!/^\d+$/.test(id)) {
        return json(
          {
            error: "Invalid gamemode ID"
          },
          400
        );
      }

      try {
        const data = await request.json();

        const name =
          String(data.name || "").trim();

        const description =
          String(data.description || "").trim();

        const status =
          String(
            data.status || "available"
          ).trim();

        const displayOrder =
          Number.isFinite(Number(data.display_order))
            ? Number(data.display_order)
            : 0;

        if (!name) {
          return json(
            {
              error: "Gamemode name is required"
            },
            400
          );
        }

        await env.DB
          .prepare(`
            UPDATE gamemodes
            SET
              name = ?,
              description = ?,
              status = ?,
              display_order = ?
            WHERE id = ?
          `)
          .bind(
            name,
            description,
            status,
            displayOrder,
            id
          )
          .run();

        return json({
          success: true
        });
      } catch {
        return json(
          {
            error: "Failed to update gamemode"
          },
          500
        );
      }
    }

    // ADMIN - DELETE GAMEMODE

    if (
      url.pathname.startsWith("/api/admin/gamemodes/") &&
      request.method === "DELETE"
    ) {
      if (!isAdmin(request)) {
        return unauthorized();
      }

      const id = url.pathname
        .split("/")
        .pop();

      if (!/^\d+$/.test(id)) {
        return json(
          {
            error: "Invalid gamemode ID"
          },
          400
        );
      }

      try {
        await env.DB
          .prepare(`
            DELETE FROM gamemodes
            WHERE id = ?
          `)
          .bind(id)
          .run();

        return json({
          success: true
        });
      } catch {
        return json(
          {
            error: "Failed to delete gamemode"
          },
          500
        );
      }
    }

    // =====================================================
    // SETTINGS
    // =====================================================

    // PUBLIC - GET SETTINGS

    if (
      url.pathname === "/api/settings" &&
      request.method === "GET"
    ) {
      try {
        const result = await env.DB
          .prepare(`
            SELECT
              setting_key,
              setting_value
            FROM site_settings
          `)
          .all();

        const settings = {};

        for (const row of result.results || []) {
          settings[row.setting_key] =
            row.setting_value;
        }

        return json(settings);
      } catch {
        return json(
          {
            error: "Failed to load settings"
          },
          500
        );
      }
    }

    // ADMIN - UPDATE SETTING

    if (
      url.pathname === "/api/admin/settings" &&
      request.method === "PUT"
    ) {
      if (!isAdmin(request)) {
        return unauthorized();
      }

      try {
        const data = await request.json();

        const key =
          String(data.key || "").trim();

        const value =
          String(data.value || "").trim();

        if (!key) {
          return json(
            {
              error: "Setting key is required"
            },
            400
          );
        }

        await env.DB
          .prepare(`
            INSERT INTO site_settings
              (setting_key, setting_value, updated_at)
            VALUES
              (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(setting_key)
            DO UPDATE SET
              setting_value = excluded.setting_value,
              updated_at = CURRENT_TIMESTAMP
          `)
          .bind(key, value)
          .run();

        return json({
          success: true
        });
      } catch {
        return json(
          {
            error: "Failed to update setting"
          },
          500
        );
      }
    }

    // =====================================================
    // ADMIN PAGE
    // =====================================================

    if (url.pathname === "/admin.html") {
      return env.ASSETS.fetch(request);
    }

    // =====================================================
    // WEBSITE
    // =====================================================

    return env.ASSETS.fetch(request);
  }
};
