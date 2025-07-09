<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';

    type Props = {
        checked?: boolean;
        title?: string;
    } & HTMLInputAttributes;

    let { checked = $bindable(), title, ...rest }: Props = $props();
</script>

<vscode-checkbox
    {checked}
    {...rest}
    onchange={(e) => {
        checked = e.target.checked;
        rest?.onchange?.(e);
    }}
>
    {#if title}
        {title}
    {/if}
</vscode-checkbox>

<style lang="scss">
    /* your styles go here */
</style>
