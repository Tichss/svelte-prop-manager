<script lang="ts">
    import type ToggleButtonGroup from './ToggleButtonGroup.svelte';
    import { type ComponentProps, getContext } from 'svelte';
    import type { Writable } from 'svelte/store';

    const parentValue = getContext('value') as Writable<string | string[]>;
    const onChange = getContext('_onChange') as Writable<
        ComponentProps<typeof ToggleButtonGroup>['onChange']
    >;
    const _multiple = getContext('_multiple') as Writable<boolean>;
    const _disabled = getContext('_disabled') as Writable<boolean>;
    const display = getContext('display') as 'button' | 'chip' | 'nativ';

    interface Props {
        value: any;
        disabled?: boolean;
        _class?: string | undefined;
        children?: import('svelte').Snippet;
    }

    let { value, disabled = false, _class = undefined, children }: Props = $props();
    let selected = $derived(
        Array.isArray($parentValue) ? $parentValue?.indexOf(value) >= 0 : $parentValue === value
    );
</script>

<button
    class={_class}
    class:hs-toggle-button={display === 'button'}
    class:hs-toggle-chip={display === 'chip'}
    class:selected
    aria-pressed={selected}
    type="button"
    onclick={() => {
        if ($_multiple) {
            if (!Array.isArray($parentValue)) {
                if ($parentValue !== value) {
                    $parentValue = [$parentValue, value];
                } else {
                    $parentValue = [value];
                }
                $onChange?.($parentValue);

                return;
            }

            let index = $parentValue?.indexOf(value);

            if (index === -1) {
                $parentValue.push(value);
            } else {
                $parentValue.splice(index, 1);
            }

            $parentValue = $parentValue;
            $onChange?.($parentValue);
        } else {
            if ($parentValue !== value) {
                $parentValue = value;
                $onChange?.($parentValue);
            }
        }
    }}
    disabled={disabled || $_disabled}
>
    {@render children?.()}
</button>

<style lang="scss">
    :global(.hs-toggle-button-group) {
        & > :first-child {
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
            border: 1px solid white;
        }
        & > :last-child {
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
        }
    }

    .hs-toggle-button {
        background-color: transparent;
        cursor: pointer;
        vertical-align: middle;
        font-size: 0.8rem;
        padding: 2px 8px;
        border: 1px solid white;
        border-left: unset;
        color: inherit;
        font-size: 11px;

        &:hover {
            background-color: rgb(86, 86, 86);
        }

        &.selected {
            color: black;
            background-color: white;
        }

        &:disabled {
            background-color: transparent;
            cursor: not-allowed;

            &:hover {
                background-color: transparent;
            }

            &.selected {
                color: rgba(var(--theme-rgb), 0.8);
                background-color: rgba(var(--theme-rgb), 0.05);
            }
        }
    }
</style>
