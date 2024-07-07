import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  return context.redirect('/search');
};