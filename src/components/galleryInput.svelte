<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let value: string | null | undefined;

  let newImagePrefix: string = '';
  let previewUrl: string | null = null;
  let galleryImageFiles: { key: string; url: string }[] = [];

  const uploadImage = async () => {
    if (!imgInput.files || imgInput.files.length === 0) return;

    let fileSuffix = imgInput.files[0].name.split('.').pop();
    let key = newImagePrefix?.length ? newImagePrefix + '.' + fileSuffix : imgInput.files[0].name;

    const formData = new FormData();
    formData.append('file', imgInput.files[0]);
    formData.append('key', key);

    const response = await fetch('/api/bucket.json', { method: 'POST', body: formData });
    const { url } = await response.json() as { url: string };

    if (response.ok) galleryImageFiles = [...galleryImageFiles, { key, url }];
    else console.error(response);

    newImagePrefix = '';
    if (imgInput) {
      imgInput.value = '';
      imgInput.files = null;
      previewUrl = null;
    }
  }

  let cursor: string; // For continuing search of bucket items
  let search: string;
  const fetchGallery = async () => {
    const searchParams = new URLSearchParams({
      ...(search?.length ? { search } : {}),
      ...(cursor?.length ? { cursor } : {}),
    });

    const response = await fetch(`/api/bucket.json?${searchParams.toString()}`);

    if (response.ok) {
      const { items, cursor: newCursor } = await response.json() as { items: { key: string; url: string }[]; cursor: string };
      galleryImageFiles = [...galleryImageFiles, ...items];
      cursor = newCursor;
    }
  };

  const deleteImage = async (key: string) => {
    const response = await fetch('/api/bucket.json', { method: 'DELETE', body: JSON.stringify({ key }) });

    if (response.ok) {
      galleryImageFiles = galleryImageFiles.filter(image => image.key !== key);
    }
    else console.error(response);
  }

  let modal: HTMLDialogElement;
  let imgInput: HTMLInputElement;

  const handleClickOutside = (e: MouseEvent) => {
    const modalBody = document.getElementById('modalBody');
    if (e.target === modal && (modalBody && !modalBody.contains(e.target as Node))) {
      modal.close();
    }
  };
  onMount(() => {
    modal.addEventListener('click', handleClickOutside);
  });
  onDestroy(() => {
    modal?.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="gallery-input input-basic {$$restProps.class || ''}">
  <input type="url" bind:value={value} placeholder="Image URL" class="outline-none bg-transparent"/>
  <button class="underline pr-1 whitespace-nowrap" on:click={() => {modal.showModal(); fetchGallery()}}>
    Open gallery
  </button>
  <dialog
    bind:this={modal}
    class="backdrop:bg-gray-900/80 min-w-[90vw] h-[80vh] outline-none p-4 rounded-md border bg-[--dark-screen-color] text-[--dark-pen-color] border-[--dark-faint-border-color]"
  >
    <div class="h-full w-full" id="modalBody">

      <div class="flex justify-between items-center">
        <h1 class="text-lg font-bold tracking-wide">Choose image</h1>
        <span class="flex gap-1 items-center">
          <input bind:value={search} type="text" placeholder="Search" class="input-basic" on:keydown={(e) => e.key === 'Enter' && fetchGallery()} />
          <button on:click={fetchGallery} class="filter-btn">Search</button>
        </span>
      </div>

      <div class="p-2 flex flex-wrap gap-[5%]">

        <div class="basis-[45%] md:basis-[30%] flex-0 aspect-square border-2 border-[--dark-faint-border-color] p-1 overflow-y-auto mb-4">
          <input bind:this={imgInput} type="file" accept="image/*" class="hidden" on:change={() => previewUrl = imgInput?.files && imgInput.files[0] ? URL.createObjectURL(imgInput.files[0]) : null} />
          {#if !previewUrl}
          <button on:click={() => imgInput.click()} class="h-full w-full bg-black/85 flex items-center justify-center font-bold rounded-xl">
            Upload Image 🖼
          </button>
          {:else}
          <div class="flex justify-between">
            <button on:click={() => imgInput.click()} class="btn secondary justify-center basis-[48%]">Change</button>
            <button on:click={uploadImage} class="btn primary justify-center basis-[48%]">Upload</button>
          </div>
          <img src={previewUrl} alt="Preview" class="w-full h-auto object-cover my-1" />
          <input class="input-basic block w-full" type="text" bind:value={newImagePrefix} placeholder="Name" />
          {/if}
        </div>

        {#each galleryImageFiles as image}
        <button
          on:click={() => {value = image.url; modal.close();}}
          class="basis-[45%] md:basis-[30%] aspect-square border-2 border-[--dark-faint-border-color] p-1 overflow-y-auto mb-4 flex flex-col items-center gap-1"
        >
          <img src={image.url} alt="Preview" class="w-[90%] h-auto object-cover" />
          <div class="text-center">{image.key}</div>
          <button class="underline" on:click|self|stopPropagation={() => deleteImage(image.key)}>Delete</button>
        </button>
        {/each}

      </div>

      {#if cursor}
      <button on:click={fetchGallery} class="btn secondary">Load more</button>
      {/if}

    </div>
  </dialog>
</div>

<style>
  .gallery-input {
    @apply inline-flex items-center gap-1;
    --defaultText: var(--dark-pen-color);
    --defaultBackground: var(--dark-screen-color);
  }
</style>

