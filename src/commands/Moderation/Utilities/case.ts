import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { PermissionLevels } from '../../../lib/types/Enums';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: 'Get the information from a case by its index.',
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '<Case:integer|latest>'
		});
	}

	public async run(message: KlasaMessage, [index]: [number | 'latest']) {
		const modlog = index === 'latest'
			? (await message.guild!.moderation.fetch()).last()
			: await message.guild!.moderation.fetch(index);
		if (modlog) return message.sendEmbed(await modlog.prepareEmbed());
		throw message.language.tget('COMMAND_REASON_NOT_EXISTS');
	}

}
