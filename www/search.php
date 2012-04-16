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

function make_pcre_pattern($arg)
{
    return sprintf("{%s}", $arg);
}

define('CSV_PATH', "reversed.csv");

require_once 'jsonp.inc.php';

$where = array();

if(!empty($_REQUEST['area']))
    $where[] = function($row) { return preg_match(make_pcre_pattern($_REQUEST['area']), $row[4]); };
if(!empty($_REQUEST['category']))
    $where[] = function($row) { return preg_match(make_pcre_pattern($_REQUEST['category']), $row[8]); };
if(!empty($_REQUEST['name']))
    $where[] = function($row) { return preg_match(make_pcre_pattern($_REQUEST['name']), $row[9]); };
if(isset($_REQUEST['I131']))
{
    $i131 = floatval($_REQUEST['I131']);
    if($i131 > 0) {
        $where[] = function($row) use($i131) { return (strstr($row[15], "<") === FALSE)
                                    && (floatval($row[15]) >= $i131); };
    }
}
if(isset($_REQUEST['Cs']))
{
    $cs_total = floatval($_REQUEST['Cs']);
    if($cs_total > 0) {
        $where[] = function($row) use($cs_total) { return (strstr($row[18], "<") === FALSE)
                                    && (floatval($row[18]) >= $cs_total); };
    }
}

$callback = get_jsonp_callback();
if(($fp = fopen(CSV_PATH, "rb")) !== FALSE)
{
    header("Content-Type: application/javascript; charset=UTF-8");

    print jsonp_begin($callback);
    print "[\n";
    while(($row = fgetcsv($fp, 1024)) !== FALSE)
    {
        $t = TRUE;
        foreach($where as $fn)
        {
            $t = $t && $fn($row);
        }
        if($t === FALSE) continue;

        print json_encode($row, JSON_HEX_APOS | JSON_HEX_QUOT);
        print ",\n";
    }
    print "]";
    print jsonp_end($callback);
    print "\n";

    fclose($fp);
}
else
{
    header("Status: 500 Internal Server Error");
}
