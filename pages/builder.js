function init() {
    writeChannels(false, '');
    writeLatestChannels();
}

function shortenTopic(topic) {
    const maxLength = 140;
    return topic.length <= maxLength ? topic : `
        ${topic.slice(0, maxLength)}...
        <details>
            <summary>全文を表示</summary>
            ${topic}
        </details>
    `;
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
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const uncategorized = (i + 1) === categories.length;

        let channelsCount = category.channels.length;
        if (doSearch) {
            for (const channel of category.channels) {
                if (channel.name.indexOf(searchWord) === -1) {
                    channelsCount--;
                }
            }
            if (channelsCount === 0) continue;
        }

        if (uncategorized) {
            if (channelsCount === 0) continue;
            category.name = '<span style="font-style: italic">カテゴリ未分類</span>';
        }

        html += `
            <details open>
                <summary class="category">
                    ${category.name} (${channelsCount})
                </summary>
                ${category
                    .channels
                    .filter(channel => !(doSearch && !channel.name.includes(searchWord)))
                    .map(channel => (`
                        <div class="channel">
                            <span class="channel-name">
                                <span style="color: gray">＃</span>
                                ${channel.name}
                            </span>
                            ${channel.hasTopic ? `
                                <br>
                                <span class="channel-topic">
                                    ${shortenTopic(channel.topic)}
                                </span>
                            ` : ''}
                        </div>
                    `)).join('')
                }
            </details>
        `;
    }
    document.getElementById('content').innerHTML = html;
}

function writeLatestChannels() {
    const channelHTMLs = audit.map(channel => (`
        <div class="channel latest-channel">
            <span class="channel-name">
                <span style="color: gray">
                    ${channel.type === 'text' ? '＃' : 'Category: '}
                </span>
                ${channel.name}
            </span>
            ${channel.hasTopic ? `
                <br>
                <span class="channel-topic">
                    ${shortenTopic(channel.topic)}
                </span>
            ` : ''}
            <hr>
            <span class="channel-author">
                ${channel.hasParentCategory ? `Category: ${channel.parentCategory}<br>` : ''}
                ${channel.creator} (${channel.createdAt})
            </span>
        </div>
    `))

    document.getElementById('latest').innerHTML = `
        ${channelHTMLs.slice(0, 3).join('')}
        ${channelHTMLs.length >= 4 ? `
            <details>
                <summary>クリックでさらに表示</summary>
                ${channelHTMLs.slice(3).join('')}
            </details>
        ` : ''}
    `;
}

function searchChannels() {
    const val = document.getElementById('search-box').value;
    if (val === '') {
        resetSearch();
    } else {
        writeChannels(true, val);
        document.getElementById('reset-button').style.display = 'inline';
    }
}

function resetSearch() {
    document.getElementById('search-box').value = '';
    document.getElementById('reset-button').style.display = 'none';
    writeChannels(false, '');
}

onload = init;
