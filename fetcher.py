# -*- coding: utf-8 -*-

import os
from typing import Optional

import disnake

client = disnake.Client()

TOKEN: Optional[str] = os.environ.get('DISCORD_BOT_TOKEN')
GUILD_ID = int(os.environ.get('DISCORD_GUILD_ID'))


@client.event
async def on_ready():
    categories = client.get_guild(GUILD_ID).categories
    js = f'const serverName = "{client.get_guild(GUILD_ID).name}";'
    js += 'const categories = ['
    for category in categories:
        js += '{'
        js += f'"name": "{category.name}",'
        js += '"channels": ['
        for ch in category.text_channels:
            js += '{'
            js += f'"name": "{ch.name}",'
            js += f'"nsfw": {str(ch.nsfw).lower()},'
            has_topic = ch.topic is not None
            js += f'"hasTopic": {str(has_topic).lower()},'
            if has_topic:
                js += f'"topic": "{ch.topic}",'
            js += '},'
        js += ']},'
    js += '];'

    with open('pages/channels.js', 'w', encoding='utf-8') as f:
        f.write(js)

    await client.close()


if __name__ == '__main__':
    if TOKEN is not None:
        client.run(TOKEN)
    else:
        print('You must set the environment variable DISCORD_BOT_TOKEN')
        exit(1)
