const http = require('http');
const fs = require('fs');

const { Events } = require('discord.js');
const { getVoiceConnection, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

const { guildId, Reading_Channel, If_Reding, Reading_Role_Id, VOICEVOX_API_URL, VOICEVOX_Speaker_Id } = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(interaction) {
        if (!If_Reding) return;// If_Reading True?
        if (interaction.guild.id !== guildId) return;// Receive guild is guildId?
        if (interaction.channelId !== Reading_Channel) return;// Receive channel is Reading_Channel?
        const member = interaction.member;
        if (member.roles.cache.some(role => role.id === Reading_Role_Id)) {
            // 対象者

            let text = '';
            if (interaction.content === '' && interaction.attachments.size > 0) {
                // テキストメッセージではない場合
                text = `${member.displayName}さんが画像を送信しました。`;
            } else {
                // 読み上げテキストを作成
                text = `${member.displayName}さんのメッセージ、${interaction.content.replace(/r?n/g, '、')}`;// 特に制限などは設けていない。必要そうであれば処理をここの上に追加。
            }

            // テキストメッセージ(であると考えられる)
            // ボイスチャンネルに接続されているか確認
            const voicechannel_connection = getVoiceConnection(guildId);
            if (voicechannel_connection === undefined) return;
            //console.log(`Receive Message: User=${member.displayName},Content=${interaction.content}`)// For Debug

            // VOICEVOXにて音声を合成
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
            // 非対象者(一個ずつ確認するらしく、何回か呼ばれていると思われる)
            return;
        }
    },
};
