<script lang="ts">
        import Dialog from '$coreComponents/Dialog.svelte';
    import Icon from '$coreComponents/Icon.svelte';
    import type MinimalTableManager from '$coreComponents/MinimalDataTable/MinimalTableManager.svelte';
    import { type ComponentProps, type Snippet } from 'svelte';
    import Tippy2 from '$coreComponents/Tippy/Tippy2.svelte';
    import { dropdown } from '$coreComponents/Tippy/tippyProps';
    import TippyContainer from '$coreComponents/Tippy/TippyContainer.svelte';
    import TippyRow from '$coreComponents/Tippy/TippyRow.svelte';
    import TableSettingDialog from '$coreComponents/MinimalDataTable/TableSettingDialog.svelte';
    import type { TitleObj } from '$src/lib/types';
    /* ezt a rész kellene megtalálni */

    ...

    /* let id = 'csuszka - ' + Math.random(); */
    let datalistId = 'datalist - ' + Math.random();

    let arr: number[] = $state([]);

    function generateList() {
        arr = [];
        for (let i = min; i < max + 1; i += derivedDataListStep) {
            arr.push(i);
        }
        arr = arr;

        value = value - 1;
        value = value + 1;
    }

    const decimalCount = (num: number) => (num % 1 !== 0 ? num.toString().split('.')[1].length : 0);
    let derivedDataListStep = $derived(dataListStep || step);

    $effect(() => {
        void min;
        void max;
        void step;

        untrack(() => {
            generateList();
        });
    });
</script>

<div class="wrapper">
    <label>
        <div class="title-con">
            <div class="title">{title}</div>
            <div class="value">
                {value.toLocaleString(undefined, {
                    minimumFractionDigits: decimalCount(step),
                    maximumFractionDigits: decimalCount(step),
                })}

                {postfix ?? ''}
            </div>
        </div>
        <input type="range" class="hs-input" bind:value {min} {max} list={datalistId} {step} />
    </label>

    <datalist id={datalistId}>
        {#each arr ?? [] as item}
            <option value={item} label={item + (postfix ?? '')}></option>
        {/each}
    </datalist>
</div>

<style lang="scss">
    .wrapper {
        margin-block: 32px;
    }

    .title-con {
        display: flex;
        justify-content: space-between;
    }

    .title {
        font-size: 16px;
        font-weight: 700;
    }

    .value {
        font-size: 16px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
    }

    .hs-input {
        padding: unset;
    }

    datalist {
        padding-inline: 10px;
        width: 100%;
        display: flex;
        justify-content: space-between;

        option {
            padding: unset;
            width: 0px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
        }
    }
</style>
