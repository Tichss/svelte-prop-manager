import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function activate(context: vscode.ExtensionContext) {
    const filePath = path.join(context.extensionPath, 'media', 'index.html');
    const str = fs.readFileSync(filePath, 'utf8');

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('myWebviewView', {
            resolveWebviewView(webviewView) {
                const postMsg = registerMessagePoster(webviewView);
                webviewView.webview.options = {
                    enableScripts: true,
                };

                webviewView.webview.html = str;

                postFileUpdate();
                postSaveData();

                vscode.window.onDidChangeActiveTextEditor(() => {
                    postFileUpdate();
                });

                let changeTimeout: NodeJS.Timeout | undefined;

                vscode.workspace.onDidChangeTextDocument((event) => {
                    const activeEditor = vscode.window.activeTextEditor;
                    if (activeEditor && event.document === activeEditor.document) {
                        if (changeTimeout) clearTimeout(changeTimeout);
                        changeTimeout = setTimeout(() => {
                            postFileUpdate();
                        }, 500); // csak 500ms szünet után fut le
                    }
                });

                vscode.workspace.onDidSaveTextDocument((document) => {
                    const activeEditor = vscode.window.activeTextEditor;
                    if (activeEditor && document === activeEditor.document) {
                        postFileUpdate();
                    }
                });

                webviewView.onDidChangeVisibility(() => {
                    if (webviewView.visible) {
                        postFileUpdate();
                        postSaveData();
                    }
                });

                webviewView.webview.onDidReceiveMessage(async (message) => {
                    const { command, data } = message as { command: string, data: any };

                    console.log('onDidReceiveMessage', command, data);

                    if (command === 'propChange') {
                        const editor = vscode.window.activeTextEditor;

                        if (editor) {
                            const fullRange = new vscode.Range(
                                editor.document.positionAt(0),
                                editor.document.positionAt(editor.document.getText().length)
                            );

                            await editor.edit((editBuilder) => {
                                editBuilder.replace(fullRange, data);
                            });

                            let readData = context.workspaceState.get('data') as { autoSave: boolean | undefined };

                            let autoSave = readData?.autoSave;

                            if (autoSave) {
                                await editor.document.save();
                            }
                        }
                    } else if (command === 'save') {
                        context.workspaceState.update('data', data);
                    }
                });

                function postFileUpdate() {
                    const activeEditor = vscode.window.activeTextEditor;
                    if (activeEditor) {
                        const fileName = activeEditor?.document?.fileName ?? 'Nincs aktív fájl';

                        const msg/* : Message */ = {
                            command: 'activeFile',
                            data: {
                                fileName: fileName,
                                document: activeEditor?.document,
                                text: activeEditor?.document.getText(),
                            },

                        };

                        postMsg(msg)
                    }
                }

                function postSaveData() {
                    const savedData = context.workspaceState.get('data');
                    postMsg({
                        command: 'load',
                        data: savedData
                    })
                }
            },
        })
    );
}

const registerMessagePoster = (webviewView: vscode.WebviewView) => {
    const func = (message: any) => {
        console.log('postMessage', message);
        webviewView.webview.postMessage(message);
    }

    return func;
}

// this method is called when your extension is deactivated
export function deactivate() { }
