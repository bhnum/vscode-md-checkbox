document.addEventListener('click', (e) => {
    const checkboxData = getCheckboxData(e.target);
    if (!checkboxData) {
        return;
    }

    const { line, checked } = checkboxData;
    const { port, nonce } = getServerData();
    const source = getSource();

    const url = new URL('http://localhost/checkbox/mark');
    url.port = port;
    url.searchParams.append('nonce', nonce);
    url.searchParams.append('source', source);
    url.searchParams.append('line', line);
    url.searchParams.append('checked', checked);
    url.searchParams.append('no-cache', crypto.randomUUID());

    sendRequest(url);
});

function getCheckboxData(node) {
    const checkbox = node.closest(`input[type="checkbox"]`);
    if (!checkbox) {
        return;
    }

    const dataLineNode = checkbox.closest('[data-line]');
    if (!dataLineNode) {
        return;
    }

    const line = dataLineNode.getAttribute('data-line');
    if (line === null) {
        return;
    }

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
