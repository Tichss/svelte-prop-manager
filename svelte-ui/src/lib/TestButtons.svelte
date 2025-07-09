<script lang="ts">
    import { type Message } from '$lib/type';
    import VscodeButton from '$lib/ui/VscodeButton.svelte';
    import { onMount } from 'svelte';

    interface Props {
        class?: string;
    }

    let { class: _class }: Props = $props();

    let filesContent: { url: string; content: string; button: string }[] = $state([]);

    onMount(async () => {
        const modules = import.meta.glob('./testFiles/*', { eager: true, as: 'raw' });

        console.log(modules);

        for (const path in modules) {
            const url = path;
            const content = modules[path];
            const button = url.split('/').pop() ?? '';

            filesContent.push({ url, content, button });
        }

        const msg: Message = {
            command: 'activeFile',

            data: {
                fileName: filesContent[0].url,
                text: filesContent[0].content,
            },
        };
        window.postMessage(msg);
    });
</script>

{#each filesContent as f}
    <VscodeButton
        onclick={() => {
            const msg: Message = {
                command: 'activeFile',
                data: {
                    fileName: f.url,
                    text: f.content,
                },
            };
            window.postMessage(msg);
        }}
    >
        {f.button}
    </VscodeButton>
{/each}

<style lang="scss">
    /* your styles go here */
</style>
