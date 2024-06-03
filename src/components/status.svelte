<script lang="ts">
  import type { insertStatus as Status } from "@db/schema";
  import { Carta, Markdown } from "carta-md";

  export let status: Status;

  const carta = new Carta();
</script>

<div class="flex flex-col items-center gap-2 {$$restProps.class || ''}">
  <div class="text-center">
    <Markdown value={status.text ?? ''} {carta} />
  </div>
  <div>({ status.mood })</div>
  <div class="italic text-sm">{ status.theme }</div>
</div>