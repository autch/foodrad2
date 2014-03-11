# foodrad2

厚生労働省発表の「食品中の放射性物質の検査結果について」を [三重大の奥村晴彦教授が CSV 化したもの](http://oku.edu.mie-u.ac.jp/~okumura/stat/data/mhlw/) をローカルファイルとして参照し、iPhone/Android での利用に適した検索画面を提供します。

[foodrad](https://github.com/autch/foodrad) が MySQL を必要とし、CSV を取得しては DB に格納していたのに対し、こちらは CSV ファイルをローカルに保存し、それを直接検索して結果表示します。

このバージョンは 4 月 1 日以前の形式にも対応します。


## 用意するもの

基本的に Debian squeeze のパッケージで揃います。

- Ruby 1.9.2 くらい
  - require 'csv'
  - require 'json'
- PHP 5.3 くらい
  - JSON モジュール
  - `proc_open()` がつかえること
- PHP が動く Web サーバ
- awk


## インストール

### ソースの入手

ソース一式を入手します。

    $ git clone git://github.com/autch/foodrad2.git foodrad2

中身はこうなっています。

    foodrad2/		チェックアウトしたディレクトリ
    |
    +-- www/		Web サーバで公開するディレクトリ

### ディレクトリの公開

www/ ディレクトリを Web サーバで公開します。このディレクトリの中の php ファイルが実行できるようにしてください。

www/ ディレクトリに `awk-errors.log` というファイルを作り、Web サーバの書き込み権を与えてください。


### データの導入

CSV ファイルを取得し、都道府県リストや食品カテゴリリストを生成しておきます。それには、foodrad2 ディレクトリで `update_cron.sh` を実行します。

    $ cd /your/path/to/foodrad2 && ./update_cron.sh

例外が出なければ大丈夫なはずです。index.html へアクセスしてみましょう。


## 日頃のデータ更新

`update_cron.sh` を cron に登録します。crontab の例は以下のようになるでしょう。

    0 9 * * * (cd /your/path/to/foodrad2/; nice ./update_cron.sh)


## ソースについて

index.html がすべての画面を持ち、都道府県リストや食品カテゴリのリストはあらかじめ CSV ファイルから生成した静的な JSON ファイルを読み込んで使います。

測定結果検索は PHP スクリプトが検索条件を awk スクリプトとして生成し、これをパイプで受け取った awk がCSV ファイルをスキャンし、条件にマッチしたものを JSONP として返すことで実現しています。

BSD ライセンスとします。
