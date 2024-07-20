import type { APIRoute, APIContext } from "astro";
import type { R2ListOptions } from "@cloudflare/workers-types";
import { getURLfromBucketKey } from "@lib/utils";
import { checkLoggedIn } from "@lib/auth";

export const GET: APIRoute = async (context: APIContext) => {
  try {
    const { isLoggedIn, toRedirect } = await checkLoggedIn(context.cookies);
    if (!isLoggedIn) return context.redirect(toRedirect!);

    const url = new URL(context.request.url);

    const options: R2ListOptions = {
      prefix: url.searchParams.get('search') ?? undefined,
      delimiter: url.searchParams.get('delimiter') ?? undefined,
      cursor: url.searchParams.get('cursor') ?? undefined,
      limit: 10
    }
    const list = await context.locals.runtime.env.BUCKET.list(options);

    const returnObject = {
      items: list.objects.map((o) => {
        return {
          url: getURLfromBucketKey(o.key),
          key: o.key
        }
      }),
      cursor: list.truncated ? list.cursor : undefined,
    };

    return new Response(JSON.stringify(returnObject));
  }
  catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
};

export const POST: APIRoute = async (context: APIContext) => {
  try {
    const { isLoggedIn, toRedirect } = await checkLoggedIn(context.cookies);
    if (!isLoggedIn) return context.redirect(toRedirect!);

    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;
    const key = formData.get('key') as string | null;

    if (!file) return new Response("Bad request: file is required", { status: 400 });
    if (!key) return new Response("Bad request: key is required", { status: 400 });

    const objectToStore = await file.arrayBuffer();

    await context.locals.runtime.env.BUCKET.put(key, objectToStore, {
      httpMetadata: {
        contentType: file.type
      }
    });

    return new Response(JSON.stringify({ url: getURLfromBucketKey(key), key }), { status: 200 });
  }
  catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
};

export const DELETE: APIRoute = async (context: APIContext) => {
  try {
    const { isLoggedIn, toRedirect } = await checkLoggedIn(context.cookies);
    if (!isLoggedIn) return context.redirect(toRedirect!);

    const { key } = await context.request.json() as { key: string | null };
    if (!key) return new Response("Bad request: key is required", { status: 400 });

    await context.locals.runtime.env.BUCKET.delete(key);

    return new Response("Success", { status: 200 });
  }
  catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}