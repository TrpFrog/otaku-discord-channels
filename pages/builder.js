function writeChannels() {
    document.getElementById('title').innerHTML = serverName;
    let html = '<ul>';
    for (const category of categories) {
        html += '<li>' + category.name + '</li>';
        html += '<ul>';
        for (const channel of category.channels) {
            html += '<li>' + channel.name + '</li>';
            if (channel.hasTopic) {
                html += '<ul><li>' + channel.topic + '</li></ul>';
            }
        }
        html += '</ul>';
    }
    html += '</ul>';
    document.getElementById('content').innerHTML = html;
}

onload = writeChannels;
