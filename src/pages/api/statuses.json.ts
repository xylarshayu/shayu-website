import type { APIRoute, APIContext } from "astro";
import { desc, isNull, count, DrizzleError, like, and, gte, lte, between } from "drizzle-orm";
import { getDb } from "@db/index";
import { statusTable } from "@db/schema";
import { CACHE_TAGS, cacheThis } from "@lib/utils";
import dayjs from "dayjs";

export const GET: APIRoute = async (context: APIContext) => {
  try {
    const db = getDb(context.locals.runtime.env.DB);
    const url = new URL(context.request.url);
    const offset = Math.max(Number(url.searchParams.get('offset') ?? 1) - 1, 0);
    const toGetCount = url.searchParams.get('getCount') === 'true';

    let whereSQLqueryArray = [isNull(statusTable._deleted_at)]; 
    let textToSearch = url.searchParams.get('search');
    let beforeToSearch = url.searchParams.get('before'); // DD/MM/YYYY
    let afterToSearch = url.searchParams.get('after'); // DD/MM/YYYY
    if (textToSearch?.length) {
      whereSQLqueryArray.push(like(statusTable.text, `%${textToSearch}%`));
    };
    if (beforeToSearch?.length || afterToSearch?.length) {
      const beforeDate = beforeToSearch ? dayjs(beforeToSearch, 'DD/MM/YYYY').toDate() : undefined;
      const afterDate = afterToSearch ? dayjs(afterToSearch, 'DD/MM/YYYY').toDate() : undefined;
      if (beforeDate && afterDate) {
        whereSQLqueryArray.push(between(statusTable.date, beforeDate, afterDate));
      } else whereSQLqueryArray.push(beforeDate ? gte(statusTable.date, beforeDate) : lte(statusTable.date, afterDate!));
    };
    const whereSQLquery = whereSQLqueryArray.length > 1 ? and(...whereSQLqueryArray) : whereSQLqueryArray[0];

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

    const response = new Response(JSON.stringify({ statuses, count: totalCount[0].count }));
    cacheThis(response, CACHE_TAGS.HOME.TAG);
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