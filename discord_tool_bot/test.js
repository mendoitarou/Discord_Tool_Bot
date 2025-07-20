const { VOICEVOX_Speaker_Id } = require('./config.json');

const voicevox = require('./VOICEVOX.js');

text = "これはテストメッセージです。";

voicevox.voicevox_generate_voice(text, VOICEVOX_Speaker_Id);
