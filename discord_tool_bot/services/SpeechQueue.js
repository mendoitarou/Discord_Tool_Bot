const { VOICEVOX_Speaker_Id } = process.env;

class SpeechQueue {
    constructor(speechService) {
        this.speechService = speechService;
        this.queues = new Map();
    }

    add(guildId, item) {
        // Mapにサーバの情報があるかチェック
        if (!this.queues.has(guildId)) {
            // 持ってない
            this.queues.set(guildId, {
                queue: [],
                running: false,
            });
        }
        const queues = this.queues.get(guildId);
        queues.queue.push(item);
    }

    clear(guildId) {
        const queues = this.queues.get(guildId);
        if(!queues) return; // 無い場合は終了
        queues.queue.length = 0;// リストを削除
    }

    stop(guildId) {
        const queues = this.queues.get(guildId);
        if(!queues) return; // 無い場合は終了
        queues.running = false;
    }

    destroy(guildId) {
        if(!this.queues.get(guildId)) return; // 無い場合は終了
        this.clear(guildId); // リストクリア
        this.stop(guildId); // 実行状況をリセット
        this.queues.delete(guildId); // Mapから削除
        this.speechService.destroy(guildId); // ボイスチャットから切断
    }

    async start(guildId) {
        const queues = this.queues.get(guildId);
        if (!queues || queues.running) return;// 無い場合やrunningがtrueの場合は終了

        queues.running = true;

        while (queues.running && queues.queue.length > 0) {// runningがtrueでかつqueue_listの長さが0より大きい場合
            const item = queues.queue.shift();
            const speakerId = VOICEVOX_Speaker_Id; // 将来的にサーバごとにコマンドで設定できるようにしたい。

            try {
                await this.speechService.speak(guildId, speakerId, item);
            } catch (err) {
                console.error(err);
            }
        }

        queues.running = false;
    }
}

module.exports = SpeechQueue;
