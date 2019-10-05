# jQuery Table4Panes 0.1.1
HTMLを変更せずにJavaScriptのみでテーブルを4つのペインに分割します。

## デモ
以下を参照してください。
* demo-jquery-table4panes.html
* demo-jquery-table4panes_span.html

## 使い方

jQueryとこのプラグインをページに含めてください。

```html
<script src="jquery.min.js"></script>
<script src="jquery-table4panes.min.js"></script>
```

分割するテーブルに対してtable4panes関数を呼び出します。
1つ目の引数に列数、2つ目の引数に行数を指定します。
各種設定(表示サイズや表示方法など)は3つ目の引数に指定します。

```js
$.fn.table4panes(col_num, row_num, settings)
```

## 例

4列3行で固定し画面全体に表示する場合は、以下のように呼び出します。
```js
$(function(){
    $("#demo-table").table4panes(4,3,{"display-method":"flex", "width":"100%", "height":"100%", "fit":true});
});
```

## 設定(第3引数)

### "display-method"
"display-method"オプションには、CSSの横並びの方法として以下のいずれかを指定できます。
* "inline-block"
* "table-cell"
* "flex"
* "float"

### "fit"
trueを指定した場合、右下のペインが親のノードにフィットします。

### サイズ
各ペインのサイズは以下で指定できます。
* 全体のサイズは"height"と"width"で指定します。
* 各ペインの高さは"top-height"と"bottom-height"で指定します。
* 各ペインの幅は"left-width"と"right-width"で指定します。

### "fix-width-rows"
列の幅を固定するために使用する行(インデックス)の開始と終了を配列で指定します。
デフォルト値は[0,row_num]です。
また、"dummy"が設定された場合、ダミー行が各ペインに挿入されることで列の幅が固定されます。

### "callbacks"
このオプションは、セレクタに対しevent/function/dataを指定し、各イベントに対するコールバックを指定します。

### "css"
このオプションはセレクタに対するCSSを指定します。

### "prefix"
このオプションは、クラス名のプレフィックスをデフォルトの"table4panes"から変更します。

## ライセンス
Copyright &copy; ASAI Etsuhisa<br>
Licensed under the MIT license.

