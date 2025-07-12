import dayjs from "dayjs";
import { type AstroGlobal } from "astro";
import { type insertStatus, type insertPost, statusTable, postTable } from "@db/schema";

export function dateString(date: Date) {
  return dayjs(date).format("hh:mm A [on] MMM D, YYYY");
};

export function dateSimpleString(date: Date) {
  return dayjs(date).format("HH:mm DD/MM/YYYY");
};

export function dateConcise (date: Date) {
  return dayjs(date).format("DD/MM/YYYY");
};

export function dateConciseToInputFormat (dateString: string) {
  return dayjs(dateString, "DD/MM/YYYY", true).format("YYYY-MM-DD");
};

export function dateConciseForInput (date: Date) {
  return dayjs(date).format("YYYY-MM-DD");
}

export function isCorrectDateConcise (date: string | undefined) {
  return dayjs(date, "DD/MM/YYYY", true).isValid();
};

export function dateInputFormat (date: Date) {
  return dayjs(date).format("YYYY-MM-DD");
};

export function getURLfromBucketKey (key: string) {
  return import.meta.env.BUCKET_URL + key;
};

export function isValidImageUrl (value: string) {
  if (!value || !value.length) return false;
  try {
    const url = new URL(value);
    console.log(url);
    return ['http:', 'https:'].includes(url.protocol) && ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(url.href.split('.').pop() ?? '');
  } catch {
    return false;
  }
}

export type DataType<T extends 'post' | 'status'> = T extends 'post' ? insertPost : insertStatus;
export function getDefaultPostOrStatus<T extends 'post' | 'status'>(type: T): DataType<T> {
  if (type === 'post') {
    const post: insertPost = {
      text: '',
      title: '',
      slug: '',
      type: 'article',
      textColor: postTable.textColor.default as string,
      backgroundColor: postTable.backgroundColor.default as string,
    };
    return post as DataType<T>;
  } else {
    const status: insertStatus = {
      text: '',
      theme: 'light',
      mood: 'neutral',
      spotify_link: '',
    };
    return status as DataType<T>;
  }
};

export async function getPostOrStatus<T extends 'post' | 'status'>(Astro: AstroGlobal, type: T, latest?: boolean): Promise<{ data: DataType<T>; mode: 'create' | 'update'; }> {
  const uniqueKey = Astro.url.searchParams.get(type == 'post' ? 'slug' : 'id');
  const getLatest = latest || Astro.url.searchParams.get('getLatest') === 'true';
  let data: DataType<T> = getDefaultPostOrStatus(type);
  let mode: 'create' | 'update' = 'create';

  if (uniqueKey?.length || getLatest) {
    let fetchUrl = Astro.url.origin + '/api/' + type + (getLatest ? '' : '/' + uniqueKey) + '.json';
    const response = await fetch(fetchUrl);
    if (response.ok) {
      data = await response.json() as DataType<T>;
      mode = 'update';
    };
  };

  return { data, mode };
};

export type SearchOptions<T> = {
  search?: string;
  before?: string; // DD/MM/YYYY
  after?: string; // DD/MM/YYYY
  type?: T extends 'post' ? insertPost['type'] : never;
};
export type SearchResult<T extends 'post' | 'status'> = {
  items: DataType<T>[],
  count: number;
}
export async function getListOfPostsOrStatuses<T extends 'post' | 'status'>(urlOrigin: AstroGlobal['url']['origin'], type: T, firstSearch = true, page = 1, options: SearchOptions<T> ): Promise<SearchResult<T>> {
  const urlSearch = new URLSearchParams({
    offset: (10 * (page - 1)).toString(),
    ...(firstSearch ? { getCount: 'true' } : {})
  });

  Object.keys(options).forEach(key => {
    const value = options[key as keyof SearchOptions<T>];
    if (value && (!['before', 'after'].includes(key) || isCorrectDateConcise(value))) {
      urlSearch.append(key, value as string);
    }
  });

  const apiName = type == 'post' ? 'posts' : 'statuses';
  const fetchUrl = urlOrigin + '/api/' + apiName + '.json?' + urlSearch.toString();

  let data: SearchResult<T> = { items: [], count: 0 };

  const response = await fetch(fetchUrl);
  if (response.ok) {
    const responseData = await response.json() as { count: number, statuses?: DataType<T>[], posts?: DataType<T>[] };
    const items = type === 'post' ? responseData.posts : responseData.statuses;
    data = { items: items || [], count: responseData.count };
  };

  return data;
}

