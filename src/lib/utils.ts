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

export function dateInputFormat (date: Date) {
  return dayjs(date).format("YYYY-MM-DD");
};

type DataType<T extends 'post' | 'status'> = T extends 'post' ? insertPost : insertStatus;
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
}