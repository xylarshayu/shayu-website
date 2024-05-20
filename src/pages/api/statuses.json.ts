import type { APIRoute, APIContext } from "astro";
import { desc, isNull, count } from "drizzle-orm";
import { getDb } from "@db/index";
import { statusTable } from "@db/schema";

export const GET: APIRoute = async (context: APIContext) => {
  const db = getDb(context.locals.runtime.env.DB);
  const url = new URL(context.request.url);
  const offset = Math.max(Number(url.searchParams.get('offset') ?? 1) - 1, 0);
  const toGetCount = url.searchParams.get('getCount') === 'true';
  const statusQuery = db
    .select()
    .from(statusTable)
    .where(isNull(statusTable._deleted_at))
    .offset(offset)
    .orderBy(desc(statusTable.date))
    .limit(10);
  const countQuery = toGetCount ? db
    .select({ count: count() })
    .from(statusTable)
    .where(isNull(statusTable._deleted_at)) : Promise.resolve([{ count: 0 }]);

  const [statuses, totalCount] = await Promise.all([statusQuery, countQuery]);
  
  return new Response(JSON.stringify({ statuses, count: totalCount[0].count }));
};