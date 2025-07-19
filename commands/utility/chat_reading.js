const { SlashCommandBuilder, MessageFlags, InteractionContextType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, StreamType } = require('@discordjs/voice');

const { guildId, Voice_Channel_Id, Reading_Role_Id, VOICEVOX_Speaker_Id } = require('../../config.json');

const voicevox = require('../../VOICEVOX.js');
const player = require('../../Playing_VoiceChannel.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chat_reading')
		.setDescription('テキストチャットの読み上げに関するコマンド')
		/*.addSubcommand(subcommand =>
			subcommand
				.setName('available')
				.setDescription('テキストチャットの読み上げ有効/無効')
				.addBooleanOption(option =>
					option
						.setName('availability')
						.setDescription('true/false')
						.setRequired(true)
				)
		)*/
		.addSubcommand(subcommand =>
			subcommand
				.setName('connect')
				.setDescription('テキストチャットの読み上げbotをボイスチャットに接続させる')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('disconnect')
				.setDescription('テキストチャットの読み上げbotをボイスチャットから切断させる')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('change')
				.setDescription('自身のチャットの読み上げ状態を変更します。')
				.addBooleanOption(option =>
					option
						.setName('availability')
						.setDescription('True/False')
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('check')
				.setDescription('自身のチャットの読み上げ状態を確認します。')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('test')
				.setDescription('テスト音声を再生します。')
				.addBooleanOption(option =>
					option
						.setName('generate')
						.setDescription('True/False')
						.setRequired(true)
				)
		)
		/*.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for banning'))*/
		.setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'available') {
			const availability = interaction.options.getBoolean('availability');
			await interaction.reply({ content: `This command is created now!`, flags: MessageFlags.Ephemeral });
		} else if (interaction.options.getSubcommand() === 'connect') {
			// 接続処理
			const voicechannel_connection = joinVoiceChannel({
				channelId: Voice_Channel_Id,
				guildId: guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});
			await interaction.reply({ content: `読み上げbotを<#${Voice_Channel_Id}>に接続しました。` });
		} else if (interaction.options.getSubcommand() === 'disconnect') {
			const voicechannel_connection = getVoiceConnection(guildId);
			if (voicechannel_connection === undefined) {
				await interaction.reply({ content: `読み上げbotは接続されていません。` });
				return;
			} else {
				voicechannel_connection.destroy();
				await interaction.reply({ content: `読み上げbotを切断しました。` });
			}
		} else if (interaction.options.getSubcommand() === 'change') {
			// 対象変更コマンド(ロール付与)
			const availability = interaction.options.getBoolean('availability');
			if (availability) {
				// 有効化
				const role = interaction.guild.roles.cache.get(Reading_Role_Id);
				const member = interaction.member;
				if (!member.roles.cache.some(role => role.id === Reading_Role_Id)) {
					// 変更
					await member.roles.add(role);
					await interaction.reply({ content: `読み上げ対象にしました。`, flags: MessageFlags.Ephemeral });
				} else {
					// すでに対象
					await interaction.reply({ content: `既に読み上げ対象です。`, flags: MessageFlags.Ephemeral });
				}
			} else {
				// 無効化
				const role = interaction.guild.roles.cache.get(Reading_Role_Id);
				const member = interaction.member;
				if (member.roles.cache.some(role => role.id === Reading_Role_Id)) {
					// 変更
					await member.roles.remove(role);
					await interaction.reply({ content: `読み上げ対象から削除しました。`, flags: MessageFlags.Ephemeral });
				} else {
					// すでに非対象
					await interaction.reply({ content: `既に読み上げ対象ではありません。`, flags: MessageFlags.Ephemeral });
				}
			}
		} else if (interaction.options.getSubcommand() === 'check') {
			// 確認コマンド
			const member = interaction.member;
			if (member.roles.cache.some(role => role.id === Reading_Role_Id)) {
				await interaction.reply({ content: 'あなたはチャット読み上げ対象者です！', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'あなたはチャット読み上げ対象者ではありません！', flags: MessageFlags.Ephemeral });
			}
		} else if (interaction.options.getSubcommand() === 'test') {
			const generate = interaction.options.getBoolean('Generate');
			if (generate) {
				// ボイスチャンネルに接続されているか確認
				const voicechannel_connection = getVoiceConnection(guildId);
				if (voicechannel_connection === undefined) return;
				//console.log(`Receive Message: User=${member.displayName},Content=${interaction.content}`)// For Debug
				// VOICEVOXにて音声を合成
				text = 'これはテスト音声です。';
				// VOICEVOXにて音声を合成
				new Promise(async (resolve, reject) => {
					const resource = await voicevox.voicevox_generate_voice(text, VOICEVOX_Speaker_Id)
					resolve(resource);
				})
					.then((resource) => {
						// ボイスチャットでの再生処理
						player.play_resource(voicechannel_connection);
					})
					.catch((error) => {
						console.log(error);
						return "Error";
					});
			} else {
				const voicechannel_connection = getVoiceConnection(guildId);
				if (voicechannel_connection === undefined) return;

				// ボイスチャットでの再生処理
				player.play_resource(voicechannel_connection, './test.wav');
			}
		} else {
			await interaction.reply({ content: `[ERROR] コマンドの構文が間違っている可能性があります。\n正しい構文で再度実行してください。`, flags: MessageFlags.Ephemeral });
		}
	},
};
