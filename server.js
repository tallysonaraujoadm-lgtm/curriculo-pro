import { resolve } from "node:path";
import { createServer } from "node:http";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { pool } from "./lib/db.js";
import authProvidersHandler from "./api/auth-providers.js";
import resumesHandler from "./api/resumes.js";
import sendResumeHandler from "./api/send-resume.js";

const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";
const projectRoot = import.meta.dirname;
const httpServer = createServer(app);

app.disable("x-powered-by");
app.set("trust proxy", 1);

// O Better Auth precisa receber o corpo original da requisição.
// Esta rota deve ficar antes de express.json().
app.all("/api/auth/*splat", toNodeHandler(auth.handler));

app.use(express.json({ limit: "12mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.get("/api/auth-providers", authProvidersHandler);
app.all("/api/resumes", resumesHandler);
app.post("/api/send-resume", sendResumeHandler);

if (isProduction) {
  const distPath = resolve(projectRoot, "dist");
  app.use(express.static(distPath));
  app.get("/*splat", (req, res) => {
    res.sendFile(resolve(distPath, "index.html"));
  });
} else {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    root: projectRoot,
    server: {
      middlewareMode: true,
      hmr: { server: httpServer }
    },
    appType: "spa"
  });
  app.use(vite.middlewares);
}

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ error: "Erro interno do servidor." });
});

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Currículo Pro disponível em http://localhost:${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} recebido. Encerrando o servidor...`);
  httpServer.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
