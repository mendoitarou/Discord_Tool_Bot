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

`docker-compose.yaml`に環境変数を設定します。

コマンド一発で自動でいろいろやってくれます。

```shell
docker compose up -d
```

コマンドの設定もします。

```shell
docker compose run discord_tool_bot node deploy-commands.js
```

これで終わりです。

## 更新
ファイルの更新から、起動までやります。

まず、レポジトリからファイルを同期します。

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

## さくらのAI EngineをこのBOTで使う方法
さくらのAI Engine側の設定は、[公式ドキュメント](https://manual.sakura.ad.jp/cloud/ai-engine/02-howto.html)を参照してください。

環境変数を書き換えるだけで動作します。なお、docker composeによってVOICEVOXのエンジンが自動起動するので、いらない人は無効化しておいてください。

`VOICEVOX_API_URL`にさくらのAI Engine 音声の読み上げ VOICEVOX形式のURLを指定してください。

以下が例です。

```
VOICEVOX_API_URL: https://api.ai.sakura.ad.jp/tts/v1
```

また、`VOICEVOX_isAuth`を`true`に変更し、`VOICEVOX_API_TOKEN`にアカウントトークンを指定してください。

```
VOICEVOX_isAuth: true
VOICEVOX_API_TOKEN: '~~~~~~~~~~~'
```

これだけで音声合成をさくらのAI Engineに任せることができます。

## 使用させていただいたもの

- [VOICEVOX Engine](https://github.com/VOICEVOX/voicevox_engine)
- [VOICEVOX Docker Image](https://hub.docker.com/r/voicevox/voicevox_engine)
- [Discord.js](https://discord.js.org/)
