import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { pool } from "../lib/db.js";

const MAX_PAYLOAD_BYTES = 2_000_000;

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function getUser(req) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });
  return session?.user || null;
}

function validTitle(value) {
  const title = String(value || "").trim();
  return title.slice(0, 120) || "Currículo sem título";
}

function validPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }
  return Buffer.byteLength(JSON.stringify(payload), "utf8") <= MAX_PAYLOAD_BYTES;
}

export default async function handler(req, res) {
  try {
    const user = await getUser(req);
    if (!user) {
      return json(res, 401, { error: "Faça login para acessar seus currículos." });
    }

    if (req.method === "GET") {
      const result = await pool.query(
        `select id, title, payload, created_at, updated_at
         from public.resumes
         where user_id = $1
         order by updated_at desc`,
        [user.id]
      );
      return json(res, 200, { resumes: result.rows });
    }

    if (req.method === "POST") {
      if (!validPayload(req.body?.payload)) {
        return json(res, 400, { error: "Conteúdo do currículo inválido ou muito grande." });
      }
      const result = await pool.query(
        `insert into public.resumes (user_id, title, payload)
         values ($1, $2, $3::jsonb)
         returning id, title, payload, created_at, updated_at`,
        [user.id, validTitle(req.body.title), JSON.stringify(req.body.payload)]
      );
      return json(res, 201, { resume: result.rows[0] });
    }

    if (req.method === "PATCH") {
      if (!req.body?.id || !validPayload(req.body?.payload)) {
        return json(res, 400, { error: "Identificador ou conteúdo inválido." });
      }
      const result = await pool.query(
        `update public.resumes
         set title = $1, payload = $2::jsonb, updated_at = now()
         where id = $3 and user_id = $4
         returning id, title, payload, created_at, updated_at`,
        [
          validTitle(req.body.title),
          JSON.stringify(req.body.payload),
          req.body.id,
          user.id
        ]
      );
      if (!result.rowCount) return json(res, 404, { error: "Currículo não encontrado." });
      return json(res, 200, { resume: result.rows[0] });
    }

    if (req.method === "DELETE") {
      if (!req.body?.id) return json(res, 400, { error: "Identificador ausente." });
      const result = await pool.query(
        "delete from public.resumes where id = $1 and user_id = $2 returning id",
        [req.body.id, user.id]
      );
      if (!result.rowCount) return json(res, 404, { error: "Currículo não encontrado." });
      return json(res, 200, { deleted: true });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return json(res, 405, { error: "Método não permitido." });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: "Não foi possível concluir a operação." });
  }
}
