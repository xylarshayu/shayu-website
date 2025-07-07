<script lang="ts">
  import type { insertPost as Post } from "@db/schema";
  import { marked } from "marked";
  import { dateConcise } from "@lib/utils";

  export let post: Post;

  $: info = {
    type: post.type!.charAt(0).toUpperCase() + post.type!.slice(1),
    date: dateConcise(post.date!),
  };
</script>

<article class="prose w-full max-w-full !text-inherit">
  <h1 class="text-inherit">{ post.title }</h1>
  <p class="text-right text-sm my-4"><b>{ info.type }</b> | Posted on { info.date }</p>
  <hr class="mt-0 mb-4" />
  {#if post.image}
    <img src={post.image} alt="Preview" class="w-auto h-auto max-h-[300px] object-cover mx-auto" />
  {/if}
  {@html marked(post.text?.replace(/\n/g, '<br />') ?? '')}
</article>