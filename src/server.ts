import { randomUUID, timingSafeEqual } from 'crypto';
import express, { Request, Response } from 'express';
import { AddressInfo } from 'net';
import * as vscode from 'vscode';

export function createServer() {
    const serverNonce = randomUUID().toString();

    const app = express();
    app.disable('view cache');
    app.get('/checkbox/mark', handle(serverNonce));
    const server = app.listen();
    const port = (server.address() as AddressInfo).port;

    const disposable = { dispose: () => server.closeAllConnections() };

    return { port, serverNonce, disposable };
}

const emptyImage =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQAAAAA3bvkkAAAACklEQVR4AWNgAAAAAgABc3UBGAAAAABJRU5ErkJggg==';

const handle = (serverNonce: string) => (req: Request, res: Response) => {
    if (!validateNonce(req.query.nonce as string, serverNonce)) {
        res.status(403);
        return;
    }

    const source = req.query.source as string;
    const line = parseInt(req.query.line as string);
    const checked = req.query.checked === 'true';

    console.log(
        `Marking checkbox in file ${source} at line ${line} as ${
            checked ? 'checked' : 'unchecked'
        }`
    );

    markCheckbox(source, line, checked);

    res.contentType('image/png');
    res.send(Buffer.from(emptyImage, 'base64'));
};

function validateNonce(nonce: string, serverNonce: string) {
    return timingSafeEqual(Buffer.from(nonce), Buffer.from(serverNonce));
}

async function markCheckbox(source: string, line: number, checked: boolean) {
    const uri = vscode.Uri.parse(source);
    const document = await vscode.workspace.openTextDocument(uri);

    const lineText = document.lineAt(line).text;
    const checkboxMatch = lineText.match('[[ xX]] ');
    const checkboxColumn = checkboxMatch?.index;

    if (checkboxColumn === undefined) {
        console.error(`Checkbox not found at line ${line}!`);
        return;
    }

    const checkRange = new vscode.Range(
        line,
        checkboxColumn,
        line,
        checkboxColumn + 1
    );
    const newMark = checked ? 'x' : ' ';

    const edit = new vscode.WorkspaceEdit();
    edit.replace(uri, checkRange, newMark);
    await vscode.workspace.applyEdit(edit);
}
