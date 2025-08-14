<script lang="ts">
    import type { Prop } from '$lib/type';
    import VscodeButton from '$lib/ui/VscodeButton.svelte';
    import { tick } from 'svelte';
    import DeleteIcon from 'svelte-google-materialdesign-icons/Delete.svelte';

    interface Props {
        prop: Prop;
        kicsi?: boolean;
        onSubmit?: () => any;
        onDelete?: () => any;
    }
    let { prop = $bindable(), kicsi, onSubmit, onDelete }: Props = $props();
</script>

<div class="prop" class:kicsi>
    <div class="inputs" class:kicsi>
        <div class="label-wr" class:kicsi>
            <input
                required
                class="input"
                id="name-{prop.name}"
                value={prop.name}
                onchange={(e) => (prop.name = e.target.value)}
            />
        </div>

        <div class="label-wr" class:kicsi>
            <input class="input" bind:value={prop.type} />

            <button
                tabindex="-1"
                class="fl"
                class:active={prop.nullable}
                onclick={() => {
                    prop.nullable = !prop.nullable;
                    onSubmit?.();
                }}
            >
                Null
            </button>
        </div>

        <div class="label-wr" class:kicsi>
            <input class="input" bind:value={prop.value} />

            <button
                tabindex="-1"
                class="fl"
                class:active={prop.bindable}
                onclick={() => {
                    prop.bindable = !prop.bindable;
                    onSubmit?.();
                }}
            >
                Bind
            </button>
        </div>
    </div>

    <div
        class="delete"
        style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;"
    >
        <VscodeButton
            tabindex="-1"
            appearance="icon"
            type="button"
            onclick={async () => {
                onDelete?.();
            }}
        >
            <DeleteIcon size="13" />
        </VscodeButton>
    </div>
</div>

<style lang="scss">
    .flex {
        display: flex;
    }
    .prop {
        display: flex;
        align-items: center;
        max-width: 100%;

        gap: 3px;
        --design-unit: 0.5;
        --input-height: 20;
        --type-ramp-base-font-size: 10px;
        --input-min-width: 60px;

        &.kicsi {
            display: flex;
            align-items: start;
            margin-bottom: 8px;
        }
    }

    .inputs {
        display: flex;
        align-items: center;
        max-width: 100%;
        flex: 1;

        gap: 3px;

        &.kicsi {
            flex-wrap: wrap;
        }
    }

    .label-wr {
        width: 33%;
        position: relative;

        &.kicsi {
            width: 100%;
        }

        input {
            width: 100%;
            padding-right: 24px;
        }

        .fl {
            position: absolute;
            right: 0px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
            cursor: pointer;
            transition: 0.15s;
            font-size: 10px;
            background-color: inherit;
            border: unset;

            &:not(:hover) {
                color: var(--input-placeholder-foreground);
            }
            &.active {
                color: var(--link-active-foreground);
            }
        }
        display: flex;
    }

    .input {
        width: unset;
        /* flex-grow: 1;
        flex-shrink: 1; */
        --type-ramp-base-font-size: 10px;
        margin: 0;
        box-sizing: border-box;
        position: relative;
        color: var(--input-foreground);
        background: var(--input-background);
        border-radius: calc(var(--corner-radius-round) * 1px);
        border: calc(var(--border-width) * 1px) solid var(--dropdown-border);
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
        font-size: var(--type-ramp-base-font-size);
        line-height: var(--type-ramp-base-line-height);
        /* min-width: var(--input-min-width); */
        outline: unset;

        &:focus {
            background: var(--input-background);
            border-color: var(--focus-border);
        }
    }
</style>
