<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLInputAttributes } from 'svelte/elements';

    type Props = {
        value?: string | number;
        title?: string;
        children?: Snippet;
    } & HTMLInputAttributes;

    let { value = $bindable(), title, children, ...rest }: Props = $props();
</script>

<vscode-text-field
    {value}
    {...rest}
    oninput={(e) => {
        value = e.target.value;
        rest?.oninput?.(e);
    }}
>
    {title}

    {@render children?.()}
</vscode-text-field>

<style lang="scss">
</style>
