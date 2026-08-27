import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import initSqlJs, { Database } from "sql.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "homelab_keys.sqlite");

let db: Database;

function saveDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error("Failed to save database to disk:", err);
  }
}

async function initDatabase() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
      console.log("Loaded existing SQLite database from disk.");
    } catch (e) {
      console.warn("Could not load existing DB file, creating new one:", e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
    console.log("Created fresh SQLite database.");
  }

  // Ensure table exists with exact specified columns
  db.run(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_name TEXT NOT NULL,
      key_value TEXT NOT NULL,
      org_id TEXT,
      client_id TEXT,
      created_date TEXT,
      expiry_date TEXT,
      account TEXT,
      project TEXT,
      environment TEXT,
      last_used_date TEXT,
      status TEXT DEFAULT 'Active',
      ip_restrictions TEXT,
      portal_url TEXT,
      creator_contact TEXT,
      purpose TEXT
    );
  `);

  // Migrate existing databases to add org_id and client_id if missing
  try {
    const tableInfo = queryAll<any>("PRAGMA table_info(api_keys);");
    const columnNames = tableInfo.map((c: any) => c.name);
    if (!columnNames.includes("org_id")) {
      db.run("ALTER TABLE api_keys ADD COLUMN org_id TEXT;");
      console.log("Migrated SQLite schema: added org_id column.");
    }
    if (!columnNames.includes("client_id")) {
      db.run("ALTER TABLE api_keys ADD COLUMN client_id TEXT;");
      console.log("Migrated SQLite schema: added client_id column.");
    }
  } catch (migErr) {
    console.warn("Migration check error (ignored):", migErr);
  }

  // Save database structure
  saveDb();
}

function queryAll<T>(sql: string, params: any[] = []): T[] {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

function queryOne<T>(sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

async function startServer() {
  await initDatabase();

  const app = express();
  app.use(express.json({ limit: "20mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get all keys with search, filters & sort
  app.get("/api/keys", (req, res) => {
    try {
      const search = (req.query.search as string) || "";
      const environment = (req.query.environment as string) || "";
      const status = (req.query.status as string) || "";
      const sortBy = (req.query.sort_by as string) || "id";
      const sortOrder = (req.query.sort_order as string)?.toUpperCase() === "ASC" ? "ASC" : "DESC";

      let query = "SELECT * FROM api_keys WHERE 1=1";
      const params: any[] = [];

      if (search.trim()) {
        query += " AND (app_name LIKE ? OR key_value LIKE ? OR project LIKE ? OR account LIKE ? OR purpose LIKE ? OR org_id LIKE ? OR client_id LIKE ?)";
        const pattern = `%${search.trim()}%`;
        params.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern);
      }

      if (environment.trim() && environment !== "All") {
        query += " AND environment = ?";
        params.push(environment.trim());
      }

      if (status.trim() && status !== "All") {
        query += " AND status = ?";
        params.push(status.trim());
      }

      const allowedSortColumns = ["id", "app_name", "created_date", "expiry_date", "last_used_date", "environment", "status", "project", "org_id", "client_id"];
      const cleanSort = allowedSortColumns.includes(sortBy) ? sortBy : "id";

      query += ` ORDER BY ${cleanSort} ${sortOrder};`;

      const keys = queryAll(query, params);
      res.json(keys);
    } catch (err: any) {
      console.error("GET /api/keys error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch keys" });
    }
  });

  // Stats calculation
  app.get("/api/stats", (req, res) => {
    try {
      const keys = queryAll<any>("SELECT * FROM api_keys;");
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      let active = 0;
      let expiringSoon = 0;
      let revokedOrExpired = 0;
      let paused = 0;
      const byEnvironment: Record<string, number> = {};

      for (const k of keys) {
        const env = k.environment || "Unassigned";
        byEnvironment[env] = (byEnvironment[env] || 0) + 1;

        if (k.status === "Revoked") {
          revokedOrExpired++;
        } else if (k.status === "Paused") {
          paused++;
        } else {
          // Active or other
          if (k.expiry_date) {
            const exp = new Date(k.expiry_date);
            if (!isNaN(exp.getTime())) {
              if (exp < now) {
                revokedOrExpired++;
                continue;
              } else if (exp <= sevenDaysFromNow) {
                expiringSoon++;
                active++;
                continue;
              }
            }
          }
          active++;
        }
      }

      res.json({
        total: keys.length,
        active,
        expiringSoon,
        revokedOrExpired,
        paused,
        byEnvironment
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch statistics" });
    }
  });

  // Get single key
  app.get("/api/keys/:id", (req, res) => {
    try {
      const key = queryOne("SELECT * FROM api_keys WHERE id = ?;", [req.params.id]);
      if (!key) {
        return res.status(404).json({ error: "Key not found" });
      }
      res.json(key);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create key
  app.post("/api/keys", (req, res) => {
    try {
      const {
        app_name,
        key_value,
        org_id,
        client_id,
        created_date,
        expiry_date,
        account,
        project,
        environment,
        last_used_date,
        status,
        ip_restrictions,
        portal_url,
        creator_contact,
        purpose
      } = req.body;

      if (!app_name || !app_name.trim()) {
        return res.status(400).json({ error: "App Name is required" });
      }
      if (!key_value || !key_value.trim()) {
        return res.status(400).json({ error: "Key Value is required" });
      }

      const created = created_date || new Date().toISOString();
      const currentStatus = status || "Active";

      db.run(
        `INSERT INTO api_keys (app_name, key_value, org_id, client_id, created_date, expiry_date, account, project, environment, last_used_date, status, ip_restrictions, portal_url, creator_contact, purpose)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          app_name.trim(),
          key_value.trim(),
          org_id ? org_id.trim() : null,
          client_id ? client_id.trim() : null,
          created,
          expiry_date || null,
          account || null,
          project || null,
          environment || null,
          last_used_date || null,
          currentStatus,
          ip_restrictions || null,
          portal_url || null,
          creator_contact || null,
          purpose || null
        ]
      );

      saveDb();

      // Retrieve inserted key
      const createdKey = queryOne("SELECT * FROM api_keys ORDER BY id DESC LIMIT 1;");
      res.status(201).json(createdKey);
    } catch (err: any) {
      console.error("POST /api/keys error:", err);
      res.status(500).json({ error: err.message || "Failed to create key" });
    }
  });

  // Update key
  app.put("/api/keys/:id", (req, res) => {
    try {
      const id = req.params.id;
      const existing = queryOne("SELECT * FROM api_keys WHERE id = ?;", [id]);
      if (!existing) {
        return res.status(404).json({ error: "Key not found" });
      }

      const {
        app_name,
        key_value,
        org_id,
        client_id,
        created_date,
        expiry_date,
        account,
        project,
        environment,
        last_used_date,
        status,
        ip_restrictions,
        portal_url,
        creator_contact,
        purpose
      } = req.body;

      if (!app_name || !app_name.trim()) {
        return res.status(400).json({ error: "App Name is required" });
      }
      if (!key_value || !key_value.trim()) {
        return res.status(400).json({ error: "Key Value is required" });
      }

      db.run(
        `UPDATE api_keys SET
          app_name = ?,
          key_value = ?,
          org_id = ?,
          client_id = ?,
          created_date = ?,
          expiry_date = ?,
          account = ?,
          project = ?,
          environment = ?,
          last_used_date = ?,
          status = ?,
          ip_restrictions = ?,
          portal_url = ?,
          creator_contact = ?,
          purpose = ?
        WHERE id = ?;`,
        [
          app_name.trim(),
          key_value.trim(),
          org_id ? org_id.trim() : null,
          client_id ? client_id.trim() : null,
          created_date || null,
          expiry_date || null,
          account || null,
          project || null,
          environment || null,
          last_used_date || null,
          status || "Active",
          ip_restrictions || null,
          portal_url || null,
          creator_contact || null,
          purpose || null,
          id
        ]
      );

      saveDb();

      const updated = queryOne("SELECT * FROM api_keys WHERE id = ?;", [id]);
      res.json(updated);
    } catch (err: any) {
      console.error("PUT /api/keys/:id error:", err);
      res.status(500).json({ error: err.message || "Failed to update key" });
    }
  });

  // Delete key
  app.delete("/api/keys/:id", (req, res) => {
    try {
      const id = req.params.id;
      db.run("DELETE FROM api_keys WHERE id = ?;", [id]);
      saveDb();
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Touch key (update last_used_date)
  app.post("/api/keys/:id/touch", (req, res) => {
    try {
      const id = req.params.id;
      const now = new Date().toISOString();
      db.run("UPDATE api_keys SET last_used_date = ? WHERE id = ?;", [now, id]);
      saveDb();
      const updated = queryOne("SELECT * FROM api_keys WHERE id = ?;", [id]);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Clone key
  app.post("/api/keys/:id/clone", (req, res) => {
    try {
      const id = req.params.id;
      const original = queryOne<any>("SELECT * FROM api_keys WHERE id = ?;", [id]);
      if (!original) {
        return res.status(404).json({ error: "Key not found" });
      }

      db.run(
        `INSERT INTO api_keys (app_name, key_value, org_id, client_id, created_date, expiry_date, account, project, environment, last_used_date, status, ip_restrictions, portal_url, creator_contact, purpose)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          `${original.app_name} (Copy)`,
          original.key_value,
          original.org_id || null,
          original.client_id || null,
          new Date().toISOString(),
          original.expiry_date,
          original.account,
          original.project,
          original.environment,
          null,
          "Active",
          original.ip_restrictions,
          original.portal_url,
          original.creator_contact,
          original.purpose
        ]
      );
      saveDb();
      const cloned = queryOne("SELECT * FROM api_keys ORDER BY id DESC LIMIT 1;");
      res.status(201).json(cloned);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Bulk delete
  app.post("/api/keys/bulk-delete", (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Array of IDs required" });
      }
      const placeholders = ids.map(() => "?").join(",");
      db.run(`DELETE FROM api_keys WHERE id IN (${placeholders});`, ids);
      saveDb();
      res.json({ success: true, count: ids.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Bulk status update
  app.post("/api/keys/bulk-status", (req, res) => {
    try {
      const { ids, status } = req.body;
      if (!Array.isArray(ids) || ids.length === 0 || !status) {
        return res.status(400).json({ error: "Array of IDs and status required" });
      }
      const placeholders = ids.map(() => "?").join(",");
      db.run(`UPDATE api_keys SET status = ? WHERE id IN (${placeholders});`, [status, ...ids]);
      saveDb();
      res.json({ success: true, count: ids.length, status });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Export JSON
  app.get("/api/export/json", (req, res) => {
    try {
      const keys = queryAll("SELECT * FROM api_keys ORDER BY id ASC;");
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="homelab_api_keys_${new Date().toISOString().slice(0, 10)}.json"`);
      res.send(JSON.stringify(keys, null, 2));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Export CSV
  app.get("/api/export/csv", (req, res) => {
    try {
      const keys = queryAll<any>("SELECT * FROM api_keys ORDER BY id ASC;");
      const headers = [
        "id",
        "app_name",
        "key_value",
        "org_id",
        "client_id",
        "created_date",
        "expiry_date",
        "account",
        "project",
        "environment",
        "last_used_date",
        "status",
        "ip_restrictions",
        "portal_url",
        "creator_contact",
        "purpose"
      ];

      const csvRows = [headers.join(",")];
      for (const k of keys) {
        const values = headers.map(h => {
          const val = k[h] === null || k[h] === undefined ? "" : String(k[h]);
          // Escape quotes and wrap in quotes
          const escaped = val.replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="homelab_api_keys_${new Date().toISOString().slice(0, 10)}.csv"`);
      res.send(csvRows.join("\n"));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Export raw SQLite DB
  app.get("/api/export/sqlite", (req, res) => {
    try {
      const binary = db.export();
      const buffer = Buffer.from(binary);
      res.setHeader("Content-Type", "application/x-sqlite3");
      res.setHeader("Content-Disposition", `attachment; filename="homelab_keys_${new Date().toISOString().slice(0, 10)}.sqlite"`);
      res.send(buffer);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Import JSON
  app.post("/api/import/json", (req, res) => {
    try {
      const { items, mode = "merge" } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Invalid payload: 'items' array required" });
      }

      if (mode === "replace") {
        db.run("DELETE FROM api_keys;");
      }

      let importedCount = 0;
      for (const item of items) {
        if (!item.app_name || !item.key_value) continue;

        db.run(
          `INSERT INTO api_keys (app_name, key_value, org_id, client_id, created_date, expiry_date, account, project, environment, last_used_date, status, ip_restrictions, portal_url, creator_contact, purpose)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            item.app_name.trim(),
            item.key_value.trim(),
            item.org_id ? String(item.org_id).trim() : null,
            item.client_id ? String(item.client_id).trim() : null,
            item.created_date || new Date().toISOString(),
            item.expiry_date || null,
            item.account || null,
            item.project || null,
            item.environment || null,
            item.last_used_date || null,
            item.status || "Active",
            item.ip_restrictions || null,
            item.portal_url || null,
            item.creator_contact || null,
            item.purpose || null
          ]
        );
        importedCount++;
      }

      saveDb();
      res.json({ success: true, count: importedCount, mode });
    } catch (err: any) {
      console.error("POST /api/import/json error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Homelab API Key Manager server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
