docker run -d \
  -p 80:3002 \
  -p 443:3002 \
  -v $PWD/config.json:/app/config.json \
  -v $PWD/serialized-state.json:/app/serialized-state.json \
  -v $PWD/serialized-broadcasts-data.json:/app/serialized-broadcasts-data.json \
  -v /etc/letsencrypt/live/mydomain.com/fullchain.pem:/app/certs/fullchain.pem \
  -v /etc/letsencrypt/live/mydomain.com/privkey.pem:/app/certs/privkey.pem \
  discord-intercom:latest
