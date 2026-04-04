const crypto = require("crypto");

const { SlashCommandBuilder,  EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dice')
		.setDescription('Roll the dice')
        .addIntegerOption(option =>
            option
                .setName('count')
                .setDescription('Number of shakes (Default: 1, MAX: 100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('sides')
                .setDescription('Maximum number of dice (Default: 6, MAX: 100,000)')
                .setMinValue(1)
                .setMaxValue(100000)
                .setRequired(false)
        ),
	async execute(interaction) {
        const count = interaction.options.getInteger('count') || 1;// Default 1
        const sides = interaction.options.getInteger('sides') || 6;// Default 6
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push( crypto.randomInt(1, sides + 1) );
        }
		const MessageEmbedVersion = new EmbedBuilder()
			.setTitle(`${count}d${sides}ダイスを振る`)
            .setDescription(`結果: ${results}`)
        return await interaction.reply({embeds: [MessageEmbedVersion]});
	},
};
