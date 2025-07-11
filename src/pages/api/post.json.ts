import type { APIRoute, APIContext } from "astro";
import { desc, isNull, DrizzleError, eq, and } from "drizzle-orm";
import { getDb } from "@db/index";
import { postTable, type insertPost } from "@db/schema";
import { checkLoggedIn } from "@lib/auth";
import { isValidImageUrl, CACHE_TAGS, cacheThis, cacheRebuild } from "@lib/utils";

export const GET: APIRoute = async (context: APIContext) => {
  try {
    const db = getDb(context.locals.runtime.env.DB);

    let whereSQLquery;
    const url = new URL(context.request.url);
    const typeToSearch = url.searchParams.get('type') as insertPost['type'];
    if (typeToSearch?.length && postTable.type.enumValues.includes(typeToSearch)) {
      whereSQLquery = and(
        isNull(postTable._deleted_at),
        eq(postTable.type, typeToSearch)
      );
    } else {
      whereSQLquery = isNull(postTable._deleted_at);
    };

    let query = await db
      .select()
      .from(postTable)
      .where(whereSQLquery)
      .orderBy(desc(postTable.date))
      .limit(1);
    const post = query[0];
    const response = new Response(JSON.stringify(post));
    cacheThis(response, CACHE_TAGS.SLUG.TAG.replace('$slug', post.slug));
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
    const body: insertPost = await context.request.json();
    let { title, text, type, image, textColor, backgroundColor } = body;
    if (image?.length && !isValidImageUrl(image)) return new Response("Bad request: image is invalid", { status: 400 });
    if (!title) return new Response("Bad request: title is required", { status: 400 });
    const slug = title.toLowerCase().replace(/ /g, '-');
    const query = await db
      .insert(postTable)
      .values({ title, slug, text, type, image, textColor, backgroundColor })
      .returning();
    await cacheRebuild(context.url.origin, [CACHE_TAGS.CONTENT_SEARCH, CACHE_TAGS.SLUG], [['$slug', slug]]);
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