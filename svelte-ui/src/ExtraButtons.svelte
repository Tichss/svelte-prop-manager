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

    interface Props {
        colManager?: ComponentProps<typeof MinimalTableManager>['colManager'];
        downloadable?: ComponentProps<typeof MinimalTableManager>['downloadable'];
        downloadableExtensions?: ComponentProps<
            typeof MinimalTableManager
        >['downloadableExtensions'];
        arrCol: ComponentProps<typeof MinimalTableManager>['arrCol'];
        titleObj?: TitleObj;
        onDownload?: ComponentProps<typeof MinimalTableManager>['onDownload'];
        onColumnChange?: ComponentProps<typeof MinimalTableManager>['onColumnChange'];
        onColumnReset?: () => any | Promise<any>;
        extraButtons?: Snippet;
        predefinedBadgesSnippet?: Snippet;
    }

    let {
        colManager,
        downloadable,
        downloadableExtensions,
        arrCol = $bindable(),
        titleObj,
        onDownload,
        onColumnChange,
        onColumnReset,
        extraButtons,
        predefinedBadgesSnippet,
    }: Props = $props();

    let openMobileSettingsDialog = $state(false);
    let csDlgOpened = $state(false);
    let openDropdown = $state(false);

    let action: HTMLButtonElement = $state();
    let instance = $state();

    const visibleMobileMore = $derived(
        colManager ||
            downloadable ||
            downloadableExtensions?.includes('csv') ||
            downloadableExtensions?.includes('xlsx') ||
            extraButtons,
    );
</script>

<TableSettingDialog
    bind:opened={csDlgOpened}
    bind:arrCol
    {titleObj}
    {onColumnChange}
    {onColumnReset}
    {predefinedBadgesSnippet}
/>

<Dialog bind:opened={openMobileSettingsDialog} noHeader>
    <div class="mobile-buttons">
        {#if colManager}
            <div
                tabindex="0"
                role="button"
                class="mobile-button"
                onclick={() => (csDlgOpened = true)}
            >
                <Icon name="settings_outline" />
                <div class="title">Oszlop beállítások</div>
            </div>
        {/if}
        {#if downloadable}
            {#if downloadableExtensions?.includes('csv')}
                <div
                    tabindex="0"
                    role="button"
                    class="mobile-button"
                    onclick={() => {
                        onDownload?.('csv');
                    }}
                >
                    <Icon name="download2" />
                    <div class="title">Letöltés CSV (.csv)</div>
                </div>
            {/if}

            {#if downloadableExtensions?.includes('xlsx')}
                <div
                    tabindex="0"
                    role="button"
                    class="mobile-button"
                    onclick={() => {
                        onDownload?.('xlsx');
                    }}
                >
                    <Icon name="download2" />
                    <div class="title">Letöltés Excel (.xlsx)</div>
                </div>
            {/if}
        {/if}

        {@render extraButtons?.()}
    </div>
</Dialog>

<Tippy2
    bind:action
    tippyProps={{
        ...dropdown,
        placement: 'bottom-end',
        trigger: 'click',
        maxWidth: 'none',
        hideOnClick: true,
    }}
    onReady={(_instance) => {
        instance = _instance;
    }}
>
    <TippyContainer width={115}>
        <div class="title">Letöltés</div>

        {#if downloadableExtensions?.includes('csv')}
            <TippyRow
                onClick={() => {
                    onDownload?.('csv');
                    instance?.hide();
                }}
            >
                CSV (.csv)
            </TippyRow>
        {/if}

        {#if downloadableExtensions?.includes('xlsx')}
            <TippyRow
                onClick={() => {
                    onDownload?.('xlsx');
                    instance.hide();
                }}
            >
                Excel (.xlsx)
            </TippyRow>
        {/if}
    </TippyContainer>
</Tippy2>

{#if visibleMobileMore}
    <div class="buttons mobil">
        <button
            class="hs-button icon gray"
            onclick={() => (openMobileSettingsDialog = !openMobileSettingsDialog)}
        >
            <Icon name="moreVert" viewBox="0 -960 960 960" size={30} />
        </button>
    </div>
{/if}

<div class="buttons desktop">
    {#if colManager}
        <button class="hs-button icon gray" onclick={() => (csDlgOpened = true)}>
            <Icon name="settings_outline" size={24} />
        </button>
    {/if}
    {#if downloadable}
        <button
            class="hs-button icon gray"
            onclick={() => (openDropdown = true)}
            bind:this={action}
        >
            <Icon name="download2" size={24} />
        </button>
    {/if}
    {@render extraButtons?.()}
</div>

<style lang="scss">
    @media only screen and (max-width: 576px) {
    }

    .title {
        font-size: 12px;
        padding: 4px 16px;
    }

    .buttons {
        display: flex;
        align-items: center;
        gap: 1px;
        margin-left: auto;
        * {
            flex-shrink: 0;
        }
    }

    .mobile-buttons {
        .mobile-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            border-bottom: 1px solid var(--theme-border-soft);
            cursor: pointer;

            .title {
                font-size: 1.2rem;
                position: relative;
                top: 2px;
            }

            &:hover {
                background-color: var(--theme-hover);
            }
        }
    }
</style>
