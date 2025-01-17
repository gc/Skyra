import { Colors, Task } from 'klasa';
import { TOKENS } from '../../config';
import { Events } from '../lib/types/Enums';
import { fetch, FetchResultTypes } from '../lib/util/util';

const r = new Colors({ text: 'red' });
const g = new Colors({ text: 'green' });
const b = new Colors({ text: 'lightblue' });
const header = b.format('[POST STATS   ]');

enum Lists {
	BotsForDiscord = 'botsfordiscord.com',
	DiscordBotList = 'discordbotlist.com',
	DiscordBotsOrg = 'discordbots.org',
	DiscordBotsGG = 'discord.bots.gg',
	BotsOnDiscord = 'bots.ondiscord.xyz'
}

export default class extends Task {

	public async run() {
		if (this.client.options.dev) return;

		const guilds = this.client.guilds.size.toString();
		const users = this.client.guilds.reduce((acc, val) => acc + val.memberCount, 0).toString();

		const results = (await Promise.all([
			this.query(`https://discordbots.org/api/bots/${this.client.user!.id}/stats`,
				`{"server_count":${guilds}}`, TOKENS.DISCORD_BOT_ORG, Lists.DiscordBotsOrg),
			this.query(`https://discord.bots.gg/api/v1/bots/${this.client.user!.id}/stats`,
				`{"guildCount":${guilds}}`, TOKENS.DISCORD_BOTS, Lists.DiscordBotsGG),
			this.query(`https://botsfordiscord.com/api/bot/${this.client.user!.id}`,
				`{"server_count":${guilds}}`, TOKENS.BOTS_FOR_DISCORD_KEY, Lists.BotsForDiscord),
			this.query(`https://discordbotlist.com/api/bots/${this.client.user!.id}/stats`,
				`{"guilds":${guilds},"users":${users}}`, TOKENS.DISCORD_BOT_LIST ? `Bot ${TOKENS.DISCORD_BOT_LIST}` : null, Lists.DiscordBotList),
			this.query(`https://bots.ondiscord.xyz/bot-api/bots/${this.client.user!.id}/guilds`,
				`{"guildCount":${guilds}}`, TOKENS.BOTS_ON_DISCORD_KEY, Lists.BotsOnDiscord)
		])).filter(value => value !== null);

		if (results.length) this.client.emit(Events.Verbose, `${header} [ ${guilds} [G] ] [ ${users} [U] ] | ${results.join(' | ')}`);
	}

	public async query(url: string, body: string, token: string | null, list: Lists) {
		try {
			if (!token) return null;
			await fetch(url, {
				body,
				headers: { 'Content-Type': 'application/json', 'Authorization': token },
				method: 'POST'
			}, FetchResultTypes.Result);
			return g.format(list);
		} catch (error) {
			const reason = typeof error === 'object' ? error.status || error.code || '' : error;
			return `${r.format(list)}${reason ? ` [${r.format(reason)}]` : ''}`;
		}
	}

}
