const { Events, MessageFlags } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: '[ERROR] コマンドの実行中にエラーが発生しました。\n管理人に連絡してください。', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: '[ERROR] コマンドの実行中にエラーが発生しました。\n管理人に連絡してください。', flags: MessageFlags.Ephemeral });
			}
		}
	},
};
