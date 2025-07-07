<script lang="ts">
  import { type selectPost } from '@db/schema';
  import { getListOfPostsOrStatuses, isCorrectDateConcise, dateConcise, dateConciseForInput, dateConciseToInputFormat, dateString, type SearchOptions, type DataType } from "@lib/utils";
  import Status from './status.svelte';
  import { marked } from 'marked';

  export let isLoggedIn = false;
  export let urlOrigin: string = '';
  export let contentType: 'post' | 'status' = 'post';
  export let options = {} as SearchOptions<'post' | 'status'>;
  export let items = [] as DataType<'post' | 'status'>[];
  export let page = 1;
  export let count = 0;

  let justMounted = false; // Will set to true on $

  const calculatePaginationOps = () => {
    let arr: (number | string)[] = [1];
    const maxPage = Math.ceil(count / 10);
    if (maxPage > 5 && page > 3) {
      arr = [1, '...', page , '...', maxPage];
    }
    else if (maxPage > 5 && page <= 3) {
      arr = [1, 2, 3, '...', maxPage];
    } else {
      arr = Array.from({ length: maxPage }, (_, i) => i + 1);
    }
    return arr;
  };

  let pageNumsArray = calculatePaginationOps();

  let optionsCache = {...options};
  let date = {
    before: options.before ? dateConciseToInputFormat(options.before) : undefined,
    after: options.after ? dateConciseToInputFormat(options.after) : undefined
  };
  $: {
    options.before = date.before ? dateConcise(new Date(date.before)) : undefined;
    options.after = date.after ? dateConcise(new Date(date.after)) : undefined;
    if (justMounted && (isCorrectDateConcise(options.before) || isCorrectDateConcise(options.after))) {
      handleSearch();
    }
    justMounted = true;
  }

  const handleSearch = async (forContentType = contentType, postType: selectPost['type'] | undefined = undefined) => {
    if (postType) options.type = postType;

    let firstSearch = false;
    const keys = Object.keys(options) as (keyof SearchOptions<'post' | 'status'>)[];
    if (options.before && !isCorrectDateConcise(options.before)) options.before = undefined;
    if (options.after && !isCorrectDateConcise(options.after)) options.after = undefined;
    if (!optionsCache || forContentType !== contentType || keys.some(key => options[key] !== optionsCache[key])) {
      firstSearch = true;
    }

    const data = await getListOfPostsOrStatuses(urlOrigin, forContentType, firstSearch, page, options);
    if (firstSearch) {
      count = data.count;
      page = 1;
      contentType = forContentType;
      optionsCache = {...options};
    };

    items = data.items;
    pageNumsArray = calculatePaginationOps();
  };

  const getHref = (item: DataType<'post' | 'status'>) => {
    if (contentType === 'post' && 'slug' in item) return `/post/${item.slug}`;
    else return 'admin/status?id=' + item.id;
  };
  const getEditHref = (item: DataType<'post' | 'status'>) => {
    if (contentType === 'post' && 'slug' in item) return `admin/post?slug=${item.slug}`;
    else return 'admin/status?id=' + item.id;
  }

  const isPost = (item: DataType<'post' | 'status'>): item is selectPost => {
    return 'slug' in item;
  };

  const textContent = (item: DataType<'post' | 'status'>) => {
    let text = marked.parseInline(item.text?.replace(/\n/g, '<br />') ?? '');
    return text.toString().replace(/#/g, '');
  };

</script>

<div>
  {#if isLoggedIn}
  <nav class="flex gap-1 mb-2">
    <button class="filter-btn" disabled={contentType === 'status'} on:click={() => handleSearch('status')}>
      Statuses
    </button>
    <button class="filter-btn" disabled={contentType === 'post'} on:click={() => handleSearch('post')}>
      Posts
    </button>
  </nav>
  {/if}
  <nav class="flex flex-col md:flex-row md:items-center gap-3">

    <div class="flex gap-1 items-center">
      <input class="input-basic min-w-36" type="search" placeholder="Search" bind:value={options.search} on:keypress={e => e.key === 'Enter' && handleSearch()}  />
      <button class="fill-current cursor-pointer" on:click={() => handleSearch()}> <!-- Search Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path fill="currentColor" d="m19.485 20.154l-6.262-6.262q-.75.639-1.725.989t-1.96.35q-2.402 0-4.066-1.663T3.808 9.503T5.47 5.436t4.064-1.667t4.068 1.664T15.268 9.5q0 1.042-.369 2.017t-.97 1.668l6.262 6.261zM9.539 14.23q1.99 0 3.36-1.37t1.37-3.361t-1.37-3.36t-3.36-1.37t-3.361 1.37t-1.37 3.36t1.37 3.36t3.36 1.37"/></svg>
      </button>
    </div>

    <div class="flex gap-4 text-sm">
      {#if !options.before}
      <button class="flex items-center gap-1 underline text-xs md:text-sm" on:click={() => date.before = dateConciseForInput(new Date())}>
        <span>Before date?</span>
        <span class="fill-current"> <!-- Plus Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4.929 4.929A10 10 0 1 1 19.07 19.07A10 10 0 0 1 4.93 4.93zM13 9a1 1 0 1 0-2 0v2H9a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2z"/></svg>
        </span>
      </button>
      {:else}
      <div class="flex gap-1 items-center px-1 bg-slate-400 rounded">
        <span class="font-bold text-xs md:text-sm">Before</span>
        <input type="date" class="outline-none bg-transparent w-24" bind:value={date.before} />
        <button class="fill-current cursor-pointer ml-1" on:click={() => {date.before = undefined; handleSearch()}}> <!-- Minus Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m40 112H88a8 8 0 0 1 0-16h80a8 8 0 0 1 0 16"/></svg>
        </button>
      </div>
      {/if}

      {#if !options.after}
      <button class="flex items-center gap-1 underline text-xs md:text-sm" on:click={() => date.after = dateConciseForInput(new Date())}>
        <span>After date?</span>
        <span class="fill-current"> <!-- Plus Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4.929 4.929A10 10 0 1 1 19.07 19.07A10 10 0 0 1 4.93 4.93zM13 9a1 1 0 1 0-2 0v2H9a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2z"/></svg>
        </span>
      </button>
      {:else}
      <div class="flex gap-1 items-center px-1 bg-slate-400 rounded">
        <span class="font-bold text-xs md:text-sm">After</span>
        <input type="date" class="outline-none bg-transparent w-24" bind:value={date.after} />
        <button class="fill-current cursor-pointer ml-1" on:click={() => {date.after = undefined; handleSearch()}}> <!-- Minus Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m40 112H88a8 8 0 0 1 0-16h80a8 8 0 0 1 0 16"/></svg>
        </button>
      </div>
      {/if}
    </div>

    {#if contentType === 'post'}
    <div class="ml-auto flex gap-1">
      <button disabled={options.type === 'poem'} on:click={() => {options.type = 'poem'; handleSearch()}} class="filter-btn">
        Poems
      </button>
      <button disabled={options.type === 'article'} on:click={() => {options.type = 'article'; handleSearch()}} class="filter-btn">
        Posts <!-- Meant to be articles but that sounds odd so I've written posts -->
      </button>
      <button disabled={options.type == undefined} on:click={() => {options.type = undefined; handleSearch()}} class="filter-btn">
        All
      </button>
      {#if import.meta.env.DEV}
      <button on:click={() => console.log({ items })} class="filter-btn">
        Debug 🤡
      </button>
      {/if}
    </div>
    {/if}

  </nav>

  <hr class="mt-1 mb-3 border-[--dark-faint-border-color]">

  {#if items.length}
  {#each items as item}
  {#key contentType + item.id}
    <a href={getHref(item)} target={contentType == 'post' ? undefined : '_blank'} class="border-b border-[--dark-faint-border-color] pb-3 pt-2 block">
      {#if isPost(item)} <!-- Type guard to reassure typescript that it's a post -->
        <h1 class="font-bold text-lg">
          {item.title}
        </h1>
        <span class="text-sm font-bold tracking-wide text-[--applied-gray-color]">
          {item.type == 'poem' ? 'Poem' : 'Post'}
        </span>
        <p class="post-preview-text my-2">
          {@html textContent(item)}
        </p>
        {:else}
          <Status status={item} />

        {/if}
        <p class="text-right text-sm">
          {dateString(item.date || new Date())}
        </p>
        {#if isLoggedIn}
          <a href={getEditHref(item)} class="underline">
            Edit
          </a>
        {/if}
    </a>
    {/key}
    {/each}
    {:else}
    <div class="flex items-center justify-center h-28 text-sm font-bold italic tracking-wide text-[--gray-color]">
      Looks like it's just you and me...
    </div>
    {/if}
    <div class="border-t-2 border-[--dark-faint-border-color] py-4 flex items-center justify-between">
      <span class="text-[--applied-gray-color] text-sm">
        {count} result{count === 1 ? '' : 's'}
      </span>
      {#if count > 10}
      <div class="flex gap-2">
        <button disabled={page == 1} on:click={() => {page--; handleSearch()}} class="min-w-[2ch] text-sm bg-transparent hover:bg-black/25 transition-all px-2 py-1 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12z"/></svg>
        </button>
        {#each pageNumsArray as pageNum}
          <button on:click={() => {typeof pageNum === 'string' ? '' : page = pageNum; handleSearch()}} disabled={page === pageNum || pageNum === '...'} class="filter-btn" style="--min-item-w: 3ch">
            {pageNum}
          </button>
        {/each}
        <button disabled={page == Math.ceil(count / 10)} on:click={() => {page++; handleSearch()}} class="min-w-[2ch] text-sm bg-transparent hover:bg-black/25 transition-all px-2 py-1 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>
      {/if}
    </div>
</div>

<style>
::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
.post-preview-text {
  --num-lines: 2;
  --line-height: 1.4em;
  text-align: justify;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: var(--num-lines);
  -webkit-line-clamp: var(--num-lines);
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: var(--line-height);
  max-height: calc(var(--num-lines) * var(--line-height));
}
</style>