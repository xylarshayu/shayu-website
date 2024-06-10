import { OAuth2RequestError } from "arctic";
import { initializeGithubClient, generateToken } from "@lib/auth";

import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  const github = initializeGithubClient();
  const code = context.url.searchParams.get("code");
	if (!code) {
		return new Response("Invalid code from github", {
			status: 400
		});
	}
  
  try {
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "User-Agent": "astro-cloudflare-pages",
      },
    });

    if (!githubUserResponse.ok) {
      return new Response("Failed to fetch GitHub user", { status: 400 });
    }

    const githubUser: GitHubUser = await githubUserResponse.json();

    if (String(githubUser.id) !== import.meta.env.MY_GITHUB_ID) {
      return new Response("Only Shayu is authorized", {
        status: 403
      });
    };

    const token = await generateToken();
    context.cookies.set('auth_token', token, {
      path: "/",
      secure: import.meta.env.PROD,
      httpOnly: true,
      maxAge: 60 * 15,
      sameSite: "lax"
    });

    return context.redirect("/admin/status");
  }
  catch (error) {
    if (error instanceof OAuth2RequestError) {
      return new Response(error.message, {
        status: 400
      });
    };
    return new Response("Server error: " + error, {
      status: 500
    });
  }
};

interface GitHubUser {
  id: string;
  login: string;
}

