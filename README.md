# Search Jumper - 搜索醬 
*A user script to assist in switching search engines*

![react-version](https://img.shields.io/badge/react-lastest-green.svg)
![materialUI-version](https://img.shields.io/badge/material-lastest-blue.svg)
![license](https://img.shields.io/badge/license-GPL3.0-red.svg)
![support](https://img.shields.io/badge/support-Chrome|Firefox|Edge-989898.svg)


## [Install](https://greasyfork.org/scripts/445274-searchjumper)

Build with React.js

UI: [Material-UI](https://mui.com/)

Icons: [FontAwesome](https://fontawesome.com/)

### [More site rules 更多站點配置](https://github.com/hoothin/SearchJumper/issues?q=label%3A%22Sites+Rule%22)

<img src='demo1.gif' height='210px'><img src='demo3.gif' height='210px'><img src='demo2.gif' height='210px'>

## Features：
+ Comprehensive customization 全面的自定義功能
+ Support full character encoding 支持全字符編碼
+ Support Post 支持 Post
+ No 3rd party dependencies 無第三方依賴庫
+ Self-expand current category 自展開當前類別並提前
+ No tamper with the original page 不篡改原始頁面
+ Support search by picture 可以搜索圖片
+ Support search by selected words 可以劃詞搜索
+ Support in-site search 支持站內搜索
+ Toolbar can be dragged & dropped, you can choose any location to place 工具欄隨拖隨放，可隨意選擇位置放置
+ Support open with shortcut key, right click on the logo to close 可隨意使用快捷鍵開啟，右鍵點擊 logo 關閉
+ Support configuration export and quick sharing 支持配置導出與快捷分享
+ Support middle button to open links in the background 支持中鍵後台打開連結
+ Support processing of pictures, links, audio, video, and pages 支持分別處理圖片、連結、音頻、視頻、頁面
+ Support batch opening of the same category 支持批量打開同一類別
+ Support custom styles 支持自定義樣式

## Config params
* `%s` search keyword 🗒️ 搜索關鍵詞
* `%e` charset 🗒️ 編碼
* `%c` client pc,mobile 🗒️ 客戶端 pc,mobile
* `%u` current website url `%U` with encodeURI 🗒️ 當前網站 url
* `%h` current website host 🗒️ 當前網站 host
* `%t` target src `%T` with encodeURI 🗒️ 指向對象的 src
* `%b` target src without http `%B` with encodeURI 🗒️ 指向對象 src 去頭
* `%i` base64 of target image 🗒️ 指向圖片的 base64
* `%p{params}` post body, like %p{x=1&y=%s} 🗒️ post 參數體，例如 %p{x=1&y=%s}
* `%P{params}` post without navigation 🗒️ post 但不跳轉
* `%input{tips}` input something 🗒️ 輸入占位，例如%input{請輸入您的三圍}
* `#p{params}` post in page, like #p{#input=1&div.param=2} 🗒️ 頁内 post，可在頁面之内使用【css選擇器】填寫參數提交查詢，適用於不開放GET/POST接口（Ajax-render）的網站，例如 #p{#input=1&div.param=2}
* `["siteName1","siteName2"]` batch open by site name you've created 🗒️ 通過你已經創建的站點名批量打開，例如 \["雅虎搜索","谷歌搜索"\]

---

平時工作中搜尋引擎跳轉功能用得很頻繁，但嘗試了相關的擴展，發現大多夾有私貨。

而這只是一個簡單功能，所以不如自己寫一個啦。

結果寫配置頁面耗費的精力數倍於腳本本身……🤦‍

這個搜尋引擎跳轉支持自己拖拽定義位置，同時也支持站內搜索，多語言編碼設置（例如shift-jis），劃詞搜索，以及配置導入導出。

