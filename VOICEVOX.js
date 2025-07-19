const http = require('http');
const fs = require('fs');

const { VOICEVOX_API_URL } = require('./config.json');

function generate(text, speaker_Id) {
    // クエリの作成
    try {
        new Promise((resolve, reject) => {
            const options_audio_query = {
                method: "POST",
                headers: {
                    "accept": "application/json",
                },
            };
            url_audio_query = VOICEVOX_API_URL + `/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker_Id}`;
            const request_audio_query = http.request(url_audio_query, options_audio_query, (res_audio_query) => {
                res_audio_query.setEncoding('utf8');
                let responseBody = '';
                res_audio_query.on('data', (chunk) => {
                    responseBody += chunk;
                });
                res_audio_query.on("end", () => {
                    const Audio_Query_Response = responseBody;

                    // 音声生成を実行
                    const options_synthesis = {
                        method: "POST",
                        headers: {
                            "accept": "audio/wav",
                            "Content-Type": "application/json",
                        },
                    };
                    url_synthesis = VOICEVOX_API_URL + `/synthesis?speaker=${speaker_Id}&enable_interrogative_upspeak=true`;
                    const request_synthesis = http.request(url_synthesis, options_synthesis, (res_synthesis) => {
                        res_synthesis.pipe(fs.createWriteStream("./output.wav"));
                        resolve('OK')
                        return 'OK';
                    });
                    request_synthesis.write(Audio_Query_Response);
                    request_synthesis.end();
                });
            });
            request_audio_query.end();
        })
        .then((resource) => {
            return resource;
        })
        .catch((error) => {
            console.log(error);
            return "Error";
        })
        .catch((error) => {
            console.log(error);
            return "Error";
        });
    } catch (error) {
        console.log(error);
        return "Error";
    }
}

async function voicevox_generate_voice(text, speaker_Id) {
    // 関数を実行
    try {
        new Promise(async (resolve, reject) => {
            const resource = await generate(text, speaker_Id);
            resolve(resource);
        })
        .then((resource) => {
            return resource;
        })
        .catch((error) => {
            console.log(error);
            return "Error";
        });
    } catch (error) {
        console.log(error);
        return "Error";
    }
}

// ほかのファイルで使うため
module.exports = { voicevox_generate_voice };

/*
// もともとの一連のコード
// VOICEVOXにて音声を合成
try {
    // Step1
    const options_audio_query = {
        method: "POST",
        headers: {
            "accept": "application/json",
        },
    };
    url_audio_query = VOICEVOX_API_URL + `/audio_query?text=${encodeURIComponent(text)}&speaker=${VOICEVOX_Speaker_Id}`;
    const request_audio_query = http.request(url_audio_query, options_audio_query, (res_audio_query) => {
        res_audio_query.setEncoding('utf8');
        let responseBody = '';
        res_audio_query.on('data', (chunk) => {
            responseBody += chunk;
        });
        res_audio_query.on("end", () => {
            const Audio_Query_Response = responseBody;
            //console.log(Audio_Query_Response)
            //console.log("Query_Ready");

            // Step2
            const options_synthesis = {
                method: "POST",
                headers: {
                    "accept": "audio/wav",
                    "Content-Type": "application/json",
                },
            };
            url_synthesis = VOICEVOX_API_URL + `/synthesis?speaker=${VOICEVOX_Speaker_Id}&enable_interrogative_upspeak=true`;
            const request_synthesis = http.request(url_synthesis, options_synthesis, (res_synthesis) => {
                res_synthesis.pipe(fs.createWriteStream("../output.wav"));

                res_synthesis.on("end", () => {
                    // ボイスチャットでの再生処理
                    const resource = createAudioResource('../output.wav');

                    player = createAudioPlayer({
                        behaviors: {
                            noSubscriber: NoSubscriberBehavior.Pause,
                        },
                    });
                    // 再生開始
                    player.play(resource);
                    subscriber = voicechannel_connection.subscribe(player);
                    player.on(AudioPlayerStatus.Idle, () => {
                        // 再生が終わったので解除
                        subscriber.unsubscribe();
                    });

                    //console.log(`PlayerStatus: ${player.state.status}`);
                    //console.log(`Connection_Status: ${voicechannel_connection.state.status}`);

                    //console.log("Play Audio");
                });
            });
            request_synthesis.write(Audio_Query_Response);
            request_synthesis.end();
        });
    });
    request_audio_query.end();
} catch (error) {
    console.log(error);
}
*/
