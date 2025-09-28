import type { APIRoute, APIContext } from "astro";
import { getDb } from "@db/index";
import { subscriptionsTable, type insertSubscription } from "@db/schema";
import { DrizzleError, isNotNull } from "drizzle-orm";
import type { D1Database } from "@cloudflare/workers-types";
import { sendNotifications } from "@lib/utils";
import { checkLoggedIn } from "@lib/auth";

export const POST: APIRoute = async (context: APIContext) => {
  try {
    const db = getDb(context.locals.runtime.env.DB);
    const body: insertSubscription = await context.request.json();
    const { endpoint, p256dh, auth } = body;
    if (!endpoint || !p256dh || !auth) return new Response("Bad request: missing required fields", { status: 400 });
    const query = await db
      .insert(subscriptionsTable)
      .values({ endpoint, p256dh, auth })
      .returning();
    return new Response(JSON.stringify(query[0]));
  }
  catch (error) {
    console.error(error);
    if (error instanceof DrizzleError) {
      return new Response("Bad request: " + error.message, { status: 400 });
    }
    else return new Response("Internal server error", { status: 500 });
  }
}

export const GET: APIRoute = async (context: APIContext) => {
  const { isLoggedIn } = await checkLoggedIn(context.cookies);
  if (!isLoggedIn) {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = new URL(context.request.url);
  const title = url.searchParams.get('title');
  const body = url.searchParams.get('body');
  const batchSize = url.searchParams.get('batchSize');
  const urlParam = url.searchParams.get('url') || undefined;
  const page = url.searchParams.get('page') || '0';

  if (!title || !body || !batchSize) {
    return new Response(JSON.stringify({ error: 'Missing required parameters: title, body, batchSize' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = context.locals.runtime.env.DB as D1Database;
  const currentPage = parseInt(page);
  const batchSizeNum = parseInt(batchSize);

  if (isNaN(currentPage) || isNaN(batchSizeNum)) {
    return new Response(JSON.stringify({ error: 'Invalid page or batchSize' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { notifications, count } = await sendNotifications(db, title, body, urlParam || '/', batchSizeNum, currentPage);
    await notifications;
    if (count === batchSizeNum && currentPage < 10) { // @xylar remove the aribtrary 10 later
      const nextUrl = new URL(context.request.url);
      nextUrl.searchParams.set('page', (currentPage + 1).toString());
      context.locals.runtime.ctx.waitUntil(fetch(nextUrl.toString()).catch(console.error));
    } else { // All subcribers have been notified, clean up the failed ones and end loop
      const removeDeleted = await getDb(db).delete(subscriptionsTable).where(isNotNull(subscriptionsTable._deleted_at)).returning().then(r => r.length);
      // console.log(`Cleaned up ${removeDeleted} deleted subscriptions`);
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
