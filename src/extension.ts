import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const filePath = path.join(context.extensionPath, 'media', 'index.html');
    const str = fs.readFileSync(filePath, 'utf8');

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('myWebviewView', {
            resolveWebviewView(webviewView) {
                webviewView.webview.options = {
                    enableScripts: true,
                };

                webviewView.webview.html = str;

                const activeEditor = vscode.window.activeTextEditor;
                const fileName = activeEditor?.document?.fileName ?? 'Nincs aktív fájl';

                webviewView.webview.postMessage({
                    command: 'activeFile',
                    fileName,
                    document: activeEditor?.document,
                    text: activeEditor?.document.getText(),
                });

                vscode.window.onDidChangeActiveTextEditor((editor) => {
                    const fileName = editor?.document?.fileName ?? 'Nincs aktív fájl';
                    webviewView.webview.postMessage({
                        command: 'activeFile',
                        fileName,
                        document: editor?.document,
                        text: editor?.document.getText(),
                    });
                });

                webviewView.webview.onDidReceiveMessage(async (message) => {
                    if (message.command === 'propChange') {
                        const editor = vscode.window.activeTextEditor;

                        if (editor) {
                            const fullRange = new vscode.Range(
                                editor.document.positionAt(0),
                                editor.document.positionAt(editor.document.getText().length)
                            );

                            await editor.edit((editBuilder) => {
                                editBuilder.replace(fullRange, message.text);
                            });

                            await vscode.commands.executeCommand('editor.action.formatDocument');
                            await editor.document.save();
                        }
                    }
                });
            },
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}
