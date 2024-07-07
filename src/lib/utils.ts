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

export async function getPostOrStatus<T extends 'post' | 'status'>(Astro: AstroGlobal, type: T): Promise<{ data: DataType<T>; mode: 'create' | 'update'; }> {
  const uniqueKey = Astro.url.searchParams.get(type == 'post' ? 'slug' : 'id');
  const getLatest = Astro.url.searchParams.get('getLatest') === 'true';
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