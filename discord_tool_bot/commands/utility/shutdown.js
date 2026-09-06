const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');

const { ownerId, guildId } = process.env;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shutdown')
		.setDescription('This bot shutdown.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ADMINISTRATOR),
	async execute(interaction, { services }) {
        if (interaction.user.id === ownerId) {
            if(services.speechService.check(guildId)) { // ボイスチャットに接続してるか
                services.speechQueue.destroy(guildId); // ボイスチャットから切断
            }
            await interaction.reply({content: '停止します。', flags: MessageFlags.Ephemeral});
            await process.exit();
        } else {
            console.log(`[WARNING] 権限のないユーザ(${interaction.user.name})がこのBOTを停止させようとしました！`);
            await interaction.reply({content: 'あなたには権限がありません。', flags: MessageFlags.Ephemeral});
        }
	},
};
