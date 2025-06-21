const { SlashCommandBuilder, MessageFlags, InteractionContextType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, NoSubscriberBehavior, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');

const { guildId, Voice_Channel_Id, Reading_Role_Id } = require('../../config.json');

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
			await interaction.reply({content: `This command is created now!`, flags: MessageFlags.Ephemeral});
		} else if (interaction.options.getSubcommand() === 'connect') {
			// 接続処理
			const voicechannel_connection = joinVoiceChannel({
				channelId: Voice_Channel_Id,
				guildId: guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});
			await interaction.reply({content: `読み上げbotを<#${Voice_Channel_Id}>に接続しました。`});
		} else if (interaction.options.getSubcommand() === 'disconnect') {
			const voicechannel_connection = getVoiceConnection(guildId);
			if (voicechannel_connection === undefined) {
				await interaction.reply({content: `読み上げbotは接続されていません。`});
				return;
			} else {
				voicechannel_connection.destroy();
				await interaction.reply({content: `読み上げbotを切断しました。`});
			}
		} else if (interaction.options.getSubcommand() === 'change') {
			// 対象変更コマンド(ロール付与)
			const availability = interaction.options.getBoolean('availability');
			if(availability) {
				// 有効化
				const role = interaction.guild.roles.cache.get(Reading_Role_Id);
				const member = interaction.member;
				if(!member.roles.cache.some(role => role.id === Reading_Role_Id)) {
					// 変更
					await member.roles.add(role);
					await interaction.reply({content: `読み上げ対象にしました。`, flags: MessageFlags.Ephemeral});
				} else {
					// すでに対象
					await interaction.reply({content: `既に読み上げ対象です。`, flags: MessageFlags.Ephemeral});
				}
			} else {
				// 無効化
				const role = interaction.guild.roles.cache.get(Reading_Role_Id);
				const member = interaction.member;
				if(member.roles.cache.some(role => role.id === Reading_Role_Id)) {
					// 変更
					await member.roles.remove(role);
					await interaction.reply({content: `読み上げ対象から削除しました。`, flags: MessageFlags.Ephemeral});
				} else {
					// すでに非対象
					await interaction.reply({content: `既に読み上げ対象ではありません。`, flags: MessageFlags.Ephemeral});
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
            	try {
                	// Step1
                	const options_audio_query = {
                    	method: "POST",
                    	headers: {
                        	"accept": "application/json",
                    	},
                	};
                	url_audio_query = VOICEVOX_API_URL + `/audio_query?text=${encodeURIComponent(text)}&speaker=${VOICEVOX_Speaker_Id}`;
                	const request_audio_query = http.request(url_audio_query, options_audio_query, (res_audio_query) => {
                    	res_audio_query.setEncoding('utf8');
                    	let responseBody = '';
                    	res_audio_query.on('data', (chunk) => {
                        	responseBody += chunk;
                    	});
                    	res_audio_query.on("end", () => {
                        	const Audio_Query_Response = responseBody;
                        	//console.log(Audio_Query_Response)
                        	//console.log("Query_Ready");

                        	// Step2
                        	const options_synthesis = {
                            	method: "POST",
                            	headers: {
                                	"accept": "audio/wav",
                                	"Content-Type": "application/json",
                            	},
                        	};
	                        url_synthesis = VOICEVOX_API_URL + `/synthesis?speaker=${VOICEVOX_Speaker_Id}&enable_interrogative_upspeak=true`;
    	                    const request_synthesis = http.request(url_synthesis, options_synthesis, (res_synthesis) => {
        	                    res_synthesis.pipe(fs.createWriteStream("../output.wav"));

            	                res_synthesis.on("end", () => {
                	                // ボイスチャットでの再生処理
                    	            const resource = createAudioResource('../output.wav');

                        	        player = createAudioPlayer({
                            	        behaviors: {
                                	        noSubscriber: NoSubscriberBehavior.Pause,
                                    	},
                                	});
	                                // 再生開始
    	                            player.play(resource);
        	                        subscriber = voicechannel_connection.subscribe(player);
            	                    player.on(AudioPlayerStatus.Idle, () => {
                	                    // 再生が終わったので解除
                    	                subscriber.unsubscribe();
                        	        });

                            	    //console.log(`PlayerStatus: ${player.state.status}`);
                                	//console.log(`Connection_Status: ${voicechannel_connection.state.status}`);

                                	//console.log("Play Audio");
                            	});
                        	});
    	                    request_synthesis.write(Audio_Query_Response);
        	                request_synthesis.end();
            	        });
                	});
	                request_audio_query.end();
    	        } catch (error) {
        	        console.log(error);
            	}
			} else {
				const voicechannel_connection = getVoiceConnection(guildId);
            	if (voicechannel_connection === undefined) return;

				// ボイスチャットでの再生処理
                const resource = createAudioResource('../test.wav');

                player = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Pause,
                    },
                });

	            // 再生開始
    	        player.play(resource);
        	    subscriber = voicechannel_connection.subscribe(player);
            	player.on(AudioPlayerStatus.Idle, () => {
                	// 再生が終わったので解除
                    subscriber.unsubscribe();
            	});
			}
		} else {
			await interaction.reply({content: `[ERROR] コマンドの構文が間違っている可能性があります。\n正しい構文で再度実行してください。`, flags: MessageFlags.Ephemeral});
		}
	},
};
