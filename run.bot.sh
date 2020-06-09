docker run -d \
  -p 3002:3002 \
  -v $PWD/config.json:/app/config.json \
  -v $PWD/serialized-state.json:/app/serialized-state.json \
  -v $PWD/serialized-broadcasts-data.json:/app/serialized-broadcasts-data.json \
  discord-intercom:latest