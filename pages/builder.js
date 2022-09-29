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

function getOutdatedLabel(channel) {
    if (!channel.hasLastUpdated) {
        return `
            <span class="outdated">
                未使用
            </span>
        `
    } else {
        const sp = channel.lastUpdated.split(/[年月日 ]/g).filter(e => e);
        const date = Date.parse(`${sp[0]}/${sp[1]}/${sp[2]} ${sp[3]} GMT+0900`);
        const now = Date.now();
        const oneMonth = 1000 * 60 * 60 * 24 * 30.5;
        if (now - date < 4 * oneMonth) {
            return ''
        } else {
            const mon = Math.floor((now - date) / oneMonth);
            return `
                <span class="outdated">
                    ${mon}か月未使用
                </span>
            `
        }
    }
}

function getServiceStoppingMsg() {
    const sp = lastUpdated.split(/[年月日 ]/g).filter(e => e);
    const date = Date.parse(`${sp[0]}/${sp[1]}/${sp[2]} ${sp[3]} GMT+0900`);
    const now = Date.now();
    const oneDay = 1000 * 60 * 60 * 24;
    if (now - date < 2 * oneDay) {
        return ''
    } else {
        return `
            <div id="service-temporarily-stop-msg-box">
                <h3>このページの自動更新が止まっている可能性があります！</h3>
                <p>
                    <span class="ib">管理者の Twitter (<a href="https://twitter.com/rpFrog">@TrpFrog</a>)</span> 
                    <span class="ib">または</span><span class="ib">メール (dev<span style="color: #9bc5ff">●</span>trpfrog.net) までご連絡をお願いします🙇</span>
                </p>
                <small>
                    <details>
                        <summary>このメッセージが表示されている理由</summary>
                        <p>
                            このページは GitHub Actions で毎日自動更新されています。
                            しかし、GitHub Actions は 60 日間メンテナンスを行わないと自動停止してしまいます。
                            したがって 2 日間以上更新がない現在、このページの自動更新が止まっている可能性があります。
                        </p>
                        <p>
                            <b>Q.</b> 止まらないようにする何らかの仕組み組んだりすれば良いのでは？<br>
                            <b>A.</b> こんなしょうもないサイトにそんな高度な機能は要らぬ……
                        </p>
                        <p>
                            <b>Q.</b> そういう機能実装して Pull Request を出します！<br>
                            <b>A.</b> いやでも僕が死んでも未来永劫このサイトが更新され続けるのは GitHub 社に申し訳なくない？
                        </p>
                        <p>
                            <b>Q.</b> この鯖の住人です！メンテするからコラボレータ権限くれ〜<br>
                            <b>A.</b> 𝑶𝑲 (あげるので僕に聞いてください)
                        </p>
                    </details>
                </small>
            </div>
        `
    }
}

function writeChannels(doSearch, searchWord) {
    document.getElementById('title').innerHTML = serverName;

    let sum = 0;
    for (const category of categories) {
        sum += category.channels.length;
    }
    document.getElementById('number-of-channels').innerHTML = sum + "";
    document.getElementById('last-updated').innerHTML = lastUpdated;
    document.getElementById('service-temporarily-stop-msg').innerHTML = getServiceStoppingMsg();

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
                                <span>
                                    <span style="color: gray">＃</span>
                                    ${channel.name}
                                </span>
                                ${getOutdatedLabel(channel)}
                            </span>
                            ${channel.hasTopic ? `
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
                <span>
                    <span style="color: gray">
                        ${channel.type === 'text' ? '＃' : 'Category: '}
                    </span>
                    ${channel.name}
                </span>
            </span>
            ${channel.hasTopic ? `
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
