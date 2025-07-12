/// <reference types="astro/client" />

type D1Database = import("@cloudflare/workers-types").D1Database;
type R2Bucket = import("@cloudflare/workers-types").R2Bucket;
type Env = {
	DB: D1Database,
	BUCKET: R2Bucket,
	GITHUB_CLIENT_ID: string,
  GITHUB_CLIENT_SECRET: string,
	MY_GITHUB_ID: string,
	JWT_SECRET: string,
	BUCKET_URL: string,
	CF_API_KEY: string,
	CF_API_EMAIL: string,
	CF_ZONE_ID: string,
};

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}