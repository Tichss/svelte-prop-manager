<script lang="ts">
    import { tick, untrack } from 'svelte';
    import '$lib/vscode.css';
    import type { Message, Prop } from '$lib/type';
    import VscodeButton from '$lib/ui/VscodeButton.svelte';
    import GridIcon from 'svelte-google-materialdesign-icons/Grid_view.svelte';
    import RowIcon from 'svelte-google-materialdesign-icons/Notes.svelte';
    import MentesIcon from 'svelte-google-materialdesign-icons/Save.svelte';
    import ActiveButton from '$lib/ui/ActiveButton.svelte';
    import ToggleButtonGroup from '$lib/ToggleButton/ToggleButtonGroup.svelte';
    import ToggleButton from '$lib/ToggleButton/ToggleButton.svelte';
    import { flip } from 'svelte/animate';
    import { insertAfterLastImport, uuid } from '$lib/functions';
    import Test from '$lib/pages/Test.svelte';
    import TestButtons from '$lib/TestButtons.svelte';
    import PropRow from '$lib/PropRow.svelte';

    let rawText = $state('');
    let test = $state(import.meta.env.DEV);

    let vscode: ReturnType<typeof acquireVsCodeApi> | undefined = undefined;

    if (typeof window !== 'undefined' && 'acquireVsCodeApi' in window) {
        vscode = (window as any).acquireVsCodeApi();
    }

    let props = $state<Prop[]>([]);

    async function getPropNameList() {
        props = [];

        const propsRegex = /let\s*{([\s\S]+?)}\s*:\s*(\w+)\s*=\s*\$props\(\);/;

        const propsMatch = rawText.match(propsRegex);

        if (propsMatch) {
            const [_, propList, interfaceName] = propsMatch;

            const existingProps = propList
                .split(',')
                .map((p) => p.trim())
                .filter((p) => p !== '');

            for (let i = 0; i < existingProps.length; i++) {
                const stringProp = existingProps[i];
                props[i] = {};

                let [name, val] = stringProp.split('=');

                name = name.trim();
                val = val?.trim();

                /* props[i].id ??= uuid(); */
                props[i].name = name;
                props[i].bindable = val?.startsWith('$bindable(');

                let tempValue = props[i].bindable ? val.slice('$bindable('.length, -1) : val;
                if (tempValue === 'undefined') {
                    props[i].value = undefined;
                } else {
                    props[i].value = tempValue;
                }
            }

            const interfaceRegex = new RegExp(
                `\\b(?:interface|type)\\s+${interfaceName}\\b` + // 1. és 2. pont
                    `[^\\{]*` + // Szerepelhet bármilyen karakter, az első '{'-ig
                    `\\{` + // Az első '{'
                    `([\\s\\S]*?)` + // A keresett tartalom (Capture Group 1)
                    `\\}` // A hozzá tartozó '}'
            );

            const interfaceMatch = rawText.match(interfaceRegex);

            if (interfaceMatch) {
                const interfaceBody = interfaceMatch[1].trim();

                const interfaceBodyArr = interfaceBody
                    .split(';')
                    .map((p) => p.trim())
                    .filter((p) => p !== '');

                for (let i = 0; i < interfaceBodyArr.length; i++) {
                    const element = interfaceBodyArr[i];

                    const [name, type] = sliceStringAtIndex(element, element.indexOf(':'));

                    let tempName = name.trim();
                    let tempNullable = false;
                    let tempType = type.trim();

                    if (name.endsWith('?')) {
                        tempNullable = true;
                        tempName = name.slice(0, -1);
                    } else {
                        tempName = name;
                    }

                    for (let j = 0; j < props.length; j++) {
                        const prop = props[j];

                        if (prop.name.split(':')[0] == tempName) {
                            prop.type = tempType;
                            prop.nullable = tempNullable;
                        }
                    }
                }
            }

            let lastProp = props.at(-1);
            let el = document.getElementById(`name-${lastProp?.name}`) as HTMLInputElement;
            el?.focus();
            el?.select();
            /* ide */
        } else {
            ('nincs props');
        }
    }

    function submit() {
        form?.requestSubmit();
    }

    function setRawText() {
        const propsRegex = /let\s*({[\s\S]*?})\s*:\s*([\w\d_]+)\s*=\s*\$props\(\);/;

        let _rawText = rawText;

        if (!propsRegex.test(_rawText)) {
            let interface2 = `interface Props { var0?: string; props?: Prop[]; kicsi?: boolean; onSubmit?: () => any }`;
            let prop = `let { var0 = $bindable(), props = $bindable(), kicsi, onSubmit }:Props = $props();`;

            _rawText = insertAfterLastImport(_rawText, [interface2, prop]);
        }

        const talalat = propsRegex.exec(_rawText);

        if (talalat) {
            const wholeProps = talalat[0];
            const propListWithBrackets = talalat[1];
            const interfaceName = talalat[2];
            const propList = propListWithBrackets.slice(1, -1);

            let propStrArr = [];

            for (let i = 0; i < props.length; i++) {
                const prop = props[i];

                if (prop.name) {
                    let strProp = prop.name;

                    let valTemp = prop.bindable ? `$bindable(${prop.value ?? ''})` : prop.value;

                    if (valTemp) {
                        strProp += ` = ${valTemp}`;
                    }
                    propStrArr.push(strProp);
                }
            }

            let spacekLead = ' ';
            let spacekEnd = ' ';

            if (propList.trim() !== '') {
                spacekLead = getLeadingWhitespace(propList);
                spacekEnd = getTrailingWhitespace(propList);
            }

            let valaszto = ',' + spacekLead;

            let finalStr = propStrArr.join(valaszto);
            finalStr = `{${spacekLead}${finalStr}${spacekEnd}}`;

            let temp = wholeProps.replace(propListWithBrackets, finalStr);

            _rawText = _rawText.replace(wholeProps, temp);

            const interfaceRegex = new RegExp(
                `\\b(?:interface|type)\\s+${interfaceName}\\b` + // 1. és 2. pont
                    `[^\\{]*` + // Szerepelhet bármilyen karakter, az első '{'-ig
                    `(` + // Befogó csoport kezdete (Capture Group 1)
                    `\\{` + // Az első '{'
                    `[\\s\\S]*?` + // A keresett tartalom
                    `\\}` + // A hozzá tartozó '}'
                    `)` // Befogó csoport vége
            );

            const talalat2 = interfaceRegex.exec(_rawText);

            if (talalat2) {
                const wholeTypes = talalat2[0];
                const typeListWithBrackets = talalat2[1];
                const typeList = typeListWithBrackets.slice(1, -1);

                let typeStrArr = [];

                for (let i = 0; i < props.length; i++) {
                    const prop = props[i];
                    if (prop.name && !prop.name.startsWith('...')) {
                        let strType = prop.name.split(':')[0];

                        if (prop.nullable) {
                            strType += '?';
                        }

                        strType += `: ${prop.type}`;

                        typeStrArr.push(strType);
                    }
                }

                let spacekLead = ' ';
                let spacekEnd = ' ';

                if (typeList.trim() !== '') {
                    spacekLead = getLeadingWhitespace(typeList);
                    spacekEnd = getTrailingWhitespace(typeList);
                }

                let valaszto = ';' + spacekLead;

                let finalStr = typeStrArr.join(valaszto);

                finalStr = `{${spacekLead}${finalStr}${spacekEnd}}`;

                let temp = wholeTypes.replace(typeListWithBrackets, finalStr);

                _rawText = _rawText.replace(wholeTypes, temp);
            }
        }

        postMsg({
            command: 'propChange',
            data: _rawText,
        });

        rawText = _rawText;
    }

    function getLeadingWhitespace(block: string): string {
        let ws = '';
        for (let i = 0; i < block.length; i++) {
            const char = block[i];
            if (/\s/.test(char)) {
                ws += char;
            } else {
                break;
            }
        }
        return ws;
    }

    function getTrailingWhitespace(block: string): string {
        let ws = '';
        for (let i = block.length - 1; i >= 0; i--) {
            const char = block[i];
            if (/\s/.test(char)) {
                ws = char + ws;
            } else {
                break;
            }
        }
        return ws;
    }

    function sliceStringAtIndex(str: string, index: number) {
        if (index < 0 || index >= str.length) {
            console.warn('Az index kívül esik a string határain. Üres stringet ad vissza.');
            return ['', ''] as const;
        }

        const firstPart = str.slice(0, index);
        const secondPart = str.slice(index + 1); // Az index+1 miatt az adott karakter kimarad

        return [firstPart, secondPart] as const;
    }

    let insertId = 0;

    async function inserto(prop: Prop) {
        insertId++;
        let courrentId = insertId;
        let name = prop.name;

        let count = getNextPostfix(
            props.map((p) => p.name),
            name
        );

        if (count > 0) {
            name += count;
        }

        prop.name = name;

        let insertIndex = props.findIndex((prop) => prop.name.startsWith('...'));

        if (insertIndex > -1) {
            props.splice(insertIndex, 0, prop);
        } else {
            props.push(prop);
        }

        submit();

        /* setTimeout(() => {
            if (insertId == courrentId) {
                let el = document.getElementById(`name-${prop.name}`);
                el?.focus();
                el?.select();
            }
        }, 100); */
    }

    async function addProp() {
        console.log('clcik');

        inserto({
            name: 'var',
            type: 'string',
            nullable: true,
            bindable: false,
        });
    }

    async function addEvent() {
        inserto({
            name: 'onEvent',
            type: '() => any',
            nullable: true,
            bindable: false,
        });
    }

    async function addSnippet() {
        inserto({
            name: 'snippet',
            type: `import('svelte').Snippet<[any]>`,
            nullable: true,
            bindable: false,
        });
    }

    function order() {
        props = props.toSorted((a, b) => {
            function getOrder(prop: Prop) {
                if (prop?.name?.startsWith('...')) return 7;
                if (prop?.type?.includes('Snippet')) return 6;
                if (prop?.name?.startsWith('on') || prop?.type?.startsWith('(')) return 5;
                if (prop.bindable && !prop.nullable) return 1;
                if (prop.bindable) return 2;
                if (!prop.nullable) return 3;
                return 4;
            }
            const orderA = getOrder(a);
            const orderB = getOrder(b);
            return orderA - orderB;
        });

        // setRawText();
        submit();
    }

    function getNextPostfix(arr: string[], prefix: string) {
        arr = arr.filter((item) => item.startsWith(prefix));
        let nums = arr.map((p) => {
            let str = p.substring(prefix.length);

            if (!isNaN(+str)) {
                return +str;
            }
            return 0;
        });

        let max = 0;

        if (nums.length) {
            max = Math.max(...nums) + 1;
        }

        return max;
    }

    let propString = $state('');

    $effect(() => {
        void $state.snapshot(props);

        untrack(() => {
            propString = '';
            for (let i = 0; i < props.length; i++) {
                const prop = props[i];
                propString += prop.name;

                if (prop.type) {
                    if (prop.nullable) {
                        propString += '?';
                    }

                    propString += `: ${prop.type}`;
                }

                let tempValue = prop.value;

                if (prop.bindable) {
                    tempValue = `$bindable(${tempValue ?? ''})`;
                }

                if (tempValue) {
                    propString += ` = ${tempValue}`;
                }

                propString += `; \n`;
            }
        });
    });

    function textAreaChange(e) {
        let val = e.target.value as string;
        let strArr = val.split(';').filter((n) => n.trim() !== '');

        props = [];

        for (let i = 0; i < strArr.length; i++) {
            const str = strArr[i].trim();
            props[i] = {};
            const prop = props[i];

            let [namePlusType, value] = str.split(/=(?!>)/);

            if (value) {
                value = value.trim();

                if (value?.startsWith('$bindable(')) {
                    prop.bindable = true;
                    value = value.slice('$bindable('.length, -1);
                }
            }

            if (value != 'undefined') {
                prop.value = value;
            }

            let [name, type] = sliceStringAtIndex(namePlusType, namePlusType.indexOf(':'));

            name = name.trim();
            type = type.trim();

            if (name.endsWith('?')) {
                prop.nullable = true;
                name = name.slice(0, -1);
            }

            prop.id = uuid();
            prop.name = name;
            prop.type = type;
        }
        // setRawText();
        submit();
    }

    function postMsg(msg: Message) {
        let _msg = $state.snapshot(msg);
        /* console.log('DP MEASSGE', _msg); */
        vscode?.postMessage(_msg);
    }

    let fileName: string | undefined = $state();

    const svelteFile = $derived(getExtension(fileName ?? '') === '.svelte');

    function getExtension(fileName: string) {
        // Levágja a query paramétereket, ha vannak
        const cleanName = fileName.split('?')[0];
        const parts = cleanName.split('.');
        return parts.length > 1 ? '.' + parts.pop() : undefined;
    }

    let propsWidth: number | undefined = $state();
    const elegKicsi = $derived((propsWidth ?? 10000) < 230);

    let savedDatas = $state<{ autoSave?: boolean }>({});
    let autoSave: boolean = $state(false);
    let view: 'grid' | 'textarea' | 'test' = $state('grid');

    let form: HTMLFormElement | undefined = $state();
