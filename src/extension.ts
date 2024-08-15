import { randomUUID, timingSafeEqual } from 'crypto';
import express, { Request, Response } from 'express';
import { AddressInfo } from 'net';
import * as vscode from 'vscode';

const emptyImage =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQAAAAA3bvkkAAAACklEQVR4AWNgAAAAAgABc3UBGAAAAABJRU5ErkJggg==';

const serverInstanceId = randomUUID().toString();

const validateInstance = (req: Request) => {
    const instanceId = req.query.instance as string;
    return timingSafeEqual(
        Buffer.from(instanceId),
        Buffer.from(serverInstanceId)
    );
};

const handle = (action: 'mark' | 'unmark') => (req: Request, res: Response) => {
    if (!validateInstance(req)) {
        res.status(403);
        return;
    }

    const source = req.query.source as string;
    const index = parseInt(req.query.index as string);

    console.log('got index', index, 'at source', source, 'with action', action);
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
        extendMarkdownIt(md: any) {
            return md.use(require('markdown-it-checkbox'), {
                idPrefix: `port:${port},instance:${serverInstanceId},index:`,
            });
        },
    };
}

export function deactivate() {}