export const THEME_MAP = {
	dark: { color: 'var(--dark-pen-color)', background: 'var(--dark-screen-color)', gray: 'var(--dark-gray-color)' },
	light: { color: 'var(--pen-color)', background: 'var(--screen-color)', gray: 'var(--gray-color)' },
	red: { color: 'var(--red-pen-color)', background: 'var(--red-screen-color)', gray: 'var(--red-gray-color)' },
	purple: { color: 'var(--purple-pen-color)', background: 'var(--purple-screen-color)', gray: 'var(--purple-gray-color)' },
};

const t_u = (tag: string, urls: string[]) => {
  return { TAG: tag, URLs: urls };
};

export const CACHE_TAGS = {
  HOME: t_u('home', ['/']),
  STATUS: t_u('status', ['/api/status.json', '/api/statuses.json']),
  CONTENT_SEARCH: t_u('content-search', ['/api/posts.json', '/search']),
  SLUG: t_u('slug-$slug', ['/search', '/post/$slug'])
};

export function cacheThis(response: { readonly headers: Headers }, tag: string, browserAge: number = 300, cfCdnAge: number = 2419200) {
  if (import.meta.env.DEV) {
    console.log(`Cache set for tag: ${tag}, browserAge: ${browserAge}, cfCdnAge: ${cfCdnAge}`);
  }
  response.headers.set('Cache-Control', `public, max-age=${browserAge}`);
  response.headers.set('Cloudflare-CDN-Cache-Control', `public, max-age=${cfCdnAge}`);
  response.headers.set('Cache-Tag', tag);
}

export async function purgeCache(tags: string[]) {
  if (import.meta.env.DEV) {
    console.log('Purging cache in development mode is skipped.');
    return;
  }
  if (import.meta.env.CLOUDFLARE_API_KEY && import.meta.env.CLOUDFLARE_EMAIL && import.meta.env.CLOUDFLARE_ZONE_ID) {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${import.meta.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Email': import.meta.env.CLOUDFLARE_EMAIL,
            'X-Auth-Key': import.meta.env.CLOUDFLARE_API_KEY,
          },
          body: JSON.stringify({ tags }),
        }
      );
      
      if (!response.ok) {
        console.error('Failed to purge cache:', await response.text());
      }
    } catch (error) {
      console.error('Error purging cache:', error);
    }
  } else {
    console.warn('Cloudflare API credentials are not set. Cache purge skipped.');
  }
}

export async function warmCache(urls: string[]) {
  if (import.meta.env.DEV) {
    console.log('Warming cache in development mode is skipped.');
    return;
  }
  try {
    await Promise.all(urls.map(url => fetch(url)));
  } catch (error) { 
    console.error('Error warming cache:', error);
  }
}

const doReplaceDynamic = (str: string, replaceDynamic?: [string, string][]) => {
  if (!replaceDynamic?.length) return str;
  let result = str;
  replaceDynamic.forEach(([searchValue, replaceValue]) => {
    result = result.replace(new RegExp(searchValue, 'g'), replaceValue);
  });
  return result;
};

export async function cacheRebuild(originUrl: string, tagInfo: { TAG: string, URLs: string[] }[], replaceDynamic?: [string, string][]) {
  const thisTagInfo = tagInfo.map(tag => {
    const TAG = doReplaceDynamic(tag.TAG, replaceDynamic);
    const URLs = tag.URLs.map(url => {
      url = doReplaceDynamic(url, replaceDynamic);
      if (url == '/') {
        return originUrl;
      } else {
        return originUrl + url.replace(/^\//, ''); // Ensure no leading slash
      }
    })
    return { TAG, URLs };
  });

  if (import.meta.env.DEV) {
    console.log(`Cache rebuild for tag(s) ${thisTagInfo.map(t => t.TAG).join(', ')} in development mode is skipped.`);
    return;
  }
  const theseUrls = [...new Set(thisTagInfo.flatMap(tag => tag.URLs))];
  try {
    await purgeCache(thisTagInfo.map(tag => tag.TAG));
    await warmCache(theseUrls);
  } catch (error) {
    console.error(`Error during cache rebuild for tag ${thisTagInfo.map(t => t.TAG).join(', ')}:`, error);
  }
};