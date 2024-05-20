<script lang="ts">
  import { type selectStatus as Status } from "@db/schema";

  export let count = 10;
  export let statuses: Array<Status> = [];
  export let currIdx = 0;

  const getStatuses = async () => {
    const data: { statuses: Array<Status> } = await fetch(`/api/statuses.json?offset=${currIdx + 7}`).then(res => res.json());
    const newStatuses = data.statuses;
    if (statuses.length) statuses = [...statuses, ...newStatuses];
  };

  $: if (currIdx >= (statuses.length - 6) && statuses.length < count) getStatuses();

  const getDateString = (date: Date | string) => {
    date = new Date(date);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString().slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
</script>

<div class="flex flex-col items-center gap-2">
  {#if statuses.length}
  <b>
    {statuses[currIdx].text}
  </b>
  <p>
    {getDateString(statuses[currIdx].date)} | {statuses[currIdx].mood} | {statuses[currIdx].theme}
    {#if statuses[currIdx].spotify_link?.length}
    <br>{statuses[currIdx].spotify_link}
    {/if}
  </p>
  <div class="flex gap-2">
    <button on:click={() => currIdx--} disabled={currIdx === 0}>Prev</button>
    <button on:click={() => currIdx++} disabled={currIdx === statuses.length - 1}>Next</button>
  </div>
  <div class="w-full rounded border border-stone-500 text-center">
    {currIdx + 1} || {statuses.length}
  </div>
  {/if}
</div>