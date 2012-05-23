#!/bin/sh

./get_csv.sh www/
./gen_timestamp.sh

./gen_prefectures.rb
./gen_categories.rb

