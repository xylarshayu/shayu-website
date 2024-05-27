import { GitHub } from "arctic";
import * as jose from 'jose';

import { type AstroGlobal } from "astro";

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
    return false;
  }
};

export async function validateUser(Astro: AstroGlobal) {
  const token = Astro.cookies.get('auth_token');
  if (!token || !token.value) {
    return Astro.redirect('/404');
  };
  const tokenIsValid = await validateToken(token?.value ?? '');
  if (!tokenIsValid) {
    Astro.response.status = 403;
    Astro.response.statusText = 'Only Shayu is authorized';
    return Astro.redirect('/403');
  };
}