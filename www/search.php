<?php
# 検査結果データの検索
#
# 検査結果データを指定のキーワード等で検索し、結果を JSON で返す
#
# home_pref: 産地の都道府県。前方一致
# category: 食品カテゴリ。前方一致
# item_name: 品目。前方一致
# cs_total: Cs134+137, 0 を指定すると ND も検索する 
#
# callback([ {結果}, {結果}, {結果}, ... ]) 
#
# {結果} ハッシュのキーと意味は foodrad.sql を参照。
#

setlocale(LC_ALL, 'ja_JP.UTF-8');

function make_regexp_pattern($arg) {
    return addcslashes($arg, "\"'");
}

define('CSV_PATH', "reversed.csv");
define('AWK', 'awk');

require_once 'jsonp.inc.php';

$where = array(
    'area' => '',
    'category' => '',
    'name' => '',
    'i131' => 0,
    'cs' => 0,
    'r_limit' => 50,
    'r_offset' => 0,
    );

if(!empty($_REQUEST['area']))
    $where['area'] = make_regexp_pattern($_REQUEST['area']);
if(!empty($_REQUEST['category']))
    $where['category'] = make_regexp_pattern($_REQUEST['category']);
if(!empty($_REQUEST['name']))
    $where['name'] = make_regexp_pattern($_REQUEST['name']);

if(isset($_REQUEST['I131']))
    $where['i131'] = floatval($_REQUEST['I131']);
if(isset($_REQUEST['Cs']))
    $where['cs'] = floatval($_REQUEST['Cs']);

if(isset($_REQUEST['r_limit'])) {
    if(($where['r_limit'] = intval($_REQUEST['r_limit'])) < 50)
        $where['r_limit'] = 50;
}

if(isset($_REQUEST['r_offset'])) {
    if($where['r_offset'] = intval($_REQUEST['r_offset']) < 0)
        $where['r_offset'] = 0;
}

$preamble = <<<__EOF__
BEGIN {
    I131 = ({$where['i131']}) + 0
    CS = ({$where['cs']}) + 0
    R_OFFSET = ({$where['r_offset']}) + 0
    R_LIMIT = ({$where['r_limit']}) + 0
    AREA = "{$where['area']}"
    CATEGORY = "{$where['category']}"
    NAME = "{$where['name']}"
}
__EOF__;

$cmd = sprintf("%s -f - -f search.awk -- %s", AWK, CSV_PATH);
$ds = array(
    0 => array("pipe", "r"),
    1 => array("pipe", "w"),
    2 => array("file", "awk-errors.log", "a")
);
$pipes = array();

if(($proc = proc_open($cmd, $ds, $pipes)) !== FALSE)
{
    header("Content-Type: application/javascript; charset=UTF-8");

    fwrite($pipes[0], $preamble);
    fclose($pipes[0]);

    $callback = get_jsonp_callback();
    print jsonp_begin($callback);
    print "[\n";
    while(($row = fgetcsv($pipes[1], 1024)) !== FALSE)
    {
        $row["with_separate_cs"] = (count($row) == 19);
        $color_val = $row["with_separate_cs"] ? $row[18] : $row[17];
        if($color_val >= 500)      $row["class"] = "lv3";
        else if($color_val >= 100) $row["class"] = "lv2";

        print json_encode($row, JSON_HEX_APOS | JSON_HEX_QUOT);
        print ",\n";
    }
    print "]";
    print jsonp_end($callback);
    print "\n";

    fclose($pipes[1]);

    proc_close($proc);
}
else
{
    header("Status: 500 Internal Server Error");
}
