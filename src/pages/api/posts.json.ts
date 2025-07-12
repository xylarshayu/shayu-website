import type { APIRoute, APIContext } from "astro";
import { desc, isNull, count, DrizzleError, like, and, eq, gte, lte, or, between } from "drizzle-orm";
import { getDb } from "@db/index";
import { postTable, type selectPost } from "@db/schema";
import { CACHE_TAGS, cacheThis } from "@lib/utils";
import dayjs from "dayjs";

export const GET: APIRoute = async (context: APIContext) => {
  try {
    const db = getDb(context.locals.runtime.env.DB);
    const url = new URL(context.request.url);
    const offset = Math.max(Number(url.searchParams.get('offset') ?? 1) - 1, 0);
    const toGetCount = url.searchParams.get('getCount') === 'true';

    let whereSQLqueryArray = [isNull(postTable._deleted_at)]; 
    let textToSearch = url.searchParams.get('search');
    let typeToSearch = url.searchParams.get('type') as selectPost['type'];
    let beforeToSearch = url.searchParams.get('before'); // DD/MM/YYYY
    let afterToSearch = url.searchParams.get('after'); // DD/MM/YYYY
    if (textToSearch?.length) {
      const searchCondition = or(
        like(postTable.title, `%${textToSearch}%`),
        like(postTable.text, `%${textToSearch}%`)
      );
      whereSQLqueryArray.push(searchCondition!);
    };
    if (typeToSearch?.length && postTable.type.enumValues.includes(typeToSearch)) {
      whereSQLqueryArray.push(eq(postTable.type, typeToSearch));
    };
    if (beforeToSearch?.length || afterToSearch?.length) {
      console.log({ beforeToSearch, afterToSearch });
      const beforeDate = beforeToSearch ? dayjs(beforeToSearch, 'DD/MM/YYYY').toDate() : undefined;
      const afterDate = afterToSearch ? dayjs(afterToSearch, 'DD/MM/YYYY').toDate() : undefined;
      if (beforeDate && afterDate) {
        whereSQLqueryArray.push(between(postTable.date, beforeDate, afterDate));
      } else whereSQLqueryArray.push(beforeDate ? lte(postTable.date, beforeDate) : gte(postTable.date, afterDate!));
    };
    const whereSQLquery = whereSQLqueryArray.length > 1 ? and(...whereSQLqueryArray) : whereSQLqueryArray[0];

    const postQuery = db
      .select()
      .from(postTable)
      .where(whereSQLquery)
      .offset(offset)
      .orderBy(desc(postTable.date))
      .limit(10);
    const countQuery = toGetCount ? db
      .select({ count: count() })
      .from(postTable)
      .where(whereSQLquery) : Promise.resolve([{ count: 0 }]);

    const query = await Promise.all([postQuery, countQuery]);
    const [posts, totalCount] = query;

    const response = new Response(JSON.stringify({ posts, count: totalCount[0].count }));
    cacheThis(response, CACHE_TAGS.CONTENT_SEARCH.TAG);
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
