import { MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { KlasaMessage, Monitor } from 'klasa';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { Adder } from '../lib/util/Adder';
import { MessageLogsEnum, Moderation } from '../lib/util/constants';
import { floatPromise } from '../lib/util/util';
const { FLAGS } = Permissions;

export default class extends Monitor {

	public async run(message: KlasaMessage) {
		if (await message.hasAtLeastPermissionLevel(5)) return;

		const attachmentAction = message.guild!.settings.get(GuildSettings.Selfmod.AttachmentAction);
		const attachmentMaximum = message.guild!.settings.get(GuildSettings.Selfmod.AttachmentMaximum);
		const attachmentDuration = message.guild!.settings.get(GuildSettings.Selfmod.AttachmentDuration);

		if (!message.guild!.security.adders.attachments) message.guild!.security.adders.attachments = new Adder(attachmentMaximum, attachmentDuration);

		try {
			message.guild!.security.adders.attachments.add(message.author.id, message.attachments.size);
			return;
		} catch {
			switch (attachmentAction & 0b111) {
				case 0b000: await this.actionAndSend(message, Moderation.TypeCodes.Warn, () => null);
					break;
				case 0b001: await this.actionAndSend(message, Moderation.TypeCodes.Kick, () =>
					floatPromise(this, message.guild!.security.actions.kick({
						user_id: message.author.id,
						reason: '[Auto-Moderation] AttachmentFilter: Threshold Reached.'
					})));
					break;
				case 0b010: await this.actionAndSend(message, Moderation.TypeCodes.Mute, () =>
					floatPromise(this, message.guild!.security.actions.mute({
						user_id: message.author.id,
						reason: '[Auto-Moderation] AttachmentFilter: Threshold Reached.'
					})));
					break;
				case 0b011: await this.actionAndSend(message, Moderation.TypeCodes.Softban, () =>
					floatPromise(this, message.guild!.security.actions.softBan({
						user_id: message.author.id,
						reason: '[Auto-Moderation] AttachmentFilter: Threshold Reached.'
					}, 1)));
					break;
				case 0b100: await this.actionAndSend(message, Moderation.TypeCodes.Ban, () =>
					floatPromise(this, message.guild!.security.actions.ban({
						user_id: message.author.id,
						reason: '[Auto-Moderation] AttachmentFilter: Threshold Reached.'
					}, 0)));
					break;
			}
			// noinspection JSBitwiseOperatorUsage
			if (attachmentAction & 0b1000) {
				this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Moderation, message.guild, () => new MessageEmbed()
					.setColor(0xEFAE45)
					.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128 }))
					.setFooter(`#${(message.channel as TextChannel).name} | ${message.language.tget('CONST_MONITOR_ATTACHMENTFILTER')}`)
					.setTimestamp());
			}
		}
	}

	/**
	 * @param message The message
	 * @param type The type
	 * @param performAction The action to perform
	 */
	public async actionAndSend(message: KlasaMessage, type: Moderation.TypeCodes, performAction: () => unknown): Promise<void> {
		const lock = message.guild!.moderation.createLock();
		await performAction();
		await message.guild!.moderation.create({
			user_id: message.author.id,
			moderator_id: this.client.user!.id,
			type,
			duration: message.guild!.settings.get(GuildSettings.Selfmod.AttachmentPunishmentDuration),
			reason: 'AttachmentFilter: Threshold Reached.'
		}).create();
		lock();
	}

	public shouldRun(message: KlasaMessage) {
		return this.enabled
			&& message.guild !== null
			&& message.author !== null
			&& message.webhookID === null
			&& message.attachments.size > 0
			&& !message.system
			&& message.author.id !== this.client.user!.id
			&& message.guild.settings.get(GuildSettings.Selfmod.Attachment)
			&& !message.guild.settings.get(GuildSettings.Selfmod.IgnoreChannels).includes(message.channel.id)
			&& this.hasPermissions(message, message.guild.settings.get(GuildSettings.Selfmod.AttachmentAction));
	}

	private hasPermissions(message: KlasaMessage, action: number) {
		const guildMe = message.guild!.me!;
		const member = message.member!;
		switch (action & 0b11) {
			case 0b000: return guildMe.roles.highest.position > member.roles.highest.position;
			case 0b001: return member.kickable;
			case 0b010: return message.guild!.settings.get(GuildSettings.Roles.Muted) !== null
				&& guildMe.roles.highest.position > member.roles.highest.position
				&& guildMe.permissions.has(FLAGS.MANAGE_ROLES);
			case 0b011: return member.bannable;
			case 0b100: return member.bannable;
			default: return false;
		}
	}

}
