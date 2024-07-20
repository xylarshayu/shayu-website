<script lang='ts'>
  import { postTable, type insertPost } from '@db/schema';
  import { dateInputFormat, getDefaultPostOrStatus } from '@lib/utils';
  import PostViewer from './post.svelte';
  import ColorInput from './colorInput.svelte';
  import GalleryInput from './galleryInput.svelte';

  export let post = getDefaultPostOrStatus('post');
  export let mode: 'create' | 'update' = 'create';

  let date = dateInputFormat(post.date ?? new Date());
  $: post.date = new Date(date);

  const handleCreate = async () => {
    if (mode !== 'create') return;
    try {
      post = await fetch('/api/post.json', {
        method: 'POST',
        body: JSON.stringify(post),
      }).then(res => res.json());
      mode = 'update';
    }
    catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    if (mode !== 'update') return;
    try {
      await fetch(`/api/post/${post.id}.json`, {
        method: 'PATCH',
        body: JSON.stringify(post),
      });
      mode = 'update';
      date = dateInputFormat(post.date!);
    }
    catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (mode !== 'update') return;
    try {
      await fetch(`/api/post/${post.id}.json`, {
        method: 'DELETE',
      });
      post = getDefaultPostOrStatus('post');
      date = dateInputFormat(new Date());
      mode = 'create';
    }
    catch (error) {
      console.error(error);
    }
  };

  let previewMode = false;

  const setDefaultColorValues = () => {
    post.textColor = postTable.textColor.default as string;
    post.backgroundColor = postTable.backgroundColor.default as string;
  };
</script>

<div class="postForm flex flex-wrap gap-y-1 justify-between {$$restProps.class || ''}">
  <input bind:value={post.title} type="text" name="title" class="basis-full input-basic" placeholder="Title" required />
  <select name="type" required class="basis-[34%] input-basic" bind:value={post.type}>
    {#each postTable.type.enumValues as type}
      <option value={type}>{type}</option>
    {/each}
  </select>
  <input bind:value={date} type="date" name="date" class="basis-[64%] input-basic" />
  <GalleryInput bind:value={post.image} class="basis-[32%]" />
  <ColorInput bind:color={post.textColor} label="Text Color" class="basis-[32%]" />
  <ColorInput bind:color={post.backgroundColor} label="Background Color" class="basis-[32%]" />
  <button on:click={setDefaultColorValues} class="underline text-sm">Set default color values</button>
  <span class="flex items-center ml-auto">{previewMode ? '👁‍🗨 Preview' : '✏ Edit'}&nbsp;&nbsp;&nbsp;<input type="checkbox" class="my-toggle" bind:checked={previewMode} /> </span>
  <!-- Add image insert thingy -->
  <div class="basis-full {previewMode ? 'mt-2 p-2' : ''}" style="color: {post.textColor}; background-color: {post.backgroundColor};">
    {#if previewMode}
    <PostViewer {post} />
    {:else}
    <textarea bind:value={post.text} class="mt-1 w-full min-h-[25vh] max-h-[50vh] overflow-auto p-2 input-basic" placeholder="Time to write"></textarea>
    {/if}
  </div>
  <div class="flex justify-between basis-full gap-1">
    {#if mode == 'create'}
    <button on:click={handleCreate} class="btn primary ml-auto">Post</button>
    {:else}
    <button on:click={handleDelete} class="btn danger">Delete</button>
    <button on:click={handleUpdate} class="btn primary">Update</button>
    {/if}
  </div>
</div>

<style>
.postForm {
  --defaultText: var(--dark-pen-color);
  --defaultBackground: var(--dark-screen-color);
}
</style>