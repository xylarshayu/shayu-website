<script lang="ts">
  export let color: string | null | undefined;
  export let label: string = 'Color';
</script>

<div class="color-input input-basic {$$restProps.class || ''}">
  <input type="text" bind:value={color} placeholder={label} class="outline-none bg-transparent"/>
  <input type="color" bind:value={color} style="--val:{color}" class="ml-auto" />
</div>

<style>
  .color-input {
    @apply inline-flex items-center gap-1;
    --defaultText: var(--dark-pen-color);
    --defaultBackground: var(--dark-screen-color);

    & input[type="color"] {
      @apply w-5 h-5 relative;
      &::before {
        @apply absolute top-0 left-0 w-full h-full cursor-pointer opacity-100;
        background-color: var(--val);
        content: '';
      }
    }
  }
</style>