<script lang="ts">
    import { writable, type Writable } from 'svelte/store';
    import { setContext, onDestroy, untrack } from 'svelte';

    interface Props {
        value: string | string[] | number | number[] | boolean | boolean[] | null | undefined;
        multiple?: boolean;
        disabled?: boolean;
        display?: 'button' | 'chip' | 'nativ';
        onChange?: ((val: typeof value) => any | Promise<any>) | undefined;
        _class?: string | undefined;
        children?: import('svelte').Snippet;
    }

    let {
        value = $bindable(),
        multiple = $bindable(false),
        disabled = false,
        display = 'button',
        onChange = undefined,
        _class = undefined,
        children,
    }: Props = $props();

    let _disabled = writable(disabled);

    let _multiple: Writable<boolean> = writable(multiple);

    function setMultipleStore() {
        if (multiple) {
            if (!Array.isArray(value)) {
                if (value) {
                    value = [value];
                } else {
                    value = [];
                }
            }
        } else {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    value = value[0];
                } else {
                    value = null;
                }
            }
        }

        _multiple.set(multiple);
    }
    const unsub1 = _multiple.subscribe((val) => (multiple = val));

    let valueStore = writable(value);

    const unsub2 = valueStore.subscribe((valueStoreValue) => (value = valueStoreValue));

    let _onChange = writable(onChange);

    setContext('value', valueStore);
    setContext('_onChange', _onChange);
    setContext('_multiple', _multiple);
    setContext('_disabled', _disabled);
    setContext('display', display);

    $effect(() => {
        $_disabled = disabled;
    });

    $effect(() => {
        /* maybe could with explicit */
        valueStore.set(value);
    });

    $effect(() => {
        void multiple;
        untrack(() => {
            setMultipleStore();
        });
    });

    onDestroy(() => {
        unsub1();
        unsub2();
    });
</script>

<div
    class:hs-toggle-button-group={display === 'button'}
    class:hs-toggle-chip-group={display === 'chip'}
    class={`wrapper ${_class ?? ''}`}
    role="group"
    aria-label="group"
>
    {@render children?.()}
</div>

<style lang="scss">
    .wrapper {
        display: contents;
    }

    .hs-toggle-button-group {
        display: inline-flex;
        flex-wrap: wrap;
    }

    .hs-toggle-chip-group {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 8px;
    }
</style>
