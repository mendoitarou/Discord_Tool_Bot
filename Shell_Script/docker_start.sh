#!/bin/bash

docker run --name tool_bot --network voicevox -d --restart unless-stopped tool_bot
