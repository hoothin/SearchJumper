# Search Jumper - 搜索醬 
*A user script to assist in switching search engines*

## [Install](https://greasyfork.org/scripts/445274-searchjumper)

Build with React.js

UI: [Material-UI](https://mui.com/)

Icons: [FontAwesome](https://fontawesome.com/)

<img src='demo1.gif' height='210px'><img src='demo3.gif' height='210px'><img src='demo2.gif' height='210px'>

[Sites settings example 站點設置示例](https://github.com/hoothin/SearchJumper/issues/1)

## 特性：
+ 全面的自定義功能，詳見最下方
+ 支持全字符編碼
+ 支持 Post
+ 無第三方依賴庫
+ 自展開當前類別並提前
+ 不篡改原始頁面
+ 可以搜索圖片
+ 可以劃詞搜索
+ 支持站內搜索
+ 工具欄隨拖隨放，可隨意選擇位置放置
+ 可隨意使用快捷鍵開啟，右鍵點擊 logo 關閉
+ 支持配置導出與快捷分享
+ 支持中鍵後台打開連結

## Config params
* %s search keyword | 搜索關鍵詞
* %e charset | 編碼
* %c client pc,mobile | 客戶端 pc,mobile
* %u current website url | 當前網站 url
* %h current website host | 當前網站 host
* %t image src | 圖片 src
* %b image src without http | 圖片src去頭
* :p{params} post body, like:p{x=1&y=2} | post 參數體，例如 :p{x=1&y=2}

---

平時工作中搜尋引擎跳轉功能用得很頻繁，但嘗試了相關的擴展，發現大多夾有私貨。

而這只是一個簡單功能，所以不如自己寫一個啦。

結果寫配置頁面耗費的精力數倍於腳本本身……🤦‍

這個搜尋引擎跳轉支持自己拖拽定義位置，同時也支持站內搜索，多語言編碼設置（例如shift-jis），劃詞搜索，以及配置導入導出。

