const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const { version } = require('../../version.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('version')
		.setDescription('Show this bot version.'),
	async execute(interaction) {
        return await interaction.reply({content: `バージョン: ${version}`, flags: MessageFlags.Ephemeral});
	},
};
