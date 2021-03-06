#!/usr/bin/ruby1.9.1
# -*- encoding: utf-8; -*-

require 'csv'
require 'json'

dir = File.dirname(File.expand_path(__FILE__))
CSV_PATH = File.join(dir, "www", "reversed.csv")
JSON_PATH = File.join(dir, "www", "categories.js")

CATEGORIES = Hash.new{|h, k| h[k] = { "count" => 0, "items" => [] } }

File.open(CSV_PATH, "rb:UTF-8") do |file|
  while line = file.gets do
    line.chomp!
    row = line.split(",")
    key = row[8]
    item = CATEGORIES[key]
    item['items'] << row[9]
    item['count'] += 1
  end
end

CATEGORIES.each do |k, v|
  v['items'].uniq!
end

File.open(JSON_PATH, "wb:UTF-8") do |file|
  JSON.dump(CATEGORIES, file)
end
