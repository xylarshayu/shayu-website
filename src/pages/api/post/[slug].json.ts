import type { APIRoute, APIContext } from "astro";
import { isNull, DrizzleError, and, eq } from "drizzle-orm";
import { getDb } from "@db/index";
import { postTable, type selectPost } from "@db/schema";
import { checkLoggedIn } from "@lib/auth";
import { isValidImageUrl } from "@lib/utils";

export const GET: APIRoute = async (context: APIContext) => {
  try {
    const db = getDb(context.locals.runtime.env.DB);
    const slug = context.params.slug;
    if (!slug) return new Response("Bad request: slug is required", { status: 400 });
    const query = await db
      .select()
      .from(postTable)
      .where(and(
        isNull(postTable._deleted_at),
        eq(postTable.slug, slug)
      ))
      .limit(1);
    const status = query[0];
    return new Response(JSON.stringify(status));
  }
  catch (error) {
    console.error(error);
    if (error instanceof DrizzleError) {
      return new Response("Bad request: " + error.message, { status: 400 });
    }
    else return new Response("Internal server error", { status: 500 });
  }
};

export const PATCH: APIRoute = async (context: APIContext) => {
  try {
    const { isLoggedIn, toRedirect } = await checkLoggedIn(context.cookies);
    if (!isLoggedIn) return context.redirect(toRedirect!);
    const db = getDb(context.locals.runtime.env.DB);
    const body: selectPost = await context.request.json();
    let { title, text, type, image, textColor, backgroundColor, date } = body;
    if (image?.length && !isValidImageUrl(image)) return new Response("Bad request: image is invalid", { status: 400 });
    if (!title) return new Response("Bad request: title is required", { status: 400 });
    const slug = title.toLowerCase().replace(/ /g, '-');
    const thisDate = new Date(date);
    const query = await db
      .update(postTable)
      .set({ title, slug, text, type, image, textColor, backgroundColor, date: thisDate })
      .where(
        and(
          isNull(postTable._deleted_at),
          eq(postTable.slug, slug)
        )
      )
      .returning();
    if (!query[0]) return new Response("Not found", { status: 404 });
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

export const DELETE: APIRoute = async (context: APIContext) => {
  try {
    const { isLoggedIn, toRedirect } = await checkLoggedIn(context.cookies);
    if (!isLoggedIn) return context.redirect(toRedirect!);
    const db = getDb(context.locals.runtime.env.DB);
    const url = new URL(context.request.url);
    const slug = url.searchParams.get('slug');
    if (!slug) return new Response("Bad request: slug is required", { status: 400 });
    const query = await db
      .update(postTable)
      .set({ _deleted_at: new Date() })
      .where(
        and(
          isNull(postTable._deleted_at),
          eq(postTable.slug, slug)
        )
      )
      .returning();
    if (!query[0]) return new Response("Not found", { status: 404 });
    
    return new Response(null, { status: 204 });
  }
  catch (error) {
    console.error(error);
    if (error instanceof DrizzleError) {
      return new Response("Bad request: " + error.message, { status: 400 });
    }
    else return new Response("Internal server error", { status: 500 });
  }
}