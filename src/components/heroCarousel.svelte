<script lang="ts">
  import StatusComponent from "./status.svelte";
  import { dateString } from "@lib/utils";
  import emblaCarouselSvelte from 'embla-carousel-svelte';
  import { type EmblaCarouselType } from 'embla-carousel';
  import { type selectStatus as Status } from "@db/schema";

  export let count = 10;
  export let statuses: Array<Status> = [];
  export let currIdx = 0;

  const getStatuses = async (idx = currIdx) => {
    const data: { statuses: Array<Status> } = await fetch(`/api/statuses.json?offset=${idx + 7}`).then(res => res.json());
    const newStatuses = data.statuses;
    if (statuses.length) statuses = [...statuses, ...newStatuses];
  };

  // $: if (currIdx >= (statuses.length - 6) && statuses.length < count) getStatuses();

  let emblaApi: EmblaCarouselType;
  function onEmblaInit(event: any): void {
    emblaApi = event.detail;
    emblaApi.on('select', () => {
      currIdx = emblaApi.selectedScrollSnap();
    });
    emblaApi.on('settle', () => {
      const idx = emblaApi.selectedScrollSnap() + 2; // Fetching it early on to avoid the user experiencing the weird scroll rerender
      if (idx >= (statuses.length - 6) && statuses.length < count) getStatuses(idx);
    })
  };

  const prev = () => {
    emblaApi.scrollPrev();
  };
  const next = () => {
    emblaApi.scrollNext();
  };

</script>

<div class="flex flex-col items-center gap-2">
  {#if statuses.length}
  <div class="embla" use:emblaCarouselSvelte on:emblaInit={onEmblaInit}>
    <div class="embla__container">
      {#each statuses as status}
        <StatusComponent status={status} class="embla__slide" />
      {/each}
    </div>
  </div>
  <div class="flex items-center gap-2">
    <button on:click={prev} disabled={currIdx === 0} class="font-bold text-lg disabled:opacity-50 wiggle-left-on-hover">{'<'}</button>
    <span class="font-bold tracking-wider text-xs uppercase">{dateString(statuses[currIdx].date)}</span>
    <button on:click={next} disabled={currIdx === statuses.length - 1} class="font-bold text-lg disabled:opacity-50 wiggle-right-on-hover">{'>'}</button>
  </div>
  <!-- <div class="w-full rounded border border-stone-500 text-center">
    {currIdx + 1} || {statuses.length}
  </div> -->
  {/if}
</div>

<style >
  .embla {
    @apply overflow-hidden;
    max-width: 100svw;

    & .embla__container {
      @apply flex;

      & :global(.embla__slide) {
        flex: 0 0 100%;
        min-width: 0;
      }
    }
  }

  
</style>