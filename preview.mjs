document.addEventListener(`click`, (e) => {
    const checkbox = e.target.closest(`input[type="checkbox"]`);
    const { port, instance, index } = getValues(checkbox.id);
    const source = getSource();
    const action = checkbox.checked ? 'mark' : 'unmark';

    const url = new URL(`http://localhost/checkbox/${action}`);
    url.port = port;
    url.searchParams.append('instance', instance);
    url.searchParams.append('source', source);
    url.searchParams.append('index', index);
    url.searchParams.append('nonce', crypto.randomUUID());

    sendRequest(url);
});

function getValues(id) {
    const pairs = id.split(',').map((p) => p.split(':'));
    const map = new Map(pairs);
    return {
        port: map.get('port'),
        instance: map.get('instance'),
        index: map.get('index'),
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
