import { randomUUID, timingSafeEqual } from 'crypto';
import express, { Request, Response } from 'express';
import MarkdownIt from 'markdown-it';
import { AddressInfo } from 'net';
import * as vscode from 'vscode';

const emptyImage =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQAAAAA3bvkkAAAACklEQVR4AWNgAAAAAgABc3UBGAAAAABJRU5ErkJggg==';

const serverNonce = randomUUID().toString();

const validateNonce = (req: Request) => {
    const nonce = req.query.nonce as string;
    return timingSafeEqual(Buffer.from(nonce), Buffer.from(serverNonce));
};

const handle = (action: 'mark' | 'unmark') => (req: Request, res: Response) => {
    if (!validateNonce(req)) {
        res.status(403);
        return;
    }

    const source = req.query.source as string;
    const line = parseInt(req.query.line as string);

    console.log('got line', line, 'at source', source, 'with action', action);
    res.contentType('image/png');
    res.send(Buffer.from(emptyImage, 'base64'));
};

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "vscode-md-checkbox" is now active.');

    const app = express();
    app.disable('view cache');
    app.get('/checkbox/mark', handle('mark'));
    app.get('/checkbox/unmark', handle('unmark'));
    const server = app.listen();

    const port = (server.address() as AddressInfo).port;

    context.subscriptions.push({ dispose: () => server.closeAllConnections() });

    return {
        extendMarkdownIt(md: MarkdownIt) {
            md = md.use(require('markdown-it-task-checkbox'), {
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
