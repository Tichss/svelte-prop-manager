<script lang="ts">
    import { untrack } from 'svelte';

    interface Props {
        value?: number;
        min?: any;
        max?: number;
        step?: number;
        dataListStep?: number | undefined;
        title?: string | undefined;
        postfix?: string | undefined;
    }

    let {
        value = $bindable(0),
        min = -100,
        max = 100,
        step = 1,
        dataListStep = undefined,
        title = undefined,
        postfix = undefined,
    }: Props = $props();

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
