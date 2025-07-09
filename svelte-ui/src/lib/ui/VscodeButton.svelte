<script lang="ts">
    import { Button } from '@vscode/webview-ui-toolkit';
    import type { Snippet } from 'svelte';

    type Props = Omit<Partial<Button>, 'children'> & {
        styleContent?: string;
        children?: Snippet;
    };

    let { children, styleContent, ...rest }: Props = $props();
</script>

<vscode-button {...rest}>
    <div style="font-size: var(--type-ramp-base-font-size); {styleContent ?? ''}">
        {@render children?.()}
    </div>
</vscode-button>

<style>
</style>
