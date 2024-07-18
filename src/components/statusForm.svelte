<script lang="ts">
  import { statusTable, type insertStatus } from '@db/schema';
  import { dateSimpleString, getDefaultPostOrStatus } from '@lib/utils';
  import StatusViewer from './status.svelte';

  export let status = getDefaultPostOrStatus('status');
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

      status = getDefaultPostOrStatus('status');
      mode = 'create';
    }
    catch (error) {
      console.error(error);
    }
  };

  let previewMode = false;
</script>

<div class="rounded-md overflow-hidden {$$restProps.class || ''}">
  <div class="bg-[--dark-shade-color] text-[--dark-pen-color] p-2 flex items-center justify-between">
    <span class="font-bold tracking-wide">{panelText}</span>
    <span class="flex items-center">{previewMode ? '👁‍🗨 Preview' : '✏ Edit'}&nbsp;&nbsp;&nbsp;<input type="checkbox" class="my-toggle" bind:checked={previewMode} /> </span>
  </div>
  <div class="max-w-full bg-slate-700 p-1">
    {#if previewMode}
      <StatusViewer status={status} />
    {:else}
      <div class="flex flex-wrap justify-between mb-1">
        <select name="theme" required class="basis-[49%] input-basic" bind:value={status.theme}>
          {#each statusTable.theme.enumValues as theme}
            <option value={theme}>{theme}</option>
          {/each}
        </select>
        <select name="mood" required class="basis-[49%] input-basic" bind:value={status.mood}>
          {#each statusTable.mood.enumValues as mood}
            <option value={mood}>{mood}</option>
          {/each}
        </select>
        <input bind:value={status.spotify_link} type="url" name="spotify_link" class="basis-full input-basic mt-1" placeholder="Spotify link" />
        <!-- Add image insert thingy -->
      </div>
      <textarea bind:value={status.text} placeholder="Insert the status update text" class="mt-1 w-full max-h-[50vh] overflow-auto p-2 input-basic"></textarea>
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