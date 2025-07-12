import type { APIRoute, APIContext } from "astro";
import { desc, isNull, DrizzleError } from "drizzle-orm";
import { getDb } from "@db/index";
import { statusTable, type insertStatus } from "@db/schema";
import { checkLoggedIn } from "@lib/auth";
import { isValidImageUrl, CACHE_TAGS, cacheThis, cacheRebuild } from "@lib/utils";

export const GET: APIRoute = async (context: APIContext) => {
  try {
    const db = getDb(context.locals.runtime.env.DB);
    let query = await db
      .select()
      .from(statusTable)
      .where(isNull(statusTable._deleted_at))
      .orderBy(desc(statusTable.date))
      .limit(1);
    const status = query[0];
    const response = new Response(JSON.stringify(status));
    cacheThis(response, CACHE_TAGS.STATUS.TAG);
    return response;
  }
  catch (error) {
    console.error(error);
    if (error instanceof DrizzleError) {
      return new Response("Bad request: " + error.message, { status: 400 });
    }
    else return new Response("Internal server error", { status: 500 });
  }
};

export const POST: APIRoute = async (context: APIContext) => {
  try {
    const { isLoggedIn, toRedirect } = await checkLoggedIn(context.cookies);
    if (!isLoggedIn) return context.redirect(toRedirect!);

    const db = getDb(context.locals.runtime.env.DB);
    const body: insertStatus = await context.request.json();
    let { text, theme, mood, spotify_link, image } = body;
    if (!spotify_link?.length) spotify_link = null;
    if (image?.length && !isValidImageUrl(image)) return new Response("Bad request: image is invalid", { status: 400 });
    const query = await db
      .insert(statusTable)
      .values({ text, theme, mood, spotify_link, image })
      .returning();

    await cacheRebuild(context.url.origin, [CACHE_TAGS.STATUS, CACHE_TAGS.HOME]);

    return new Response(JSON.stringify(query[0]));
  }
  catch (error) {
    console.error(error);
    if (error instanceof DrizzleError) {
      return new Response("Bad request: " + error.message, { status: 400 });
    }
    else return new Response("Internal server error", { status: 500 });
  }
};