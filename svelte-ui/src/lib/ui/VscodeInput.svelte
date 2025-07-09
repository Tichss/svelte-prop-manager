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

<div class="root">
    <input bind:value />
</div>

<style lang="scss">
    .root {
        box-sizing: border-box;
        position: relative;
        display: flex;
        flex-direction: row;
        color: var(--input-foreground);
        background: var(--input-background);
        border-radius: calc(var(--corner-radius-round) * 1px);
        border: calc(var(--border-width) * 1px) solid var(--dropdown-border);
        height: calc(var(--input-height) * 1px);
        min-width: var(--input-min-width);
    }
    input {
        appearance: none;
        font-style: inherit;
        font-variant: inherit;
        font-weight: inherit;
        font-stretch: inherit;
        font-family: inherit;
        font-size-adjust: inherit;
        font-kerning: inherit;
        font-optical-sizing: inherit;
        font-language-override: inherit;
        font-feature-settings: inherit;
        font-variation-settings: inherit;
        background: transparent;
        color: inherit;
        height: calc(100% - (var(--design-unit) * 1px));
        width: 100%;
        margin-top: auto;
        margin-bottom: auto;
        border: medium;
        padding: 0 calc(var(--design-unit) * 2px + 1px);
        font-size: 13px;
        line-height: normal;
    }
</style>
