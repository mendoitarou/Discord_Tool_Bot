const { SlashCommandBuilder, MessageFlags,  EmbedBuilder } = require('discord.js');

const { version } = require('../../version.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('version')
		.setDescription('Show this bot version.'),
	async execute(interaction) {
		const MessageEmbedVersion = new EmbedBuilder()
			.setTitle(`Version: ${version}`)
            .setDescription(`作成: mendoitarou_\nこのBOTのソースコードはGitHubで公開されています。\nhttps://github.com/mendoitarou/Discord_Tool_Bot`)
            .setColor('#00AE95')
        return await interaction.reply({embeds: [MessageEmbedVersion], flags: MessageFlags.Ephemeral});
	},
};
