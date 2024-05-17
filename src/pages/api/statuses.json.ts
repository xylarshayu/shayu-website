import type { APIRoute } from "astro";

export const GET: APIRoute = async ({request}: any) => {
  const url = new URL(request.url);
  let num = Number(url.searchParams.get('num') ?? 1);
  const statuses = Array.from({length: 10}).map((_, i) => {
    return {
      text: 'hello world ' + num,
      id: num++,
    }
  });
  return new Response(JSON.stringify(statuses));
};