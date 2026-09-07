const fs = require('fs');
const path = require('path');

const settingFilePath = path.join(__dirname, '../settings.json'); // これは固定

class SettingService {
    constructor() {
        this.settings = new Map();
    }

    // Mapにいれるやつ
    _getSettings(guildId) {
        if (!this.settings.has(guildId)) {
            // ファイルから読み込み
            const settingFile = fs.readFileSync(settingFilePath, 'utf8');
            const settingJSON = JSON.parse(settingFile);
            let settings; // 一時格納用
            if (Object.hasOwn(settingJSON.settings, guildId)) { // サーバの設定があるか
                settings = settingJSON.settings[guildId]; // あったから格納
            } else {
                settings = { ...settingJSON.settings.template }; // ないからテンプレートをコピー
            }
            this.settings.set(guildId, settings); // Mapにセット
        }
        return this.settings.get(guildId); // 返しておく
    }

    getAll(guildId) {
        // All Setting Get
        return { ...this._getSettings(guildId) }; // 全部が返されるのでそれをコピーして返す
    }

    get(guildId, key) {
        // Setting Get
        const settings = this._getSettings(guildId); // 全部を取得
        if (!Object.hasOwn(settings, key)) { // そのキーが存在するか
            return 'ERROR'; // しないのでエラーを返す
        }
        return settings[key]; // したので値を返す
    }

    async set(guildId, key, value) {
        // Setting Set
        const settingMap = this.settings;
        const settingFile = fs.readFileSync(settingFilePath, 'utf8');
        const settingJSON = JSON.parse(settingFile);
        let settings = { ...settingJSON.settings.template }; // 一旦テンプレート
        if (Object.hasOwn(settingJSON.settings, `${guildId}`)) { // 設定があるか
            // ある
            settings = settingJSON.settings[`${guildId}`];
        }
        if (!Object.hasOwn(settings, key)) return 'ERROR'; // 無い値を参照されたらエラー文字を返す
        // 渡された値をいれる
        settings[`${key}`] = value;
        settingMap.set(guildId, settings); // Mapの方にも反映
        // ファイルに書き込む
        settingJSON.settings[guildId] = settings;
        const afterSettingJSON = JSON.stringify(settingJSON, null, 4); // Json形式に変換
        try {
            fs.writeFileSync(settingFilePath, afterSettingJSON, 'utf8');
        } catch (err) {
            console.error(err);
            return 'ERROR';
        }
    }
}

module.exports = SettingService;
