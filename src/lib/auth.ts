import { GitHub } from "arctic";
import jwt from 'jsonwebtoken';
import { type AstroGlobal } from "astro";

export function initializeGithubClient() {
  return new GitHub(import.meta.env.GITHUB_CLIENT_ID, import.meta.env.GITHUB_CLIENT_SECRET);
};

export function generateToken() {
  return jwt.sign({ id: import.meta.env.MY_GITHUB_ID }, import.meta.env.JWT_SECRET, { expiresIn: '15m' });
};

export function validateToken(token: string) {
  try {
    const payload = jwt.verify(token, import.meta.env.MY_GITHUB_ID) as { id: string };
    return payload.id === import.meta.env.MY_GITHUB_ID;
  } catch (e) {
    return false;
  }
};

export function validateUser(Astro: AstroGlobal) {
  const token = Astro.cookies.get('auth_token');
  if (!token || !token.value || !validateToken(token.value)) {
    Astro.response.status = 403;
    Astro.response.statusText = 'Only Shayu is authorized';
    return Astro.redirect('/403');
  };
}