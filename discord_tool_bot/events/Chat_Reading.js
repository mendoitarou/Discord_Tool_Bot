const http = require('http');
const fs = require('fs');

const { Events } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

const { guildId, Reading_Channel, If_Reding, Reading_Role_Id, VOICEVOX_Speaker_Id, MAX_TEXT_LENGTH, Language } = process.env;

const voicevox = require('../VOICEVOX.js');
const player = require('../Playing_VoiceChannel.js');

// Text Length
function countGrapheme(string) {
  const segmenter = new Intl.Segmenter(`${Language}`, { granularity: "grapheme" });
  return [...segmenter.segment(string)].length;
}

function replaceText(text, max_length) {
    const segmenter = new Intl.Segmenter(`${Language}`, { granularity: "grapheme" });
    const segment_text = [...segmenter.segment(text)];
    return segment_text.slice(0, max_length).join('');// 結合
}

// Queue
const queues = new Map();
const playingState = new Map();

function enqueue(guildid, text) {
    const queue_list = queues.get(guildid);
    queue_list.push(text);
    playNext(guildid);
}

async function playNext(guildid) {
    // チェック
    let isPlaying = playingState.get(guildid);
    if (isPlaying) return;
    let queue_list = queues.get(guildid);
    if (queue_list.length === 0) return;

    isPlaying = true; // 再生中のフラグを立てる
    playingState.set(guildid, isPlaying); // Mapの方に適用する
    
    // 読み上げ準備
    const voicechannel_connection = getVoiceConnection(guildId);// ボイスチャンネルのコネクションを取得
    if (voicechannel_connection === undefined) return;
    
    while (queue_list.length > 0) { // キュー消化
        const text = queue_list.shift();
        // 音声合成
        const resource = await voicevox.voicevox_generate_voice(text, VOICEVOX_Speaker_Id);
        if (resource === "Error") continue; // エラーが置きたらスキップ
        console.log('start_play');
        await player.play_resource(voicechannel_connection, './output_'+resource+'.wav');  // 読み上げ完了まで待機
        console.log('end_play');
    }

    isPlaying = false;
    playingState.set(guildid, isPlaying); // Mapの方に適用する
}

