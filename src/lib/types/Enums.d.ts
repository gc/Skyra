export const enum Events {
	ApiError = 'apiError',
	CommandError = 'commandError',
	CommandInhibited = 'commandInhibited',
	CommandSuccess = 'commandSuccess',
	CommandUnknown = 'commandUnknown',
	CoreSettingsDelete = 'coreSettingsDelete',
	CoreSettingsUpdate = 'coreSettingsUpdate',
	Debug = 'debug',
	Disconnect = 'disconnect',
	Error = 'error',
	EventError = 'eventError',
	FinalizerError = 'finalizerError',
	GuildBanAdd = 'guildBanAdd',
	GuildBanRemove = 'guildBanRemove',
	GuildCreate = 'guildCreate',
	GuildDelete = 'guildDelete',
	GuildMessageLog = 'guildMessageLog',
	KlasaReady = 'klasaReady',
	Log = 'log',
	MentionSpamExceeded = 'mentionSpamExceeded',
	MentionSpamWarning = 'mentionSpamWarning',
	Message = 'message',
	MessageDelete = 'messageDelete',
	MessageDeleteBulk = 'messageDeleteBulk',
	MessageUpdate = 'messageUpdate',
	MonitorError = 'monitorError',
	Raw = 'raw',
	ReactionBlacklist = 'reactionBlacklist',
	Reconnecting = 'reconnecting',
	RoleReactionAdd = 'roleReactionAdd',
	RoleReactionRemove = 'roleReactionRemove',
	SettingsUpdate = 'settingsUpdate',
	TaskError = 'taskError',
	TwitchStreamOffline = 'twitchStreamOffline',
	TwitchStreamOnline = 'twitchStreamOnline',
	UnhandledRejection = 'unhandledRejection',
	Verbose = 'verbose',
	Warn = 'warn',
	Wtf = 'wtf',
	GuildAnnouncementEdit = 'guildAnnouncementEdit',
	GuildAnnouncementSend = 'guildAnnouncementSend',
	GuildAnnouncementError = 'guildAnnouncementError'
}

export const enum PermissionLevels {
	Everyone = 0,
	Moderator = 5,
	Administrator = 6,
	ServerOwner = 7,
	BotOwner = 10
}
