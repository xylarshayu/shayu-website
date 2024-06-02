import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  context.cookies.delete('auth_token', { path: '/' });
  return context.redirect('/');
};