const { SlashCommandBuilder, MessageFlags, InteractionContextType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const { ownerId } = process.env;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat_read_manage')
        .setDescription('テキストチャットの読み上げに関する管理用コマンド')
        .addSubcommand(subcommand =>
            subcommand
                .setName('init')
                .setDescription('テキストチャットの読み上げbotの初期設定をする')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('set_voice-channel')
                .setDescription('読み上げ対象のボイスチャンネルを設定します。')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('ボイスチャンネルを選択してください。')
                        .setRequired(true)
                )
        )
       .addSubcommand(subcommand =>
            subcommand
                .setName('set_text-read-channel')
                .setDescription('読み上げ対象のテキストチャンネルを設定します。')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('テキストチャンネルを選択してください。')
                        .setRequired(true)
                )
       )
       .addSubcommand(subcommand =>
            subcommand
                .setName('set_notify-channel')
                .setDescription('ボイスチャンネルの状態変化を通知するテキストチャンネルを設定します。')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('テキストチャンネルを選択してください。')
                        .setRequired(true)
                )
       )
       .addSubcommand(subcommand =>
            subcommand
                .setName('set_text-read-role')
                .setDescription('読み上げ対象にするロールを設定します。')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('ロールを選択してください。')
                        .setRequired(true)
                )
       )
       /*
       .addSubcommand(subcommand =>
            subcommand
                .setName('set_default-voice-id')
                .setDescription('デフォルトで読み上げるボイスの種類を設定します。')
       )
        */
       .addSubcommand(subcommand =>
            subcommand
                .setName('set_is-read')
                .setDescription('テキストチャットの読み上げの有効/無効を設定します。')
                .addBooleanOption(option =>
                    option
                        .setName('status')
                        .setDescription('True/False')
                        .setRequired(true)
                )
       )
       .addSubcommand(subcommand =>
            subcommand
                .setName('set_is-notify')
                .setDescription('ボイスチャンネルの状態変化を通知するかの設定をします。')
                .addBooleanOption(option =>
                    option
                        .setName('status')
                        .setDescription('True/False')
                        .setRequired(true)
                )
       )
       .setContexts(InteractionContextType.Guild)
       .setDefaultMemberPermissions(PermissionFlagsBits.ADMINISTRATOR),
    async execute(interaction, { services }) {
        // 実装中
        //await interaction.reply({ content: `[ERROR] コマンドの構文が間違っている可能性があります。\n正しい構文で再度実行してください。`, flags: MessageFlags.Ephemeral });
        
        const guildId = interaction.guild.id;
        if (interaction.user.id !== ownerId) return; // オーナー以外は変えられないようにしておく

        // 実装
        if (interaction.options.getSubcommand() === 'init') {
            // 対話型な初期セットアップ
            await interaction.reply({ content: `未実装`, flags: MessageFlags.Ephemeral });
        } else if(interaction.options.getSubcommand() === 'set_voice-channel') {
            // ボイスチャンネルの設定
            const voiceChannel = interaction.options.getChannel('channel');
            const settingResult = services.settingService.set(guildId, 'Voice_Channel_Id', `${voiceChannel.id}`);
            if( settingResult == "ERROR" ) {
                // エラー出た
                console.error('Error');
                await interaction.reply({ content: `エラーが発生しました。`, flags: MessageFlags.Ephemeral });
            }
            const setting_result = new EmbedBuilder()
                .setDescription('設定を変更しました。')
                .setFields({
                    "name": "接続先ボイスチャンネル",
                    "value": `<#${voiceChannel.id}>`
                })
                .setTimestamp()
                .setColor('Green');
            await interaction.reply({ embeds: [setting_result], flags: MessageFlags.Ephemeral });
        } else if(interaction.options.getSubcommand() === 'set_text-read-channel') {
            // 読み上げ対象テキストチャンネルの設定
            const textReadChannel = interaction.options.getChannel('channel');
            const settingResult = services.settingService.set(guildId, 'Reading_Channel', `${textReadChannel.id}`);
            if( settingResult == "ERROR" ) {
                // エラー出た
                console.error('Error');
                await interaction.reply({ content: `エラーが発生しました。`, flags: MessageFlags.Ephemeral });
            }
            const setting_result = new EmbedBuilder()
                .setDescription('設定を変更しました。')
                .setFields({
                    "name": "読み上げテキストチャンネル",
                    "value": `<#${textReadChannel.id}>`
                })
                .setTimestamp()
                .setColor('Green');
            await interaction.reply({ embeds: [setting_result], flags: MessageFlags.Ephemeral });
        } else if(interaction.options.getSubcommand() === 'set_notify-channel') {
            // 通知対象テキストチャンネルの設定
            const notifyChannel = interaction.options.getChannel('channel');
            const settingResult = services.settingService.set(guildId, 'NOTIFY_CHANNEL', `${notifyChannel.id}`);
            if( settingResult == "ERROR" ) {
                // エラー出た
                console.error('Error');
                await interaction.reply({ content: `エラーが発生しました。`, flags: MessageFlags.Ephemeral });
            }
            const setting_result = new EmbedBuilder()
                .setDescription('設定を変更しました。')
                .setFields({
                    "name": "通知テキストチャンネル",
                    "value": `<#${notifyChannel.id}>`
                })
                .setTimestamp()
                .setColor('Green');
            await interaction.reply({ embeds: [setting_result], flags: MessageFlags.Ephemeral });
        } else if(interaction.options.getSubcommand() === 'set_text-read-role') {
            // 読み上げ対象ロールの設定
            const textReadRole = interaction.options.getRole('role');
            const settingResult = services.settingService.set(guildId, 'Reading_Role_Id', `${textReadRole.id}`);
            if( settingResult == "ERROR" ) {
                // エラー出た
                console.error('Error');
                await interaction.reply({ content: `エラーが発生しました。`, flags: MessageFlags.Ephemeral });
            }
            const setting_result = new EmbedBuilder()
                .setDescription('設定を変更しました。')
                .setFields({
                    "name": "読み上げ対象ロール",
                    "value": `<@&${textReadRole.id}>`
                })
                .setTimestamp()
                .setColor('Green');
            await interaction.reply({ embeds: [setting_result], flags: MessageFlags.Ephemeral });
        }/* else if(interaction.options.getSubcommand() === 'set_default-voice-id') {
            // デフォルトの読み上げボイスを設定
            //ここにVOICEVOXからAPIでボイスリストを取得して、リストにして返す処理
            await interaction.reply({ content: `未実装`, flags: MessageFlags.Ephemeral })
        }*/ else if(interaction.options.getSubcommand() === 'set_is-read') {
            // そもそも読み上げるかの設定
            const isRead = interaction.options.getBoolean('status');
            const settingResult = services.settingService.set(guildId, 'If_Reding', isRead);
            if( settingResult == "ERROR" ) {
                // エラー出た
                console.error('Error');
                await interaction.reply({ content: `エラーが発生しました。`, flags: MessageFlags.Ephemeral });
            }
            const status = isRead ? "有効" : "無効";
            const setting_result = new EmbedBuilder()
                .setDescription('設定を変更しました。')
                .setFields({
                    "name": "読み上げステータス",
                    "value": `${status}`
                })
                .setTimestamp()
                .setColor('Green');
            await interaction.reply({ embeds: [setting_result], flags: MessageFlags.Ephemeral });
        } else if(interaction.options.getSubcommand() === 'set_is-notify') {
            // ボイスチャンネルの状態変化を通知するかの設定
            const isNotify = interaction.options.getBoolean('status');
            const settingResult = services.settingService.set(guildId, 'If_Notify_Status_Voice_Channel', isNotify);
            if( settingResult == "ERROR" ) {
                // エラー出た
                console.error('Error');
                await interaction.reply({ content: `エラーが発生しました。`, flags: MessageFlags.Ephemeral });
            }
            const status = isNotify ? "有効" : "無効";
            const setting_result = new EmbedBuilder()
                .setDescription('設定を変更しました。')
                .setFields({
                    "name": "ボイスチャンネル接続通知",
                    "value": `${status}`
                })
                .setTimestamp()
                .setColor('Green');
            await interaction.reply({ embeds: [setting_result], flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: `[ERROR] コマンドの構文が間違っている可能性があります。\n正しい構文で再度実行してください。`, flags: MessageFlags.Ephemeral });
        }
    },
};
