#!/bin/bash
# Fix .env.local to uncomment MONGODB_URI
sed -i.bak 's/^# MONGODB_URI=/MONGODB_URI=/' .env.local
echo "Fixed .env.local - MONGODB_URI is now uncommented"
