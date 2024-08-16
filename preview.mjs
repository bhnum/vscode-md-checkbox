document.addEventListener(`click`, (e) => {
    const { line, checked } = getCheckboxData(e.target);
    const { port, nonce } = getServerData();
    const source = getSource();
    const action = checked ? 'mark' : 'unmark';

    const url = new URL(`http://localhost/checkbox/${action}`);
    url.port = port;
    url.searchParams.append('nonce', nonce);
    url.searchParams.append('source', source);
    url.searchParams.append('line', line);
    url.searchParams.append('no-cache', crypto.randomUUID());

    sendRequest(url);
});

function getCheckboxData(node) {
    const checkbox = node.closest(`input[type="checkbox"]`);
    const dataLineNone = checkbox.closest(`[data-line]`);
    const line = dataLineNone.getAttribute('data-line');
    const checked = checkbox.checked;
    return { line, checked };
}

function getServerData() {
    const dataNode = document.getElementById('mdCheckboxServerData');

    return {
        port: dataNode.getAttribute('data-port'),
        nonce: dataNode.getAttribute('data-nonce'),
    };
}

function getSource() {
    const settings = JSON.parse(
        document
            .querySelector('meta[id="vscode-markdown-preview-data"]')
            .getAttribute('data-settings')
    );
    return settings.source;
}

function sendRequest(url) {
    const imgNode = document.createElement('img');
    imgNode.src = url.toString();
    imgNode.style.width = imgNode.style.height = 0;

    document.body.append(imgNode);
}
