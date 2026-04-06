const http = require('http');
const fs = require('fs');

const { Events } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

const { guildId, Reading_Channel, If_Reding, Reading_Role_Id, VOICEVOX_Speaker_Id } = require('../config.json');

const voicevox = require('../VOICEVOX.js');
const player = require('../Playing_VoiceChannel.js');

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
                let regex_UserId = /<@[0-9]{17,19}>/g;// ユーザIdの正規表現
                let regex_RoleId = /<@&[0-9]{19}>/g;// ロールIdの正規表現
                let regex_emoji = /(?:^|[^<]):([^:\s]+):|<:([^:\s]+):(\d+)>/g;// 絵文字の正規表現
                let regex_URL = /https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?/g;// URL検出用の正規表現
                const message = `${interaction.content}`;// 受信したメッセージをいったん格納

                function checkURL(receiveMessage) { return (receiveMessage.match(regex_URL) !== null) }
                function checkUserId(receiveMessage) { return (receiveMessage.match(regex_UserId) !== null ) }
                async function replaceUserId(receiveMessage) {
                    // ユーザID置き換え
                    if(checkUserId(receiveMessage)) {
                        await receiveMessage.match(regex_UserId).forEach(async get_UserId => {// forEachは非同期処理？みたいなのでawaitする
                            // メンション箇所ごとに実行
                            let User_Id = get_UserId.replace("<@", "").replace(">", "");// ユーザIDのみに加工
                            let get_member = await interaction.guild.members.fetch(`${User_Id}`);// ユーザIDからサーバ内のmemberを取得
                            receiveMessage = receiveMessage.replace(`${get_UserId}`, `、${get_member.displayName}`);// ユーザIDの箇所を表示名に置き換え
                        });
                        return receiveMessage;
                    } else {
                        return receiveMessage;// 検知しなかったらそのまま返す
                    }
                }

                function checkRoleId(receiveMessage) { return (receiveMessage.match(regex_RoleId) !== null ) }
                async function replaceRoleId(receiveMessage) {
                    // ロールID置き換え
                    if(checkRoleId(receiveMessage)) {
                        // ロール検知
                        await receiveMessage.match(regex_RoleId).forEach(async get_RoleId => {// forEachは非同期処理？みたいなのでawaitする
                            let Role_Id = get_RoleId.replace("<@&", "").replace(">", "");// ロールIDのみに加工
                            let get_role = await interaction.guild.roles.fetch(`${Role_Id}`);// ロールIDからサーバ内のrolesを取得
                            receiveMessage = receiveMessage.replace(`${get_RoleId}`, `${get_role.name}`);// ロールIDの箇所をロール名に置き換え
                        });
                        return receiveMessage;
                    } else {
                        return receiveMessage;// 検知しなかったらそのまま返す
                    }
                }

                function checkUserEmoji(receiveMessage) { return (receiveMessage.match(regex_emoji) !== null ) }
                function replaceUserEmoji(receiveMessage) {
                    // 絵文字置き換え
                    if(checkUserEmoji(receiveMessage)) {
                        // 絵文字検知
                        if(receiveMessage.match(regex_emoji) !== null) {
                            return receiveMessage.replace(regex_emoji, '絵文字');// 置き換えたものを返す
                        }
                    } else {
                        return receiveMessage;// 検知しなかったらそのまま返す
                    }
                }
                
                // URLが含まれているかチェック
                if(checkURL(message)) {
                    text = `${member.displayName}さんがURLを送信しました。`;
                } else {
                    // 普通にメッセージだったら
                    let receive_Message = message;
                    if(checkUserId(receive_Message)) {
                        receive_Message = await replaceUserId(receive_Message);// ユーザIDチェック
                    }
                    if(checkRoleId(receive_Message)) {
                        receive_Message = await replaceRoleId(receive_Message);// ロールIDチェック
                    }
                    if(checkUserEmoji(receive_Message)) {
                        receive_Message = replaceUserEmoji(receive_Message);// ユーザー絵文字チェック
                    }
                    text = `${member.displayName}さんのメッセージ、${receive_Message.replace(/r?n/g, '、')}`;// 最終的なメッセージを指定
                }
                console.log(`Text: ${text}`);
            }

            // テキストメッセージ(であると考えられる)
            // ボイスチャンネルに接続されているか確認
            const voicechannel_connection = getVoiceConnection(guildId);
            if (voicechannel_connection === undefined) return;
            //console.log(`Receive Message: User=${member.displayName},Content=${interaction.content}`)// For Debug

            // VOICEVOXにて音声を合成
            //console.log("Execute_Read");
            const resource = await voicevox.voicevox_generate_voice(text, VOICEVOX_Speaker_Id);
            if(resource === "Error") return;
            // ボイスチャットでの再生処理
            player.play_resource(voicechannel_connection);
        } else {
            // 非対象者(一個ずつ確認するらしく、何回か呼ばれていると思われる)
            return;
        }
    },
};
