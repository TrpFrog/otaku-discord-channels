# -*- coding: utf-8 -*-

import os
from typing import Optional

import disnake
import bleach

client = disnake.Client()

TOKEN: Optional[str] = os.environ.get('DISCORD_BOT_TOKEN')
GUILD_ID = int(os.environ.get('DISCORD_GUILD_ID'))


def current_time() -> str:
    import datetime
    now = datetime.datetime.utcnow() + datetime.timedelta(hours=9)
    return f"{now:%Y年%m月%d日 %H:%M:%S}"


def indent(s: str, n=1, space=4) -> str:
    lines = s.split('\n')
    whitespace = ' ' * (space * n)
    for i in range(len(lines)):
        lines[i] = whitespace + lines[i]
    return '\n'.join(lines)


def clean(s: str) -> str:
    return bleach.clean(s).replace('"', '&quot;').replace("‘", '&#x27;').replace('\\', '\\\\')


class CategoryRecord:
    def __init__(self, name: str):
        self.name = clean(name)
        self.channels = []

    def __str__(self):
        ch_txt = ',\n'.join(map(lambda x: str(x), self.channels))
        ch_array = f'[\n{(indent(ch_txt))}\n]' if len(self.channels) > 0 else '[]'
        return '{\n' + indent(
            f'"name": "{self.name}",\n'
            f'"channels": {ch_array}'
        ) + '\n}'


class ChannelRecord:
    def __init__(self, name: str, nsfw: bool, topic: Optional[str], ch_type: disnake.ChannelType):
        self.name = clean(name)
        self.nsfw = nsfw
        self.type = ch_type
        self.has_topic = topic is not None
        if self.has_topic:
            self.topic = clean(topic)
        else:
            self.topic = ""

    def __str__(self):
        return '{\n' + indent(
            f'"name": "{self.name}",\n'
            f'"nsfw": {str(self.nsfw).lower()},\n'
            f'"type": "{str(self.type)}",\n'
            f'"hasTopic": {str(self.has_topic).lower()},\n'
            f'"topic": "{self.topic}",'
        ) + '\n}'


def category_array_to_str(arr: [CategoryRecord]):
    s = ',\n'.join(map(lambda x: str(x), arr))
    return '[\n' + indent(s) + '\n]'


@client.event
async def on_ready():
    categories = client.get_guild(GUILD_ID).categories

    res = []
    for category in categories:
        ca_record = CategoryRecord(category.name)
        for ch in category.text_channels:
            if len(ch.members) != 0:  # check permission
                ca_record.channels.append(ChannelRecord(ch.name, ch.nsfw, ch.topic, ch.type))
        for ch in category.voice_channels:
            if len(ch.members) != 0:  # check permission
                ca_record.channels.append(ChannelRecord(ch.name, False, None, ch.type))
        res.append(ca_record)

    js = f'const lastUpdated = "{current_time()}"; \n\n'
    js += f'const serverName = "{client.get_guild(GUILD_ID).name}"; \n\n'
    js += 'const categories = ' + category_array_to_str(res)
    with open('pages/channels.js', 'w', encoding='utf-8') as f:
        f.write(js)

    await client.close()


if __name__ == '__main__':
    if TOKEN is not None:
        client.run(TOKEN)
    else:
        print('You must set the environment variable DISCORD_BOT_TOKEN')
        exit(1)
