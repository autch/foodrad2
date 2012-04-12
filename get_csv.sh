#!/bin/sh

DATA_URL="http://oku.edu.mie-u.ac.jp/~okumura/stat/data/mhlw/reversed.csv"

if [ "x$1" = "x" ]; then
  DATA_OUT="$PWD/reversed.csv"
else
  DATA_OUT="$1/reversed.csv"
fi

exec wget -q -np -nd -nH -O "$DATA_OUT" "$DATA_URL"

