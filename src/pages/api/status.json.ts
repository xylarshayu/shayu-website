import type { APIRoute, APIContext } from "astro";
import { desc, isNull, count, eq, and, DrizzleError } from "drizzle-orm";
import { getDb } from "@db/index";
import { statusTable } from "@db/schema";

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
    return new Response(JSON.stringify(status));
  }
  catch (error) {
    console.error(error);
    if (error instanceof DrizzleError) {
      return new Response("Bad request: " + error.message, { status: 400 });
    }
    else return new Response("Internal server error", { status: 500 });
  }
}