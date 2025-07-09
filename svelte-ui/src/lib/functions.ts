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


export function getTrailingWhitespace(block: string): string {
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

export function insertAfterLastImport(svelteSourceCode: string, insertStringArr: string[]) {

    if (!insertStringArr.length) {
        return svelteSourceCode
    }



    const regex = /^\s*import\s+.*?;\s*$/gm;

    const match = svelteSourceCode.match(regex);

    const last = match?.[match.length - 1];


    if (last) {
        let sorKezdo = getLeadingWhitespace(last);

        let insertString = last + sorKezdo + insertStringArr.join(sorKezdo);

        const replaced = svelteSourceCode.replace(last, insertString);

        return replaced;

    }

    const scriptTagRegex = /<script[^>]*>/g;

    const firstTag = svelteSourceCode.match(scriptTagRegex)?.[0];

    if (firstTag) {
        let insertString = firstTag + '\n' + insertStringArr.join('\n');
        const replaced = svelteSourceCode.replace(firstTag, insertString);

        return replaced

    }

    let insertString = `<script lang="ts" >\n${insertStringArr.join('\n')}\n</script>\n`



    return insertString + svelteSourceCode;
}








