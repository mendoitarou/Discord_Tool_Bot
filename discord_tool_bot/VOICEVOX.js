const http = require('http');
const https = require('https');
const fs = require('fs');
const crypto = require("crypto");

const { VOICEVOX_API_URL, VOICEVOX_isAuth, VOICEVOX_API_TOKEN } = process.env;

function generate(text, speaker_Id, wavId) {
    // クエリの作成
    return new Promise((resolve, reject) => {
        try {
            const options_audio_query = {
                method: "POST",
                headers: {
                    "accept": "application/json",
                },
            };
            if (VOICEVOX_isAuth) {
                options_audio_query.headers.Authorization = `Bearer ${VOICEVOX_API_TOKEN}`;
            }
            url_audio_query = VOICEVOX_API_URL + `/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker_Id}`;
            const client = VOICEVOX_API_URL.startsWith('https://') ? https : http;// URLがHTTPかHTTPSか判別(使うモジュールを分ける)
            const request_audio_query = client.request(url_audio_query, options_audio_query, (res_audio_query) => {
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
                    if (VOICEVOX_isAuth) {
                        options_synthesis.headers.Authorization = `Bearer ${VOICEVOX_API_TOKEN}`;
                    }
                    url_synthesis = VOICEVOX_API_URL + `/synthesis?speaker=${speaker_Id}&enable_interrogative_upspeak=true`;
                    const request_synthesis = client.request(url_synthesis, options_synthesis, (res_synthesis) => {
                        if(res_synthesis.statusCode == 429) {
                            // Many Request(無償枠超えなど)
                            console.log('API Reject 429 Too Many Request.');
                            reject("Error");
                        } else {res_synthesis.statusCode != 200} {
                            // その他の正常でないステータスコード
                            console.log('API Reject Not 200');
                            reject("Error");
                        }
                        const fs_write = fs.createWriteStream(`./output_${wavId}.wav`);
                        res_synthesis.pipe(fs_write);
                        //console.log("[VOICEVOX.js]Done_Generate");
                        //resolve('OK');
                        fs_write.on('finish', () => {
                            resolve(wavId);
                        });

                        fs_write.on('error', (err) => {
                            console.log(err);
                            reject("Error");
                        });
                    });

                    request_synthesis.write(Audio_Query_Response);
                    request_synthesis.end();
                });
            });
            request_audio_query.end();
        } catch (error) {
            console.log(error);
            reject("Error");
        }
    })
}

async function voicevox_generate_voice(text, speaker_Id) {
    // 関数を実行
    return new Promise(async (resolve, reject) => {
        try {
            const uuid = crypto.randomUUID();
            await generate(text, speaker_Id, uuid);
            //console.log("[VOICEVOX.js]Done_generate-function");
            resolve(uuid);
        } catch (error) {
            console.log(error);
            reject("Error");
        }
    })
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
