const { getVoiceConnection } = require('@discordjs/voice');

const voicevox = require('../VOICEVOX.js');
const player = require('../Playing_VoiceChannel.js');

class SpeechService {
    check(guildId) {
        const voicechannel_connection = getVoiceConnection(guildId);
        return (voicechannel_connection !== undefined); // 接続されていない=undefined: false, 接続されている: true
    }

    destroy(guildId) {
        const voicechannel_connection = getVoiceConnection(guildId);
        voicechannel_connection.destroy();
    }

    async speak(guildId, speakerId, item) {
        // 読み上げ準備
        const voicechannel_connection = getVoiceConnection(guildId);// ボイスチャンネルのコネクションを取得
        if (voicechannel_connection === undefined) return;

        // 音声合成
        const resource = await voicevox.voicevox_generate_voice(item, speakerId);
        if (resource === "Error") return; // エラーが置きたらスキップ
        console.log(`start_play(WavID: ${resource})`);
        await player.play_resource(voicechannel_connection, './output_' + resource + '.wav');  // 読み上げ完了まで待機
        console.log('end_play');
    }
}

module.exports = SpeechService;
