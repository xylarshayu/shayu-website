import type { APIRoute, APIContext } from "astro";
import { desc, isNull, count, DrizzleError, like, and } from "drizzle-orm";
import { getDb } from "@db/index";
import { statusTable } from "@db/schema";

export const GET: APIRoute = async (context: APIContext) => {
  try {
    const db = getDb(context.locals.runtime.env.DB);
    const url = new URL(context.request.url);
    const offset = Math.max(Number(url.searchParams.get('offset') ?? 1) - 1, 0);
    const toGetCount = url.searchParams.get('getCount') === 'true';

    let whereSQLquery; 
    let textToSearch = url.searchParams.get('search');
    if (textToSearch?.length) {
      whereSQLquery = and(
        isNull(statusTable._deleted_at),
        like(statusTable.text, `%${textToSearch}%`)
      );
    } else {
      whereSQLquery = isNull(statusTable._deleted_at);
    }

    const statusQuery = db
      .select()
      .from(statusTable)
      .where(whereSQLquery)
      .offset(offset)
      .orderBy(desc(statusTable.date))
      .limit(10);
    const countQuery = toGetCount ? db
      .select({ count: count() })
      .from(statusTable)
      .where(whereSQLquery) : Promise.resolve([{ count: 0 }]);
  
    const [statuses, totalCount] = await Promise.all([statusQuery, countQuery]);
    
    return new Response(JSON.stringify({ statuses, count: totalCount[0].count }));
  }
  catch (error) {
    console.error(error);
    if (error instanceof DrizzleError) {
      return new Response("Bad request: " + error.message, { status: 400 });
    }
    else return new Response("Internal server error", { status: 500 });
  }
};