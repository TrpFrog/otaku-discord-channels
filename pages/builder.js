function init() {
    writeChannels(false, '');
    writeLatestChannels();
}

function writeChannels(doSearch, searchWord) {
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

function writeLatestChannels() {
    let html = '';
    let channelsCount = 0;
    for (const channel of audit) {
        channelsCount++;
        if (channelsCount >= 4) {
            if (channelsCount === 4) {
                html += '<details>'
                html += '<summary>クリックでさらに表示</summary>'
            }
        }

        html += '<div class="channel latest-channel">';
        const icon = channel.type === 'text' ? '＃' : 'Category: ';
        html += '<span class="channel-name"> <span style="color: gray">' + icon + '</span> '
        html += channel.name + '</span>';
        if (channel.hasTopic) {
            html += '<br><span class="channel-topic">' + channel.topic + '</span>';
        }

        html += '<hr>';
        html += '<span class="channel-author">';
        html += '' + channel.creator + ' ';
        html += '(' + channel.createdAt + ')';
        html += '</span>';
        html += '</div>';

        if (channelsCount >= 4) {

        }
    }
    if(channelsCount > 3) {
        html += '</details>'
    }
    document.getElementById('latest').innerHTML = html;
}

onload = init;
