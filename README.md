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
Docker使います。

``docker_setup.sh``を実行でセットアップ完了。

コンテナの起動は``docker_voicevox_start.sh``を実行後、``docker_start.sh``を実行。

## 更新
dockerコンテナとイメージの削除をしてください。

``docker ps``で起動中のコンテナ一覧を見て、``docker stop [ID]``で停止後、``docker rm [ID]``でコンテナ削除。

``docker images``でイメージ一覧を見て、``docker image rm [ID]``で削除。(この時、コンテナが存在するとかでエラーが出たらIDをご丁寧に教えてくれるのでコンテナ削除してください。)

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
	"VOICEVOX_API_URL": "http://voicevox:50021",
	"VOICEVOX_Speaker_Id": "3"
}

```

## 使用させていただいたもの

- [VOICEVOX Engine](https://github.com/VOICEVOX/voicevox_engine)
- [VOICEVOX Docker Image](https://hub.docker.com/r/voicevox/voicevox_engine)
- [Discord.js](https://discord.js.org/)
