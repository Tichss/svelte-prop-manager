<script lang="ts">
    import Api, { type QueryBatch, type Middleware } from '../../api-2';

    interface Props extends Partial<ComponentProps<typeof BaseActiveTable>> {
        functionWithparam: (param: string) => void;
        api: string;
        cols: ColPrimitiv[];
        id: string | number;
        base?: string;
        token?: string;
        downloadableApi?: string;
        filter?: Filter | FilterNew;
        fixFilter?: Filter | FilterNew;
        noD0?: boolean;
        newFilter?: boolean;
        take?: number;
        params?: object;
        takeCount?: boolean | string;
        takeUserColumn?: boolean | string;
        downloadable?: boolean | string;
        userId?: string | number;
        userColumnsVersion?: 1 | 2;
        queryBatch?: QueryBatch;
        selectedRows?: ComponentProps<BaseActiveTable<T>>['selectedRows'];
        predefinedSearch?: ComponentProps<BaseActiveTable<T>>['predefinedSearch'];
        badgeArr?: ComponentProps<BaseActiveTable<T>>['badgeArr'];
        badgeMode?: 'fetch';
        children?: import('svelte').Snippet<[any]>;
        contextMenu?: import('svelte').Snippet<[any]>;
        extraButtons?: import('svelte').Snippet;
        customTh?: import('svelte').Snippet<[any]>;
        footerSnippet?: import('svelte').Snippet;
    }

    let {
        functionWithparam,
        api,
        cols: colsProp,
        id,
        base,
        token,
        downloadableApi,
        filter = $bindable(),
        fixFilter,
        noD0,
        newFilter = true,
        take,
        params,
        takeCount,
        takeUserColumn,
        downloadable,
        userId,
        userColumnsVersion = 2,
        queryBatch,
        selectedRows,
        predefinedSearch: predefinedSearchProp,
        badgeArr: badgeArrProp,
        badgeMode,
        children,
        contextMenu,
        extraButtons,
        customTh,
        footerSnippet,
        ...rest
    }: Props = $props();

    export const reloadAll: typeof baseActiveTable.reloadAll = async () =>
        await baseActiveTable.reloadAll();

 