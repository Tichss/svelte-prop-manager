import { mount } from 'svelte';
import App from './App.svelte';
import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextField, vsCodePanels, vsCodePanelTab, vsCodePanelView, vsCodeCheckbox, vsCodeTextArea, vsCodeDropdown, vsCodeOption } from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(
    vsCodeButton(),
    vsCodeTextField(),
    vsCodePanels(),
    vsCodePanelTab(),
    vsCodePanelView(),
    vsCodeCheckbox(),
    vsCodeTextArea(),
    vsCodeDropdown(),
    vsCodeOption(),
);

const app = mount(App, {
    target: document.getElementById('app')!,
});

export default app;
