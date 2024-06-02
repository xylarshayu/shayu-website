<script lang="ts">
  import type { selectStatus as Status } from "@db/schema";

  export let status: Status;
</script>

<div class="flex flex-col items-center gap-2 {$$restProps.class || ''}">
  <div class="text-center">{ status.text }</div>
  <div>({ status.mood })</div>
  <div class="italic text-sm">{ status.theme }</div>
</div>