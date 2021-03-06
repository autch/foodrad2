#!/usr/bin/ruby1.9.1
# -*- encoding: utf-8; -*-

require 'csv'
require 'json'

dir = File.dirname(File.expand_path(__FILE__))
CSV_PATH = File.join(dir, "www", "reversed.csv")
JSON_PATH = File.join(dir, "www", "prefectures.js")

PREFECTURES = Hash.new{|h, k| h[k] = 0 }

File.open(CSV_PATH, "rb:UTF-8") do |file|
  while line = file.gets do
    line.chomp!
    row = line.split(",")

    key = row[4]
    PREFECTURES[key] += 1
  end
end

pref_json = []
PREFECTURES.each do |k, v|
  pref_json << { "area" => k, "count" => v }
end

File.open(JSON_PATH, "wb:UTF-8") do |file|
  JSON.dump(pref_json, file)
end
