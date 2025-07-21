# Discord_Tool_Bot
## これは何？
自分用に作っているいろんなツールが詰まったDiscordBOTです。

自分のために使ってますが、誰かの役に立つかもしれないので公開してみます。

現在搭載してる機能は以下の通り

- ボイスチャンネル入退室通知
- テキストチャンネルをボイスチャンネルにて読み上げ

追加予定機能は``issue``を確認ください。

**バグ報告もissueにてお願いします。**

## 使い方
編集中

## 簡単なセットアップ
Docker Compose使います。

コマンド一発で自動でいろいろやってくれます。

```shell
docker compose up -d
```

## 更新
ファイルの更新から、起動までやります。

まず、レポジトリからファイルを同期します。

(`config.json`が競合してできない場合は一度別の名前に変更してから同期し、その後元に戻してください。)

```shell
git pull
```

次に、コマンドを更新します。

```shell
docker compose run --build discord_tool_bot node deploy-commands.js
```

最後に、再ビルドして起動します。

```shell
docker compose up -d --build
```

これで終わり。簡単すぎる！

## Default Config
```
{
	"DISCORD_BOT_TOKEN": "",
	"clientId": "",
	"guildId": "",
	"ownerId": "",
	"NOTIFY_CHANNEL": "",
	"Reading_Channel": "",
	"Reading_Role_Id": "",
	"Voice_Channel_Id": "",
	"If_Reding": true,
	"If_Notify_Status_Voice_Channel": true,
	"VOICEVOX_API_URL": "http://voicevox:50021",
	"VOICEVOX_Speaker_Id": "3"
}

```

## 使用させていただいたもの

- [VOICEVOX Engine](https://github.com/VOICEVOX/voicevox_engine)
- [VOICEVOX Docker Image](https://hub.docker.com/r/voicevox/voicevox_engine)
- [Discord.js](https://discord.js.org/)
