<script lang="ts">
  import { type insertStatus } from '@db/schema';
  import { dateSimpleString } from '@lib/utils';
  import StatusViewer from './status.svelte';
  import { Carta, MarkdownEditor } from 'carta-md';
  import 'carta-md/default.css';

  export let status: insertStatus = {
    text: '',
    theme: 'light',
    mood: 'neutral',
    spotify_link: '',
  };
  export let mode: 'create' | 'update' = 'create';

  let date = status.date;
  $: panelText = mode == 'create' ? 'New status' : `Edit status | Posted on ${dateSimpleString(date!)}`;

  const handleCreate = async () => {
    if (mode !== 'create') return;
    try {
      status = await fetch('/api/status.json', {
        method: 'POST',
        body: JSON.stringify(status),
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
      status = await fetch(`/api/status/${status.id}.json`, {
        method: 'PATCH',
        body: JSON.stringify(status),
      }).then(res => res.json());

      mode = 'update';
      date = status.date;
    }
    catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (mode !== 'update') return;
    try {
      await fetch(`/api/status/${status.id}.json`, {
        method: 'DELETE',
      });

      status = { text: '', theme: 'light', mood: 'neutral', spotify_link: '' };
      markdownText = '';
      mode = 'create';
    }
    catch (error) {
      console.error(error);
    }
  };

  let previewMode = false;

  const carta = new Carta({ sanitizer: false, theme: 'dark-plus' });
  
  let markdownText = status.text ?? '';
  $: if (markdownText !== status.text) status.text = markdownText;
/*   $: if (status.text !== markdownText) markdownText = status.text ?? '';
  $: if (markdownText !== status.text) status.text = markdownText; */
</script>

<div class="rounded-md overflow-hidden {$$restProps.class || ''}">
  <div class="bg-[--dark-shade-color] text-[--dark-pen-color] p-2 flex items-center justify-between">
    <span class="font-bold tracking-wide">{panelText}</span>
    <span class="flex items-center">{previewMode ? '👁‍🗨 Preview' : '✏ Edit'}&nbsp;&nbsp;&nbsp;<input type="checkbox" class="my-toggle" bind:checked={previewMode} /> </span>
  </div>
  <div class="max-w-full">
    {#if previewMode}
      <StatusViewer status={status} />
    {:else}
      <div class="bg-slate-400 max-h-[50vh] overflow-auto">
        <MarkdownEditor {carta} bind:value={markdownText} />
      </div>
      <div class="flex flex-row-reverse items-center p-2 justify-between bg-[--dark-shade-color]">
        {#if mode == 'create'}
        <button on:click={handleCreate} class="btn primary">Post status</button>
        {:else}
        <button on:click={handleUpdate} class="btn primary">Update status</button>
        <button on:click={handleDelete} class="btn danger">Delete status</button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  :global(.carta-theme__default .carta-input, .carta-theme__default .carta-renderer) {
    height: unset;
    min-height: 150px;
    max-height: 300px;
  }
</style>