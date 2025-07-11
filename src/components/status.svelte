<script lang="ts">
  import type { insertStatus as Status } from "@db/schema";
  import { marked } from "marked";

  export let status: Status;
</script>

<div class="flex flex-col items-center gap-2 {$$restProps.class || ''}">
  <div class="min-h-[200px]">
    {#if status.image}
      <img src={status.image} alt="Preview" class="w-auto h-auto max-h-[200px] object-cover drop-shadow-md" height="200" />
      {:else}
      <div class="text-transparent select-none">
        No image available
      </div>
    {/if}
  </div>
  <div class="text-center px-1">
    {@html marked(status.text ?? '')}
  </div>
  <div class="w-[300px] h-[80px]">
    {#if status.spotify_link}
      <iframe
        src={`https://open.spotify.com/embed/track/${status.spotify_link.split('/').at(-1)}&utm_source=oembed`}
        width="300" height="80" title="Spotify Embed" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"
      />
    {/if}
  </div>
</div>