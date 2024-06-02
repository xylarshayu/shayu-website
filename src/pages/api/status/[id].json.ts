import type { APIRoute, APIContext } from "astro";
import { desc, isNull, count, eq, and } from "drizzle-orm";
import { checkLoggedIn } from "@lib/auth";
import { getDb } from "@db/index";
import { statusTable, type insertStatus } from "@db/schema";

export const GET: APIRoute = async (context: APIContext) => {
  let getId = context.params.id;
  const db = getDb(context.locals.runtime.env.DB);
  let query = await db
    .select()
    .from(statusTable)
    .where(
      and(
        isNull(statusTable._deleted_at),
        eq(statusTable.id, Number(getId))
      )
    )
    .limit(1);

  const status = query[0];

  return new Response(JSON.stringify(status));
};

export const PATCH: APIRoute = async (context: APIContext) => {
  const { isLoggedIn, toRedirect } = await checkLoggedIn(context.cookies);
  if (!isLoggedIn) return context.redirect(toRedirect!);

  const db = getDb(context.locals.runtime.env.DB);
  const body: insertStatus = await context.request.json();
  const { text, theme, mood, spotify_link } = body;
  const status = await db
    .update(statusTable)
    .set({ text, theme, mood, spotify_link })
    .where(
      and(
        isNull(statusTable._deleted_at),
        eq(statusTable.id, Number(context.params.id))
      )
    )
    .returning();
  if (!status[0]) return new Response("Not found", { status: 404 });
  
  return new Response(JSON.stringify(status[0]));
};

export const DELETE: APIRoute = async (context: APIContext) => {
  const { isLoggedIn, toRedirect } = await checkLoggedIn(context.cookies);
  if (!isLoggedIn) return context.redirect(toRedirect!);

  const db = getDb(context.locals.runtime.env.DB);
  const status = await db
    .update(statusTable)
    .set({ _deleted_at: new Date() })
    .where(
      and(
        isNull(statusTable._deleted_at),
        eq(statusTable.id, Number(context.params.id))
      )
    )
    .returning();
  if (!status[0]) return new Response("Not found", { status: 404 });

  return new Response(null, { status: 204 });
};