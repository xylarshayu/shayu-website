import { GitHub } from "arctic";
import * as jose from 'jose';

import { type AstroGlobal, type AstroCookies } from "astro";

const JWT_ALG = 'HS256';
const SECRET = new TextEncoder().encode(import.meta.env.JWT_SECRET);

export function initializeGithubClient() {
  return new GitHub(import.meta.env.GITHUB_CLIENT_ID, import.meta.env.GITHUB_CLIENT_SECRET);
};

export async function generateToken() {
  return await new jose.SignJWT({ id: import.meta.env.MY_GITHUB_ID }).setProtectedHeader({ alg: JWT_ALG }).setExpirationTime('15m').sign(SECRET);
};

export async function validateToken(token: string) {
  try {
    // const payload = jwt.verify(token, import.meta.env.MY_GITHUB_ID) as { id: string };
    const { payload } = await jose.jwtVerify(token, SECRET);
    return payload.id === import.meta.env.MY_GITHUB_ID;
  } catch (e) {
    if (e instanceof jose.errors.JWTExpired) console.error("expired");
    return false;
  }
};

export async function checkLoggedIn(cookies: AstroCookies ) {
  let isLoggedIn = false, toRedirect: '/403' | '/404' | undefined;
  const token = cookies.get('auth_token');
  if (token && token.value) {
    isLoggedIn = await validateToken(token?.value ?? '');
    toRedirect = isLoggedIn ? undefined : '/403';
  }
  else toRedirect = '/404';
  return { isLoggedIn, toRedirect };
};

export async function logOut(Astro: AstroGlobal) {
  Astro.cookies.delete('auth_token');
  return Astro.redirect('/');
};