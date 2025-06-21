const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');

const { ownerId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shutdown')
		.setDescription('This bot shutdown.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ADMINISTRATOR),
	async execute(interaction) {
        if (interaction.user.id === ownerId) {
            await interaction.reply({content: '停止します。', flags: MessageFlags.Ephemeral});
            await process.exit();
        } else {
            console.log(`[WARNING] 権限のないユーザ(${interaction.user.name})がこのBOTを停止させようとしました！`);
            await interaction.reply({content: 'あなたには権限がありません。', flags: MessageFlags.Ephemeral});
        }
	},
};
