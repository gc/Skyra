import { KlasaMessage, Monitor } from 'klasa';
import { Events } from '../lib/types/Enums';
import { GuildSettings, TriggerIncludes } from '../lib/types/settings/GuildSettings';
import { APIErrors } from '../lib/util/constants';

export default class extends Monitor {

	public async run(message: KlasaMessage): Promise<void> {
		const content = message.content.toLowerCase();
		const trigger = message.guild!.settings.get(GuildSettings.Trigger.Includes).find(trg => content.includes(trg.input));
		if (trigger && trigger.action === 'react') {
			if (message.reactable) {
				await this.tryReact(message, trigger);
			}
		}
	}

	public shouldRun(message: KlasaMessage) {
		return this.enabled
			&& message.guild !== null
			&& message.author !== null
			&& message.editedTimestamp === null
			&& message.content.length > 0
			&& !message.system
			&& !message.author.bot
			&& message.guild.settings.get(GuildSettings.Trigger.Includes).length > 0;
	}

	private async tryReact(message: KlasaMessage, trigger: TriggerIncludes) {
		try {
			await message.react(trigger.output);
		} catch (error) {
			// Message has been deleted
			if (error.code === APIErrors.UnknownMessage) return;
			// Attempted to react to a user who blocked the bot
			if (error.code === APIErrors.ReactionBlocked) return;
			// The emoji has been deleted or the bot is not in the whitelist
			if (error.code === APIErrors.UnknownEmoji) {
				const { errors } = await message.guild!.settings.update(GuildSettings.Trigger.Includes, trigger, { arrayAction: 'remove' });
				if (errors.length) this.client.emit(Events.Wtf, errors);
				return;
			}
			this.client.emit(Events.ApiError, error);
		}
	}

}
