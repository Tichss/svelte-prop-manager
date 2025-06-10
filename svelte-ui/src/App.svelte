<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import '$lib/vscode.css';

    import src from './Csuszka.svelte?raw';
    import src2 from './ExtraButtons.svelte?raw';
    import src3 from './AddEventDialog.svelte?raw';

    let rawText = $state('src');
    let test = $state(false);

    let vscode: ReturnType<typeof acquireVsCodeApi> | undefined = undefined;

    if (typeof window !== 'undefined' && 'acquireVsCodeApi' in window) {
        vscode = (window as any).acquireVsCodeApi();
    }

    let props: {
        name: string;
        type: string;
        value?: string;
        bindable?: boolean;
        nullable?: boolean;
    }[] = $state([]);

    function getPropNameList() {
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

                props[i].name = name;
                props[i].bindable = val?.startsWith('$bindable(');

                let tempValue = props[i].bindable ? val.slice('$bindable('.length, -1) : val;
                if (tempValue === 'undefined') {
                    props[i].value = undefined;
                } else {
                    props[i].value = tempValue;
                }
            }

            const interfaceRegex = new RegExp(`interface ${interfaceName}\\s*{([\\s\\S]*?)}`);

            const interfaceMatch = rawText.match(interfaceRegex);

            if (interfaceMatch) {
                const interfaceBody = interfaceMatch[1].trim();

                const interfaceBodyArr = interfaceBody
                    .split(';')
                    .map((p) => p.trim())
                    .filter((p) => p !== '');

                for (let i = 0; i < interfaceBodyArr.length; i++) {
                    const element = interfaceBodyArr[i];
                    const [name, type] = element.split(':');

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

                        if (prop.name == tempName) {
                            prop.type = tempType;
                            prop.nullable = tempNullable;
                        }
                    }
                }
            }

            console.log(props);
        } else {
            ('nincs props');
        }
    }

    function setRawText() {
        const propsRegex = /let\s*{([^}]+)}\s*:\s*(\w+)\s*=\s*\$props\(\);/;
        let interfaceName = undefined;

        let replaced = rawText.replace(propsRegex, (match, propList, interfaceName2) => {
            let propStrArr = [];
            interfaceName = interfaceName2;

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

            const finalStr = propStrArr.join(', ');

            return match.replace(propList, finalStr);
        });

        const interfaceRegex = new RegExp(`interface ${interfaceName}\\s*{([\\s\\S]*?)}`);

        replaced = replaced.replace(interfaceRegex, (match, typeList) => {
            let typeStrArr = [];

            for (let i = 0; i < props.length; i++) {
                const prop = props[i];
                if (prop.name) {
                    let strType = prop.name;

                    if (prop.nullable) {
                        strType += '?';
                    }

                    strType += `: ${prop.type}`;

                    typeStrArr.push(strType);
                }
            }

            const finalStr = typeStrArr.join('; ');

            return match.replace(typeList, finalStr);
        });

        console.log('DP MESSAGE');
        vscode?.postMessage({
            command: 'propChange',
            text: replaced,
        });
    }

    function change() {
        setRawText();
    }

    /* onMount(() => {
        getPropNameList();
    }); */

    function addProp() {
        props.push({
            name: 'var12345',
            type: 'string',
            nullable: true,
            bindable: false,
        });
        setRawText();
    }

    let propString = $state('');

    $effect(() => {
        void $state.snapshot(props);

        untrack(() => {
            propString = '';
            for (let i = 0; i < props.length; i++) {
                const prop = props[i];
                propString += prop.name;
                if (prop.nullable) {
                    propString += '?';
                }
                propString += `: ${prop.type}`;

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
        let val = e.target.value;
        let strArr = val.split(';').filter((n) => n.trim() !== '');

        props = [];

        for (let i = 0; i < strArr.length; i++) {
            const str = strArr[i].trim();
            props[i] = {};
            const prop = props[i];

            let [namePlusType, value] = str.split('=');

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

            let [name, type] = namePlusType.split(':');

            name = name.trim();
            type = type.trim();

            if (name.endsWith('?')) {
                prop.nullable = true;
                name = name.slice(0, -1);
            }

            prop.name = name;
            prop.type = type;
        }
        setRawText();
    }
</script>

<svelte:window
    onmessage={(e) => {
        const message = e?.data;

        if (message.command === 'activeFile') {
            rawText = message?.text;
            getPropNameList();
        }
    }}
/>

{#if test}
    <div class="test">
        <button
            onclick={() => {
                rawText = src3;
                getPropNameList();
            }}
        >
            rawTextset
        </button>
        <button
            onclick={() => {
                rawText = src;
                getPropNameList();
            }}
        >
            rawTextset
        </button>
    </div>
{/if}

<!-- 
<button
    onclick={() => {
        rawText = src2;
        getPropNameList();
    }}
>
    rawTextset2
</button> -->

<textarea value={propString} onchange={textAreaChange} />

<form action="" onchange={change}>
    {#each props as prop, i}
        <div class="prop">
            <input class="text" type="text" bind:value={prop.name} />
            <input class="text" type="text" bind:value={prop.type} list="types" />
            <input type="checkbox" bind:checked={prop.nullable} />
            <input class="text" type="text" bind:value={prop.value} />
            <input type="checkbox" bind:checked={prop.bindable} />
            <button
                type="button"
                onclick={() => {
                    props = props.filter((item, j) => i != j);
                    setRawText();
                }}
            >
                Del
            </button>
        </div>
    {/each}

    <button type="button" onclick={addProp}>Add</button>
</form>

<datalist id="types">
    <option value="string" />
    <option value="number" />
    <option value="boolean" />
    <option value="() => any | Promise<any>" />
</datalist>

{#if test}
    <pre>{rawText}</pre>
{/if}

<style lang="scss">
    .text {
        width: 80px;
    }

    textarea {
        width: 100%;
    }

    * {
        box-sizing: border-box;
    }

    :root {
        --vscode-button-background: red;
    }

    /* default */

    body {
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        font-family: var(--vscode-font-family);
        font-size: var(--vscode-font-size);
        margin: 0;
        padding: 0;
    }

    input[type='text'],
    textarea {
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid var(--vscode-input-border);
    }

    input::placeholder,
    textarea::placeholder {
        color: var(--vscode-input-placeholderForeground);
    }

    textarea {
        resize: vertical;
        min-height: 100px;
    }

    input[type='checkbox'] {
        width: 16px;
        height: 16px;
        background-color: var(--vscode-checkbox-background, var(--vscode-input-background));
        border: 1px solid var(--vscode-checkbox-border, var(--vscode-input-border));
        accent-color: var(--vscode-checkbox-foreground, var(--vscode-input-foreground));
    }

    button {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 0.6em 1.2em;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }

    button:hover {
        background-color: var(--vscode-button-hoverBackground);
    }
</style>
