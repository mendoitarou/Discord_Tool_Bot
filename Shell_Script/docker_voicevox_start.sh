#!/bin/bash

docker run --name voicevox --network voicevox -d --restart unless-stopped voicevox/voicevox_engine:cpu-latest
