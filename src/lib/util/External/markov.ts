import { pickByWeights } from './pickByWeights';
import { iteratorAt } from '../util';

export class Markov {

	private readonly wordBank: WordBank = new Map();
	private readonly normalizeFn: MarkovNormalizer;
	private readonly parseBy = /[.?\n]/g;
	private sentence = '';

	public constructor(normalizeFn: MarkovNormalizer = word => word.replace(/\.$/g, '')) {
		this.normalizeFn = normalizeFn;
	}

	public process() {
		let currentWord = this.startFn(this.wordBank);
		if (!currentWord) return '';

		this.sentence = currentWord;
		let word: WordBankValue | undefined;
		while (typeof (word = this.wordBank.get(currentWord)) !== 'undefined' && !this.endFn()) {
			currentWord = pickByWeights(word)!;
			this.sentence += ` ${currentWord}`;
		}

		return this.sentence;
	}

	public parse(text = '', parseBy = this.parseBy) {
		for (const line of text.split(parseBy)) {
			const words = Markov.retrieveWords(line);

			for (let i = 0, max = words.length - 1; i < max; ++i) {
				const currentWord = this.normalizeFn(words[i]);
				const nextWord = this.normalizeFn(words[i + 1]);

				let currentWordBank = this.wordBank.get(currentWord);
				if (typeof currentWordBank === 'undefined') {
					currentWordBank = new Map<string, number>();
					this.wordBank.set(currentWord, currentWordBank);
				}

				let currentWordCount = currentWordBank.get(nextWord);
				if (typeof currentWordCount === 'undefined') currentWordCount = 0;
				currentWordBank.set(nextWord, currentWordCount + 1);
			}
		}

		return this;
	}

	public start(fnStart: MarkovStartFunction | string) {
		switch (typeof fnStart) {
			case 'string': {
				this.startFn = () => fnStart;
				return this;
			}
			case 'function': {
				this.startFn = fnStart;
				return this;
			}
			default: throw new TypeError('Expected either a string or a function.');
		}
	}

	public end(fnEnd: MarkovEndFunction | string | number) {
		switch (typeof fnEnd) {
			case 'function': {
				this.endFn = fnEnd;
				return this;
			}
			case 'string': {
				const regex = / (.+)$/;
				this.endFn = () => {
					const executed = regex.exec(this.sentence);
					return executed !== null && executed[1] === fnEnd;
				};
				return this;
			}
			case 'number':
				this.endFn = () => this.countWords() > (fnEnd as number);
				return this;
			default: throw new TypeError('Expected either a function, string, number, or undefined.');
		}
	}

	private startFn: MarkovStartFunction = (wordList: WordBank) => iteratorAt(wordList.keys(), Math.floor(Math.random() * wordList.size))!;
	private endFn: MarkovEndFunction = () => this.countWords() > 7;

	private countWords() {
		let count = 0;
		for (let index = -2; index !== -1; index = this.sentence.indexOf(' ', index + 1)) count++;
		return count;
	}

	private static retrieveWords(line: string) {
		const words: string[] = [];
		for (const word of line.split(' ')) {
			const trimmed = word.trim();
			if (trimmed.length > 0) words.push(trimmed);
		}

		return words;
	}

}

export type WordBank = Map<WordBankKey, WordBankValue>;
export type WordBankKey = string;
export type WordBankValue = Map<string, number>;

export interface MarkovStartFunction {
	(wordBank: WordBank): string;
}

export interface MarkovEndFunction {
	(): boolean;
}

export interface MarkovNormalizer {
	(word: string): string;
}