</script>

<svelte:window
    onmessage={(e) => {
        const msg = e?.data as Message;
        const { command, data } = msg;

        if (command === 'activeFile') {
            rawText = data.text;
            fileName = data.fileName;
            getPropNameList();
        } else if (command === 'load') {
            savedDatas = data ?? {};
            autoSave = savedDatas?.autoSave ?? false;
        }
    }}
/>

<div class:test class="bg">
    {#if test}
        <TestButtons />
    {/if}

    {#if svelteFile}
        <div class="flex">
            <div class="head">
                <ActiveButton
                    active={autoSave}
                    onClick={() => {
                        autoSave = !autoSave;
                        savedDatas.autoSave = autoSave;
                        postMsg({ command: 'save', data: savedDatas });
                    }}
                >
                    <MentesIcon size="10" />
                </ActiveButton>

                <div class="last">
                    <ActiveButton onClick={order}>Rendezés</ActiveButton>
                </div>

                <div class="end">
                    <ToggleButtonGroup bind:value={view}>
                        <ToggleButton value="grid"><GridIcon size="10" /></ToggleButton>
                        <ToggleButton value="textarea"><RowIcon size="10" /></ToggleButton>
                        {#if test}
                            <ToggleButton value="test">test</ToggleButton>
                        {/if}
                    </ToggleButtonGroup>
                </div>
            </div>

            <div class="middle">
                {#if view === 'grid'}
                    <form
                        bind:this={form}
                        action=""
                        onchange={() => {
                            form?.requestSubmit();
                        }}
                        onsubmit={(e) => {
                            e.preventDefault();
                            setRawText();
                        }}
                    >
                        <div class="props" bind:clientWidth={propsWidth}>
                            {#each props as prop, i}
                                <PropRow
                                    bind:prop={props[i]}
                                    bind:props
                                    kicsi={elegKicsi}
                                    onSubmit={() => submit()}
                                />
                            {/each}
                        </div>
                    </form>
                {:else if view === 'textarea'}
                    <textarea class="input textarea" value={propString} onchange={textAreaChange} />
                {:else if view === 'test'}
                    <Test {rawText} />
                {/if}
            </div>

            <div class="buttons">
                <span>
                    <VscodeButton type="button" style="width: 100%;" onclick={addProp}>
                        + Prop
                    </VscodeButton>
                </span>

                <VscodeButton type="button" onclick={addEvent}>+ Event</VscodeButton>

                <VscodeButton type="button" onclick={addSnippet}>+ Snippet</VscodeButton>
            </div>
        </div>

        <!--  {#if test}
            <pre>{rawText}</pre>
        {/if} -->
    {:else}
        <div class="nemjo">Ez nem egy .svelte fájl!</div>
    {/if}
</div>

<style lang="scss">
    :global(*) {
        box-sizing: border-box;
    }

    :global(body) {
        margin: 0;
        padding: 0;
    }

    .head {
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;

        .last {
            margin-right: auto;
        }
    }

    .hidden-button {
        background-color: unset;
        border: unset;
        border: unset;
        font: inherit;
        padding: unset;
        cursor: pointer;
        color: unset;
        &:hover {
            background-color: var(--button-icon-hover-background);
        }
    }

    /* :root {
        --design-unit: 2 !important;
    } */

    .input {
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
        min-width: var(--input-min-width);
        outline: unset;

        &:focus {
            background: var(--input-background);
            border-color: var(--focus-border);
        }
    }

    .textarea {
        height: 100%;
        width: 100%;
        resize: none;
        display: block;
    }

    .flex {
        display: flex;
        flex-direction: column;
        height: 100%;

        .middle {
            flex-grow: 1;
            overflow: hidden;
            overflow-y: auto;
        }
    }

    .buttons {
        display: grid;
        grid-template-areas:
            'fejlec fejlec'
            'baloldal jobboldal';
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
        margin-top: 6px;

        span {
            grid-area: fejlec;
        }

        @media only screen and (max-width: 200px) {
            display: flex;
            flex-direction: column;
        }
    }

    .bg {
        height: 100dvh;
        padding: 8px;

        &.test {
            background-color: var(--vscode-menu-background);
            color: var(--vscode-menu-foreground);
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
        }

        .nemjo {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .props {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }
</style>
