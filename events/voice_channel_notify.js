const { Events, EmbedBuilder } = require('discord.js');

const { guildId, NOTIFY_CHANNEL } = require('../config.json');

module.exports = {
	name: Events.VoiceStateUpdate,
	execute(oldState, newState) {
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
            return channel.send(
                //`:inbox_tray: <@${oldState.member.user.id}> さんが入室しました。`
                { embeds: [MessageEmbed]}
            );
        } else if (oldState.channelId !== null && newState.channelId === null) {
            const MessageEmbed = new EmbedBuilder()
                .setDescription(`${oldState.member.user} さんが退室しました。`)
                .setAuthor({ name: `${oldState.member.user.username}`, iconURL: `${oldState.member.user.avatarURL()}` })
                .setTimestamp()
                .setColor('Red')
            return channel.send(
                //`:outbox_tray: <@${newState.member.user.id}> さんが退出しました。`
                { embeds: [MessageEmbed]}
            );
        }
	},
};
