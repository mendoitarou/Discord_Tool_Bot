const { Events, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

const { guildId, NOTIFY_CHANNEL, If_Notify_Status_Voice_Channel, VOICEVOX_Speaker_Id } = require('../config.json');

const voicevox = require('../VOICEVOX.js');
const player = require('../Playing_VoiceChannel.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        if (oldState.guild.id !== guildId) return;
        if (oldState.member.user.bot) return;// Bot検知
        const channel = oldState.member.guild.channels.cache.get(
            NOTIFY_CHANNEL
        );

        if (oldState.channelId === null && newState.channelId !== null) {
            const MessageEmbed = new EmbedBuilder()
                .setDescription(`${oldState.member.user} さんが入室しました。`)
                .setAuthor({ name: `${oldState.member.user.username}`, iconURL: `${oldState.member.user.avatarURL()}` })
                .setTimestamp()
                .setColor('Green')
            if (If_Notify_Status_Voice_Channel == true) {// ボイスチャンネルで通知するかどうかをチェック
                // ボイスチャンネルに接続されているか確認
                const voicechannel_connection = getVoiceConnection(guildId);
                if (voicechannel_connection !== undefined) {
                    // 接続状態のみ、音声通知をする。
                    text = `${oldState.member.displayName}さんが入室しました。`

                    // VOICEVOXにて音声を合成
                    const resource = await voicevox.voicevox_generate_voice(text, VOICEVOX_Speaker_Id);
                    if (resource === "Error") return;
                    // ボイスチャットでの再生処理
                    player.play_resource(voicechannel_connection);
                }
            }
            return channel.send(
                //`:inbox_tray: <@${oldState.member.user.id}> さんが入室しました。`
                { embeds: [MessageEmbed] }
            );
        } else if (oldState.channelId !== null && newState.channelId === null) {
            const MessageEmbed = new EmbedBuilder()
                .setDescription(`${oldState.member.user} さんが退室しました。`)
                .setAuthor({ name: `${oldState.member.user.username}`, iconURL: `${oldState.member.user.avatarURL()}` })
                .setTimestamp()
                .setColor('Red')
            if (If_Notify_Status_Voice_Channel === true) {// ボイスチャンネルで通知するかどうかをチェック
                // ボイスチャンネルに接続されているか確認
                const voicechannel_connection = getVoiceConnection(guildId);
                if (voicechannel_connection !== undefined) {
                    // 接続状態のみ、音声通知をする。
                    text = `${oldState.member.displayName}さんが退室しました。`

                    // VOICEVOXにて音声を合成
                    const resource = await voicevox.voicevox_generate_voice(text, VOICEVOX_Speaker_Id);
                    if (resource === "Error") return;
                    // ボイスチャットでの再生処理
                    player.play_resource(voicechannel_connection);
                }
            }
            return channel.send(
                //`:outbox_tray: <@${newState.member.user.id}> さんが退出しました。`
                { embeds: [MessageEmbed] }
            );
        }
    },
};
