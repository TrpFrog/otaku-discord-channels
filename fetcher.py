# -*- coding: utf-8 -*-

import os
from typing import Optional
from dotenv import load_dotenv

import disnake
import bleach
import datetime

client = disnake.Client()

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)
TOKEN: Optional[str] = os.environ.get('DISCORD_BOT_TOKEN')
GUILD_ID = int(os.environ.get('DISCORD_GUILD_ID'))

# If you want to change the display name of a user with a certain ID,
# add "DISCORD_USER_ID_[NAME]" to the environment variable
SPECIFIC_USER_ID_LIST = {}
for (k, v) in os.environ.items():
    if k.startswith('DISCORD_USER_ID_'):
        SPECIFIC_USER_ID_LIST[v] = k.replace('DISCORD_USER_ID_', '')


def is_integer(n):
    try:
        int(n)
    except ValueError:
        return False
    else:
        return True


def current_time() -> str:
    now = datetime.datetime.utcnow() + datetime.timedelta(hours=9)
    return f"{now:%Y年%m月%d日 %H:%M:%S}"


def indent(s: str, n=1, space=4) -> str:
    lines = s.split('\n')
    whitespace = ' ' * (space * n)
    for i in range(len(lines)):
        lines[i] = whitespace + lines[i]
    return '\n'.join(lines)


def clean(s: str) -> str:
    s = ' '.join(s.split())
    return bleach.clean(s) \
        .replace('"', '&quot;') \
        .replace("‘", '&#x27;') \
        .replace('\\', '\\\\')


def channel_array_to_str(arr):
    if len(arr) == 0:
        return '[]'
    s = ',\n'.join(map(lambda x: str(x), arr))
    return '[\n' + indent(s) + '\n]'


class CategoryRecord:
    def __init__(self, name: str):
        self.name = clean(name)
        self.channels = []

    def __str__(self):
        return '{\n' + indent(
            f'"name": "{self.name}",\n'
            f'"type": "category",\n'
            f'"channels": {channel_array_to_str(self.channels)}'
        ) + '\n}'


class ChannelRecord:
    def __init__(self, name: str, nsfw: bool, topic: Optional[str],
                 ch_type: disnake.ChannelType,
                 category: disnake.CategoryChannel = None,
                 creator: Optional[str] = None,
                 created_at: datetime = None, is_removed: bool = False,
                 last_updated: datetime = None):
        self.name = clean(name)
        self.nsfw = nsfw
        self.type = ch_type

        self.has_topic = topic is not None
        self.topic = clean(topic) if self.has_topic else ""

        self.has_creator = creator is not None
        self.creator = clean(creator) if self.has_creator else ""

        self.has_parent_category = category is not None
        self.parent_category = clean(category.name) if self.has_parent_category else ""

        self.has_created_at = created_at is not None
        if self.has_created_at:
            created_at += datetime.timedelta(hours=9)
        self.created_at = f'{created_at:%Y年%m月%d日 %H:%M:%S}' if self.has_created_at else ""

        self.has_last_updated = last_updated is not None
        if self.has_last_updated:
            last_updated += datetime.timedelta(hours=9)
        self.last_updated = f'{last_updated:%Y年%m月%d日 %H:%M:%S}' if self.has_last_updated else ""

        self.is_removed = is_removed

    def __str__(self):
        return '{\n' + indent(
            f'"name": "{self.name}",\n'
            f'"nsfw": {str(self.nsfw).lower()},\n'
            f'"type": "{str(self.type)}",\n'
            f'"hasTopic": {str(self.has_topic).lower()},\n'
            f'"topic": "{self.topic}",\n'
            f'"hasCreator": {str(self.has_creator).lower()},\n'
            f'"creator": "{self.creator}",\n'
            f'"hasCreatedAt": {str(self.has_created_at).lower()},\n'
            f'"createdAt": "{self.created_at}",\n'
            f'"hasLastUpdated": {str(self.has_last_updated).lower()},\n'
            f'"lastUpdated": "{self.last_updated}",\n'
            f'"hasParentCategory": {str(self.has_parent_category).lower()},\n'
            f'"parentCategory": "{self.parent_category}",\n'
            f'"isRemoved": {str(self.is_removed).lower()},'
        ) + '\n}'


@client.event
async def on_ready():
    guild = client.get_guild(GUILD_ID)
    categories = guild.categories

    res = []
    for category in categories:
        ca_record = CategoryRecord(category.name)
        for idx, ch in enumerate(category.text_channels):
            print(ch.name, idx, len(category.text_channels))
            if len(ch.members) != 0:  # check permission
                m_id = ch.last_message_id
                last_updated = None
                if m_id is not None:
                    try:
                        message = await ch.fetch_message(m_id)
                        last_updated = message.created_at
                    except disnake.errors.NotFound:
                        pass
                ca_record.channels.append(
                    ChannelRecord(ch.name, ch.nsfw, ch.topic, ch.type, last_updated=last_updated)
                )
        for ch in category.voice_channels:
            if len(ch.members) != 0:  # check permission
                ca_record.channels.append(ChannelRecord(ch.name, False, None, ch.type))
        res.append(ca_record)

    # Category: UNCATEGORIZED
    uncategorized = CategoryRecord('Uncategorized')
    for ch in list(filter(lambda x: x.category is None, guild.text_channels)):
        if len(ch.members) != 0:  # check permission
            uncategorized.channels.append(ChannelRecord(ch.name, ch.nsfw, ch.topic, ch.type))
    res.append(uncategorized)

    # latest channels
    audit_record = []
    async for entry in guild.audit_logs(limit=100):
        if entry.action == disnake.AuditLogAction.channel_create:
            ch = entry.target
            # Check if it is removed channel
            if is_integer(ch.id) is False or guild.get_channel(int(ch.id)) is None:
                continue
            topic = ch.topic if type(ch) == disnake.TextChannel else None

            if str(entry.user.id) in SPECIFIC_USER_ID_LIST:
                entry.user.name = SPECIFIC_USER_ID_LIST[str(entry.user.id)]

            audit_record.append(ChannelRecord(
                ch.name, ch.nsfw, topic, ch.type, ch.category,
                entry.user.name, entry.created_at
            ))

    js = f'const lastUpdated = "{current_time()}"; \n\n'
    js += f'const serverName = "{client.get_guild(GUILD_ID).name}"; \n\n'
    js += 'const categories = ' + channel_array_to_str(res) + '\n\n'
    js += 'const audit = ' + channel_array_to_str(audit_record)
    with open('pages/channels.js', 'w', encoding='utf-8') as f:
        f.write(js)

    await client.close()


if __name__ == '__main__':
    if TOKEN is not None:
        client.run(TOKEN)
    else:
        print('You must set the environment variable DISCORD_BOT_TOKEN')
        exit(1)
