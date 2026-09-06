const { Events, EmbedBuilder } = require('discord.js');

const { guildId, NOTIFY_CHANNEL, If_Notify_Status_Voice_Channel } = process.env;

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, { client, services }) {
        if (oldState.guild.id !== guildId) return;
        if (oldState.member.user.bot) return;// Bot検知
        const channel = oldState.member.guild.channels.cache.get(
            NOTIFY_CHANNEL
        );

        if (oldState.channelId === null && newState.channelId !== null) {
            if (newState.channel.members.size == 1) {
                // 一人目だった場合
                const MessageEmbedStart = new EmbedBuilder()
                    .setDescription(`${oldState.member.user} さんが通話を開始しました。`)
                    .setAuthor({ name: `${oldState.member.user.username}`, iconURL: `${oldState.member.user.avatarURL()}` })
                    .setTimestamp()
                    .setColor('Green')
                console.log(oldState.member.user);
                return channel.send(
                    { content: "@here", embeds: [MessageEmbedStart] }
                )
            } else {
                // 一人目でないとき
                const MessageEmbed = new EmbedBuilder()
                    .setDescription(`${oldState.member.user} さんが入室しました。`)
                    .setAuthor({ name: `${oldState.member.user.username}`, iconURL: `${oldState.member.user.avatarURL()}` })
                    .setTimestamp()
                    .setColor('Green')
                if (If_Notify_Status_Voice_Channel == true) {// ボイスチャンネルで通知するかどうかをチェック
                    // ボイスチャンネルに接続されているか確認
                    if (services.speechService.check(guildId)) {
                        // 接続状態のみ、音声通知をする。
                        text = `${oldState.member.displayName}さんが入室しました。`

                        // ボイスチャットでの再生処理
                        services.speechQueue.add(guildId, text);
                        services.speechQueue.start(guildId);
                    }
                }
                return channel.send(
                    //`:inbox_tray: <@${oldState.member.user.id}> さんが入室しました。`
                    { embeds: [MessageEmbed] }
                );
            }
        } else if (oldState.channelId !== null && newState.channelId === null) {
            const botMember = oldState.client.guilds.cache.get(guildId).members.cache.get(client.user.id);// BOTの通話参加状態を取得
            if (oldState.channel.members.size == 1) {// 残り人数が1名の時(BOTのみなど)
                if (botMember && botMember.voice.channel && oldState.channelId === botMember.voice.channel.id) {// BOTが通話に参加しているとき
                    // BOTだけしか通話に残っていない場合、自動で切断する。
                    services.speechQueue.destroy(guildId);
                    channel.send(`BOT以外の参加ユーザが全員切断したため、読み上げbotを切断しました。`)
                }
            }
            const MessageEmbed = new EmbedBuilder()
                .setDescription(`${oldState.member.user} さんが退室しました。`)
                .setAuthor({ name: `${oldState.member.user.username}`, iconURL: `${oldState.member.user.avatarURL()}` })
                .setTimestamp()
                .setColor('Red')
            if (If_Notify_Status_Voice_Channel === true) {// ボイスチャンネルで通知するかどうかをチェック
                // ボイスチャンネルに接続されているか確認
                if (services.speechService.check(guildId)) {
                    // 接続状態のみ、音声通知をする。
                    text = `${oldState.member.displayName}さんが退室しました。`

                    // ボイスチャットでの再生処理
                    services.speechQueue.add(guildId, text);
                    services.speechQueue.start(guildId);
                }
            }
            return channel.send(
                //`:outbox_tray: <@${newState.member.user.id}> さんが退出しました。`
                { embeds: [MessageEmbed] }
            );
        }
    },
};
