#!/bin/sh
set -e

IN_FILE="www/reversed.csv"
OUT_FILE="www/timestamp.txt"
TMP_FILE="www/timestamp.tmp"

:> "$TMP_FILE"
date -R -r "$IN_FILE" | tr -d '\n' >> "$TMP_FILE"
touch -r "$IN_FILE" "$TMP_FILE"

mv "$TMP_FILE" "$OUT_FILE"

