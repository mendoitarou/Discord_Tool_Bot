const { NoSubscriberBehavior, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

function play_resource(voicechannel_connection, source='./output.wav') {
    const resource = createAudioResource(source);

    // ボイスチャットでの再生処理
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
        return;
    });
}

// ほかのファイルで使うため
module.exports = { play_resource };

/*
もともとの処理

// ボイスチャットでの再生処理
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

*/
