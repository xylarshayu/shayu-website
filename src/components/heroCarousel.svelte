<script lang="ts">
  interface Status {
    text: string;
    id: number;
  }

  export let statuses: Array<Status> = [{text: 'hello world -1', id: -1}];
  export let currIdx = 0;

  const getStatuses = async () => {
    const newStatuses: Array<Status> = await fetch(`/api/statuses.json?num=${currIdx + 7}`).then(res => res.json());
    if (statuses.length) statuses = [...statuses, ...newStatuses];
  };

  $: if (currIdx >= (statuses.length - 6)) getStatuses();
</script>

<div class="flex flex-col items-center gap-2">
  <h2 class="h2">
    {statuses[currIdx].text}
  </h2>
  <div class="flex gap-2">
    <button on:click={() => currIdx--}>Prev</button>
    <button on:click={() => currIdx++}>Next</button>
  </div>
  <div class="w-full rounded border border-stone-500 text-center">
    {currIdx} || {statuses.length}
  </div>
</div>

<!-- {#if statuses.length}
  {#each statuses as status}
    <p>{status.text}</p>
    <p>{status.id}</p>
  {/each}
{/if} -->