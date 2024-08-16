import MarkdownIt from 'markdown-it';
import * as vscode from 'vscode';
import { createServer } from './server';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "md-checkbox" is now active.');

    const { port, serverNonce, disposable } = createServer();
    context.subscriptions.push(disposable);

    return {
        extendMarkdownIt(md: MarkdownIt) {
            md.use(require('markdown-it-task-checkbox'), {
                disabled: false,
            });
            md.core.ruler.push('checkbox_server_data', (state) => {
                const serverDataToken = new state.Token(
                    'md_checkbox_server_data',
                    'div',
                    0
                );
                serverDataToken.attrSet('hidden', '');
                serverDataToken.attrSet('id', 'mdCheckboxServerData');
                serverDataToken.attrSet('data-port', port.toString());
                serverDataToken.attrSet('data-nonce', serverNonce);

                state.tokens.push(serverDataToken);
            });
            return md;
        },
    };
}

export function deactivate() {}
