<script lang="ts">
    import { insertAfterLastImport } from '$lib/functions';

    interface Props {
        rawText?: string;
    }

    let { rawText }: Props = $props();
</script>

<button
    onclick={() => {
        console.log(insertAfterLastImport(rawText, ['asd']));
    }}
>
    123
</button>

<style lang="scss">
    /* your styles go here */
</style>
