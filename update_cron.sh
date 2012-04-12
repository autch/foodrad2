#!/bin/sh

./get_csv.sh www/

./gen_prefectures.rb
./gen_categories.rb

