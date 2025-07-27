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
                let regex_UserId = /<@[0-9]{17,18}>/g;// ユーザIdの正規表現
                const message = `${interaction.content}`;// 受信したメッセージをいったん格納
                if(regex_UserId.test(message)) {
                    // メンションしてたら、ユーザIDをユーザ名に置き換え
                    let get_UserId = message.match(regex_UserId)[0].replace("<@", "").replace(">", "");// ユーザIDを抜き出し
                    let get_member = await interaction.guild.members.fetch(`${get_UserId}`);// ユーザIDからサーバ内のmemberを取得
                    let receive_Message = message.replace(regex_UserId, `、${get_member.displayName}`);// ユーザIDの箇所を表示名に置き換え
                    text = `${member.displayName}さんのメッセージ、${receive_Message.replace(/r?n/g, '、')}`;// 最終的なメッセージを指定
                } else {
                    // メンションしてないならそのまま
                    text = `${member.displayName}さんのメッセージ、${message.replace(/r?n/g, '、')}`;// 特に制限などは設けていない。必要そうであれば処理をここの上に追加。
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
