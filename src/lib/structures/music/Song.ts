import { Track } from 'lavalink';
import { enumerable, showSeconds, cleanMentions } from '../../util/util';
import { Queue } from './Queue';
import { Util } from 'discord.js';

export class Song {

	@enumerable(false)
	public track: string;

	@enumerable(false)
	public requester: string;

	@enumerable(false)
	public queue: Queue;

	public identifier: string;
	public seekable: boolean;
	public author: string;
	public duration: number;
	public stream: boolean;
	public position: number;
	public title: string;
	public url: string;
	public skips = new Set<string>();

	/**
	 * @param queue The queue that manages this song.
	 * @param data The retrieved data.
	 * @param requester The user that requested this song.
	 */
	public constructor(queue: Queue, data: Track, requester: string) {
		this.queue = queue;
		this.track = data.track;
		this.requester = requester;
		this.identifier = data.info.identifier;
		this.seekable = data.info.isSeekable;
		this.author = data.info.author;
		this.duration = data.info.length;
		this.stream = data.info.isStream;
		this.position = data.info.position;
		this.title = data.info.title;
		this.url = data.info.uri;
	}

	/**
	 * The cleaned and escaped title
	 */
	public get safeTitle() {
		return cleanMentions(this.queue.guild, Util.escapeMarkdown(this.title));
	}

	public get friendlyDuration(): string {
		return showSeconds(this.duration);
	}

	public async fetchRequester() {
		try {
			return await this.queue.client.users.fetch(this.requester);
		} catch {
			return null;
		}
	}

	public toString(): string {
		return `<${this.url}>`;
	}

}
