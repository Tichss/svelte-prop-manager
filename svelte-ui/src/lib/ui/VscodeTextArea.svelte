<script lang="ts">
    import type { HTMLTextareaAttributes } from 'svelte/elements';

    interface Props extends HTMLTextareaAttributes {
        value?: string | number;
        title?: string;
    }

    let { value = $bindable(), title, ...rest }: Props = $props();
</script>

<vscode-text-area
    {value}
    {...rest}
    oninput={(e) => {
        value = e.target.value;
        rest?.oninput?.(e);
    }}
>
    {#if title}
        {title}
    {/if}
</vscode-text-area>

<style lang="scss">
    /* your styles go here */
</style>
