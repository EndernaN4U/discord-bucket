import { Client, Guild } from 'discord.js';

export const getGuild = async (client: Client, guildId: string): Promise<Guild> => {
  const guild = await client.guilds.fetch(guildId);

  if (!guild) {
    throw new Error(`Guild with ID ${guildId} not found.`);
  }

  return guild;
};
