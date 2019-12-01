import { CommandStore, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

import languages from '../../lib/util/languages';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_EMOJI_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_EMOJI_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			usage: '<code:string>',
			flagSupport: true
		});
	}

	public async run(message: KlasaMessage, [code]: [string]) {
		const identifier = code.split('\n')[0].replace(/`/g, '');

		const regexResult = /^```(\w+)\s(.+)```$/.exec(code);
		if (!regexResult) throw 'bruh';
		const actualCode = regexResult[2];
		if (!actualCode) throw 'bruh';

		const body = new URLSearchParams();
		body.append('compilerOptions', '');
		body.append('code', actualCode);
		body.append('stdin', '');
		const parameters = {
			method: 'POST',
			body,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};

		const langObj = languages.find(lang => lang.identifier === identifier);

		if (!langObj) throw 'missing lang';

		// @ts-ignore
		const result = await fetch(`https://pastebin.run/api/v0/run/${langObj.implementations[0].wrappers[0].identifier}`, parameters);

		if (!result.ok) {
			return message.send(await result.text());
		}

		const { status, stdout, stderr } = await result.json();
		console.log({ status, stderr, stdout });
		return message.send(stdout || stderr);

	}

}
