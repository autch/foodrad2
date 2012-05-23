#!/bin/sh

DATA_URL="http://oku.edu.mie-u.ac.jp/~okumura/stat/data/mhlw/reversed.csv.gz"

if [ "x$1" = "x" ]; then
  DATA_GZ="$PWD/reversed.csv.gz"
  DATA_OUT="$PWD/reversed.csv"
else
  DATA_GZ="$1/reversed.csv.gz"
  DATA_OUT="$1/reversed.csv"
fi

wget -q -np -nd -nH -O "$DATA_GZ" "$DATA_URL" \
	&& gzip -dc "$DATA_GZ" > "$DATA_OUT" \
	&& touch -r "$DATA_GZ" "$DATA_OUT"

