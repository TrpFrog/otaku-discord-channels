function writeChannels() {
    document.getElementById('title').innerHTML = serverName;

    let sum = 0;
    for (const category of categories) {
        sum += category.channels.length;
    }
    document.getElementById('number-of-channels').innerHTML = sum + "";
    document.getElementById('last-updated').innerHTML = lastUpdated;

    let html = '';
    for (const category of categories) {
        html += '<details open>';
        html += `<summary class="category">${category.name} (${category.channels.length})</summary>`;
        for (const channel of category.channels) {
            html += '<div class="channel">';
            html += '<span class="channel-name"> <span style="color: gray">＃</span> ' + channel.name + '</span>';
            if (channel.hasTopic) {
                html += '<br><span class="channel-topic">' + channel.topic + '</span>';
            }
            html += '</div>';
        }
        html += '</details>';
    }
    document.getElementById('content').innerHTML = html;
}

onload = writeChannels;