module.exports = {
    name: Events.MessageCreate,
    async execute(interaction) {
        if (!If_Reding) return;// If_Reading True?
        if (interaction.guild.id !== guildId) return;// Receive guild is guildId?
        if (interaction.channelId !== Reading_Channel) return;// Receive channel is Reading_Channel?
        const member = interaction.member;
        if (member.roles.cache.some(role => role.id === Reading_Role_Id)) {
            // 対象者

            let text = '';
            if (interaction.content === '' && interaction.attachments.size > 0) {
                // テキストメッセージではない場合
                text = `${member.displayName}さんが画像を送信しました。`;
            } else {
                // 読み上げテキストを作成
                let regex_UserId = /<@[0-9]{17,19}>/g;// ユーザIdの正規表現
                let regex_RoleId = /<@&[0-9]{19}>/g;// ロールIdの正規表現
                let regex_emoji = /(?:^|[^<]):([^:\s]+):|<:([^:\s]+):(\d+)>/g;// 絵文字の正規表現
                let regex_mark_only = /^[!！?？]+$/g;// 感嘆符/疑問符のみのメッセージかどうかの正規表現
                let regex_question_mark = /[?？]+/g;// 疑問符単体(任意文字数)のメッセージかの正規表現
                let regex_bikkuri_mark = /[!！]+/g;// 感嘆符単体(任意文字数)のメッセージかの正規表現
                let regex_notreadflag = /^#NotReadTextBody/;// 読み上げしないフラグ(#NotReadTextBody)が先頭についているかの正規表現
                let regex_ignoreflag = /^#ignoreMessage/;// 無視するフラグ(#ignoreMessage)が先頭についているかの正規表現
                let regex_URL = /https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?/g;// URL検出用の正規表現
                const message = `${interaction.content}`;// 受信したメッセージをいったん格納

                function checkURL(receiveMessage) { return (receiveMessage.match(regex_URL) !== null) }
                function checkNotReadFlag(receive_Message) { return (receive_Message.match(regex_notreadflag) !== null) }
                function checkIgnoreFlag(receive_Message) { return (receive_Message.match(regex_ignoreflag) !== null) }
                function checkUserId(receiveMessage) { return (receiveMessage.match(regex_UserId) !== null ) }
                async function replaceUserId(receiveMessage) {
                    // ユーザID置き換え
                    if(checkUserId(receiveMessage)) {
                        await receiveMessage.match(regex_UserId).forEach(async get_UserId => {// forEachは非同期処理？みたいなのでawaitする
                            // メンション箇所ごとに実行
                            let User_Id = get_UserId.replace("<@", "").replace(">", "");// ユーザIDのみに加工
                            let get_member = await interaction.guild.members.fetch(`${User_Id}`);// ユーザIDからサーバ内のmemberを取得
                            receiveMessage = receiveMessage.replace(`${get_UserId}`, `、${get_member.displayName}`);// ユーザIDの箇所を表示名に置き換え
                        });
                        return receiveMessage;
                    } else {
                        return receiveMessage;// 検知しなかったらそのまま返す
                    }
                }

                function checkRoleId(receiveMessage) { return (receiveMessage.match(regex_RoleId) !== null ) }
                async function replaceRoleId(receiveMessage) {
                    // ロールID置き換え
                    if(checkRoleId(receiveMessage)) {
                        // ロール検知
                        await receiveMessage.match(regex_RoleId).forEach(async get_RoleId => {// forEachは非同期処理？みたいなのでawaitする
                            let Role_Id = get_RoleId.replace("<@&", "").replace(">", "");// ロールIDのみに加工
                            let get_role = await interaction.guild.roles.fetch(`${Role_Id}`);// ロールIDからサーバ内のrolesを取得
                            receiveMessage = receiveMessage.replace(`${get_RoleId}`, `${get_role.name}`);// ロールIDの箇所をロール名に置き換え
                        });
                        return receiveMessage;
                    } else {
                        return receiveMessage;// 検知しなかったらそのまま返す
                    }
                }

                function checkUserEmoji(receiveMessage) { return (receiveMessage.match(regex_emoji) !== null ) }
                function replaceUserEmoji(receiveMessage) {
                    // 絵文字置き換え
                    if(checkUserEmoji(receiveMessage)) {
                        // 絵文字検知
                        if(receiveMessage.match(regex_emoji) !== null) {
                            return receiveMessage.replace(regex_emoji, '絵文字');// 置き換えたものを返す
                        }
                    } else {
                        return receiveMessage;// 検知しなかったらそのまま返す
                    }
                }

                function checkMarkOnly(receive_Message) { return (receive_Message.match(regex_mark_only) !== null) }
                function replaceBikkuri_QuestionMark(receive_Message) {
                    // 感嘆符/疑問符置き換え
                    if(checkMarkOnly(receive_Message)) {
                        // 感嘆符/疑問符のみで構成されている
                        const hasBikkuri = regex_bikkuri_mark.test(receive_Message);
                        const hasQestion = regex_question_mark.test(receive_Message);
                        if(hasBikkuri && hasQestion) {
                            return "(感嘆符)(疑問符)";// 感嘆符と疑問符が含まれているので、置き換えて返す
                        } else if(hasBikkuri) {
                            return "(感嘆符)";// 感嘆符だけが含まれているので、置き換えて返す
                        } else if(hasQestion) {
                            return "(疑問符)";// 疑問符だけが含まれているので、置き換えて返す
                        }
                    } else {
                        return receive_Message;// 検知しなかったらそのまま返す
                    }
                }

                // 正規表現でチェック
                if(checkIgnoreFlag(message)) return;// 無視するフラグがついてたら
                if(checkURL(message)) {// URLが含まれているかチェック
                    text = `${member.displayName}さんがURLを送信しました。`;
                } else if (checkNotReadFlag(message)) {// 読み上げしないフラグがついてるかチェック
                    text = `${member.displayName}さんがテキストメッセージを送信しました。`;
                } else {
                    // 普通にメッセージだったら
                    let receive_Message = message;
                    receive_Message = receive_Message.replace(/\r?\n/g, '、');// 改行コードを「、」に変換
                    if(checkUserId(receive_Message)) {// ユーザIDチェック
                        receive_Message = await replaceUserId(receive_Message);
                    }
                    if(checkRoleId(receive_Message)) {// ロールIDチェック
                        receive_Message = await replaceRoleId(receive_Message);
                    }
                    if(checkUserEmoji(receive_Message)) {// ユーザー絵文字チェック
                        receive_Message = replaceUserEmoji(receive_Message);
                    }
                    // 感嘆符/疑問符チェック
                    if(checkMarkOnly(receive_Message)) {// 感嘆符/疑問符のみで構成されている
                        receive_Message = replaceBikkuri_QuestionMark(receive_Message);
                    }
                    // 文字数チェック
                    if(countGrapheme > MAX_TEXT_LENGTH) {
                        receive_Message = replaceText(receive_Message, MAX_TEXT_LENGTH) + '以下略';// 文字列を変換
                    }
                    text = `${member.displayName}さんのメッセージ、${receive_Message}`;// 最終的なメッセージを指定
                }
                console.log(`Text: ${text}`);
            }

            // Mapにサーバの情報があるかチェック
            if ( !queues.has(guildId) ) {
                // 持ってない
                queues.set(guildId, []); // 配列セット
            }
            if ( !playingState.has(guildId) ) {
                // 持ってない
                playingState.set(guildId, false); // booleanセット
            }

            // ボイスチャットでの再生処理
            enqueue(guildId, text);
        } else {
            // 非対象者(一個ずつ確認するらしく、何回か呼ばれていると思われる)
            return;
        }
    },
};
