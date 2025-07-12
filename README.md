# shayu-website
My personal website

## Caching Strategy

This project implements a smart caching strategy using Cloudflare to optimize performance and reduce database load. Here's a breakdown of how it works:

### Cached Resources

The following pages and API endpoints are cached by Cloudflare for one week:

- **Home Page:** `/`
- **Individual Post Pages:** `/post/[slug]`
- **Statuses API:** `/api/statuses.json`
- **Latest Status API:** `/api/status.json`

### Cache Invalidation and Warming

The cache is automatically purged and refreshed (warmed) to ensure content is always up-to-date. This happens in the following scenarios:

- **Post Creation:** When a new post is created, the cache for that post's page is purged.
- **Post Update:** When a post is updated, the cache for its page is purged and warmed.
- **Post Deletion:** When a post is deleted, the cache for its page is purged.
- **Status Creation/Update:** When a status is created or updated, the cache for the home page, statuses API, and latest status API is purged and warmed.
- **Status Deletion:** When a status is deleted, the cache for the home page, statuses API, and latest status API is purged.

This proactive caching approach ensures that users receive fresh content quickly while minimizing requests to the origin server.
