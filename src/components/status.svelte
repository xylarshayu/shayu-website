<script lang="ts">
  import type { insertStatus as Status } from "@db/schema";
  import { marked } from "marked";

  export let status: Status;
</script>

<div class="flex flex-col items-center gap-2 {$$restProps.class || ''}">
  {#if status.image}
    <img src={status.image} alt="Preview" class="w-auto h-auto max-h-[200px] object-cover" />
  {/if}
  <div class="text-center">
    {@html marked(status.text ?? '')}
  </div>
  <div>Mood: { status.mood } | Color theme: { status.theme }</div>
  {#if status.spotify_link}
    <iframe
      src={`https://open.spotify.com/embed/track/${status.spotify_link.split('/').at(-1)}&utm_source=oembed`}
      width="400" height="100" title="Spotify Embed" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"
    />
  {/if}
</div>