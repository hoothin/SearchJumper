// ==UserScript==
// @name         SearchJumper
// @name:zh-CN   搜索酱
// @name:zh-TW   搜尋醬
// @name:ja      SearchJumper
// @name:ru      SearchJumper
// @namespace    hoothin
// @version      1.9.33
// @description  Instantly search selected text across multiple search engines. Highlight keywords and boost your research efficiency.
// @description:zh-CN  一键即时搜索选定文本或在多个搜索引擎之间快速切换，支持关键词高亮、拖拽搜索、以图搜图、页内查找与自定义引擎。
// @description:zh-TW  一鍵即時搜尋選定文字或在多個搜尋引擎之間快速切換，支援關鍵字高亮、拖曳搜尋、以圖搜圖、頁內尋找與自訂引擎。
// @description:ja  選択したテキストをワンクリックで即座に検索したり、キーワードの強調表示、ドラッグアンドドロップ検索、画像検索、ページ内検索、カスタムエンジンをサポートする複数の検索エンジン間で素早く切り替えたりできます。
// @description:ru  Легко проводите поиск по выбранному тексту/изображению/ссылке. Быстро переходите к любому поисковому движку. Выделяйте искомый текст.
// @author       hoothin
// @license      MPL-2.0
// @match        *://*/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAclBMVEUAAAD+/v7////+/v7+/v7////+/v79/f3////////+/v7////////////+/v79/f3////+/v7/rP8zMzP/2f/R0dHAwMD/zf+vr69ZWVlKSkry8vL/vv/+5/7r6+uRkZGcnJx8fHxwcHD+7/7f39+kpKTMxXKjAAAAEXRSTlMA4wrL9ICvkxk56nVVI9WgZNxdEUkAAAE2SURBVDjLfdPZloMgDAZgFtHR2uU3LnWrXd//FUfIHKRT7XfhUYIkhINYqPyoM0SZTnIlPu2PEbwo2f8LqwTvIvMW/9H4oH+WeCqxQu79/xKr5N8aSmOD5gkGm3YuQYRNkU3CG+ynCYH6VsEycwW8wJXoDK8narlOIXI4Z6IKi47ucNI5A6vCOC41mBEaX8VCAuVQFEXzQODRzENDaVsRoSwYAgUrIecJI38MCAw8NkLaFCibphyDMusKox0DoJci+6615fcA2q5fikz8b/QC0HWuKTX8NnM/wbWSyL86qW01u1D3xEQ04dLSE0z6w3ILz9rWPq/hefslUN3uL+B6v/kKMiVmO2w6CSfGhqNg6oBVWvlbxTO+XAy1kiVWInTK8EZyfQFlZBDeKbEiNfFBSh2bNBj8BZ8mNsZysMSsAAAAAElFTkSuQmCC
// @grant        GM.getValue
// @grant        GM_getValue
// @grant        GM.setValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM.addStyle
// @grant        GM.deleteValue
// @grant        GM_deleteValue
// @grant        GM.registerMenuCommand
// @grant        GM_registerMenuCommand
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @grant        GM.notification
// @grant        GM_notification
// @grant        GM.setClipboard
// @grant        GM_setClipboard
// @grant        GM.openInTab
// @grant        GM_openInTab
// @grant        GM.info
// @grant        GM_info
// @grant        unsafeWindow
// @compatible   edge tested with tm
// @compatible   Chrome tested with tm
// @compatible   Firefox tested with tm
// @compatible   Opera untested
// @compatible   Safari untested
// @compatible   ios tested with userscript
// @compatible   android tested with kiwi
// @supportURL   https://github.com/hoothin/SearchJumper/issues
// @homepage     https://github.com/hoothin/SearchJumper
// @downloadURL  https://greasyfork.org/scripts/445274-searchjumper/code/SearchJumper.user.js
// @updateURL    https://greasyfork.org/scripts/445274-searchjumper/code/SearchJumper.meta.js
// @require      https://update.greasyfork.org/scripts/484118/searchJumperDefaultConfig.js
// @connect      global.bing.com
// @connect      suggestqueries.google.com
// @connect      api.bing.com
// @connect      suggestion.baidu.com
// @connect      webdav.hoothin.com
// @connect      search.hoothin.com
// @connect      *
// @run-at       document-start
// ==/UserScript==

(async function() {
    'use strict';
    const ext = false;
    const _unsafeWindow = (typeof unsafeWindow == 'undefined') ? window : unsafeWindow;
    if (_unsafeWindow.searchJumperInited) return;
    _unsafeWindow.searchJumperInited = true;
    const clipboard = navigator && navigator.clipboard;
    const inIframe = window.top !== window.self;
    if (inIframe) {
        try {
            if (window.self.innerWidth === 0 && window.self.innerHeight === 0) {
                let ignore = await new Promise(resolve => {
                    window.addEventListener('load', e => {
                        setTimeout(() => {
                            resolve(window.self.innerWidth < 300 || window.self.innerHeight < 300);
                        }, 500);
                    });
                });
                if (ignore) return;
            } else if (window.self.innerWidth < 300 || window.self.innerHeight < 300) {
                return;
            }
        } catch(e) {
            return;
        }
    }
    const importPageReg = /^https:\/\/github\.com\/hoothin\/SearchJumper(\/(issue|discussions)|\/?$|#|\?)|^https:\/\/greasyfork\.org\/.*\/scripts\/445274[\-\/].*\/discussions/i;
    const mobileUa = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
    const homePage = 'https://search.hoothin.com/';
    const githubPage = 'https://hoothin.github.io/SearchJumper';
    const firstRunPage = homePage + "firstRun";
    let configPage = homePage + 'config/';
    let isAllPage = false;

    let searchData = {};
    searchData.sitesConfig = sitesConfig;
    searchData.prefConfig = {
        position: {
            x: "left",
            y: "top"
        },
        offset: {
            x: "0",
            y: "0"
        },
        firstRun: true,
        openInNewTab: false,
        enableInPage: true,
        altKey: false,
        ctrlKey: true,
        shiftKey: false,
        metaKey: false,
        autoClose: false,
        autoDelay: 1000,
        shortcut: true,
        initShow: false,
        alwaysShow: false,
        customSize: 100,
        tilesZoom: 100,
        tipsZoom: 100,
        typeOpenTime: 250,
        longPressTime: 500,
        noIcons: false,
        showSiteLists: true,
        alwaysShowSiteLists: false,
        cacheSwitch: false,
        noAni: false,
        quickAddRule: true,
        multiline: 2,
        multilineGap: 1000,
        historyLength: 0,
        dragToSearch: true,
        hideDragHistory: false,
        sortType: false,
        sortSite: false,
        autoHide: false,
        autoHideAll: false,
        showCurrent: true,
        shortcutKey: 'Backquote',
        showInSearchEngine: false,
        showInSearchJumpPage: true,
        limitInPageLen: 1,
        limitPopupLen: 1,
        ignoreWords: ["a", "in", "into", "the", "to", "on", "among", "between", "and", "an", "of", "by", "with", "about", "under", "or", "at", "as"],
        inPageRule: {},
        firstFiveWordsColor: [],
        inPageWordsStyles: [],
        altToHighlight: true,
        defaultPicker: false,
        disableInputOnWords: false,
        disableTypeOpen: false,
        callBarAlt: false,
        callBarCtrl: false,
        callBarShift: false,
        callBarMeta: false,
        defaultFindTab: true,
        disableAutoOpen: false,
        hideOnSearchEngine: false,
        minSizeMode: false,
        hidePopup: false,
        minPopup: 0,
        selectToShow: ext,
        expandType: false,
        rightMouse: true,
        shiftLastUsedType: true,
        mouseLeaveToHide: true,
        currentTypeFirst: true,
        switchSitesPreKey: 'ArrowLeft',
        switchSitesNextKey: 'ArrowRight',
        switchSitesCtrl: true,
        switchSitesAlt: false,
        switchSitesShift: true,
        switchSitesMeta: false
    };
    function run() {
        let lang = navigator.appName === "Netscape" ? navigator.language : navigator.userLanguage;
        let config = {};
        function setLang() {
            switch (lang) {
                case "zh-CN":
                case "zh-SG":
                    config = {
                        import: '导入',
                        filter: '筛选',
                        selectAll: '全选',
                        importOrNot: '是否导入配置？',
                        settings: '配置脚本',
                        batchOpen: '批量打开',
                        batchOpenConfirm: '确定要批量打开吗？',
                        postOver: '发送成功：',
                        postError: '发送失败：',
                        copyOver: '复制成功',
                        keywords: '请输入搜索词',
                        targetUrl: '请输入搜索URL',
                        siteName: '站名',
                        siteDesc: '描述',
                        siteUrl: '地址',
                        siteIcon: '图标',
                        siteTest: '测试',
                        siteCancel: '取消',
                        siteAdd: '添加',
                        siteType: '分类',
                        siteExist: '已存在相同规则，是否添加为克隆项？',
                        siteAddOver: '站点添加成功',
                        multiline: '是否以换行符分隔多行搜索？',
                        multilineTooMuch: '行数超过10行，是否继续搜索？',
                        inputPlaceholder: '筛选引擎',
                        inputTitle: '筛选引擎，支持 * ? 通配符，$代表末尾，^代表开头，分组**站点 可筛选指定分组，例如 图片**baidu，tab 下一项',
                        inputKeywords: '输入搜索关键词',
                        inPageTips: '自定义分隔符：$c 加分隔符，例如 $c| search | jumper，默认空格作为分隔符\n原始文本不分隔：$o 加文本，例如$oopai liked by hero\n正则表达式：/re/，例如 $c, /google/i , /aPPle/\n添加提示文本：搜索文本$t{提示文本}，例如 linux$t{linux is not unix}\n添加自定义样式：搜索文本$s{背景;其他}，例如 google$s{#333333;color:red;}\n左键点击关键词跳转至下一个，右键点击关键词跳转至上一个',
                        inPagePlaceholder: '输入文字，按下回车进行页内查找',
                        pickerBtn: '抓取元素',
                        multiPickerBtn: '抓取元素，按住 Ctrl 或 Command 连续抓取',
                        editBtn: '编辑查找文字',
                        emptyBtn: '清空查找文字',
                        copyInPageBtn: '复制查找文字',
                        wordModeBtn: '单词模式',
                        copyEleBtn: '复制选中元素',
                        openLinkBtn: '打开选中链接',
                        maxEleBtn: '展开选中元素',
                        minEleBtn: '收起选中元素',
                        expandAll: '全部展开',
                        collapseAll: '全部合起',
                        rename: '重命名',
                        recoverBtn: '恢复查找文字',
                        pinBtn: '固定查找文字，在所有标签页中搜索',
                        locBtn: '定位侧边栏',
                        filterSites: '搜索引擎',
                        searchInPage: '页内查找',
                        removeBtn: '移除搜索词',
                        saveRuleBtn: '保存当前站点的搜索词',
                        wordContent: '搜索词内容',
                        wordHide: '隐藏父级元素',
                        wordHideTips: '元素深度，0为当前父级',
                        wordStyle: '搜索词样式',
                        wordTitle: '搜索词注释',
                        re: '正则',
                        ignoreCase: '不区分大小写',
                        filterLink: '筛选链接',
                        modify: '修改',
                        cancel: '取消',
                        modifyWord: '修改页内搜索词',
                        addSearchEngine: '添加搜索引擎',
                        noValidItemAsk: '未找到有效元素，是否手动编辑规则并添加？',
                        expand: '展开剩余站点',
                        add: '添加',
                        addWord: '添加新词语',
                        wordRange: '生效范围',
                        customInputFrame: '自定义搜索参数',
                        customSubmit: '提交搜索',
                        finalSearch: '目标搜索字串',
                        search: '搜索此项',
                        siteKeywords: '关键词(多个关键词以|分隔)',
                        siteMatch: '站点 URL 匹配正则',
                        openSelect: '打开选项',
                        openInDefault: '默认',
                        openInNewTab: '新标签页打开',
                        openInCurrent: '当前页打开',
                        currentType: '当前分类',
                        maxAddSiteBtn: '最大化',
                        minAddSiteBtn: '还原',
                        addAction: '添加操作',
                        crawlInfo: '模拟输入搜索',
                        inputAction: '输入',
                        clickAction: '点击',
                        sleepAction: '等待',
                        copyAction: '📄复制元素',
                        submitCrawl: '☑️完成操作',
                        inputOutput: '在元素<span title="#t1#" class="element">#t1#</span>内输入<span title="#t2#">#t2#</span>',
                        clickOutput: '点击元素<span title="#t#" class="element">#t#</span>',
                        dblclickOutput: '双击元素<span title="#t#" class="element">#t#</span>',
                        rclickOutput: '右击元素<span title="#t#" class="element">#t#</span>',
                        copyOutput: '复制元素<span title="#t#" class="element">#t#</span>',
                        sleepOutput: '休眠<span title="#t#">#t#</span>毫秒',
                        inputNewValue: '请输入新值',
                        deleteConfirm: '确定要删除此项吗？',
                        sleepPrompt: '等待时间（毫秒）',
                        startCache: '开始缓存，请耐心等待缓存完毕，勿关闭配置页！',
                        cacheOver: '所有图标都已缓存完毕！',
                        cspDisabled: '脚本样式被当前站点的 CSP 阻止，因此无法显示，请尝试安装 Allow CSP: Content-Security-Policy 扩展获取权限',
                        Sunday: '星期日 (日)',
                        Monday: '星期一 (月)',
                        Tuesday: '星期二 (火)',
                        Wednesday: '星期三 (水)',
                        Thursday: '星期四 (木)',
                        Friday: '星期五 (金)',
                        Saturday: '星期六 (土)',
                        template: '请设置【#t#】的值',
                        recordAction: '⏺️录制操作',
                        startRecord: '开始录制操作，按回车键结束录制',
                        loopAction: '🔁开始循环',
                        loopActionEnd: '⏹️循环结束',
                        loopStart: '开始循环，循环次数为<span title="#t#">#t#</span>',
                        loopEnd: '结束循环',
                        loopTimes: '循环次数，将遍历所有匹配元素并顺序执行',
                        loadingCollection: '正在加载合集，请稍候……',
                        emuInputTips: '在指定页面元素（例如输入框）内输入搜索词',
                        emuClickTips: '单击指定页面元素（例如按钮）',
                        emuWaitTips: '等待一段时间后继续执行，当某个操作需要一段时间才能完成时很有用',
                        emuCopyTips: '复制指定元素的文本到剪贴板',
                        emuRecordTips: '录制接下来的点击和输入操作',
                        emuLoopTips: '开始循环，接下来的操作将遍历所有找到的元素并且重复指定次数',
                        emuStopTips: '结束操作并生成规则'
                    };
                    break;
                case "zh":
                case "zh-TW":
                case "zh-HK":
                    config = {
                        import: '導入',
                        filter: '篩選',
                        selectAll: '全選',
                        importOrNot: '是否導入配置？',
                        settings: '配置脚本',
                        batchOpen: '批量打開',
                        batchOpenConfirm: '確定要批量打開嗎？',
                        postOver: '發送成功：',
                        postError: '發送失敗：',
                        copyOver: '複製成功',
                        keywords: '請輸入搜尋詞',
                        targetUrl: '請輸入搜尋URL',
                        siteName: '站名',
                        siteDesc: '描述',
                        siteUrl: '地址',
                        siteIcon: '圖標',
                        siteTest: '測試',
                        siteCancel: '取消',
                        siteAdd: '添加',
                        siteType: '分類',
                        siteExist: '已存在相同規則，是否添加為克隆項？',
                        siteAddOver: '站點添加成功',
                        multiline: '是否以換行符分隔多行搜尋？',
                        multilineTooMuch: '行數超過10行，是否繼續搜尋？',
                        inputPlaceholder: '篩選引擎',
                        inputTitle: '篩選引擎，支援 * ? 通配符，$代表末尾，^代表開頭，分組**站點 可篩選指定分組，例如 圖片**google，tab 下一項',
                        inputKeywords: '輸入搜尋關鍵詞',
                        inPageTips: '自定義分隔符：$c 加分隔符，例如 $c| search | jumper，默認空格作為分隔符\n原始文本不分隔：$o 加文本，例如$oopai liked by hero\n正則表達式：/re/，例如 $c, /google/i , /aPPle/\n添加提示文本：搜尋文本$t{提示文本}，例如 linux$t{linux is not unix}\n添加自定義樣式：搜尋文本$s{背景;其他}，例如 google$s{#333333;color:red;}\n左鍵點擊關鍵詞跳轉至下一個，右鍵點擊關鍵詞跳轉至上一個',
                        inPagePlaceholder: '輸入文字，按下回車進行頁內查找',
                        pickerBtn: '抓取元素',
                        multiPickerBtn: '抓取元素，按住 Ctrl 或 Command 連續抓取',
                        editBtn: '編輯查找文字',
                        emptyBtn: '清空查找文字',
                        copyInPageBtn: '複製查找文字',
                        wordModeBtn: '單詞模式',
                        copyEleBtn: '複製選中元素',
                        openLinkBtn: '打開選中連結',
                        maxEleBtn: '展開選中元素',
                        minEleBtn: '收起選中元素',
                        expandAll: '全部展開',
                        collapseAll: '全部合起',
                        rename: '重命名',
                        recoverBtn: '恢復查找文字',
                        pinBtn: '固定查找文字，在所有標籤頁中搜尋',
                        locBtn: '定位側邊欄',
                        filterSites: '搜尋引擎',
                        searchInPage: '頁內查找',
                        removeBtn: '移除搜尋詞',
                        saveRuleBtn: '保存當前站點的搜尋詞',
                        wordContent: '搜尋詞內容',
                        wordHide: '隱藏父級元素',
                        wordHideTips: '元素深度，0為當前父級',
                        wordStyle: '搜尋詞樣式',
                        wordTitle: '搜尋詞注釋',
                        re: '正則',
                        ignoreCase: '不區分大小寫',
                        filterLink: '篩選鏈接',
                        modify: '修改',
                        cancel: '取消',
                        modifyWord: '修改頁內搜尋詞',
                        addSearchEngine: '添加搜尋引擎',
                        noValidItemAsk: '未找到有效元素，是否手動編輯規則並添加？',
                        expand: '展開剩餘站點',
                        add: '添加',
                        addWord: '添加新詞語',
                        wordRange: '生效範圍',
                        customInputFrame: '自定義搜尋參數',
                        customSubmit: '提交搜尋',
                        finalSearch: '目標搜尋字串',
                        search: '搜尋此項',
                        siteKeywords: '關鍵詞(多個關鍵詞以|分隔)',
                        siteMatch: '站點 URL 匹配正則',
                        openSelect: '打開選項',
                        openInDefault: '默認',
                        openInNewTab: '新標籤頁打開',
                        openInCurrent: '當前頁打開',
                        currentType: '當前分類',
                        maxAddSiteBtn: '最大化',
                        minAddSiteBtn: '還原',
                        addAction: '添加操作',
                        crawlInfo: '模擬輸入搜尋',
                        inputAction: '輸入',
                        clickAction: '點擊',
                        sleepAction: '等待',
                        copyAction: '📄複製元素',
                        submitCrawl: '☑️完成操作',
                        inputOutput: '在元素<span title="#t1#" class="element">#t1#</span>內輸入<span title="#t2#">#t2#</span>',
                        clickOutput: '點擊元素<span title="#t#" class="element">#t#</span>',
                        dblclickOutput: '雙擊元素<span title="#t#" class="element">#t#</span>',
                        rclickOutput: '右擊元素<span title="#t#" class="element">#t#</span>',
                        copyOutput: '複製元素<span title="#t#" class="element">#t#</span>',
                        sleepOutput: '休眠<span title="#t#">#t#</span>毫秒',
                        inputNewValue: '請輸入新值',
                        deleteConfirm: '確定要刪除此項嗎？ ',
                        sleepPrompt: '等待時間（毫秒）',
                        startCache: '開始緩存，請耐心等待緩存完畢，勿關閉配置頁！',
                        cacheOver: '所有圖標都已緩存完畢！',
                        cspDisabled: '腳本樣式被當前站點的 CSP 阻止，因此無法顯示，請嘗試安裝 Allow CSP: Content-Security-Policy 擴展獲取權限',
                        Sunday: '星期日 (日)',
                        Monday: '星期一 (月)',
                        Tuesday: '星期二 (火)',
                        Wednesday: '星期三 (水)',
                        Thursday: '星期四 (木)',
                        Friday: '星期五 (金)',
                        Saturday: '星期六 (土)',
                        template: '請設置【#t#】的值',
                        recordAction: '⏺️錄製動作',
                        startRecord: '開始錄製操作，按下回車鍵結束錄製',
                        loopAction: '🔁開始循環',
                        loopActionEnd: '⏹️循環結束',
                        loopStart: '開始循環，循環次數為<span title="#t#">#t#</span>',
                        loopEnd: '結束循環',
                        loopTimes: '循環次數，將遍歷所有匹配元素並順序執行',
                        loadingCollection: '正在載入合集，請稍候……',
                        emuInputTips: '在指定頁面元素（例如輸入框）內輸入搜尋字詞',
                        emuClickTips: '點擊指定頁面元素（例如按鈕）',
                        emuWaitTips: '等待一段時間後繼續執行，當某個操作需要一段時間才能完成時很有用',
                        emuCopyTips: '複製指定元素的文字到剪貼簿',
                        emuRecordTips: '錄製接下來的點擊和輸入操作',
                        emuLoopTips: '開始循環，接下來的操作將遍歷所有找到的元素並且重複指定次數',
                        emuStopTips: '結束操作並產生規則'
                    };
                    break;
                case 'ja':
                    config = {
                        import: 'インポート',
                        filter: 'フィルター',
                        selectAll: 'すべて選択',
                        importOrNot: '設定をインポートしますか? ',
                        settings: '構成スクリプト',
                        batchOpen: 'バッチオープン',
                        batchOpenConfirm: 'バッチオープンしてもよろしいですか? ',
                        postOver: '正常に送信されました:',
                        postError: '送信に失敗しました:',
                        copyOver: 'コピーに成功しました',
                        keywords: '検索語を入力してください',
                        targetUrl: '検索 URL を入力してください',
                        siteName: 'サイト名',
                        siteDesc: '説明',
                        siteUrl: 'アドレス',
                        siteIcon: 'アイコン',
                        siteTest: 'テスト',
                        siteCancel: 'キャンセル',
                        siteAdd: '追加',
                        siteType: 'カテゴリ',
                        siteExist: '同じルールがすでに存在します。クローンとして追加しますか? ',
                        siteAddOver: 'サイトは正常に追加されました',
                        multiline: '複数行の検索は改行で区切るべきですか? ',
                        multilineTooMuch: '行数が 10 行を超えています。検索を続けますか? ',
                        inputPlaceholder: 'フィルタリング エンジン',
                        inputTitle: 'フィルタリング エンジン、*? ワイルドカードをサポート、$ は終わりを表し、^ は始まりを表します、グループ ** サイトは写真などの指定されたグループをフィルターできます ** Google、次の項目をタブします',
                        inputKeywords: '検索キーワードを入力してください',
                        inPageTips: 'カスタム区切り文字: $c と区切り文字 ($c| 検索 | ジャンパーなど)、デフォルトのスペースを区切り文字として使用\n元のテキストは分離されていません: $o と文字 (ヒーローが好んだ $oopai など)\n正規表現 ：/re/ 、$c、/google/i、/aPPle/ など\nプロンプト テキストの追加: 検索テキスト $t{プロンプト テキスト}、たとえば linux$t{Linux は Unix ではありません}\nカスタム スタイルの追加: 検索テキスト $s{背景;other}、例: google$s{#333333;color:red;}\nキーワードを左クリックすると次のキーワードにジャンプし、キーワードを右クリックすると前のキーワードにジャンプします',
                        inPagePlaceholder: 'ページ内を検索するには、テキストを入力して Enter キーを押してください',
                        pickerBtn: '要素の取得',
                        multiPickerBtn: '要素を取得するには、Ctrl または Command を押したまま継続的に取得します',
                        editBtn: '検索テキストを編集',
                        emptyBtn: '空の検索テキスト',
                        copyInPageBtn: '検索テキストをコピー',
                        wordModeBtn: 'ワードモード',
                        copyEleBtn: '選択した要素をコピー',
                        openLinkBtn: '選択したリンクを開く',
                        maxEleBtn: '選択した要素を展開',
                        minEleBtn: '選択した要素を折りたたむ',
                        expandAll: 'すべて展開',
                        collapseAll: 'すべて折り',
                        rename: '名前を変更',
                        reverseBtn: '検索テキストを復元',
                        pinBtn: '検索テキストを修正、すべてのタブで検索',
                        locBtn: 'サイドバーを検索',
                        filterSites: '検索エンジン',
                        searchInPage: 'ページ内を検索',
                        removeBtn: '検索語を削除',
                        saveRuleBtn: '現在のサイトの検索語を保存',
                        wordContent: '単語の内容を検索',
                        wordHide: '親要素を非表示',
                        wordHideTips: '要素の深さ、0 が現在の親',
                        wordStyle: '検索ワードスタイル',
                        wordTitle: '検索単語の注釈',
                        re: 'RegExp',
                        ignoreCase: '大文字と小文字は区別されません',
                        filterLink: 'フィルターリンク',
                        modify: '変更',
                        cancel: 'キャンセル',
                        modifyWord: 'ページ上の検索ワードを変更します',
                        addSearchEngine: '検索エンジンを追加',
                        noValidItemAsk: '有効な要素が見つかりません。ルールを手動で編集して追加しますか? ',
                        expand: '残りのサイトを展開します',
                        add: '追加',
                        addWord: '新しい単語を追加',
                        wordRange: '有効範囲',
                        customInputFrame: 'カスタム検索パラメータ',
                        customSubmit: '検索を送信',
                        finalSearch: '対象の検索文字列',
                        search: 'このアイテムを検索',
                        siteKeywords: 'キーワード (| で区切られた複数のキーワード)',
                        siteMatch: '通常のサイト URL と一致',
                        openSelect: 'オプションを開く',
                        openInDefault: 'デフォルト',
                        openInNewTab: '新しいタブが開きます',
                        openInCurrent: '現在のページが開いています',
                        currentType: '現在のカテゴリ',
                        maxAddSiteBtn: '最大化',
                        minAddSiteBtn: '復元',
                        addAction: 'アクションを追加',
                        rollInfo: '入力検索をシミュレート',
                        inputAction: '入力',
                        clickAction: 'クリック',
                        sleepAction: '待機',
                        copyAction: '📄要素のコピー',
                        submitCrawl: '☑️操作を完了',
                        inputOutput: '要素 <span title="#t1#" class="element">#t1#</span> 内に <span title="#t2#">#t2#</span> を入力します',
                        clickOutput: 'クリック<span title="#t#" class="element">#t#</span>',
                        dblclickOutput: 'ダブルクリック<span title="#t#" class="element">#t#</span>',
                        rclickOutput: '右クリック<span title="#t#" class="element">#t#</span>',
                        copyOutput: 'コピー要素<span title="#t#" class="element">#t#</span>',
                        sleepOutput: 'スリープ<span title="#t#">#t#</span> ミリ秒',
                        inputNewValue: '新しい値を入力してください',
                        deleteconfirm: 'この項目を削除してもよろしいですか? ',
                        sleepPrompt: '待機時間 (ミリ秒)',
                        startCache: 'キャッシュを開始します。キャッシュが完了するまで辛抱強く待ってください。設定ページは閉じないでください。 ',
                        cacheOver: 'すべてのアイコンがキャッシュされました! ',
                        cspDisabled: 'スクリプト スタイルは現在のサイトの CSP によってブロックされているため、表示できません。許可を取得するには、Allow CSP: Content-Security-Policy 拡張機能をインストールしてみてください',
                        Sunday: '日曜日',
                        Monday: '月曜日',
                        Tuesday: '火曜日',
                        Wednesday: '水曜日',
                        Thursday: '木曜日',
                        Friday: '金曜日',
                        Saturday: '土曜日',
                        template: '[#t#]の値を設定してください',
                        recordAction: '⏺️記録操作',
                        startRecord: '記録操作を開始します。記録を終了するには Enter キーを押してください',
                        loopAction: '🔁ループの開始',
                        loopActionEnd: '⏹️ループの終了',
                        loopStart: 'ループを開始。ループ数は <span title="#t#">#t#</span> です',
                        loopEnd: 'ループの終了',
                        loopTimes: 'ループの数。一致するすべての要素が走査され、順番に実行されます',
                        loadingCollection: 'コレクションを読み込み中...',
                        emuInputTips: '指定されたページ要素 (入力ボックスなど) に検索語を入力します',
                        emuClickTips: '指定されたページ要素 (ボタンなど) をクリックします',
                        emuWaitTips: '続行する前にしばらく待ってください。操作が完了するまでに時間がかかる場合に便利です',
                        emuCopyTips: '指定された要素のテキストをクリップボードにコピーします',
                        emuRecordTips: '次のクリックと入力操作を記録します',
                        emuLoopTips: 'ループを開始します。次の操作は見つかったすべての要素を走査し、指定された回数だけ繰り返します',
                        emuStopTips: '操作を終了してルールを生成'
                    };
                    break;
                case 'ru':
                    config = {
                        import: 'Импортировать', //????????????????????????????????????????????????????????????
                        filter: 'Фильтровать', //????????????????????????????????????????????????????????????
                        selectAll: 'Выбрать всё', //????????????????????????????????????????????????????????????
                        importOrNot: 'Импортировать эту конфигурацию?',
                        settings: 'Настройки',
                        batchOpen: 'Групповой поиск',
                        batchOpenConfirm: 'Искать с помощью всех движков группы?',
                        postOver: 'Post over: ',
                        postError: 'Post fail: ',
                        copyOver: 'Скопировано успешно',
                        keywords: 'Input keywords',
                        targetUrl: 'Input URL',
                        siteName: 'Название',
                        siteDesc: 'Описание',
                        siteUrl: 'URL',
                        siteIcon: 'Иконка',
                        siteTest: 'Тест',
                        siteCancel: 'Отменить',
                        siteAdd: 'Добавить',
                        siteType: 'Группа',
                        siteExist: 'Движок уже существует. Добавить его как клон?',
                        siteAddOver: 'Движок успешно добавлен',
                        multiline: 'Использовать многострочный поиск?',
                        multilineTooMuch: 'Количество строк превышает 10. Продолжить поиск?', //????????????????????????????????????????????????????????????
                        inputPlaceholder: 'Фильтры',
                        inputTitle: 'Filter engines, support * ? wildcards, $ means end, ^ means start, type name**site name to filter type like "image**google", tab to next. ',
                        inputKeywords: 'Ввести ключевые слова поиска',
                        inPageTips: 'Custom delimiter: $c + delimiter, such as $c| search | jumper, space as delimiter by default\nOriginal text without delimited: $o + text, such as $oopai liked by hero\nRegular expression: /re/, such as $c, /google/i , /aPPle/\nTips text: search text$t{tips text}, such as linux$t{linux is not unix}\nCustom style: Search text$s{background;other}, such as google$s{#333333;color:red;}\nLeft-click keyword to jump to the next, right-click keyword to jump to the previous',
                        inPagePlaceholder: 'Для поиска введите текст и нажмите Enter',
                        pickerBtn: 'Выбрать область',
                        multiPickerBtn: 'Выбрать элемент или выбрать несколько элементов с помощью Ctrl или Command',
                        editBtn: 'Редактировать текст поиска',
                        emptyBtn: 'Очистить поле ввода',
                        copyInPageBtn: 'Скопировать текст поика',
                        wordModeBtn: 'Режим поиска по словам. В поле ввода можно ввести целое предложение, после чего на странице будут искаться все слова по отдельности из которого состоит предложение',
                        copyEleBtn: 'Скопировать выбранные элементы',
                        openLinkBtn: 'Открыть выбранные ссылки',
                        maxEleBtn: 'Расширить выбранные элементы',
                        minEleBtn: 'Сжать выбранные элементы',
                        expandAll: 'Развернуть всё',
                        collapseAll: 'Свернуть всё',
                        rename: 'Rename',
                        recoverBtn: 'Recover find text',
                        pinBtn: 'Выделить цветом текущие ключевые слова поиска по странице во всех открытых вкладках',
                        locBtn: 'Отображать совпадения справа на панели',
                        filterSites: 'Фильтровать движки',
                        searchInPage: 'Искать на странице',
                        removeBtn: 'Удалить правило поиска',
                        saveRuleBtn: 'Сохранить правило поиска текущего сайта',
                        wordContent: 'Слово или фраза для поиска',
                        wordHide: 'Hide parent element',
                        wordHideTips: 'Глубина элемента, 0 - это текущее значение', //????????????????????????????????????????????????????????????
                        wordStyle: 'Стиль выделения слова',
                        wordTitle: 'Аннотация к искомому слову',
                        re: 'RegExp',
                        ignoreCase: 'Игнорировать регистр',
                        filterLink: 'Фильтровать ссылку', //????????????????????????????????????????????????????????????
                        modify: 'Готово',
                        cancel: 'Отменить',
                        modifyWord: 'Изменить параметры',
                        addSearchEngine: 'Добавить движок',
                        noValidItemAsk: 'Не найден подходящий элемент. Хотите вручную добавить сайт?',
                        expand: 'Развернуть другие сайты', //????????????????????????????????????????????????????????????
                        add: 'Добавить',
                        addWord: 'Добавить новое слово',
                        wordRange: 'Выделить область поиска',
                        customInputFrame: 'Пользовательские параметры поиска',
                        customSubmit: 'Принять',
                        finalSearch: 'Целевая строка поиска',
                        search: 'Искать это', //????????????????????????????????????????????????????????????
                        siteKeywords: 'Ключевые слова (разделитель |)',
                        siteMatch: 'Regexp для соответствия URL сайта',
                        openSelect: 'Открыть в',
                        openInDefault: 'По умолчанию',
                        openInNewTab: 'Открыть в новой вкладке',
                        openInCurrent: 'Открыть в текущей вкладке',
                        currentType: 'Current',
                        maxAddSiteBtn: 'Развернуть',
                        minAddSiteBtn: 'Свернуть',
                        addAction: 'Добавить действия',
                        crawlInfo: 'Симуляция действий на сайте',
                        inputAction: 'Ввод',
                        clickAction: 'Клик мыши',
                        sleepAction: 'Ожидание',
                        copyAction: '📄Копировать элемент',
                        submitCrawl: '☑️Завешить действие',
                        inputOutput: 'Ввод <span title="#t2#">#t2#</span> в элемент <span title="#t1#" class="element">#t1#</span>',
                        clickOutput: 'Клик по элементу <span title="#t#" class="element">#t#</span>',
                        dblclickOutput: 'Двойной клик <span title="#t#" class="element">#t#</span>',
                        rclickOutput: 'щелкните ПКМ <span title="#t#" class="element">#t#</span>',
                        copyOutput: 'Копировать элемент <span title="#t#" class="element">#t#</span>',
                        sleepOutput: 'Ждать <span title="#t#">#t#</span> миллисекунд',
                        inputNewValue: 'Введите новое значение',
                        deleteConfirm: 'Хотите удалить этот элемент? ',
                        sleepPrompt: 'Время ожидания (в миллисекундах)',
                        startCache: 'Началось кширование закрывайте страницу!',
                        cacheOver: 'Все иконки кэшированы!',
                        cspDisabled: 'The style of SearchJumper is blocked by the CSP of current site, please try to install the Allow CSP: Content-Security-Policy extension to obtain permission',
                        template: 'Установите значение "#t#"',
                        recordAction: '⏺️Записать действие',
                        startRecord: 'Сейчас начнется запись действия. После завершения нажмите Enter, чтобы вернуться в окно редактирования.',
                        loopAction: '🔁Начать цикл',
                        loopActionEnd: '⏹️Остановить цикл',
                        loopStart: 'Начать цикл <span title="#t#">#t#</span> раз',
                        loopEnd: 'Остановить цикл',
                        loopTimes: 'Количество циклов, все совпадающие элементы будут пройдены и выполнены последовательно',
                        loadingCollection: 'Preparing collection for SearchJumper...',
                        emuInputTips: 'Ввести поисковые запросы в указанные элементы страницы (например, в поля ввода).',
                        emuClickTips: 'Кликнуть по указанному элементу страницы (например, по кнопке)',
                        emuWaitTips: 'Подождите некоторое время, прежде чем продолжить. Полезно, когда операция требует некоторого времени для завершения',
                        emuCopyTips: 'Копирование текста указанного элемента в буфер обмена',
                        emuRecordTips: 'Записать следующие нажатия и операции ввода',
                        emuLoopTips: 'Запустить цикл, следующая операция будет обходить все найденные элементы и повторяться указанное количество раз',
                        emuStopTips: 'Завершить операцию и создать правило'
                    };
                    break;
                default:
                    config = {
                        import: 'Import',
                        filter: 'Filter',
                        selectAll: 'SelectAll',
                        importOrNot: 'Do you want to import this config?',
                        settings: 'Settings',
                        batchOpen: 'Batch open',
                        batchOpenConfirm: 'Batch open urls?',
                        postOver: 'Post over: ',
                        postError: 'Post fail: ',
                        copyOver: 'Copied successfully',
                        keywords: 'Input keywords',
                        targetUrl: 'Input URL',
                        siteName: 'Site Name',
                        siteDesc: 'Description',
                        siteUrl: 'Site Url',
                        siteIcon: 'Site Icon',
                        siteTest: 'Test',
                        siteCancel: 'Cancel',
                        siteAdd: 'Add',
                        siteType: 'Category',
                        siteExist: 'Site is already exist, add it as clone?',
                        siteAddOver: 'Site added successfully',
                        multiline: 'Search as multilines?',
                        multilineTooMuch: 'The number of lines exceeds 10, do you want to continue searching?',
                        inputPlaceholder: 'Filter engines',
                        inputTitle: 'Filter engines, support * ? wildcards, $ means end, ^ means start, type name**site name to filter type like "image**google", tab to next. ',
                        inputKeywords: 'Enter search keywords',
                        inPageTips: 'Custom delimiter: $c + delimiter, such as $c| search | jumper, space as delimiter by default\nOriginal text without delimited: $o + text, such as $oopai liked by hero\nRegular expression: /re/, such as $c, /google/i , /aPPle/\nTips text: search text$t{tips text}, such as linux$t{linux is not unix}\nCustom style: Search text$s{background;other}, such as google$s{#333333;color:red;}\nLeft-click keyword to jump to the next, right-click keyword to jump to the previous',
                        inPagePlaceholder: 'Input text, press Enter to find in the page',
                        pickerBtn: 'Pick a element',
                        multiPickerBtn: 'Pick a element, pick multi elements with Ctrl or Command',
                        editBtn: 'Edit search text',
                        emptyBtn: 'Empty search text',
                        copyInPageBtn: 'Copy search text',
                        wordModeBtn: 'Word mode',
                        copyEleBtn: 'Copy selected elements',
                        openLinkBtn: 'Open selected links',
                        maxEleBtn: 'Expand selected elements',
                        minEleBtn: 'Collapse selected elements',
                        expandAll: 'Expand All',
                        collapseAll: 'Collapse All',
                        rename: 'Rename',
                        recoverBtn: 'Recover find text',
                        pinBtn: 'Pin search text to search in all tabs',
                        locBtn: 'Sidebar to locate',
                        filterSites: 'Search engines',
                        searchInPage: 'Find in page',
                        removeBtn: 'Remove search term',
                        saveRuleBtn: 'Save the search term of the current site',
                        wordContent: 'Search word content',
                        wordHide: 'Hide parent element',
                        wordHideTips: 'Element depth, 0 means the current',
                        wordStyle: 'Search word style',
                        wordTitle: 'Search word annotation',
                        re: 'RegExp',
                        ignoreCase: 'Ignore case',
                        filterLink: 'Filter link',
                        modify: 'Modify',
                        cancel: 'Cancel',
                        modifyWord: 'Modify search word',
                        addSearchEngine: 'Add search engine',
                        noValidItemAsk: 'No valid element found, do you want to manually edit the rule and add it?',
                        expand: 'Expand other sites',
                        add: 'Add',
                        addWord: 'Add new word',
                        wordRange: 'Effective range',
                        customInputFrame: 'Custom search parameters',
                        customSubmit: 'Submit',
                        finalSearch: 'Target search string',
                        search: 'Search this',
                        siteKeywords: 'Keywords(split by |)',
                        siteMatch: 'Regexp to match site URL',
                        openSelect: 'Open option',
                        openInDefault: 'Default',
                        openInNewTab: 'Open a new tab',
                        openInCurrent: 'Open in current',
                        currentType: 'Current',
                        maxAddSiteBtn: 'Maximize',
                        minAddSiteBtn: 'Restore',
                        addAction: 'Add Actions',
                        crawlInfo: 'Analog input search',
                        inputAction: 'Input',
                        clickAction: 'Click',
                        sleepAction: 'Wait',
                        copyAction: '📄Copy element',
                        submitCrawl: '☑️Complete operation',
                        inputOutput: 'Input <span title="#t2#">#t2#</span> in the element <span title="#t1#" class="element">#t1#</span>',
                        clickOutput: 'Click on element <span title="#t#" class="element">#t#</span>',
                        dblclickOutput: 'Double click <span title="#t#" class="element">#t#</span>',
                        rclickOutput: 'Right click <span title="#t#" class="element">#t#</span>',
                        copyOutput: 'Copy element <span title="#t#" class="element">#t#</span>',
                        sleepOutput: 'Sleep for <span title="#t#">#t#</span> milliseconds',
                        inputNewValue: 'Please enter a new value',
                        deleteConfirm: 'Are you sure you want to delete this item? ',
                        sleepPrompt: 'Wait time (milliseconds)',
                        startCache: 'Start cache icons of engines, do not close this page!',
                        cacheOver: 'All icons cached!',
                        cspDisabled: 'The style of SearchJumper is blocked by the CSP of current site, please try to install the Allow CSP: Content-Security-Policy extension to obtain permission',
                        template: 'Please set the value of "#t#"',
                        recordAction: '⏺️Record operation',
                        startRecord: 'Start to record operation, press Enter to end',
                        loopAction: '🔁Start loop',
                        loopActionEnd: '⏹️Stop loop',
                        loopStart: 'Start loop <span title="#t#">#t#</span> times',
                        loopEnd: 'Stop loop',
                        loopTimes: 'Number of loops, all matching elements will be traversed and executed sequentially',
                        loadingCollection: 'Preparing collection for SearchJumper...',
                        emuInputTips: 'Enter search terms in specified page elements (such as input boxes)',
                        emuClickTips: 'Click on a specified page element (such as a button)',
                        emuWaitTips: 'Wait for a while before continuing, useful when an operation takes a while to complete',
                        emuCopyTips: 'Copy the text of the specified element to the clipboard',
                        emuRecordTips: 'Record the next clicks and input operations',
                        emuLoopTips: 'Start the loop, the next operation will traverse all found elements and repeat the specified number of times',
                        emuStopTips: 'End the operation and generate rules'
                    };
                    break;
            }
        }
        function i18n(name, param) {
            return config[name] ? (param ? config[name].replace(/#t#/g, param).replace(/#t1#/g, param[0]).replace(/#t2#/g, param[1]) : config[name]) : name;
        };
        const isMobile = ('ontouchstart' in document.documentElement);
        var enableDebug = true;
        var debug = (str, title) => {
            if(enableDebug) {
                console.log(
                    `%c【SearchJumper v.${_GM_info.script.version}】 ${title ? title : 'debug'}`,
                    'color: orange;font-size: large;font-weight: bold;',
                    str
                );
            }
        };
        var disabled = false;
        var isInConfigPage = false;
        var lastRequestUrl;

        function createHTML(html = "") {
            return escapeHTMLPolicy ? escapeHTMLPolicy.createHTML(html) : html;
        }

        var _GM_xmlhttpRequest, _GM_registerMenuCommand, _GM_notification, _GM_setClipboard, _GM_openInTab, _GM_addStyle, _GM_info, GM_fetch;
        if (typeof GM_xmlhttpRequest != 'undefined') {
            _GM_xmlhttpRequest = GM_xmlhttpRequest;
            GM_fetch = true;
        } else if (typeof GM != 'undefined' && typeof GM.xmlHttpRequest != 'undefined') {
            _GM_xmlhttpRequest = GM.xmlHttpRequest;
            GM_fetch = true;
        } else {//will not cross csp, it's safe!
            let res;
            _GM_xmlhttpRequest = (f) => {fetch(f.url, {method: f.method || 'GET', body: f.data, headers: f.headers}).then(response => {
                res = response;
                if (f.responseType === "blob") {
                    return response.blob();
                }
                return response.text();
            }).then(data => {
                let doc = document.implementation.createHTMLDocument('');
                doc.documentElement.innerHTML = createHTML(data);
                f.onload && f.onload({status: res.status, response: data, responseXML: doc})
            }).catch(e => f.onerror && f.onerror(e))};
        }
        if (GM_fetch) {
            GM_fetch = async (url, option) => {
                if (!url) return null;
                lastRequestUrl = url;
                return new Promise((resolve, reject) => {
                    let isPost = option && /^post$/i.test(option.method);
                    let requestOption = {
                        method: (option && option.method) || 'GET',
                        url: url,
                        headers: (option && option.headers) || {
                            referer: url,
                            origin: url,
                            "Content-Type": (isPost ? "application/x-www-form-urlencoded" : ""),
                            'X-Requested-With': (isPost ? 'XMLHttpRequest' : '')
                        },
                        onload: function(d) {
                            if (lastRequestUrl != url) return;
                            let response = d.response;
                            if (d.status >= 400 || !response) response = "";
                            let text = () => new Promise((r) => {
                                r(response);
                            });
                            let json = () => new Promise((r) => {
                                try {
                                    r(JSON.parse(response));
                                } catch (e) {
                                    r(null);
                                }
                            });
                            resolve({text: text, json: json, finalUrl: (d.finalUrl || url)});
                        },
                        onerror: function(e) {
                            debug(e);
                            reject(e);
                        },
                        ontimeout: function(e) {
                            debug(e);
                            reject(e);
                        }
                    };
                    if (option && option.body) {
                        requestOption.data = option.body;
                    }
                    if (option && option.responseType === "stream") {
                        requestOption.responseType = "stream";
                        delete requestOption.onload;
                        requestOption.onloadstart = d => {
                            if (!d || !d.response || !d.response.getReader) return;
                            let bytes = [], callBack, buffer;
                            const reader = d.response.getReader();
                            let json = () => {
                                let result = "";
                                try {
                                    if (buffer) {
                                        result = buffer.trim();
                                        if (/^data:/.test(result)) {
                                            result = "[" + result.replace(/^data:\s+\[DONE\]\s*/m, "").trim().replace(/\n+/g, "\n").split("\n").map(line => line.replace(/^data:/, "")).join(",") + "]";
                                        } else if (/^({.*} *\n)* *{.*}$/.test(result)) {
                                            result = result.split("\n").pop();
                                        } else if (/^\[[\s\S]+[^\]]$/.test(result)) {
                                            result = result + "]";
                                        }
                                    }
                                    return JSON.parse(result);
                                } catch (e) {
                                    return null;
                                }
                            };
                            reader.read().then(function readBytes({done, value}) {
                                if (lastRequestUrl != url) return;
                                if (done) {
                                    resolve({text: buffer, json: json, finalUrl: (d.finalUrl || url)});
                                    return;
                                }
                                bytes = option.streamMode === "standalone" ? Array.from(value) : bytes.concat(Array.from(value));
                                try {
                                    buffer = new TextDecoder('utf-8').decode(new Uint8Array(bytes));
                                    option.onstream({text: buffer, json: json, finalUrl: (d.finalUrl || url)});
                                } catch (e) {
                                    console.log(e);
                                }
                                return reader.read().then(readBytes);
                            });
                        };
                    }
                    _GM_xmlhttpRequest(requestOption);
                });
            }
        } else GM_fetch = fetch;
        if (inIframe) {
            _GM_registerMenuCommand = (s, f) => {};
        } else if (typeof GM_registerMenuCommand != 'undefined') {
            _GM_registerMenuCommand = GM_registerMenuCommand;
        } else if (typeof GM != 'undefined' && typeof GM.registerMenuCommand != 'undefined') {
            _GM_registerMenuCommand = GM.registerMenuCommand;
        } else {
            _GM_registerMenuCommand = (s, f) => {};
        }
        if (ext) {
            _GM_openInTab = (s, t) => {
                chrome.runtime.sendMessage({action: "openInTab", detail: {url: s, incognito: t && t.incognito, active: t && t.active, close: t && t.close}});
            };
        } else if (typeof GM_openInTab != 'undefined') {
            _GM_openInTab = GM_openInTab;
        } else if (typeof GM != 'undefined' && typeof GM.openInTab != 'undefined') {
            _GM_openInTab = GM.openInTab;
        } else {
            _GM_openInTab = (s, t) => {window.open(s)};
        }
        if (ext) {
            _GM_notification = s => {
                chrome.runtime.sendMessage({action: "notification", detail: {message: s}});
            }
        } else if (typeof GM_notification != 'undefined') {
            _GM_notification = s => GM_notification({text: s, onclick: e => _GM_openInTab(configPage, {active: true})});
        } else if (typeof GM != 'undefined' && typeof GM.notification != 'undefined') {
            _GM_notification = s => GM.notification({text: s, onclick: e => _GM_openInTab(configPage, {active: true})});
        } else {
            _GM_notification = (s) => {};
        }
        if (typeof GM_setClipboard != 'undefined') {
            _GM_setClipboard = GM_setClipboard;
        } else if (typeof GM != 'undefined' && typeof GM.setClipboard != 'undefined') {
            _GM_setClipboard = GM.setClipboard;
        } else {
            _GM_setClipboard = (s, i) => {
                try {
                    clipboard.writeText(s)
                        .then(() => {
                        console.log('Text copied to clipboard');
                    })
                        .catch((error) => {
                        document.execCommand('copy');
                        console.error('Failed to copy text: ', error);
                    });
                } catch (e) {
                    document.execCommand('copy');
                }
            };
        }
        _GM_addStyle = cssStr => {
            cssStr = cssStr.replace(/\n\s*/g, "");
            if (typeof GM_addStyle != 'undefined') {
                return GM_addStyle(cssStr);
            } else {
                let styleEle = document.createElement("style");
                styleEle.innerHTML = createHTML(cssStr);
                document.head.appendChild(styleEle);
                return styleEle;
            }
        };
        if (typeof GM_info != 'undefined') {
            _GM_info = GM_info;
        } else if (typeof GM != 'undefined' && typeof GM.info != 'undefined') {
            _GM_info = GM.info;
        } else {
            _GM_info = { script: {name: 'SearchJumper', version: 0} };
        }
        if (!_unsafeWindow.searchJumperAddons) _unsafeWindow.searchJumperAddons = [];
        const curRef = document.referrer;
        let href = location.href.slice(0, 500);

        var storage = {
            supportGM: typeof GM_getValue == 'function' && typeof GM_getValue('a', 'b') != 'undefined',
            supportGMPromise: typeof GM != 'undefined' && typeof GM.getValue == 'function' && typeof GM.getValue('a','b') != 'undefined',
            supportCrossSave: function() {
                return this.supportGM || this.supportGMPromise;
            },
            listItemCache: [],
            mxAppStorage: (function() {
                try {
                    return window.external.mxGetRuntime().storage;
                } catch(e) {
                }
            })(),
            operaUJSStorage: (function() {
                try {
                    return window.opera.scriptStorage;
                } catch(e) {
                }
            })(),
            setItem: function (key, value) {
                if (ext) {
                    chrome.storage.local.set({ [key]: value }, () => {});
                } else if (this.supportGMPromise) {
                    GM.setValue(key, value);
                    if(value === "" && typeof GM != 'undefined' && typeof GM.deleteValue != 'undefined'){
                        GM.deleteValue(key);
                    }
                } else if (this.supportGM) {
                    GM_setValue(key, value);
                    if(value === "" && typeof GM_deleteValue != 'undefined'){
                        GM_deleteValue(key);
                    }
                } else if (this.operaUJSStorage) {
                    this.operaUJSStorage.setItem(key, value);
                } else if (this.mxAppStorage) {
                    this.mxAppStorage.setConfig(key, value);
                } else if (window.localStorage) {
                    window.localStorage.setItem(key, value);
                }
            },
            getItem: async function (key, cb) {
                var value;
                if (ext) {
                    let result = await chrome.storage.local.get([key]);
                    value = result && result[key];
                } else if (this.supportGMPromise) {
                    value = await GM.getValue(key);
                } else if (this.supportGM) {
                    value = GM_getValue(key);
                } else if (this.operaUJSStorage) {
                    value = this.operaUJSStorage.getItem(key);
                } else if (this.mxAppStorage) {
                    value = this.mxAppStorage.getConfig(key);
                } else if (window.localStorage) {
                    value = window.localStorage.getItem(key);
                };
                if(cb) cb(value);
                return value;
            },
            getListItem: async function(list, key) {
                var listData = this.listItemCache[list];
                if (typeof listData === 'undefined') {
                    listData = await this.getItem(list);
                    this.listItemCache[list] = listData || null;
                }
                if (!listData) return null;
                for(var i = 0; i < listData.length; i++) {
                    let data = listData[i];
                    if (data.k == key) {
                        return data.v;
                    }
                }
                return null;
            },
            setListItem: async function(list, key, value) {
                var listData = this.listItemCache[list];
                if (typeof listData === 'undefined') {
                    listData = await this.getItem(list);
                }
                if (!listData) listData = [];
                listData = listData.filter(data => data && data.k != key);
                if (value) {
                    listData.unshift({k: key, v: value});
                    if (listData.length > 50) listData.pop();
                }
                this.setItem(list, listData);
                this.listItemCache[list] = listData;
            }
        };

        class WebDAV {
            constructor(webDAVUrl, username, password) {
                this.webDAVUrl = webDAVUrl;
                this.username = username;
                this.password = password;
            }

            init() {
                if (this.inited) return;
                this.inited = true;
                this.auth = btoa(`${this.username}:${this.password}`);
            }

            request(action, data, path, type, callback, headers) {
                if (ext) {
                    chrome.runtime.sendMessage({action: "webDAV", detail: {method: action, body: data, path: path, type: type, headers: headers}}, function(r) {
                        callback && callback(r);
                    });
                } else {
                    this.init();
                    let url = this.webDAVUrl + path;
                    let _headers = {
                        referer: url,
                        origin: url,
                        "Content-Type": "text/xml; charset=UTF-8",
                        "Authorization": `Basic ${this.auth}`
                    };
                    for (let header in headers) {
                        _headers[header] = headers[header];
                    }
                    _GM_xmlhttpRequest({
                        method: action,
                        url: url,
                        data: data,
                        headers: _headers,
                        onload: function(d) {
                            let response = d.response;
                            if (d.status >= 400 || !response) response = "";
                            if (type == 'xml') {
                                var xml = d.responseXML;
                                if(xml) {
                                    response = xml.firstChild.nextSibling ? xml.firstChild.nextSibling : xml.firstChild;
                                }
                            }
                            callback && callback(response);
                        },
                        onerror: function(e) {
                            debug(e);
                            callback && callback(e);
                        },
                        ontimeout: function(e) {
                            debug(e);
                            callback && callback(e);
                        }
                    });
                }
            }

            GET(path, callback) {
                return this.request('GET', null, path, 'text', callback, {});
            }

            PROPFIND(path, callback) {
                return this.request('PROPFIND', null, path, 'xml', callback, {Depth: "1"});
            }

            MKCOL(path, callback) {
                return this.request('MKCOL', null, path, 'text', callback, {});
            }

            DELETE(path, callback) {
                return this.request('DELETE', null, path, 'text', callback, {});
            }

            PUT(path, data, callback) {
                return this.request('PUT', data, path, 'text', callback, {});
            }

            async read(path) {
                let self = this;
                return new Promise((resolve) => {
                    self.GET(path, resolve);
                });
            }

            async write(path, data) {
                let self = this;
                return new Promise((resolve) => {
                    self.PUT(path, data, resolve);
                });
            }

            async rm(path) {
                let self = this;
                return new Promise((resolve) => {
                    self.DELETE(path, resolve);
                });
            }
        }
        var webDAV;
        async function dataChanged(callback, override) {
            if (shareEngines) return;
            let _searchData = await storage.getItem("searchData");
            if (_searchData) searchData = _searchData;
            if (!webDAV) return callback && callback();
            if (!override) {
                let _lastModified = await webDAV.read("lastModified");
                if (_lastModified) {
                    _lastModified = parseFloat(_lastModified);
                }
                if (_lastModified && (!searchData.lastModified || _lastModified > searchData.lastModified)) {
                    searchData.lastModified = _lastModified;
                    lastModified = searchData.lastModified;
                    let sitesConfig = await webDAV.read("sitesConfig.json");
                    if (sitesConfig) {
                        try {
                            sitesConfig = JSON.parse(sitesConfig);
                            searchData.sitesConfig = sitesConfig;
                        } catch (e) {
                            debug(e);
                        }
                    }

                    let inPageRule = await webDAV.read("inPageRule.json");
                    if (inPageRule) {
                        try {
                            inPageRule = JSON.parse(inPageRule);
                            searchData.prefConfig.inPageRule = inPageRule;
                        } catch (e) {
                            debug(e);
                        }
                    }
                }
            }
            callback && callback();
            await webDAV.write("lastModified", "" + searchData.lastModified);
            await webDAV.write("sitesConfig.json", JSON.stringify(searchData.sitesConfig));
            await webDAV.write("inPageRule.json", JSON.stringify(searchData.prefConfig.inPageRule));
        }





        function parseTrustedTypes(cspString) {
            const policies = new Set();
            let allowDuplicates = false;
            let ttDirectiveFound = false;
            const ttRegex = /trusted-types\s+([^;]+)/gi;
            let match;

            while ((match = ttRegex.exec(cspString)) !== null) {
                ttDirectiveFound = true;

                const policyNames = match[1].trim().split(/\s+/);
                for (const name of policyNames) {
                    if (name === "'allow-duplicates'") {
                        allowDuplicates = true;
                    } else if (name !== "'none'") {
                        policies.add(name.replace(/'/g, ''));
                    }
                }
            }
            return { names: policies, allowDuplicates: allowDuplicates, ttDirectiveFound: ttDirectiveFound };
        }

        async function getCspTrustedTypesInfo() {
            const combinedPolicies = new Set();
            let combinedAllowDuplicates = false;
            let combinedTtDirectiveFound = false;

            const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            if (meta) {
                const metaResult = parseTrustedTypes(meta.content);
                metaResult.names.forEach(name => combinedPolicies.add(name));
                if (metaResult.allowDuplicates) {
                    combinedAllowDuplicates = true;
                }
                if (metaResult.ttDirectiveFound) {
                    combinedTtDirectiveFound = true;
                }
            }

            return new Promise((resolve) => {
                GM_xmlhttpRequest({
                    method: "HEAD",
                    url: window.location.href,
                    onload: function(response) {
                        const cspHeader = response.responseHeaders.split('\r\n')
                        .filter(h => h.toLowerCase().startsWith('content-security-policy:'))
                        .map(h => h.substring(26).trim())
                        .join('; ');

                        const headerResult = parseTrustedTypes(cspHeader);
                        headerResult.names.forEach(name => combinedPolicies.add(name));
                        if (headerResult.allowDuplicates) {
                            combinedAllowDuplicates = true;
                        }
                        if (headerResult.ttDirectiveFound) {
                            combinedTtDirectiveFound = true;
                        }

                        resolve({
                            names: combinedPolicies,
                            allowDuplicates: combinedAllowDuplicates,
                            ttDirectiveFound: combinedTtDirectiveFound
                        });
                    },
                    onerror: function(error) {
                        resolve({
                            names: combinedPolicies,
                            allowDuplicates: combinedAllowDuplicates,
                            ttDirectiveFound: combinedTtDirectiveFound
                        });
                    }
                });
            });
        }

        function isTrustedTypesEnforced() {
            try {
                document.createElement('div').innerHTML = '';
                return false;
            } catch (e) {
                return true;
            }
        }

        async function createPolicy() {
            if (!(_unsafeWindow.trustedTypes && _unsafeWindow.trustedTypes.createPolicy && isTrustedTypesEnforced())) {
                return;
            }

            const { names: allowedNames, allowDuplicates, ttDirectiveFound } = await getCspTrustedTypesInfo();

            if (ttDirectiveFound && !allowDuplicates) {
                debug("CSP Trusted Types is enforced without 'allow-duplicates'. " +
                      "Skipping policy creation to avoid conflicts with the page.");
                return;
            }

            const MY_POLICY_NAME = 'pvcep_default';

            try {
                escapeHTMLPolicy = _unsafeWindow.trustedTypes.createPolicy(MY_POLICY_NAME, {
                    createHTML: (string, sink) => string,
                    createScriptURL: string => string,
                    createScript: string => string
                });
                return;
            } catch (e) {
            }

            const existingPolicies = new Set(_unsafeWindow.trustedTypes.getPolicyNames());
            for (const name of allowedNames) {
                if (name === '*' || existingPolicies.has(name)) {
                    continue;
                }

                try {
                    escapeHTMLPolicy = _unsafeWindow.trustedTypes.createPolicy(name, {
                        createHTML: (string, sink) => string,
                        createScriptURL: string => string,
                        createScript: string => string
                    });
                    return;
                } catch (e) {
                    debug(`create '${name}' failed, trying next...`);
                }
            }
            debug("Could not create any trusted types policy.");
        }

        var escapeHTMLPolicy;
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

        if (typeof String.prototype.replaceAll != 'function') {
            String.prototype.replaceAll = function(search, replacement) {
                var target = this;
                return target.split(search).join(replacement);
            };
        }
        if (typeof String.prototype.endsWith != 'function') {
            String.prototype.endsWith = function(search, this_len) {
                if (this_len === undefined || this_len > this.length) {
                    this_len = this.length;
                }
                return this.substring(this_len - search.length, this_len) === search;
            };
        }
        if (typeof String.prototype.startsWith != 'function') {
            String.prototype.startsWith = function(search, pos){
                return this.slice(pos || 0, search.length) === search;
            };
        }

        function getBody(doc) {
            return doc.body || doc.querySelector('body');
        }

        function clientX(e) {
            if (e.type.indexOf('touch') === 0) {
                return e.changedTouches ? e.changedTouches[0].clientX : 0;
            } else {
                return e.clientX;
            }
        }

        function clientY(e) {
            if (e.type.indexOf('touch') === 0) {
                return e.changedTouches ? e.changedTouches[0].clientY : 0;
            } else {
                return e.clientY;
            }
        }

        function pageX(e) {
            if (e.type.indexOf('touch') === 0) {
                return e.changedTouches ? e.changedTouches[0].pageX : 0;
            } else {
                return e.pageX;
            }
        }

        function pageY(e) {
            if (e.type.indexOf('touch') === 0) {
                return e.changedTouches ? e.changedTouches[0].pageY : 0;
            } else {
                return e.pageY;
            }
        }

        function getAllElementsByXpath(xpath, contextNode, doc) {
            doc = doc || document;
            contextNode = contextNode || doc;
            var result = [];
            try {
                var query = doc.evaluate(xpath, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                for (var i = 0; i < query.snapshotLength; i++) {
                    var node = query.snapshotItem(i);
                    if (node.nodeType === 1) result.push(node);
                }
            } catch (err) {
                debug(`Invalid xpath: ${xpath}`);
            }
            return result;
        }

        function getElementByXpath(xpath, contextNode, doc) {
            doc = doc || document;
            contextNode = contextNode || doc;
            try {
                let xpathNode = (s, d, n) => {
                    let result = d.evaluate(s, n, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null);
                    return result.singleNodeValue && result.singleNodeValue.nodeType === 1 && result.singleNodeValue;
                };
                let selSplit = xpath.split(" =>> ");
                if (selSplit.length === 2) {
                    let ele = xpathNode(selSplit[0], doc, contextNode);
                    if (ele && ele.shadowRoot) {
                        return xpathNode(selSplit[1], ele.shadowRoot, ele.shadowRoot);
                    }
                } else {
                    return xpathNode(xpath, doc, contextNode);
                }
            } catch (err) {
                debug(`Invalid xpath: ${xpath}`);
                return false;
            }
        }

        function isXPath(xpath) {
            if (!xpath) return false;
            return /^\(*(descendant::|\.\/|\/\/|id\()/.test(xpath);
        }

        function getAllElements(sel, doc, contextNode) {
            if (!doc) doc = document;
            try {
                if (!isXPath(sel)) {
                    return doc.querySelectorAll(sel);
                }
            } catch(e) {
                debug(e, 'Error selector');
            }
            return getAllElementsByXpath(sel, contextNode, doc);
        }

        function getElement(sel, doc) {
            if (!doc) doc = document;
            try {
                if (!isXPath(sel)) {
                    let selSplit = sel.split(" =>> ");
                    if (selSplit.length === 2) {
                        let ele = doc.querySelector(selSplit[0]);
                        return ele && ele.shadowRoot && ele.shadowRoot.querySelector(selSplit[1]);
                    } else return doc.querySelector(sel);
                }
            } catch(e) {
                debug(e);
            }
            return getElementByXpath(sel, doc, doc);
        }

        function getElementTop(ele, targetIframe) {
            var actualTop = ele.offsetTop;
            var current = ele.offsetParent;
            while (current) {
                actualTop += current.offsetTop;
                current = current.offsetParent;
            }
            if (targetIframe) {
                current = targetIframe;
                while (current) {
                    actualTop += current.offsetTop;
                    current = current.offsetParent;
                }
                try {
                    let currentWindow = targetIframe.contentWindow.parent;
                    targetIframe = currentWindow.frameElement;
                    while (targetIframe) {
                        current = targetIframe;
                        while (current) {
                            actualTop += current.offsetTop;
                            current = current.offsetParent;
                        }

                        currentWindow = currentWindow.parent;
                        targetIframe = currentWindow.frameElement;
                    }
                } catch(e) {}
            }
            return actualTop;
        }

        function getElementLeft(ele) {
            var actualLeft = ele.offsetLeft;
            var current = ele.offsetParent;
            while (current) {
                actualLeft += current.offsetLeft;
                current = current.offsetParent;
            }
            if (!document.isSameNode(ele.ownerDocument)) {
                let iframes = document.getElementsByTagName("iframe");
                for (let i = 0; i < iframes.length; i++) {
                    let iframe = iframes[i];
                    let iframeDoc;
                    try {
                        iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    } catch(e) {
                        break;
                    }
                    if (iframeDoc.isSameNode(ele.ownerDocument)) {
                        current = iframe;
                        while (current) {
                            actualLeft += current.offsetLeft;
                            current = current.offsetParent;
                        }
                        break;
                    }
                }
            }
            return actualLeft;
        }

        function getActiveElement(root) {
            const activeEl = root.activeElement;
            if (!activeEl) {
                return null;
            }
            if (activeEl.shadowRoot) {
                return getActiveElement(activeEl.shadowRoot);
            } else {
                return activeEl;
            }
        }

        function isInput(ele) {
            if (ele &&
                ((/INPUT|TEXTAREA/i.test(ele.nodeName) &&
                  ele.getAttribute("aria-readonly") != "true"
                 ) ||
                 ele.contentEditable == 'true'
                )
               ) {
                return true;
            } else {
                while (ele && ele.nodeName) {
                    if (ele.contentEditable == 'true') return true;
                    if (ele.nodeName.toUpperCase() == 'BODY') {
                        break;
                    }
                    ele = ele.parentNode;
                }
            }
            return false;
        }

        function inputActive(doc) {
            let activeEl = getActiveElement(doc);
            return isInput(activeEl);
        }

        async function waitForFontAwesome(callback) {
            while (document.hidden) {
                await sleep(500);
            }
            var retries = 100;
            var text = '\uf0c8';
            var checkReady = function() {
                var canvas, context;
                retries -= 1;
                canvas = document.createElement('canvas');
                canvas.width = 20;
                canvas.height = 20;
                context = canvas.getContext('2d', { willReadFrequently: true });
                context.fillStyle = 'rgba(0,0,0,1.0)';
                context.fillRect( 0, 0, 20, 20 );
                context.font = '16pt FontAwesome';
                context.textAlign = 'center';
                context.fillStyle = 'rgba(255,255,255,1.0)';
                context.fillText(text, 10, 18 );
                var data = context.getImageData( 2, 10, 1, 1 ).data;
                if ( data[0] == 0 && data[1] == 0 && data[2] == 0 ) {
                    context.font = '16pt "Font Awesome 6 Free"';
                    context.fillText(text, 10, 18 );
                    data = context.getImageData( 2, 10, 1, 1 ).data;
                    if ( data[0] == 0 && data[1] == 0 && data[2] == 0 ) {
                        if ( retries > 0 ) {
                            setTimeout( checkReady, 150 );
                        }
                    } else if ( typeof callback === 'function' ) {
                        callback();
                    }
                } else {
                    if ( typeof callback === 'function' ) {
                        callback();
                    }
                }
            }

            setTimeout( checkReady, 100 );
        }

        var logoBtn, searchBar, searchTypes = [], currentSite = false, disableState = false, cacheKeywords, cacheFilter, tipsStorage, localKeywords, lastSign, inPagePostParams, cacheIcon, historySites, historyType, sortTypeNames, sortSiteNames, cachePool = [], cacheFontPool = [], currentFormParams, globalInPageWords, navEnable, referrer, clickLink, disableHighlight, lastHighlight, lastAddType, allPageNewMode = false, lastModified = 0, allPageBgUrl;
        const logoBtnSvg = `<svg class="search-jumper-logoBtnSvg" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><title>${_GM_info.script.name}</title><path d="M.736 510.464c0-281.942 228.335-510.5 510-510.5 135.26 0 264.981 53.784 360.625 149.522 95.643 95.737 149.375 225.585 149.375 360.978 0 281.94-228.335 510.5-510 510.5-281.665 0-510-228.56-510-510.5zm510-510.5v1021m-510-510.5h1020" fill="#fefefe"/><path d="M237.44 346.624a48.64 48.64 0 1 0 97.28 0 48.64 48.64 0 1 0-97.28 0zM699.904 346.624a48.64 48.64 0 1 0 97.28 0 48.64 48.64 0 1 0-97.28 0zM423.296 759.296c-64 0-115.712-52.224-115.712-115.712 0-26.624 9.216-52.224 25.6-72.704 9.216-11.776 26.112-13.312 37.888-4.096s13.312 26.112 4.096 37.888c-9.216 11.264-13.824 24.576-13.824 38.912 0 34.304 27.648 61.952 61.952 61.952s61.952-27.648 61.952-61.952c0-4.096-.512-8.192-1.024-11.776-2.56-14.848 6.656-28.672 21.504-31.744 14.848-2.56 28.672 6.656 31.744 21.504 1.536 7.168 2.048 14.336 2.048 22.016-.512 63.488-52.224 115.712-116.224 115.712z" fill="#333"/><path d="M602.08 760.296c-64 0-115.712-52.224-115.712-115.712 0-14.848 12.288-27.136 27.136-27.136s27.136 12.288 27.136 27.136c0 34.304 27.648 61.952 61.952 61.952s61.952-27.648 61.952-61.952c0-15.36-5.632-30.208-15.872-41.472-9.728-11.264-9.216-28.16 2.048-37.888 11.264-9.728 28.16-9.216 37.888 2.048 19.456 21.504 29.696 48.64 29.696 77.824 0 62.976-52.224 115.2-116.224 115.2z" fill="#333"/><ellipse ry="58" rx="125" cy="506.284" cx="201.183" fill="#faf"/><ellipse ry="58" rx="125" cy="506.284" cx="823.183" fill="#faf"/></svg>`;
        const searchSvg = `<svg width="25" height="25" xmlns="http://www.w3.org/2000/svg" fill="currentcolor" viewBox="0 0 52.966 52.966"><path d="M51.704 51.273L36.844 35.82c3.79-3.8 6.14-9.04 6.14-14.82 0-11.58-9.42-21-21-21s-21 9.42-21 21 9.42 21 21 21c5.082 0 9.747-1.817 13.383-4.832l14.895 15.49c.196.206.458.308.72.308.25 0 .5-.093.694-.28.398-.382.41-1.015.028-1.413zM21.984 40c-10.478 0-19-8.523-19-19s8.522-19 19-19 19 8.523 19 19-8.525 19-19 19z"></path></svg>`;
        const logoBase64 = "data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic2VhcmNoLWp1bXBlci1sb2dvQnRuU3ZnIiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0uNzM2IDUxMC40NjRjMC0yODEuOTQyIDIyOC4zMzUtNTEwLjUgNTEwLTUxMC41IDEzNS4yNiAwIDI2NC45ODEgNTMuNzg0IDM2MC42MjUgMTQ5LjUyMiA5NS42NDMgOTUuNzM3IDE0OS4zNzUgMjI1LjU4NSAxNDkuMzc1IDM2MC45NzggMCAyODEuOTQtMjI4LjMzNSA1MTAuNS01MTAgNTEwLjUtMjgxLjY2NSAwLTUxMC0yMjguNTYtNTEwLTUxMC41em01MTAtNTEwLjV2MTAyMW0tNTEwLTUxMC41aDEwMjAiIGZpbGw9IiNmZWZlZmUiLz48cGF0aCBkPSJNMjM3LjQ0IDM0Ni42MjRhNDguNjQgNDguNjQgMCAxIDAgOTcuMjggMCA0OC42NCA0OC42NCAwIDEgMC05Ny4yOCAwek02OTkuOTA0IDM0Ni42MjRhNDguNjQgNDguNjQgMCAxIDAgOTcuMjggMCA0OC42NCA0OC42NCAwIDEgMC05Ny4yOCAwek00MjMuMjk2IDc1OS4yOTZjLTY0IDAtMTE1LjcxMi01Mi4yMjQtMTE1LjcxMi0xMTUuNzEyIDAtMjYuNjI0IDkuMjE2LTUyLjIyNCAyNS42LTcyLjcwNCA5LjIxNi0xMS43NzYgMjYuMTEyLTEzLjMxMiAzNy44ODgtNC4wOTZzMTMuMzEyIDI2LjExMiA0LjA5NiAzNy44ODhjLTkuMjE2IDExLjI2NC0xMy44MjQgMjQuNTc2LTEzLjgyNCAzOC45MTIgMCAzNC4zMDQgMjcuNjQ4IDYxLjk1MiA2MS45NTIgNjEuOTUyczYxLjk1Mi0yNy42NDggNjEuOTUyLTYxLjk1MmMwLTQuMDk2LS41MTItOC4xOTItMS4wMjQtMTEuNzc2LTIuNTYtMTQuODQ4IDYuNjU2LTI4LjY3MiAyMS41MDQtMzEuNzQ0IDE0Ljg0OC0yLjU2IDI4LjY3MiA2LjY1NiAzMS43NDQgMjEuNTA0IDEuNTM2IDcuMTY4IDIuMDQ4IDE0LjMzNiAyLjA0OCAyMi4wMTYtLjUxMiA2My40ODgtNTIuMjI0IDExNS43MTItMTE2LjIyNCAxMTUuNzEyeiIgZmlsbD0iIzMzMyIvPjxwYXRoIGQ9Ik02MDIuMDggNzYwLjI5NmMtNjQgMC0xMTUuNzEyLTUyLjIyNC0xMTUuNzEyLTExNS43MTIgMC0xNC44NDggMTIuMjg4LTI3LjEzNiAyNy4xMzYtMjcuMTM2czI3LjEzNiAxMi4yODggMjcuMTM2IDI3LjEzNmMwIDM0LjMwNCAyNy42NDggNjEuOTUyIDYxLjk1MiA2MS45NTJzNjEuOTUyLTI3LjY0OCA2MS45NTItNjEuOTUyYzAtMTUuMzYtNS42MzItMzAuMjA4LTE1Ljg3Mi00MS40NzItOS43MjgtMTEuMjY0LTkuMjE2LTI4LjE2IDIuMDQ4LTM3Ljg4OCAxMS4yNjQtOS43MjggMjguMTYtOS4yMTYgMzcuODg4IDIuMDQ4IDE5LjQ1NiAyMS41MDQgMjkuNjk2IDQ4LjY0IDI5LjY5NiA3Ny44MjQgMCA2Mi45NzYtNTIuMjI0IDExNS4yLTExNi4yMjQgMTE1LjJ6IiBmaWxsPSIjMzMzIi8+PGVsbGlwc2Ugcnk9IjU4IiByeD0iMTI1IiBjeT0iNTA2LjI4NCIgY3g9IjIwMS4xODMiIGZpbGw9IiNmYWYiLz48ZWxsaXBzZSByeT0iNTgiIHJ4PSIxMjUiIGN5PSI1MDYuMjg0IiBjeD0iODIzLjE4MyIgZmlsbD0iI2ZhZiIvPjwvc3ZnPg==";
        const noImgBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNNDI5LjAxMzMzMyA2NDBBMzIgMzIgMCAwIDEgMzg0IDU5NC45ODY2NjdsMzcuNzYtMzcuNzYtMjIuODI2NjY3LTIyLjYxMzMzNC0xMzUuNjggMTM1LjY4IDkwLjQ1MzMzNCA5MC40NTMzMzQgMTM1LjY4LTEzNS42OC0yMi42MTMzMzQtMjIuNjEzMzM0ek01MzQuNjEzMzMzIDM5OC45MzMzMzNsMjIuNjEzMzM0IDIyLjYxMzMzNEw1OTQuOTg2NjY3IDM4NEEzMiAzMiAwIDAgMSA2NDAgNDI5LjAxMzMzM2wtMzcuNzYgMzcuNzYgMjIuNjEzMzMzIDIyLjYxMzMzNCAxMzUuNjgtMTM1LjY4LTkwLjQ1MzMzMy05MC40NTMzMzR6IiBmaWxsPSIjNUU1QzVDIj48L3BhdGg+PHBhdGggZD0iTTUxMiAyMS4zMzMzMzNhNDkwLjY2NjY2NyA0OTAuNjY2NjY3IDAgMSAwIDQ5MC42NjY2NjcgNDkwLjY2NjY2N0E0OTAuNjY2NjY3IDQ5MC42NjY2NjcgMCAwIDAgNTEyIDIxLjMzMzMzM3ogbTMxNi44IDM1NC45ODY2NjdsLTE4MS4xMiAxODEuMTJhMzIgMzIgMCAwIDEtNDUuMjI2NjY3IDBMNTU3LjIyNjY2NyA1MTIgNTEyIDU1Ny4yMjY2NjdsNDUuMjI2NjY3IDQ1LjIyNjY2NmEzMiAzMiAwIDAgMSAwIDQ1LjIyNjY2N2wtMTgxLjEyIDE4MS4xMmEzMiAzMiAwIDAgMS00NS4yMjY2NjcgMGwtMTM1LjY4LTEzNS42OGEzMiAzMiAwIDAgMSAwLTQ1LjIyNjY2N2wxODEuMTItMTgxLjEyYTMyIDMyIDAgMCAxIDQ1LjIyNjY2NyAwTDQ2Ni43NzMzMzMgNTEyIDUxMiA0NjYuNzczMzMzbC00NS4yMjY2NjctNDUuMjI2NjY2YTMyIDMyIDAgMCAxIDAtNDUuMjI2NjY3bDE4MS4xMi0xODEuMTJhMzIgMzIgMCAwIDEgNDUuMjI2NjY3IDBsMTM1LjY4IDEzNS42OGEzMiAzMiAwIDAgMSAwIDQ1LjIyNjY2N3oiIGZpbGw9IiM1RTVDNUMiPjwvcGF0aD4KPC9zdmc+";
        const closePath = '<path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m165.4 618.2l-66-0.3L512 563.4l-99.3 118.4-66.1 0.3c-4.4 0-8-3.5-8-8 0-1.9 0.7-3.7 1.9-5.2l130.1-155L340.5 359c-1.2-1.5-1.9-3.3-1.9-5.2 0-4.4 3.6-8 8-8l66.1 0.3L512 464.6l99.3-118.4 66-0.3c4.4 0 8 3.5 8 8 0 1.9-0.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path>';
        const wordParam = "%s[lurest]?\\b";
        const wordParamReg = new RegExp(wordParam);
        var targetElement, hoverElement, cssText, mainStyleEle;
        var inMinMode = false;

        function sloarToLunar(sy, sm, sd) {
            if (!sy && !sm && !sd) {
                let now = new Date();
                let year = now.getFullYear(), month = now.getMonth(), date = now.getDate();
                sy = now.getFullYear();
                sm = now.getMonth() + 1;
                sd = now.getDate();
            }
            let firstYear = 2000;
            let firsrMonth = 2;
            let firstDay = 5;
            let lunarYearArr = [
                0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, //2000-2009
                0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, //2010-2019
                0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, //2020-2029
                0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, //2030-2039
                0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, //2040-2049
                0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, //2050-2059
                0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, //2060-2069
                0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, //2070-2079
                0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, //2080-2089
                0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, //2090-2099
                0x0d520 //2100
            ],
                lunarMonth = '正二三四五六七八九十冬臘',
                lunarDay = '一二三四五六七八九十初廿',
                tianGan = '甲乙丙丁戊己庚辛壬癸',
                diZhi = '子丑寅卯辰巳午未申酉戌亥',
                shengxiao = '鼠牛虎兔龍蛇馬羊猴雞狗豬';

            function sloarToLunar(sy, sm, sd) {
                sm -= 1;

                let daySpan = (Date.UTC(sy, sm, sd) - Date.UTC(firstYear, firsrMonth - 1, firstDay)) / (24 * 60 * 60 * 1000) + 1;
                let ly, lm, ld;
                let lunarData;
                for (let j = 0; j < lunarYearArr.length; j++) {
                    daySpan -= lunarYearDays(lunarYearArr[j]);
                    if (daySpan <= 0) {
                        ly = firstYear + j;
                        lunarData = lunarYearArr[j];
                        daySpan += lunarYearDays(lunarData);
                        break
                    }
                }
                if (!lunarData) return null;

                for (let k = 0; k < lunarYearMonths(lunarData).length; k++) {
                    daySpan -= lunarYearMonths(lunarData)[k];
                    if (daySpan <= 0) {
                        if (hasLeapMonth(lunarData) && hasLeapMonth(lunarData) <= k) {
                            if (hasLeapMonth(lunarData) < k) {
                                lm = k;
                            } else if (hasLeapMonth(lunarData) === k) {
                                lm = '闰' + k;
                            } else {
                                lm = k + 1;
                            }
                        } else {
                            lm = k + 1;
                        }
                        daySpan += lunarYearMonths(lunarData)[k];
                        break
                    }
                }

                ld = daySpan;

                if (hasLeapMonth(lunarData) && (typeof (lm) === 'string' && lm.indexOf('闰') > -1)) {
                    lm = `闰${lunarMonth[/\d/.exec(lm) - 1]}`
                } else {
                    lm = lunarMonth[lm - 1];
                }

                ly = getTianGan(ly) + getDiZhi(ly);

                if (ld < 11) {
                    ld = `${lunarDay[10]}${lunarDay[ld-1]}`
                } else if (ld > 10 && ld < 20) {
                    ld = `${lunarDay[9]}${lunarDay[ld-11]}`
                } else if (ld === 20) {
                    ld = `${lunarDay[1]}${lunarDay[9]}`
                } else if (ld > 20 && ld < 30) {
                    ld = `${lunarDay[11]}${lunarDay[ld-21]}`
                } else if (ld === 30) {
                    ld = `${lunarDay[2]}${lunarDay[9]}`
                }


                return {
                    lunarYear: ly,
                    lunarMonth: lm,
                    lunarDay: ld,
                }
            }

            function hasLeapMonth(ly) {
                if (ly & 0xf) {
                    return ly & 0xf
                } else {
                    return false
                }
            }

            function leapMonthDays(ly) {
                if (hasLeapMonth(ly)) {
                    return (ly & 0xf0000) ? 30 : 29
                } else {
                    return 0
                }
            }

            function lunarYearDays(ly) {
                let totalDays = 0;

                for (let i = 0x8000; i > 0x8; i >>= 1) {
                    let monthDays = (ly & i) ? 30 : 29;
                    totalDays += monthDays;
                }
                if (hasLeapMonth(ly)) {
                    totalDays += leapMonthDays(ly);
                }

                return totalDays
            }

            function lunarYearMonths(ly) {
                let monthArr = [];

                for (let i = 0x8000; i > 0x8; i >>= 1) {
                    monthArr.push((ly & i) ? 30 : 29);
                }
                if (hasLeapMonth(ly)) {
                    monthArr.splice(hasLeapMonth(ly), 0, leapMonthDays(ly));
                }

                return monthArr
            }

            function getTianGan(ly) {
                let tianGanKey = (ly - 3) % 10;
                if (tianGanKey === 0) tianGanKey = 10;
                return tianGan[tianGanKey - 1]
            }

            function getDiZhi(ly) {
                let diZhiKey = (ly - 3) % 12;
                if (diZhiKey === 0) diZhiKey = 12;
                diZhiKey--;
                return diZhi[diZhiKey] + ` (${shengxiao[diZhiKey]}) `
            }
            return sloarToLunar(sy, sm, sd)
        }

        class SearchBar {
            constructor() {
                let self = this;
                this.scale = searchData.prefConfig.customSize / 100;
                this.tilesZoom = searchData.prefConfig.tilesZoom / 100;
                this.tipsZoom = searchData.prefConfig.tipsZoom / 100;
                cssText = `
                 #search-jumper {
                     font-size: 16px;
                 }
                 #search-jumper-root {
                     font-size: initial;
                 }
                 #search-jumper.search-jumper-showall {
                     overflow-y: hidden;
                     pointer-events: all;
                     overscroll-behavior: contain;
                     -ms-scroll-chaining: contain;
                     flex-direction: unset;
                     max-width: unset;
                     max-height: unset;
                     text-align: center;
                     top: 0;
                     bottom: unset;
                     height: 100%;
                 }
                 #search-jumper.search-jumper-showall>.search-jumper-searchBar {
                     display: none;
                 }
                 #search-jumper>.search-jumper-searchBar.grabbing>.search-jumper-type {
                     display: none!important;
                 }
                 #search-jumper.search-jumper-showall #filterSites {
                     background-color: #f5f5f5e0;
                     border: none;
                     height: 40px;
                     margin-bottom: 0;
                     padding: 5px;
                     margin: 0 10px;
                     box-shadow: #ddd 0px 0px 3px;
                     outline: none;
                     box-sizing: border-box;
                     cursor: default;
                     user-select: none;
                     -webkit-user-select: none;
                     -moz-user-select: none;
                     -khtml-user-select: none;
                     -ms-user-select: none;
                     position: fixed;
                     width: 80%;
                     left: calc(10% - 10px);
                     top: 1%;
                     border-radius: 20px;
                     pointer-events: all;
                 }
                 #search-jumper.search-jumper-showall #filterSites>input,
                 #search-jumper.search-jumper-showall #filterSites>textarea {
                     background-color: white;
                     color: black;
                     border: none;
                     outline: none;
                     box-sizing: border-box;
                     font-size: 20px;
                     cursor: text;
                 }
                 #search-jumper.search-jumper-showall #filterSites>span {
                     display: none;
                 }
                 #search-jumper.search-jumper-showall #search-jumper-alllist .sitelist {
                     visibility: visible!important;
                     opacity: 1;
                     pointer-events: all;
                     text-align: left;
                     position: static;
                     display: block!important;
                     height: fit-content;
                     max-height: calc(100vh - 110px);
                     overscroll-behavior: contain;
                     -ms-scroll-chaining: contain;
                 }
                 #search-jumper.search-jumper-showall #search-jumper-alllist .sitelist:hover {
                     opacity: 1;
                 }
                 #search-jumper.search-jumper-showall #search-jumper-alllist .sitelist>.sitelistCon {
                     opacity: 1;
                 }
                 #search-jumper.search-jumper-showall #search-jumper-alllist .sitelist>.sitelistCon>p {
                     pointer-events: all;
                     cursor: pointer;
                     margin: 0 auto;
                 }
                 #search-jumper.search-jumper-showall.searching #search-jumper-alllist .sitelist>.sitelistCon a {
                     display: flex!important;
                 }
                 #search-jumper.search-jumper-showall #search-jumper-alllist .sitelist:hover {
                     z-index: 1;
                 }
                 #search-jumper.search-jumper-showall.search-jumper-searchBarCon {
                     -ms-overflow-style: unset;
                     scrollbar-width: unset;
                     overflow: hidden;
                 }
                 #search-jumper-alllist {
                     display: none;
                     top: 101px;
                     position: absolute;
                     width: 100%;
                     overflow-x: auto;
                     overflow-y: hidden;
                     height: calc(100% - 101px);
                     overscroll-behavior: contain;
                     -ms-scroll-chaining: contain;
                 }
                 #search-jumper-alllist>.search-jumper-btn {
                     position: fixed;
                     top: 1%;
                     right: 10%;
                     filter: drop-shadow(1px 1px 3px #00000060);
                     cursor: pointer;
                     pointer-events: all;
                     z-index: 1;
                     width: 32px;
                     height: 32px;
                 }
                 #search-jumper-alllist>.search-jumper-btn>svg {
                     cursor: pointer;
                     width: 32px;
                     height: 32px;
                 }
                 .search-jumper-showallBg {
                     display: none;
                     position: fixed;
                     left: 0;
                     top: 0;
                     width: 100%;
                     height: 100%;
                     z-index: -1;
                     transform: translateZ(0);
                     ${searchData.prefConfig.noAni ? "background-color: rgba(0, 0, 0, 0.6);" : (
                    "background-color: rgba(0, 0, 0, 0.6);" +
                    //"backdrop-filter: blur(5px);" +
                    //"-webkit-backdrop-filter: blur(5px);" +
                    "transition:background-color .6s ease;")}
                 }
                 #search-jumper.search-jumper-showall>#search-jumper-alllist:hover~.search-jumper-showallBg {
                     background-color: rgba(0, 0, 0, 0.8);
                 }
                 #search-jumper.search-jumper-showall #search-jumper-alllist>.sitelistBox:hover .sitelist {
                     opacity: 0.5;
                 }
                 #search-jumper.search-jumper-showall #search-jumper-alllist>.sitelistBox .sitelist:hover {
                     opacity: 1;
                 }
                 #search-jumper.search-jumper-showall>.search-jumper-showallBg {
                     display: block;
                 }
                 #search-jumper>.groupTab {
                     position: fixed;
                     background: #ffffffee !important;
                     left: 0;
                     top: 0;
                     overflow: hidden;
                     height: 100%;
                     overflow: auto;
                     scrollbar-width: none;
                     padding: 20px 0;
                     box-sizing: border-box;
                     display: none;
                     z-index: 1;
                 }
                 #search-jumper.search-jumper-showall>#search-jumper-alllist.new-mode+.groupTab {
                     display: block;
                 }
                 #search-jumper.search-jumper-showall>.groupTab::-webkit-scrollbar {
                     width: 0 !important;
                     height: 0 !important;
                 }
                 #search-jumper.search-jumper-showall>.groupTab>span {
                     display: block;
                     width: ${42 * this.scale}px;
                     transition: all 0.25s ease;
                     cursor: pointer;
                 }
                 #search-jumper.search-jumper-showall>.groupTab>span>span.search-jumper-word {
                     opacity: 0.8;
                 }
                 #search-jumper.search-jumper-showall>.groupTab:hover>span {
                     width: ${42 * this.scale + 150}px;
                 }
                 #search-jumper.search-jumper-showall>.groupTab>span:hover{
                     background: #f5f7fa !important;
                 }
                 #search-jumper.search-jumper-showall>.groupTab:hover>span::after {
                     content: attr(data-type);
                     color: #6b6e74;
                     position: absolute;
                     margin-top: -${21 * this.scale + 10}px;
                     left: ${42 * this.scale + 5}px;
                     white-space: nowrap;
                     font-weight: bold;
                 }
                 .search-jumper-historylistcon {
                     display: flex;
                     position: fixed;
                     width: 100%;
                     max-width: 100%;
                     overflow: auto;
                     justify-content: center;
                     left: 0;
                     top: 60px;
                     background: #ffffffee;
                     border-bottom: 1px solid #ddd;
                     pointer-events: all;
                     min-height: 40px;
                     -ms-overflow-style: unset;
                     scrollbar-width: unset;
                 }
                 .search-jumper-historylistcon::-webkit-scrollbar {
                     width: 0 !important;
                     height: 0 !important;
                 }
                 .search-jumper-historylist {
                     display: flex;
                     max-width: 100%;
                 }
                 #search-jumper.search-jumper-showall #search-jumper-alllist {
                     display: block;
                 }
                 #search-jumper-alllist>.sitelistBox {
                     display: inline-flex;
                     justify-content: center;
                     width: fit-content;
                     min-height: 100%;
                     position: initial;
                     transition: all 0.3s ease;
                 }
                 #search-jumper-alllist>.timeInAll,
                 #search-jumper-alllist>.dayInAll {
                     position: fixed;
                     bottom: 0;
                     line-height: 1.5;
                     color: white;
                     opacity: 0.45;
                     font-weight: bold;
                     font-family: Arial,sans-serif,微软雅黑,"Noto Sans SC";
                     overflow-wrap: normal;
                     white-space: nowrap;
                     margin: 20px;
                     pointer-events: none;
                     text-shadow: 0 0 5px black;
                     background-image: initial;
                 }
                 #search-jumper-alllist>.dayInAll {
                     left: 50px;
                     font-size: ${lang.indexOf("zh") == 0 ? '1.5' : '2'}vw;
                 }
                 #search-jumper-alllist>.timeInAll {
                     right: 50px;
                     font-size: 2vw;
                 }
                 #search-jumper-alllist>.modeSwitch {
                     position: fixed;
                     top: 5px;
                     right: 5px;
                     width: 45px;
                     height: 45px;
                     border-radius: 50%;
                     box-shadow: 0px 0px 5px 0px #7a7a7a;
                     cursor: pointer;
                     transition: transform 0.25s ease;
                 }
                 #search-jumper-alllist>.modeSwitch>* {
                     pointer-events: none;
                 }
                 #search-jumper-alllist>.modeSwitch:hover {
                     transform: scale(1.1);
                 }
                 #search-jumper-alllist.new-mode {
                     overflow-x: hidden;
                     overflow-y: auto;
                     scrollbar-width: none;
                 }
                 #search-jumper-alllist.new-mode>.sitelistBox {
                     flex-wrap: wrap;
                     flex-direction: column;
                     align-items: center;
                     justify-content: flex-start;
                 }
                 #search-jumper.search-jumper-showall #search-jumper-alllist.new-mode .sitelist {
                     width: 78%;
                     max-height: unset;
                     height: auto !important;
                 }
                 #search-jumper.search-jumper-showall #search-jumper-alllist.new-mode .sitelist>.sitelistCon {
                     display: flex;
                     flex-wrap: wrap;
                     padding: 0;
                 }
                 #search-jumper.search-jumper-showall #search-jumper-alllist.new-mode .sitelist>.sitelistCon>p {
                     text-align: left;
                     font-size: large;
                     padding: 15px 30px;
                     display: table-caption;
                     width: 100%;
                 }
                 #search-jumper #search-jumper-alllist.new-mode .sitelist a {
                     width: 240px;
                     height: 100px;
                     display: block!important;
                     padding: 10px 8%;
                     box-sizing: border-box;
                 }
                 #search-jumper.search-jumper-showall.searching #search-jumper-alllist.new-mode .sitelist>.sitelistCon a {
                     display: block!important;
                 }
                 #search-jumper #search-jumper-alllist.new-mode .sitelist>.sitelistCon>div {
                     padding: 0 10px;
                     border-radius: 5px;
                     transition: transform 0.25s ease, box-shadow 0.25s ease;
                     box-shadow: 0 0 #0000, 0 0 #0000, 0 1px 3px #9e9e9e1a, 0 1px 2px -1px #9e9e9e1a;
                 }
                 #search-jumper #search-jumper-alllist.new-mode .sitelist>.sitelistCon>div:hover {
                     transform: translateY(-6px);
                     -webkit-transform: translateY(-6px);
                     -moz-transform: translateY(-6px);
                     box-shadow: 0 0 #0000, 0 0 #0000, 0 1px 3px #0000001a, 0 1px 2px -1px #0000001a;
                 }
                 #search-jumper #search-jumper-alllist.new-mode .sitelist>.sitelistCon>div:before {
                     content: attr(title);
                     margin-left: 41px;
                     color: #93959a;
                     font-size: 12px;
                     height: 3em;
                     line-height: 1.5em;
                     overflow: hidden;
                     display: -webkit-box;
                     -webkit-line-clamp: 2;
                     -webkit-box-orient: vertical;
                     margin-left: 62px;
                     margin-top: 35px;
                     width: 185px;
                     position: absolute;
                     pointer-events: none;
                 }
                 #search-jumper #search-jumper-alllist.new-mode .sitelist a>img {
                     width: 48px;
                     height: 48px;
                     float: left;
                     margin-left: -20px;
                     transform: scale(1);
                     transition: transform 0.5s ease;
                 }
                 #search-jumper #search-jumper-alllist.new-mode .sitelist a>p {
                     -webkit-line-clamp: 2;
                     -webkit-box-orient: vertical;
                     display: block;
                     font-weight: bold;
                     height: 21px;
                     line-height: 21px;
                     margin-bottom: 8px;
                     margin-top: 0px;
                     margin-left: 40px;
                     overflow: hidden;
                     text-overflow: ellipsis;
                     white-space: nowrap;
                     transition: color 0.5s ease;
                 }
                 #search-jumper #search-jumper-alllist.new-mode .sitelist a:hover>p {
                     color: #f1404b;
                 }
                 #search-jumper .sitelist a+p {
                     display: none;
                 }
                 #search-jumper #search-jumper-alllist.new-mode .sitelist a+p {
                     position: absolute;
                     margin-top: -28px;
                     color: white;
                     width: 250px;
                     max-width: calc(100% - 20px);
                     display: flex;
                     justify-content: space-evenly;
                     overflow: hidden;
                     opacity: 0;
                     transition: .3s;
                     border-top: 1px solid rgba(136,136,136,.2);
                     padding-top: 3px;
                 }
                 #search-jumper #search-jumper-alllist.new-mode .sitelist a+p>span {
                     flex-shrink: 0;
                     font-size: 14px;
                     padding: 2px 6px;
                     background: rgb(160 160 160 / 10%);
                     color: #888;
                     border-radius: 5px;
                     transition: .3s;
                     cursor: pointer;
                 }
                 #search-jumper #search-jumper-alllist.new-mode .sitelist a+p>span:hover {
                     background: rgb(160 160 160 / 20%);
                 }
                 #search-jumper #search-jumper-alllist.new-mode .sitelist a:hover>img {
                     transform: scale(1.1);
                 }
                 #search-jumper #search-jumper-alllist.new-mode .sitelistCon>div:hover>p {
                     opacity: 1;
                 }
                 #search-jumper #search-jumper-alllist.showbg>.inputGroup,
                 #search-jumper #search-jumper-alllist.showbg>.search-jumper-btn,
                 #search-jumper #search-jumper-alllist.showbg>.search-jumper-historylistcon,
                 #search-jumper #search-jumper-alllist.showbg+.groupTab,
                 #search-jumper #search-jumper-alllist.showbg>.sitelistBox {
                     transition: .3s;
                     opacity: 0;
                 }
                 #search-jumper.search-jumper-showall>#search-jumper-alllist.showbg:hover~.search-jumper-showallBg {
                     background: unset;
                 }
                 .search-jumper-searchBarCon {
                     all: unset;
                     position: fixed;
                     top: 0;
                     left: 0;
                     width: 100%;
                     height: 100%;
                     z-index: 2147483646;
                     pointer-events: none;
                     text-align: center;
                     overflow: scroll;
                     display: block;
                     -ms-overflow-style: none;
                     scrollbar-width: none;
                     box-sizing: border-box;
                     user-select: none;
                 }
                 .search-jumper-searchBar {
                     z-index: 2147483646;
                     overflow-wrap: break-word;
                     background: #505050cc;
                     border-radius: ${this.scale * 21}px!important;
                     border: 1px solid #b3b3b3;
                     display: inline-flex;
                     pointer-events: all;
                     margin-top: -${this.scale * 25}px;
                     vertical-align: top;
                     ${searchData.prefConfig.noAni ? "" : "opacity: 0.8;"}
                     ${searchData.prefConfig.noAni ? "" : "transition:margin-top 1s ease, margin-left 1s, right 1s, opacity 1s, transform 1s;"}
                     user-select: none;
                     text-align: center;
                     position: relative;
                     box-sizing: border-box;
                 }
                 .hideAll>.search-jumper-searchBar {
                     margin-top: -${this.scale * 40}px;
                 }
                 .search-jumper-searchBarCon:not(.search-jumper-showall)::-webkit-scrollbar {
                     width: 0 !important;
                     height: 0 !important;
                 }
                 .search-jumper-searchBarCon.search-jumper-scroll {
                     overscroll-behavior: contain;
                     -ms-scroll-chaining: contain;
                 }
                 .search-jumper-searchBarCon.search-jumper-scroll>.search-jumper-searchBar {
                     pointer-events: all;
                 }
                 .search-jumper-scroll.search-jumper-bottom {
                     overflow-y: hidden;
                 }
                 .search-jumper-scroll.search-jumper-right>.search-jumper-searchBar {
                     position: absolute !important;
                     top: 0;
                 }
                 .search-jumper-scroll.search-jumper-bottom>.search-jumper-searchBar {
                     margin-top: 0px;
                 }
                 .search-jumper-scroll.search-jumper-bottom>.search-jumper-searchBar:hover,
                 .search-jumper-scroll.search-jumper-bottom>.search-jumper-searchBar.initShow,
                 .resizePage.search-jumper-scroll.search-jumper-bottom>.search-jumper-searchBar,
                 .search-jumper-scroll.search-jumper-bottom.funcKeyCall>.search-jumper-searchBar,
                 #search-jumper.in-input.search-jumper-scroll.search-jumper-bottom>.search-jumper-searchBar {
                     margin-top: 0px;
                 }
                 .search-jumper-searchBar:hover {
                     margin-top: 0;
                     opacity: 1;
                     ${searchData.prefConfig.noAni ? "" : "transition:margin-top 0.1s ease, margin-left 0.1s, right 0.1s, opacity 0.1s, transform 0.1s;"}
                 }
                 .search-jumper-searchBar.initShow,
                 .resizePage>.search-jumper-searchBar {
                     margin-top: 0;
                     ${searchData.prefConfig.noAni ? "" : "transition:margin-top 0.25s ease, margin-left 0.25s, right 0.25s, opacity 0.25s, transform 0.25s;"}
                 }
                 .funcKeyCall>.search-jumper-searchBar.initShow {
                     ${searchData.prefConfig.noAni ? "" : "transition:opacity 0.15s ease-out, transform 0.25s ease;"}
                 }
                 #search-jumper.funcKeyCall {
                     overflow: visible;
                     position: absolute;
                     max-width: 100%;
                     width: 100%;
                     top: 0;
                 }
                 .funcKeyCall>.search-jumper-searchBar {
                     position: absolute!important;
                     background: none;
                     border: none;
                     max-width: unset!important;
                     margin: unset;
                     ${searchData.prefConfig.minPopup && !searchData.prefConfig.noAni ? 'transition: transform 0.25s ease;' : ''}
                     ${searchData.prefConfig.minPopup ? 'transform: scale(0.7);' : ''}
                 }
                 .funcKeyCall>.search-jumper-searchBar:hover {
                     ${searchData.prefConfig.minPopup ? 'transform: scale(1);' : ''}
                 }
                 .in-input>.search-jumper-searchBar,
                 .funcKeyCall>.search-jumper-searchBar {
                     opacity: 1;
                     display: inline-flex!important;
                 }
                 .in-input.in-find {
                     pointer-events: none;
                 }
                 .in-input.in-find>.searchJumperNavBar,
                 .in-input.in-find>.search-jumper-input {
                     pointer-events: all;
                 }
                 .in-input.in-find>.search-jumper-searchBar, .in-input>.rectSelecting.search-jumper-searchBar {
                     opacity: 0!important;
                     pointer-events: none;
                     transition: none;
                 }
                 .in-input.in-find>.search-jumper-searchBar:hover {
                     opacity: 1!important;
                 }
                 .in-input.in-find>.search-jumper-input {
                     opacity: 0.6;
                     transition:opacity 0.25s ease;
                 }
                 .in-input.in-find>.search-jumper-input:hover,
                 .in-input.in-find>.search-jumper-input.active {
                     opacity: 1;
                 }
                 .funcKeyCall>.search-jumper-searchBar {
                     flex-direction: column;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type {
                     height: ${searchData.prefConfig.minPopup ? (24 * this.tilesZoom + 'px') : 'auto'}!important;
                     max-width: ${searchData.prefConfig.minPopup ? (24 * this.tilesZoom) : (40 * (searchData.prefConfig.numPerLine || 7) * this.tilesZoom)}px!important;
                     width: auto!important;
                     width: max-content!important;
                     max-height: ${108 * this.tilesZoom + 10}px;
                     flex-wrap: wrap!important;
                     flex-direction: row;
                     padding: 5px;
                     box-shadow: #000000 0px 0px 10px;
                     overflow: auto;
                     scrollbar-width: none;
                     transition: none;
                     background: #d0d0d0d0;
                     box-sizing: content-box;
                 }
                 ${searchData.prefConfig.hideTileType ? `
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type:before {
                     content: attr(data-type);
                     position: absolute;
                     background: #ffffffd0;
                     color: black;
                     margin-top: -${22 * this.tilesZoom}px;
                     line-height: 1.2;
                     font-size: ${13 * this.tilesZoom}px;
                     font-weight: bold;
                     border-radius: ${20 * this.tilesZoom}px;
                     padding: 3px 6px;
                     box-shadow: #000000 0px 0px 10px;
                     opacity: 0;
                     pointer-events: none;
                     transition: all 0.5s ease;
                     left: 50%;
                     transform: translate(-50%, 0);
                     z-index: 1;
                     max-width: 100%;
                     white-space: nowrap;
                     overflow: hidden;
                     text-overflow: ellipsis;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type>span.search-jumper-btn:first-child {
                     display: none;
                 }
                 #search-jumper.funcKeyCall .search-jumper-type.search-jumper-open.not-expand>a:nth-of-type(${(searchData.prefConfig.expandTypeLength || 12)+1}) {
                     display: grid!important;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type:hover:before {
                     opacity: 1;
                 }
                 ` : ''}
                 #search-jumper>.search-jumper-searchBar>.search-jumper-type.search-jumper-open {
                     overflow: visible;
                 }
                 #search-jumper>.search-jumper-searchBar>.search-jumper-type.search-jumper-open.search-jumper-move:hover {
                     width: fit-content!important;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type.search-jumper-open:not(.not-expand) {
                     overflow: auto;
                 }
                 #search-jumper.search-jumper-left>.search-jumper-searchBar>.search-jumper-type.search-jumper-open.search-jumper-move:hover,
                 #search-jumper.search-jumper-right>.search-jumper-searchBar>.search-jumper-type.search-jumper-open.search-jumper-move:hover {
                     width: 100%!important;
                     height: fit-content!important;
                 }
                 #search-jumper.search-jumper-bottom>.search-jumper-searchBar>.search-jumper-type.search-jumper-open.search-jumper-move:hover {
                     align-items: flex-end;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type.search-jumper-open {
                     overscroll-behavior: contain;
                     -ms-scroll-chaining: contain;
                     overflow: auto;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type>.sitelist {
                     border-radius: 10px;
                     box-shadow: 0px 0px 10px 0px #7a7a7a;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type>.sitelist>.sitelistCon {
                     margin: 0;
                     padding: 5px;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type>.sitelist>.sitelistCon>p {
                     display: none;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type>.sitelist>.sitelistCon a>img {
                     width: 20px;
                     height: 20px;
                 }
                 ${searchData.prefConfig.minPopup && !searchData.prefConfig.hideTileType ? `
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type>a.search-jumper-btn,
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type>.searchJumperExpand {
                     display: none;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type:hover>a.search-jumper-btn,
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type:hover>.searchJumperExpand {
                     display: grid;
                 }
                 input#search-jumper-tileInput {
                     opacity: 0;
                 }
                 ` : ''}
                 ${searchData.prefConfig.minPopup == 2 ? `
                 .funcKeyCall:not(.targetInput)>.search-jumper-searchBar {
                     transform: scale(1);
                 }
                 #search-jumper.funcKeyCall:not(.targetInput)>.search-jumper-searchBar>.search-jumper-type {
                     height: auto!important;
                     width: auto!important;
                     width: max-content!important;
                     max-width: ${40 * (searchData.prefConfig.numPerLine || 7) * this.tilesZoom}px!important;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type>a.search-jumper-btn {
                     display: grid;
                 }
                 #search-jumper.funcKeyCall.targetInput>.search-jumper-searchBar>.search-jumper-type>a.search-jumper-btn {
                     display: none;
                 }
                 #search-jumper.funcKeyCall.targetInput>.search-jumper-searchBar>.search-jumper-type:hover>a.search-jumper-btn {
                     display: grid;
                 }
                 ` : ''}
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type:hover {
                     height: auto!important;
                     width: auto!important;
                     width: max-content!important;
                     max-width: ${40 * (searchData.prefConfig.numPerLine || 7) * this.tilesZoom}px!important;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type::-webkit-scrollbar {
                     width: 0 !important;
                     height: 0 !important;
                 }
                 .search-jumper-left,
                 .search-jumper-left .search-jumper-type,
                 .search-jumper-left>.search-jumper-searchBar,
                 .search-jumper-right,
                 .search-jumper-right .search-jumper-type,
                 .search-jumper-right>.search-jumper-searchBar {
                     flex-direction: column;
                     max-width: ${42 * this.scale}px;
                     max-height: unset;
                 }
                 .search-jumper-left .search-jumper-type,
                 .search-jumper-right .search-jumper-type {
                     max-width: ${40 * this.scale}px;
                 }
                 .search-jumper-left,
                 .search-jumper-left>.search-jumper-searchBar,
                 .search-jumper-right,
                 .search-jumper-right>.search-jumper-searchBar {
                     max-width: 100%;
                 }
                 .search-jumper-searchBar.grabbing {
                     max-width: ${42 * this.scale}px;
                 }
                 .search-jumper-right .search-jumper-type {
                     align-items: flex-end;
                 }
                 .search-jumper-left {
                     height: 100%;
                     text-align: initial;
                 }
                 .search-jumper-left:not(.search-jumper-showall) {
                     width: initial;
                     width: -webkit-fill-available;
                 }
                 .search-jumper-right {
                     left: unset;
                     right: 0;
                     height: 100%;
                 }
                 .searchJumperExpand {
                     opacity: 0.8;
                 }
                 .search-jumper-type.not-expand:not(.search-jumper-open)>.searchJumperExpand {
                     display: none;
                 }
                 .searchJumperExpand:hover {
                     opacity: 1;
                 }
                 .searchJumperExpand>svg {
                     transform: rotate(-90deg);
                     border-radius: 20px;
                     filter: drop-shadow(0px 0px 2px black);
                     width: unset;
                     height: unset;
                     color: black;
                     fill: black;
                 }
                 .search-jumper-type.search-jumper-open>span.search-jumper-word,
                 #search-jumper.funcKeyCall .search-jumper-type>span.search-jumper-word {
                     filter: drop-shadow(0px 0px 2px black);
                 }
                 .search-jumper-left .searchJumperExpand>svg,
                 .search-jumper-right .searchJumperExpand>svg {
                     transform: unset;
                 }
                 .search-jumper-bottom {
                     top: unset;
                     bottom: 0;
                     height: ${this.scale * 42 * 2}px;
                     max-height: ${this.scale * 43 * 2}px;
                     overflow-y: hidden;
                 }
                 .search-jumper-left>.search-jumper-searchBar {
                     width: fit-content;
                     margin-top: 0;
                     margin-left: -${this.scale * 20}px;
                 }
                 .hideAll.search-jumper-left>.search-jumper-searchBar {
                     margin-left: -${this.scale * 40}px;
                 }
                 .search-jumper-right>.search-jumper-searchBar {
                     margin-top: 0;
                     right: -${this.scale * 20}px;
                     position: fixed;
                 }
                 .hideAll.search-jumper-right>.search-jumper-searchBar {
                     right: -${this.scale * 40}px;
                 }
                 .search-jumper-left>.search-jumper-searchBar:hover,
                 .search-jumper-left>.search-jumper-searchBar.initShow,
                 .resizePage.search-jumper-left>.search-jumper-searchBar,
                 .search-jumper-left.funcKeyCall>.search-jumper-searchBar,
                 #search-jumper.in-input.search-jumper-left>.search-jumper-searchBar {
                     margin-top: unset;
                     margin-left: 0;
                     opacity: 1;
                 }
                 .search-jumper-right>.search-jumper-searchBar:hover,
                 .search-jumper-right>.search-jumper-searchBar.initShow,
                 .resizePage.search-jumper-right>.search-jumper-searchBar,
                 .search-jumper-right.funcKeyCall>.search-jumper-searchBar,
                 #search-jumper.in-input.search-jumper-right>.search-jumper-searchBar {
                     margin-top: unset;
                     right: 0;
                     opacity: 1;
                 }
                 .search-jumper-bottom>.search-jumper-searchBar {
                     position: relative;
                     margin-top: 0px;
                     top: ${this.scale * 42}px;
                 }
                 .hideAll.search-jumper-bottom>.search-jumper-searchBar {
                     opacity: 0;
                 }
                 .search-jumper-bottom>.search-jumper-searchBar:hover,
                 .search-jumper-bottom>.search-jumper-searchBar.initShow,
                 .resizePage.search-jumper-bottom>.search-jumper-searchBar,
                 .search-jumper-bottom.funcKeyCall>.search-jumper-searchBar,
                 #search-jumper.in-input.search-jumper-bottom>.search-jumper-searchBar {
                     margin-top: 0px;
                     opacity: 1;
                 }
                 .search-jumper-btn {
                     position: relative;
                     display: grid;
                     --scale: 1;
                     padding: ${1 * this.scale}px!important;
                     margin: ${3 * this.scale}px!important;
                     cursor: pointer;
                     box-sizing: content-box;
                     ${searchData.prefConfig.noAni ? "" : "transition:margin-left 0.25s ease, width 0.25s, height 0.25s, transform 0.25s, background 0.25s;"}
                     width: calc(${32 * this.scale}px * var(--scale));
                     height: calc(${32 * this.scale}px * var(--scale));
                     overflow: hidden;
                     text-overflow: ellipsis;
                     white-space: nowrap;
                     text-decoration:none;
                     min-width: ${32 * this.scale}px;
                     min-height: ${32 * this.scale}px;
                     text-align: center;
                     background-image: initial;
                     filter: drop-shadow(1px 1px 3px #00000030);
                 }
                 #search-jumper.funcKeyCall .search-jumper-btn {
                     padding: ${1 * this.tilesZoom}px!important;
                     margin: ${3 * this.tilesZoom}px!important;
                     width: ${32 * this.tilesZoom}px;
                     height: ${32 * this.tilesZoom}px;
                     min-width: ${32 * this.tilesZoom}px;
                     min-height: ${32 * this.tilesZoom}px;
                     border-radius: ${10 * this.tilesZoom}px;
                     filter: drop-shadow(1px 1px 3px #00000060);
                 }
                 #search-jumper.funcKeyCall a.search-jumper-btn {
                     background: #f7f7f7a0;
                 }
                 a.search-jumper-btn:not(.search-jumper-word)>span {
                     position: absolute;
                     text-align: center;
                     width: 100%;
                     bottom: 0px;
                     color: black!important;
                     font-family: Arial, sans-serif,微软雅黑,"Noto Sans SC";
                     text-shadow: 0 1px white, 1px 0 white, -1px 0 white, 0 -1px white;
                     font-size: ${12 * this.scale}px;
                     font-weight: normal;
                     opacity: 0.8;
                 }
                 #search-jumper.funcKeyCall a.search-jumper-btn:not(.search-jumper-word)>span {
                     font-size: ${12 * this.tilesZoom}px;
                 }
                 .search-jumper-type>a.search-jumper-btn.historySite {
                     box-shadow: 0px 0px 6px 0px #00000099;
                 }
                 .search-jumper-btn>img {
                     width: ${32 * this.scale}px;
                     height: ${32 * this.scale}px;
                     border: unset;
                 }
                 #search-jumper.funcKeyCall .search-jumper-btn>img {
                     width: ${32 * this.tilesZoom}px;
                     height: ${32 * this.tilesZoom}px;
                     border-radius: unset;
                 }
                 .search-jumper-btn>b {
                     line-height: ${32 * this.scale}px;
                     font-size: ${14 * this.scale}px;
                     letter-spacing: 0;
                     color: white;
                     opacity: 0.9;
                     text-shadow: 0 0 1px #d9d9d9cc;
                 }
                 #search-jumper.funcKeyCall .search-jumper-btn>b {
                     line-height: ${32 * this.tilesZoom}px;
                     font-size: ${14 * this.tilesZoom}px;
                 }
                 .search-jumper-btn:hover>b {
                     opacity: 1;
                 }
                 .search-jumper-btn>div {
                     position: absolute;
                     width: 100%;
                     height: 100%;
                     line-height: ${32 * this.scale}px;
                     background: black;
                     border-radius: ${20 * this.scale}px;
                     font-size: ${30 * this.scale}px;
                     color: wheat;
                     display: none;
                 }
                 #search-jumper.funcKeyCall .search-jumper-btn>div {
                     line-height: ${32 * this.tilesZoom}px;
                     border-radius: ${10 * this.tilesZoom}px;
                     font-size: ${30 * this.tilesZoom}px;
                 }
                 .search-jumper-isInPage .search-jumper-btn>div,
                 .search-jumper-isTargetImg .search-jumper-btn>div,
                 .search-jumper-isTargetAudio .search-jumper-btn>div,
                 .search-jumper-isTargetVideo .search-jumper-btn>div,
                 .search-jumper-isTargetLink .search-jumper-btn>div,
                 .search-jumper-isTargetPage .search-jumper-btn>div {
                     animation-name: changeOpacity;
                     animation-duration: 2s;
                     animation-iteration-count: 3;
                     animation-delay: 0.1s;
                     display: block;
                     opacity: 0;
                 }
                 @keyframes changeOpacity {
                     0%   {opacity: 0;}
                     10%  {opacity: 0;}
                     50%  {opacity: 0.75;}
                     80%  {opacity: 0;}
                     100% {opacity: 0;}
                 }
                 @-webkit-keyframes loader-rotate {
                   from {
                     transform: rotate(0deg);
                   }
                   to {
                     transform: rotate(360deg);
                   }
                 }
                 @keyframes loader-rotate {
                   from {
                     transform: rotate(0deg);
                   }
                   to {
                     transform: rotate(360deg);
                   }
                 }
                 .search-jumper-tips>.loader {
                     border-width: 5px;
                     border-style: solid;
                     border-color: gainsboro gainsboro dodgerblue gainsboro;
                     border-radius: 50%;
                     display: block;
                     width: 25px;
                     float: left;
                     height: 25px;
                     margin-right: 10px;
                     margin-top: 5px;
                     -webkit-animation: loader-rotate 1.5s linear infinite;
                     animation: loader-rotate 1.5s linear infinite;
                 }
                 .search-jumper-tips>.loader+font {
                     font-size: 25px;
                     line-height: 40px;
                 }
                 .search-jumper-tips>div {
                     font-size: initial;
                     line-height: initial;
                     font-weight: normal;
                     padding: 5px;
                     cursor: initial;
                 }
                 .search-jumper-tips>div [data-read],
                 .search-jumper-tips>div [data-close],
                 .search-jumper-tips>div [data-paste],
                 .search-jumper-tips>div [data-copy] {
                     cursor: pointer;
                 }
                 .search-jumper-tips>div [data-search] {
                     cursor: help;
                 }
                 .search-jumper-tips>div [data-close] {
                     position: absolute;
                     top: 0px;
                     right: 0px;
                     width: 20px;
                     height: 20px;
                     transition:all 0.2s ease;
                 }
                 .search-jumper-tips>div [data-close]:hover {
                     color: red;
                 }
                 .search-jumper-tips>div [data-read] {
                     color: #f9690e;
                 }
                 .search-jumper-tips>div [data-drag] {
                     cursor: grab;
                 }
                 .search-jumper-tips>div [data-copy] {
                     display: inline-block;
                     transition:all 0.2s ease;
                 }
                 .search-jumper-tips>div [data-copy]:hover {
                     -webkit-transform: scale(1.1);
                     -moz-transform: scale(1.1);
                     transform: scale(1.1);
                 }
                 .search-jumper-tips.draging {
                     cursor: grabbing;
                     transition: none;
                 }
                 .search-jumper-tips.draging * {
                     pointer-events: none;
                 }
                 .search-jumper-tips .showTips-inputGroup {
                     display: flex;
                     flex-wrap: wrap;
                     text-align: left;
                     justify-content: center;
                 }
                 .search-jumper-tips .showTips-input-title {
                     font-size: 9pt;
                     font-family: Arial, sans-serif,微软雅黑,"Noto Sans SC";
                     display: inline-block;
                     background-color: white;
                     position: relative;
                     left: 20px;
                     padding: 0px 4px;
                     text-align: left;
                     color: #646464;
                     word-break: break-all;
                     max-width: 85%;
                     z-index: 1;
                 }
                 .search-jumper-tips .showTips-inputGroup .select {
                     resize: both;
                     font-size: 11pt;
                     font-weight: normal;
                     border-radius: 4px;
                     border: 1px solid rgba(0, 0, 0, 0.23);
                     margin: 4px;
                     font-family: inherit;
                     background-color: #FFF;
                     width: calc(100% - 8px);
                     color: #4A4A4A;
                     margin-top: -8px;
                     padding: 4px;
                     padding-top: 8px;
                     box-sizing: border-box;
                     height: 30px;
                     position: relative;
                 }
                 .search-jumper-tips .showTips-inputGroup .searchBtn {
                     -moz-transition: transform 0.3s ease;
                     -webkit-transition: transform 0.3s ease;
                     transition: transform 0.3s ease;
                     cursor: pointer;
                     margin-bottom: 5px;
                 }
                 .search-jumper-tips .showTips-inputGroup * {
                     margin-left: 2px;
                     margin-right: 2px;
                 }
                 .search-jumper-tips .showTips-inputGroup .searchBtn:hover {
                     -webkit-transform: scale(1.1);
                     -moz-transform: scale(1.1);
                     transform: scale(1.1);
                     filter: drop-shadow(1px 1px 3px #00000050);
                 }
                 .search-jumper-tips .showTips-inputGroup .select>input[type=text] {
                     top: -8px;
                     left: 0px;
                     position: relative;
                     border: unset!important;
                     width: calc(100% - 25px);
                     padding-bottom: 3px;
                     margin-bottom: -30px;
                     float: left;
                     background: unset;
                     height: 24px;
                     outline: unset;
                 }
                 .search-jumper-tips .showTips-inputGroup .select>p {
                     padding: 0;
                     margin: 0;
                     position: absolute;
                     pointer-events: none;
                 }
                 .search-jumper-tips .showTips-inputGroup .select>.options {
                     position: fixed;
                     visibility: hidden;
                     opacity: 0;
                     transition: opacity .1s;
                     background-color: #FFF;
                     color: #4A4A4A;
                     border: 1px solid rgba(0, 0, 0, 0.23);
                     border-radius: 4px;
                     z-index: 10;
                     width: auto;
                     max-width: 35%;
                 }
                 .search-jumper-tips .showTips-inputGroup .select>input:focus+p {
                     display: none;
                 }
                 .search-jumper-tips .showTips-inputGroup .select:hover>.options {
                     visibility: visible;
                     opacity: 1;
                 }
                 .search-jumper-tips .showTips-inputGroup .select>.options>p {
                     cursor: pointer;
                     min-height: 20px;
                     padding: 3px 0;
                     margin: 0;
                 }
                 .search-jumper-tips .showTips-inputGroup .select>.options>p:hover {
                     background: aliceblue;
                 }
                 .search-jumper-tips .showTips-inputGroup div.select:after {
                     content: "▼";
                     position: absolute;
                     right: 6px;
                     top: 8px;
                     font-size: 9px;
                 }
                 @media (prefers-color-scheme: dark) {
                     .search-jumper-tips .showTips-input-title,
                     .search-jumper-tips .showTips-inputGroup input,
                     .search-jumper-tips .showTips-inputGroup textarea,
                     .search-jumper-tips .showTips-inputGroup .select {
                         background-color: black!important;
                         color: #d5d5d5!important;
                     }
                     .search-jumper-tips .showTips-inputGroup input:focus,
                     .search-jumper-tips .showTips-inputGroup textarea:focus,
                     .search-jumper-tips .showTips-inputGroup .select:focus {
                         background-color: #1e1e1e!important;
                     }
                     .search-jumper-tips .showTips-inputGroup input,
                     .search-jumper-tips .showTips-inputGroup textarea,
                     .search-jumper-tips .showTips-inputGroup .select {
                         border: 1px solid rgb(255 255 255 / 36%)!important;
                         background-color: #0c0c0c!important;
                     }
                     .search-jumper-tips .showTips-inputGroup .select>.options {
                         border: 1px solid rgb(255 255 255 / 36%)!important;
                         background-color: black;
                         color: #d5d5d5;
                     }
                     .search-jumper-tips .showTips-inputGroup .select>.options>p:hover {
                         background: #1e1e1e;
                     }
                 }
                 .search-jumper-logoBtnSvg {
                     width: ${32 * this.scale}px;
                     height: ${32 * this.scale}px;
                     overflow: hidden;
                     vertical-align: top;
                     cursor: grab;
                 }
                 #search-jumper.funcKeyCall .search-jumper-logoBtnSvg {
                     height: ${32 * this.tilesZoom}px;
                     width: ${32 * this.tilesZoom}px;
                 }
                 .search-jumper-type.search-jumper-targetImg,
                 .search-jumper-type.search-jumper-targetAudio,
                 .search-jumper-type.search-jumper-targetVideo,
                 .search-jumper-type.search-jumper-targetLink,
                 .search-jumper-type.search-jumper-targetPage,
                 .search-jumper-isTargetImg>.search-jumper-type,
                 .search-jumper-isTargetAudio>.search-jumper-type,
                 .search-jumper-isTargetVideo>.search-jumper-type,
                 .search-jumper-isTargetLink>.search-jumper-type,
                 .search-jumper-searchBar:hover>.search-jumper-type.search-jumper-targetImg,
                 .search-jumper-searchBar:hover>.search-jumper-type.search-jumper-targetAudio,
                 .search-jumper-searchBar:hover>.search-jumper-type.search-jumper-targetVideo,
                 .search-jumper-searchBar:hover>.search-jumper-type.search-jumper-targetLink,
                 .search-jumper-searchBar:hover>.search-jumper-type.search-jumper-targetPage,
                 .search-jumper-searchBar.search-jumper-isTargetImg:hover>.search-jumper-type,
                 .search-jumper-searchBar.search-jumper-isTargetAudio:hover>.search-jumper-type,
                 .search-jumper-searchBar.search-jumper-isTargetVideo:hover>.search-jumper-type,
                 .search-jumper-searchBar.search-jumper-isTargetLink:hover>.search-jumper-type {
                     display: none;
                 }
                 #search-jumper.in-input .search-jumper-type.search-jumper-open {
                     width: auto!important;
                     height: auto!important;
                 }
                 #search-jumper.in-input .sitelistCon>div:not(.input-hide)>a {
                     display: flex!important;
                 }
                 #search-jumper .input-hide,
                 #search-jumper.search-jumper-showall #search-jumper-alllist .sitelist.input-hide {
                     display: none!important;
                 }
                 #search-jumper.in-input .search-jumper-type:not(.input-hide) {
                     display: inline-flex!important;
                     flex-wrap: nowrap!important;
                 }
                 #search-jumper.in-input .search-jumper-btn:not(.input-hide) {
                     display: grid!important;
                 }
                 #search-jumper>.search-jumper-searchBar>.search-jumper-logo {
                     display: inline-flex;
                     background: unset;
                     padding: 0px;
                 }
                 #search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-logo {
                     display: none;
                 }
                 .search-jumper-searchBar>.search-jumper-type.search-jumper-targetAll,
                 .search-jumper-searchBar:hover>.search-jumper-type.search-jumper-targetAll {
                     display: inline-flex;
                 }
                 .search-jumper-isInPage>.search-jumper-type.search-jumper-needInPage,
                 .search-jumper-isTargetImg>.search-jumper-type.search-jumper-targetImg,
                 .search-jumper-isTargetAudio>.search-jumper-type.search-jumper-targetAudio,
                 .search-jumper-isTargetVideo>.search-jumper-type.search-jumper-targetVideo,
                 .search-jumper-isTargetLink>.search-jumper-type.search-jumper-targetLink,
                 .search-jumper-isTargetPage>.search-jumper-type,
                 .search-jumper-searchBar.search-jumper-isInPage:hover>.search-jumper-type.search-jumper-needInPage,
                 .search-jumper-searchBar.search-jumper-isTargetImg:hover>.search-jumper-type.search-jumper-targetImg,
                 .search-jumper-searchBar.search-jumper-isTargetAudio:hover>.search-jumper-type.search-jumper-targetAudio,
                 .search-jumper-searchBar.search-jumper-isTargetVideo:hover>.search-jumper-type.search-jumper-targetVideo,
                 .search-jumper-searchBar.search-jumper-isTargetLink:hover>.search-jumper-type.search-jumper-targetLink,
                 .search-jumper-searchBar.search-jumper-isTargetPage:hover>.search-jumper-type.search-jumper-targetPage,
                 .search-jumper-searchBar.search-jumper-isTargetPage:hover>.search-jumper-type {
                     display: inline-flex;
                 }
                 .search-jumper-type,
                 .search-jumper-logo {
                     display: inline-flex;
                     box-sizing: border-box;
                     background: #d0d0d0;
                     border-radius: ${20 * this.scale}px!important;
                     overflow: hidden;
                     padding: 0.2px;
                     height: ${40 * this.scale}px;
                     width: ${40 * this.scale}px;
                     max-height: ${this.scale * 40}px;
                     min-height: ${this.scale * 40}px;
                     min-width: ${this.scale * 40}px;
                     ${searchData.prefConfig.noAni ? "" : `transition:width ${searchData.prefConfig.typeOpenTime}ms ease, height ${searchData.prefConfig.typeOpenTime}ms;`}
                 }
                 #search-jumper.funcKeyCall .search-jumper-type,
                 #search-jumper.funcKeyCall .search-jumper-logo {
                     border-radius: ${20 * this.tilesZoom}px!important;
                     height: ${40 * this.tilesZoom}px;
                     width: ${40 * this.tilesZoom}px;
                     max-height: ${this.tilesZoom * 40}px;
                     min-height: ${this.tilesZoom * 40}px;
                     min-width: ${this.tilesZoom * 40}px;
                 }
                 #search-jumper-tileInput {
                     display: none;
                     opacity: 0.2;
                     user-select: all;
                     background-color: #212022;
                     color: #adadad;
                     border: none;
                     font-size: 12px;
                     margin-bottom: 3px;
                     padding: 5px;
                     border-radius: 10px;
                     box-shadow: #adadad 0px 0px 2px;
                     width: 100%;
                     outline: none;
                     box-sizing: border-box;
                     cursor: text;
                     -moz-transition: opacity 0.3s ease;
                     -webkit-transition: opacity 0.3s ease;
                     transition: opacity 0.3s ease;
                 }
                 #search-jumper-tileInput:hover {
                     opacity: 0.95;
                 }
                 #search-jumper.funcKeyCall #search-jumper-tileInput {
                     display: block;
                 }
                 .search-jumper-right>.searchJumperNavBar {
                     right: unset;
                     left: 0;
                 }
                 .search-jumper-right>.searchJumperNavBar>#navMarks+div.navPointer {
                     right: unset;
                     left: 20px;
                     transform: rotate(180deg);
                 }
                 .search-jumper-bottom>.search-jumper-input {
                     bottom: unset;
                     top: 80px;
                 }
                 #search-jumper .search-jumper-type.search-jumper-open.not-expand>a:nth-of-type(${searchData.prefConfig.expandTypeLength || 12})~a {
                     display: none!important;
                 }
                 #search-jumper .sitelist {
                     position: fixed;
                     text-align: left;
                     background: #00000000;
                     max-height: calc(100vh - ${this.scale * 42}px);
                     overflow: scroll;
                     border: 0;
                     pointer-events: none;
                     opacity: 0;
                     ${searchData.prefConfig.noAni ? "" : "transition:opacity 0.5s ease;"}
                     scrollbar-width: none;
                     box-sizing: content-box;
                     overscroll-behavior: contain;
                     -ms-scroll-chaining: contain;
                     z-index: 1;
                 }
                 #search-jumper .search-jumper-type:hover>.sitelist {
                     pointer-events: all;
                     opacity: 1;
                 }
                 #search-jumper .sitelist>.sitelistCon {
                     margin: 10px;
                     border-radius: 10px;
                     box-shadow: 0px 0px 10px 0px #7a7a7a;
                     padding: 0 0 10px 0;
                     background-color: rgba(255, 255, 255, 0.8);
                     -moz-transition: background-color 0.3s ease;
                     -webkit-transition: background-color 0.3s ease;
                     transition: background-color 0.3s ease;
                     opacity: 1;
                     border: 0;
                 }
                 #search-jumper .sitelistBox:hover>.sitelist>.sitelistCon {
                     background-color: rgba(255, 255, 255, 1);
                 }
                 #search-jumper .sitelist>.sitelistCon:hover {
                     opacity: 1;
                 }
                 #search-jumper .sitelist::-webkit-scrollbar {
                     width: 0 !important;
                     height: 0 !important;
                 }
                 #search-jumper .sitelist>.sitelistCon>div {
                     padding: 0 10px;
                 }
                 #search-jumper .sitelist>.sitelistCon>div:hover {
                     background: #f5f7fa;
                 }
                 #search-jumper .sitelist a {
                     display: flex;
                     align-items: center;
                     text-decoration: none;
                     cursor: pointer;
                 }
                 #search-jumper .sitelist a>img {
                     width: 20px;
                     height: 20px;
                     margin-right: 10px;
                     margin-top: unset;
                     max-width: unset;
                     -moz-transition: transform 0.3s ease;
                     -webkit-transition: transform 0.3s ease;
                     transition: transform 0.3s ease;
                 }
                 #search-jumper .sitelist a>p {
                     display: inline-block;
                     font-size: 15px;
                     font-family: Arial, sans-serif,微软雅黑,"Noto Sans SC";
                     line-height: 25px;
                     margin: 5px auto;
                     color: #484b4f;
                     flex: 1;
                     text-align: left;
                     white-space: nowrap;
                     transform-origin: left;
                     -moz-transition: transform 0.3s ease;
                     -webkit-transition: transform 0.3s ease;
                     transition: transform 0.3s ease;
                 }
                 #search-jumper .sitelist a.dragTarget>img {
                     -webkit-transform:scale(1.5);
                     -moz-transform:scale(1.5);
                     transform:scale(1.5);
                 }
                 #search-jumper .sitelist a.dragTarget>p {
                     -webkit-transform:scale(1.2);
                     -moz-transform:scale(1.2);
                     transform: scale(1.2);
                 }
                 #search-jumper .sitelist a * {
                     pointer-events: none;
                 }
                 #search-jumper .sitelist>.sitelistCon>p {
                     color: #565656;
                     text-align: center;
                     font-size: 16px;
                     font-family: Arial, sans-serif,微软雅黑,"Noto Sans SC";
                     font-weight: bold;
                     background: #f6f6f6cc;
                     border-radius: 10px 10px 0 0;
                     overflow: hidden;
                     white-space: nowrap;
                     text-overflow: ellipsis;
                     padding: 3px 10px;
                     position: sticky;
                     top: 0;
                     pointer-events: none;
                     margin: -1px 0 0 0;
                 }
                 .search-jumper-searchBar.disable-pointer>.search-jumper-type {
                     pointer-events: none;
                 }
                 .search-jumper-word {
                     background: black;
                     color: #ffffff!important;
                     font-family: Arial, sans-serif,微软雅黑,"Noto Sans SC";
                     font-weight: 500;
                     font-size: ${13 * this.scale}px;
                     line-height: calc(${32 * this.scale}px * var(--scale));
                     min-width: ${32 * this.scale}px;
                     min-height: ${32 * this.scale}px;
                     letter-spacing: 0px;
                     text-shadow: unset;
                     text-decoration: none;
                 }
                 span.search-jumper-word {
                     border-radius: ${20 * this.scale}px!important;
                 }
                 a.search-jumper-word>span {
                     border-radius: 50%!important;
                     min-width: ${32 * this.tilesZoom}px;
                     min-height: ${32 * this.tilesZoom}px;
                     background: white;
                 }
                 #search-jumper.funcKeyCall .search-jumper-word {
                     border-radius: ${10 * this.tilesZoom}px!important;
                     font-size: ${14 * this.tilesZoom}px;
                     line-height: ${32 * this.tilesZoom}px;
                     width: ${32 * this.tilesZoom}px;
                     height: ${32 * this.tilesZoom}px;
                     min-width: ${32 * this.tilesZoom}px;
                     min-height: ${32 * this.tilesZoom}px;
                 }
                 #search-jumper.funcKeyCall .search-jumper-word>span {
                     background: unset;
                 }
                 .search-jumper-word:hover {
                     font-weight: bold;
                     text-shadow: 0px 0px 5px #d0d0d0;
                 }
                 a.search-jumper-word {
                     color: #111111!important;
                     background: unset;
                 }
                 .funcKeyCall a.search-jumper-word {
                     background: #f7f7f7a0;
                 }
                 a.search-jumper-word>span {
                     color: #222!important;
                     border-radius: 20px;
                     line-height: unset;
                     text-align: center;
                     text-shadow: 0 0 0.7px #787878dd;
                     background-image: initial;
                 }
                 .search-jumper-type img {
                     width: 100%;
                     height: 100%;
                     margin-top: unset;
                 }
                 #search-jumper.funcKeyCall .search-jumper-type img {
                     width: ${32 * this.tilesZoom}px;
                     height: ${32 * this.tilesZoom}px;
                 }
                 .funcKeyCall>.search-jumper-tips {
                     position: absolute;
                 }
                 .search-jumper-tips {
                     z-index: 2147483646;
                     pointer-events: none;
                     position: fixed;
                     font-size: ${35 * this.tipsZoom}px;
                     background: #f5f5f5f0;
                     border-radius: ${10 * this.tipsZoom}px!important;
                     padding: 6px;
                     box-shadow: 0px 0px 10px 0px #000;
                     font-weight: bold;
                     ${searchData.prefConfig.noAni ? "" : "transition: all 0.2s ease;"}
                     color: black;
                     white-space: normal;
                     max-width: 640px;
                     max-width: min(80vw,640px);
                     width: max-content;
                     line-height: ${35 * this.tipsZoom}px;
                     word-break: break-all;
                     text-align: center;
                     box-sizing: content-box;
                     overflow: hidden;
                     scrollbar-width: none;
                     font-family: Roboto,arial,sans-serif,微软雅黑,"Noto Sans SC";
                     cursor: grab;
                     max-height: 80vh;
                     overscroll-behavior: contain;
                     -ms-scroll-chaining: contain;
                 }
                 .search-jumper-tips::-webkit-scrollbar {
                     width: 0 !important;
                     height: 0 !important;
                 }
                 .search-jumper-tips:hover {
                     overflow: auto;
                 }
                 .search-jumper-tips * {
                     max-width: 640px;
                     max-width: min(80vw,640px);
                     margin: auto;
                 }
                 .search-jumper-tips .markdown {
                     white-space: pre-wrap;
                     line-height: 1.2;
                     text-align: initial;
                     margin: 10px;
                     display: block;
                     user-select: text;
                     cursor: auto;
                 }
                 .search-jumper-tips iframe {
                     border: unset;
                     display: block;
                 }
                 .search-jumper-searchBar>.search-jumper-type {
                     padding: 0px;
                     ${searchData.prefConfig.disableTypeOpen ? "background: unset;" : ""}
                 }
                 .search-jumper-searchBar>.search-jumper-type:not(.search-jumper-open) {
                     background: unset;
                     border-radius: unset!important;
                 }
                 .minSizeMode.search-jumper-searchBar>.search-jumper-type:not(.search-jumper-open),
                 .minSizeMode.search-jumper-searchBar:hover>.search-jumper-type:not(.search-jumper-open) {
                     display: none;
                 }
                 .minSizeModeClose.minSizeMode.search-jumper-searchBar:hover>.search-jumper-type:not(.search-jumper-targetImg,.search-jumper-targetLink,.search-jumper-targetPage,.search-jumper-targetVideo,.search-jumper-targetAudio) {
                     display: inline-flex;
                 }
                 .funcKeyCall>.search-jumper-searchBar>.search-jumper-type:not(.search-jumper-open) {
                     display: none;
                     border-radius: ${20 * this.tilesZoom}px!important;
                 }
                 span.search-jumper-word>img {
                     width: ${20 * this.scale}px;
                     height: ${20 * this.scale}px;
                     margin: auto;
                 }
                 #search-jumper.funcKeyCall span.search-jumper-word>img {
                     width: ${20 * this.tilesZoom}px;
                     height: ${20 * this.tilesZoom}px;
                 }
                 .search-jumper-btn:hover {
                     -webkit-transform:scale(1.1);
                     -moz-transform:scale(1.1);
                     transform:scale(1.1);
                     color: white;
                     text-decoration:none;
                     filter: drop-shadow(1px 1px 3px #00000050);
                 }
                 .search-jumper-btn:active {
                     -webkit-transform:scale(1.1);
                     -moz-transform:scale(1.1);
                     transform:scale(1.1);
                     transition:unset;
                     filter: drop-shadow(1px 1px 5px #000000a0);
                 }
                 .search-jumper-searchBar .search-jumper-btn.current {
                     overflow: visible;
                 }
                 .search-jumper-searchBar .search-jumper-btn.current::before {
                     content: '';
                     position: absolute;
                     right: -2px;
                     top: -2px;
                     border: 1px solid #00000099;
                     display: inline-block;
                     width: 10px;
                     height: 10px;
                     border-radius: 50%;
                     background: white;
                     box-shadow: 0px 0px 3px 0px rgb(0 0 0 / 80%);
                     ${searchData.prefConfig.noAni ? "" : "opacity: 0.8;"}
                 }
                 .in-input .search-jumper-input {
                     display: block;
                     box-sizing: content-box;
                 }
                 .lock-input .search-jumper-lock-input {
                     float: left;
                     font-size: 20px;
                     top: 14px;
                     left: 25px;
                     color: darkgrey;
                     position: absolute;
                     border-right: 2px solid #32373a;
                     padding-right: 10px;
                     display: block;
                 }
                 .search-jumper-input {
                     width: 50%;
                     min-width: 500px;
                     bottom: 2%;
                     left: 50%;
                     margin: 0 0 0 -25%;
                     margin-left: min(-25%, -250px);
                     position: fixed;
                     font-family: Arial, sans-serif,微软雅黑,"Noto Sans SC";
                     text-align: left;
                     box-shadow: 0px 2px 10px rgb(0 0 0 / 80%);
                     border: 1px solid rgb(179 179 179 / 10%);
                     border-radius: 28px;
                     background-color: rgb(51 56 59 / 90%);
                     padding: 5px;
                     display: none;
                     z-index: 2139999999;
                     font-size: 20px;
                     height: 36px;
                     touch-action: none;
                 }
                 .inputGroup {
                     cursor: grab;
                     display: flex;
                 }
                 .inputGroup * {
                     cursor: default;
                 }
                 .search-jumper-input input,
                 .search-jumper-input textarea {
                     background-color: #212022;
                     color: #adadad;
                     border: none;
                     font-size: 16px;
                     height: 35px;
                     margin-bottom: 0;
                     padding: 5px;
                     margin: 0 10px;
                     border-radius: 3px;
                     box-shadow: #333 0px 0px 2px;
                     width: calc(100% - 20px);
                     outline: none;
                     box-sizing: border-box;
                     cursor: text;
                 }
                 #searchJumperInput,
                 #searchJumperInputKeyWords {
                     width: calc(100% - 11px);
                     float: left;
                     transition: 0.25s width ease;
                 }
                 #searchJumperInput {
                     margin: 0 5px 0 10px;
                 }
                 #searchJumperInputKeyWords {
                     margin: 0 10px 0 1px;
                 }
                 #searchJumperInputKeyWords:disabled {
                     opacity: 0.5;
                     max-width: 20%;
                     min-width: 20%;
                 }
                 #filterSites>input:focus,
                 #filterSites>textarea:focus {
                     width: calc(400% - 20px);
                     color: white;
                 }
                 .search-jumper-input * {
                     box-sizing: border-box;
                 }
                 .search-jumper-input input[type="radio"] {
                     display: none;
                 }
                 .search-jumper-input input:checked + label {
                     background: #3a444add;
                     opacity: 0.9;
                     color: white;
                     font-size: 14px;
                 }
                 .search-jumper-input input#filterSitesTab:checked ~ .line {
                     left: 27px;
                 }
                 .search-jumper-input input#filterSitesTab:checked ~ .content-container #filterSites {
                     opacity: 1;
                     pointer-events: all;
                 }
                 .search-jumper-input input#searchInPageTab:checked ~ .line {
                     left: 233px;
                 }
                 .search-jumper-input input#searchInPageTab:checked ~ .content-container #searchInPage {
                     opacity: 1;
                     pointer-events: all;
                 }
                 .search-jumper-input label {
                     display: inline-block;
                     font-size: 12px;
                     height: 32px;
                     line-height: 32px;
                     width: 200px;
                     text-align: center;
                     background: #2a343acc;
                     color: #959595;
                     position: relative;
                     transition: 0.25s background ease, 0.25s opacity ease;
                     cursor: pointer;
                     position: relative;
                     top: -38px;
                     left: 22px;
                     border-radius: 5px 5px 0 0;
                     user-select: none;
                     pointer-events: all;
                     max-width: 40%;
                     white-space: nowrap;
                     overflow: hidden;
                     text-overflow: ellipsis;
                     opacity: 0.6;
                 }
                 .search-jumper-input input:checked + label:hover,
                 .search-jumper-input label:hover {
                     background: #3a444a;
                     opacity: 1;
                 }
                 .search-jumper-input label::after {
                     content: "";
                     height: 1px;
                     width: 100%;
                     position: absolute;
                     display: block;
                     background: #ccc;
                     bottom: 0;
                     opacity: 0;
                     left: 0;
                     transition: 0.25s ease;
                 }
                 .search-jumper-input label:hover::after {
                     opacity: 1;
                 }
                 .search-jumper-input .line {
                     background: #1E88E5;
                     width: 200px;
                     height: 1px;
                     top: -2px;
                     left: 0;
                     transition: 0.25s ease;
                     position: absolute;
                 }
                 .inputGroup>.svgBtns {
                     right: 16px;
                     top: 5px;
                     height: 35px;
                     position: absolute;
                     user-select: none;
                     background: #212022;
                     white-space: nowrap;
                     overflow: hidden;
                     display: flex;
                     align-items: center;
                 }
                 .inputGroup>#addons {
                     position: absolute;
                     bottom: 41px;
                     right: 110px;
                     display: none;
                     flex-direction: column;
                     background: #212022;
                     border-radius: 10px;
                     opacity: 0;
                     transition: 0.5s opacity ease;
                 }
                 .inputGroup>#addons>div {
                     padding: 10px;
                 }
                 .inputGroup>#addons>div>input {
                     float: left;
                     width: 20px;
                     height: 20px;
                     margin: 0 10px 0 0;
                     cursor: pointer;
                 }
                 .inputGroup:hover>#addons {
                     display: flex;
                 }
                 .inputGroup>#addons:hover {
                     opacity: 1;
                 }
                 .inputGroup>.svgBtns:hover+#addons {
                     opacity: 1;
                 }
                 .inputGroup>#addons>div>label {
                     color: white;
                     display: inline;
                     background: none;
                     top: unset;
                     left: unset;
                     font-size: unset;
                     line-height: 20px;
                     max-width: unset;
                 }
                 .inputGroup>.svgBtns:hover {
                     width: auto;
                 }
                 .inputGroup>.svgBtns>svg {
                     margin: 0 2px;
                 }
                 .inputGroup svg.checked {
                     fill: #1E88E5;
                 }
                 @media screen and (max-width: 2048px) {
                     #search-jumper.search-jumper-showall #search-jumper-alllist.new-mode .sitelist {
                         width: 1580px;
                     }
                 }
                 @media screen and (max-width: 1920px) {
                     #search-jumper.search-jumper-showall #search-jumper-alllist.new-mode .sitelist {
                         width: 1320px;
                     }
                 }
                 @media screen and (max-width: 1600px) {
                     #search-jumper.search-jumper-showall #search-jumper-alllist.new-mode .sitelist {
                         width: 1060px;
                     }
                 }
                 @media screen and (max-width: 1300px) {
                     #search-jumper.search-jumper-showall #search-jumper-alllist.new-mode .sitelist {
                         width: 800px;
                     }
                 }
                 @media screen and (max-width: 900px) {
                     #search-jumper.search-jumper-showall #search-jumper-alllist.new-mode .sitelist {
                         width: 540px;
                     }
                 }
                 @media screen and (max-width: 600px) {
                     #search-jumper.search-jumper-showall #search-jumper-alllist.new-mode .sitelist {
                         width: 95vw;
                     }
                     #search-jumper.search-jumper-showall #search-jumper-alllist.new-mode .sitelist>.sitelistCon {
                         width: calc(100% - 20px);
                     }
                     #search-jumper-alllist>.timeInAll, #search-jumper-alllist>.dayInAll {
                         margin: 10px;
                     }
                     #search-jumper #search-jumper-alllist.new-mode .sitelist a {
                         width: calc(50vw - 45px);
                     }
                     #search-jumper #search-jumper-alllist.new-mode .sitelist>.sitelistCon>div:before {
                         width: 100px;
                         margin-left: 68px;
                     }
                     #search-jumper #search-jumper-alllist.new-mode .sitelist a>img {
                         margin-left: 0;
                     }
                 }
                 @media screen and (max-width: 380px) {
                     #search-jumper #search-jumper-alllist.new-mode .sitelist a {
                         width: calc(100vw - 60px);
                     }
                     #search-jumper #search-jumper-alllist.new-mode .sitelist>.sitelistCon>div:before {
                         width: calc(100vw - 150px);
                         margin-left: 85px;
                     }
                     #search-jumper #search-jumper-alllist.new-mode .sitelist a+p {
                         width: calc(100vw - 60px);
                     }
                 }
                 @media screen and (max-width: 800px) {
                     .search-jumper-input .line {
                         display: none;
                     }
                     .search-jumper-input {
                         min-width: 300px;
                         margin-left: min(-25%, -150px);
                     }
                     .inputGroup>.svgBtns {
                         width: 25px;
                     }
                     #search-jumper-alllist>.modeSwitch {
                         width: 36px;
                         height: 36px;
                         right: 2px;
                         top: 10px;
                     }
                 }
                 @media screen and (max-width: 650px) {
                     #search-jumper.search-jumper-showall>#search-jumper-alllist.new-mode+.groupTab {
                         display: none;
                     }
                 }
                 .search-jumper-input .content-container {
                     background: #eee;
                     position: static;
                     font-size: 16px;
                 }
                 .search-jumper-input .content-container .inputGroup {
                     position: absolute;
                     padding: 5px;
                     width: 100%;
                     top: 0;
                     left: 0;
                     opacity: 0;
                     pointer-events: none;
                     transition: 0.25s ease;
                     color: #333;
                 }
                 .search-jumper-input svg,
                 .searchJumperNavBar svg {
                     width: 25px;
                     height: 25px;
                     fill: white;
                     cursor: pointer;
                     opacity: 0.8;
                     transition: 0.25s all ease;
                     font-size: 0px;
                 }
                 .search-jumper-input .inputGroup:hover svg,
                 .searchJumperNavBar.sjNavShow svg {
                     pointer-events: all;
                 }
                 .search-jumper-input svg *,
                 .searchJumperNavBar svg * {
                     cursor: pointer;
                 }
                 .search-jumper-input svg:hover,
                 .searchJumperNavBar svg:hover,
                 .search-jumper-input>.closeBtn:hover,
                 .searchJumperNavBar>div.minNavBtn:hover,
                 .searchJumperNavBar>div.maxNavBtn:hover {
                     -webkit-transform:scale(1.2);
                     -moz-transform:scale(1.2);
                     transform:scale(1.2);
                     opacity: 1;
                 }
                 #search-jumper.selectedEle #filterSites>.svgBtns>svg {
                     display: inline-block!important;
                 }
                 .search-jumper-input>.closeBtn {
                     position: absolute;
                     right: 0px;
                     top: -35px;
                     width: 30px;
                     height: 30px;
                     vertical-align: middle;
                     overflow: hidden;
                     background: rgb(51 56 59 / 90%);
                     color: white;
                     text-align: center;
                     line-height: 30px;
                     border-radius: 20px;
                     pointer-events: all;
                     transition: 0.25s all ease;
                     opacity: 0.6;
                     font-size: 26px;
                     box-shadow: 0px 0px 2px rgb(0 0 0 / 80%);
                     border: 1px solid rgb(179 179 179 / 20%);
                     cursor: pointer;
                     user-select: none;
                 }
                 #searchInPage>.lockWords {
                     max-width: 50%;
                     position: absolute;
                     bottom: 4px;
                     left: 16px;
                     color: white;
                     font-size: 18px;
                     display: flex;
                     flex-wrap: wrap-reverse;
                     max-height: 38px;
                     overflow: hidden;
                 }
                 #searchInPage>.lockWords:hover {
                     overflow-y: auto;
                     height: auto;
                     max-height: 90vh;
                 }
                 #searchInPage>.lockWords>span {
                     position: relative;
                     padding: 5px;
                     cursor: pointer;
                     user-select: none;
                     background: yellow;
                     color: black;
                     border: 1px solid;
                     margin: 2px;
                     display: flex;
                     align-items: center;
                     white-space: nowrap;
                     max-width: 100%;
                     line-height: initial;
                 }
                 #searchInPage>.lockWords>span>em {
                     cursor: alias;
                 }
                 #searchInPage>.lockWords .lockWordTool {
                     position: absolute;
                     right: 0;
                     top: 0;
                     display: none;
                     opacity: 0.3;
                     height: 15px;
                     width: 15px;
                     text-align: center;
                     line-height: 15px;
                     border-radius: 50%;
                     background: black;
                     color: white;
                 }
                 #searchInPage>.lockWords .lockWordTool>span {
                     cursor: pointer;
                     font-size: 15px;
                 }
                 #searchInPage>.lockWords .modifyBtn {
                     top: unset;
                     bottom: 0;
                 }
                 #searchInPage>.lockWords .lockWordTool:hover {
                     opacity: 1;
                 }
                 #searchInPage>.lockWords>span:hover .lockWordTool {
                     display: block;
                     pointer-events: all;
                 }
                 #searchInPage>.lockWords .lockWordTool>svg {
                     width: 15px;
                     height: 15px;
                     fill: black;
                     color: black;
                     border: 1px solid white;
                     border-radius: 10px;
                     background: white;
                 }
                 #searchInPage>.lockWords>span>em {
                     font-size: 12px;
                     margin-right: 5px;
                     color: unset;
                 }
                 .searchJumperNavBar {
                     all: unset;
                     top: 0px;
                     bottom: 0px;
                     right: 0px;
                     position: fixed;
                     width: 20px;
                     z-index: 2147483647;
                     background: #00000026;
                     text-align: center;
                     pointer-events: none;
                     font-size: 0px;
                     opacity: 0;
                     transition: width 0.3s, background 0.3s;
                 }
                 .searchJumperNavBar:hover {
                     width: 25px;
                     background: #00000066;
                 }
                 .searchJumperNavBar.sjNavShow {
                     pointer-events: all;
                     opacity: 1;
                 }
                 .search-jumper-showall > .searchJumperNavBar.sjNavShow {
                     opacity: 0;
                 }
                 .searchJumperNavBar>.closeNavBtn {
                     width: 16px;
                     height: 16px;
                     fill: white;
                     cursor: pointer;
                     display: inline-block;
                 }
                 .searchJumperNavBar>.minNavBtn,
                 .searchJumperNavBar>.maxNavBtn {
                     font-size: 12px;
                     font-weight: bold;
                     font-family: system-ui;
                     line-height: 16px;
                     opacity: 0.1;
                     background: white;
                     color: black;
                     border-radius: 10px;
                     width: 16px;
                     height: 16px;
                     display: inline-block;
                     cursor: pointer;
                     transition: 0.25s opacity ease, 0.25s transform ease;
                 }
                 .searchJumperNavBar:hover>.minNavBtn,
                 .searchJumperNavBar:hover>.maxNavBtn {
                     opacity: 0.8;
                 }
                 #search-jumper>.searchJumperNavBar.minimize {
                     background: transparent;
                     pointer-events: none;
                 }
                 .searchJumperNavBar.minimize>.closeNavBtn,
                 .searchJumperNavBar.minimize>.navPointer,
                 .searchJumperNavBar.minimize>.maxNavBtn,
                 .searchJumperNavBar.minimize>#navMarks {
                     display: none;
                 }
                 .searchJumperNavBar.minimize>.minNavBtn {
                     opacity: 1;
                     box-shadow: 0px 0px 3px 1px #000;
                     margin-left: -50px;
                     margin-top: 5px;
                     pointer-events: all;
                 }
                 .search-jumper-right>.searchJumperNavBar.minimize>.minNavBtn {
                     margin-left: unset;
                     margin-right: -50px;
                 }
                 #navMarks+.navPointer {
                     pointer-events: none;
                     position: absolute;
                     right: 20px;
                     text-shadow: #fff 1px 0 0, #fff 0 1px 0, #fff -1px 0 0, #fff 0 -1px 0;
                     font-size: 30px;
                     font-family: system-ui;
                     line-height: 0px;
                     border: 0;
                     margin-top: 0;
                     opacity: 0.8;
                     color: black;
                     transition: top 0.25s ease;
                     animation-name: changeHor;
                     animation-duration: 1s;
                     animation-iteration-count: infinite;
                     animation-timing-function: ease-in-out;
                 }
                 @keyframes changeHor {
                     0%   {right: 20px;}
                     10%  {right: 18px;}
                     80%  {right: 25px;}
                     100% {right: 20px;}
                 }
                 #navMarks {
                     height: calc(100% - 50px);
                     width: 100%;
                     position: relative;
                 }
                 #navMarks>span {
                     height: 0.5vh;
                     width: 100%;
                     position: absolute;
                     border: 1px solid #cccccc;
                     min-height: 5px;
                     box-sizing: border-box;
                     left: 0;
                     border-radius: 0px!important;
                     cursor: alias;
                 }
                 .searchJumperPosBar {
                     background: rgba(29, 93, 163, 0.3);
                     position: absolute;
                     min-height: 10px;
                     min-width: 10px;
                     animation-duration: 2s;
                     z-index: 2147483647;
                     margin: 0;
                     opacity: 0;
                     pointer-events: none;
                     transition: 0.25s all ease;
                 }
                 .searchJumperPosBar.searchJumperPosW {
                     width: 100%;
                     left: 0;
                 }
                 .searchJumperPosBar.searchJumperPosH {
                     height: 100%;
                     top: 0;
                     position: fixed;
                 }
                 @keyframes fadeit {
                     0% {opacity: 1;}
                     50% {opacity: 0.8;}
                     100% {opacity: 0;}
                 }
                 #rightSizeChange {
                     top: 0;
                     opacity: 0;
                     height: 45px;
                     width: 15px;
                     position: absolute;
                     cursor: e-resize;
                     right: 0;
                     pointer-events: all;
                 }
                 .searchJumper-hide {
                     display: none!important;
                 }
                 .search-jumper-historylist>a.search-jumper-btn {
                     filter: drop-shadow(0px 0px 3px #00000050);
                     width: 32px;
                     height: 32px;
                     line-height: 32px;
                     min-width: auto;
                     min-height: auto;
                     flex-shrink: 0;
                 }
                 .search-jumper-historylist>a.search-jumper-btn>img {
                     width: 32px;
                     height: 32px;
                 }
                 .search-jumper-historylist>a.search-jumper-btn:not(.search-jumper-word)>span {
                     font-size: 12px;
                     line-height: normal;
                 }
                 #search-jumper .listArrow {
                     width: 0;
                     height: 0;
                     border: 10px solid transparent;
                     pointer-events: none;
                     border-bottom-color: white;
                     position: fixed;
                     opacity: 0;
                     visibility: hidden;
                     z-index: 2147483647;
                     transition: opacity .3s ease, top .15s, bottom .15s, left .15s, right .15s;
                 }
                 #search-jumper.search-jumper-left .listArrow {
                     border-bottom-color: transparent;
                     border-right-color: white;
                 }
                 #search-jumper.search-jumper-right .listArrow {
                     border-bottom-color: transparent;
                     border-left-color: white;
                 }
                 #search-jumper.search-jumper-bottom .listArrow {
                     border-bottom-color: transparent;
                     border-top-color: white;
                 }
                 @media (prefers-color-scheme: dark) {
                     /* 站点列表 */
                     #search-jumper .sitelist > .sitelistCon > p {
                         background-color: #252B32 !important;
                     }
                     #search-jumper.search-jumper-showall #filterSites {
                         background-color: #2a282cc0;
                     }
                     #search-jumper.search-jumper-showall #filterSites>input,
                     #search-jumper.search-jumper-showall #filterSites>textarea {
                         background-color: #000000;
                         color: white;
                     }

                     #search-jumper .sitelist > .sitelistCon {
                         background-color: #1C2127ee !important;
                         box-shadow: 0px 0px 10px 0px #1c1c1c;
                     }

                     #search-jumper .sitelist > .sitelistCon > div:hover {
                         background-color: #283C57 !important;
                     }

                     #search-jumper .sitelist > .sitelistCon > p,
                     #search-jumper .sitelist a > p {
                         color: #b4b8bf !important;
                     }
                     #search-jumper #search-jumper-alllist.new-mode .sitelist a:hover>p {
                         color: #f1404b !important;
                     }
                     #search-jumper .listArrow {
                         border-bottom-color: #1C2127;
                     }
                     #search-jumper.search-jumper-left .listArrow {
                         border-bottom-color: transparent;
                         border-right-color: #1C2127;
                     }
                     #search-jumper.search-jumper-right .listArrow {
                         border-bottom-color: transparent;
                         border-left-color: #1C2127;
                     }
                     #search-jumper.search-jumper-bottom .listArrow {
                         border-bottom-color: transparent;
                         border-top-color: #1C2127;
                     }

                     /* 历史列表 */
                     .search-jumper-historylistcon {
                         background-color: #181C20e0 !important;
                         border-bottom: 1px solid #252b32;
                     }

                     .search-jumper-historylist>a.search-jumper-btn {
                         filter: drop-shadow(0px 0px 2px #ffffff80);
                     }

                     .search-jumper-tips {
                         background-color: #3F4042f0;
                         color: #DADADA;
                     }
                     .search-jumper-tips>*:not(font) {
                         color: white;
                     }

                     .search-jumper-showall .search-jumper-word:hover {
                         text-shadow: 0px 0px 5px #2374FF !important;
                     }

                     /* 类别 */
                     .search-jumper-showall .search-jumper-type,
                     .search-jumper-showall .search-jumper-logo {
                         background-color: #181C20 !important;
                     }

                     #search-jumper.search-jumper-showall>.groupTab {
                         background: #1C2127ee !important;
                     }
                     #search-jumper.search-jumper-showall>.groupTab>span:hover{
                         background: #283C57 !important;
                     }
                     #search-jumper.search-jumper-showall>.groupTab:hover>span::after {
                         color: white;
                     }
                 }
                 `;
                this.inPageCss = `
                 mark.searchJumper,
                 a.searchJumper {
                     visibility: inherit;
                     font-style: inherit;
                     box-shadow: rgba(0, 0, 0, 0.3) 1px 1px 3px;
                     border-radius: 3px;
                     text-decoration: none;
                     padding: 1px 0;
                     -webkit-text-fill-color: initial;
                     text-shadow: initial;
                     min-width: initial;
                     display: inline;
                     margin: initial;
                 }
                 mark.searchJumper:before,
                 a.searchJumper:before,
                 mark.searchJumper:after,
                 a.searchJumper:after {
                     all: unset;
                     content: none!important;
                 }
                 mark.searchJumper[data-current=true],
                 a.searchJumper[data-current=true] {
                     border-bottom: 0.2em solid;
                     border-bottom-left-radius: 0;
                     border-bottom-right-radius: 0;
                     animation: 0.5s linear 0s 5 normal none running currentMark;
                 }
                 @keyframes currentMark {
                     from {border-color: unset}
                     to {border-color: transparent;}
                 }
                `;
                if (searchData.prefConfig.cssText) cssText += searchData.prefConfig.cssText;

                let bar = document.createElement("span");
                bar.className = "search-jumper-searchBar";

                let tileInput = document.createElement("input");
                tileInput.id = "search-jumper-tileInput";
                tileInput.addEventListener("mousedown", e => {
                    e && e.stopPropagation && e.stopPropagation();
                }, true);
                let tileInputTimer;
                tileInput.addEventListener("input", e => {
                    clearTimeout(tileInputTimer);
                    tileInputTimer = setTimeout(() => {
                        let targetType = self.bar.querySelector(`.search-jumper-open>span:first-child`);
                        targetType && targetType.dispatchEvent(new CustomEvent("checkSites", {detail: tileInput.value}));
                    }, 500);
                }, true);
                this.tileInput = tileInput;

                let logoCon = document.createElement("span");
                logoCon.className = "search-jumper-logo";
                logoBtn = document.createElement("span");
                logoBtn.innerHTML = createHTML(logoBtnSvg);
                logoBtn.className = "search-jumper-btn";
                logoCon.addEventListener('mouseenter', e => {
                    if (this.preList) {
                        this.preList.style.visibility = "hidden";
                        this.listArrow.style.cssText = "";
                    }
                });

                logoCon.appendChild(logoBtn);

                bar.appendChild(logoCon);

                let searchBarCon = document.createElement("div");
                searchBarCon.id = "search-jumper";
                searchBarCon.style.display = "none";
                searchBarCon.className = "search-jumper-searchBarCon";
                searchBarCon.appendChild(bar);
                searchBarCon.setAttribute("translate", "no");

                let alllist = document.createElement("div");
                alllist.id = "search-jumper-alllist";
                searchBarCon.appendChild(alllist);
                this.alllist = alllist;

                let groupTab = document.createElement("span");
                groupTab.className = "groupTab";
                searchBarCon.appendChild(groupTab);
                this.groupTab = groupTab;

                let showallBg = document.createElement("div");
                showallBg.className = "search-jumper-showallBg";
                searchBarCon.appendChild(showallBg);

                let sitelistBox = document.createElement("div");
                sitelistBox.className = "sitelistBox";
                alllist.appendChild(sitelistBox);
                this.sitelistBox = sitelistBox;
                const tagReg = /#[^\s#]+/g;
                sitelistBox.addEventListener("mouseover", e => {
                    if (!alllist.classList.contains("new-mode")) return;
                    let target = e.target;
                    if (target.parentNode && target.parentNode.dataset.name) {
                        target = target.parentNode;
                    }
                    let title = target.title;
                    if (!target.dataset.name || !title || target.initedTag) return;
                    let tags = document.createElement("p");
                    let tagMatch = title.match(tagReg);
                    if (tagMatch) {
                        tagMatch.forEach(tag => {
                            let tagEle = document.createElement("span");
                            tagEle.innerText = tag.slice(1);
                            tagEle.addEventListener("click", e => {
                                self.searchInput.value = tag;
                                self.searchInput.dispatchEvent(new CustomEvent("input"));
                            });
                            tags.appendChild(tagEle);
                        });
                        target.appendChild(tags);
                    }
                    target.initedTag = true;
                });

                let timeInAll = document.createElement("span");
                timeInAll.className = "timeInAll";
                alllist.appendChild(timeInAll);
                this.timeInAll = timeInAll;

                this.modeSwitch = document.createElement("div");
                this.modeSwitch.className = "modeSwitch";
                this.modeSwitch.innerHTML = createHTML(`<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" version="1.1"><rect height="450" width="520" y="287" x="253" fill="#fff"></rect><path d="m511.8,64.2c-247.5,0 -448.2,200.7 -448.2,448.2s200.7,448.2 448.2,448.2s448.2,-200.6 448.2,-448.2s-200.7,-448.2 -448.2,-448.2zm-260.4,353.9c0,-7.8 6.3,-14.2 14.2,-14.2l315.6,0l0,-102.5c0,-12.3 14.7,-18.8 23.7,-10.4l165.1,151.7c9.5,8.7 3.3,24.6 -9.6,24.6l-495,0c-7.8,0 -14.2,-6.3 -14.2,-14.2l0,-35l0.2,0zm523.2,188.5c0,7.8 -6.3,14.2 -14.2,14.2l-315.5,0l0,102.6c0,12.3 -14.7,18.8 -23.7,10.4l-165.2,-151.8c-9.5,-8.7 -3.3,-24.6 9.6,-24.6l495,0c7.8,0 14.2,6.3 14.2,14.2l0,35l-0.2,0z"></path></svg>`);
                alllist.appendChild(this.modeSwitch);
                this.modeSwitch.addEventListener("click", e => {
                    e.preventDefault();
                    e.stopPropagation();
                    alllist.classList.toggle("new-mode");
                    alllist.classList.remove("showbg");
                    storage.setItem("allPageNewMode", alllist.classList.contains("new-mode"));
                });
                this.modeSwitch.addEventListener("mouseenter", e => {
                    if (allPageBgUrl) {
                        e.preventDefault();
                        e.stopPropagation();
                        alllist.classList.add("showbg");
                    }
                });
                this.modeSwitch.addEventListener("mouseleave", e => {
                    if (allPageBgUrl) {
                        e.preventDefault();
                        e.stopPropagation();
                        alllist.classList.remove("showbg");
                    }
                });
                this.modeSwitch.addEventListener("contextmenu", e => {
                    if (allPageBgUrl) {
                        e.preventDefault();
                        e.stopPropagation();
                        alllist.classList.remove("showbg");
                        _GM_openInTab(allPageBgUrl, {active: true, insert: true});
                    }
                });
                if (allPageNewMode) alllist.classList.add("new-mode");

                let dayInAll = document.createElement("span");
                dayInAll.className = "dayInAll";
                alllist.appendChild(dayInAll);
                this.dayInAll = dayInAll;

                alllist.addEventListener(getSupportWheelEventName(), e => {
                    self.tips.style.display = "none";
                    clearTimeout(self.requestShowTipsTimer);
                    if (e.target != alllist && e.target != showallBg && e.target != sitelistBox) return;
                    if (alllist.classList.contains("new-mode")) return;
                    var deltaX, deltaY;
                    if(e.type !== 'wheel'){
                        var x = 0, y = 0;
                        if (typeof e.axis == 'number') {
                            if (e.axis == 2) {
                                y = e.detail;
                            } else {
                                x = e.detail;
                            }
                        } else {
                            if (typeof e.wheelDeltaY == 'undefined' || e.wheelDeltaY != 0) {
                                y = -e.wheelDelta / 40;
                            } else {
                                x = -e.wheelDelta / 40;
                            };
                        };
                        deltaY = y;
                        deltaX = x;

                    } else {
                        deltaX = e.deltaX;
                        deltaY = e.deltaY;
                    }
                    e.preventDefault();
                    e.stopPropagation();

                    alllist.scrollLeft += deltaY;
                }, { passive: false, capture: false });


                let logoConfigBtn = document.createElement("span");
                logoConfigBtn.innerHTML = createHTML(logoBtnSvg);
                logoConfigBtn.className = "search-jumper-btn";
                logoConfigBtn.addEventListener('click', e => {
                    _GM_openInTab(configPage, {active: true, insert: true});
                });
                alllist.appendChild(logoConfigBtn);


                let historylistCon = document.createElement("div");
                historylistCon.className = "search-jumper-historylistcon";
                alllist.appendChild(historylistCon);

                let historylist = document.createElement("div");
                historylist.className = "search-jumper-historylist";
                historylistCon.appendChild(historylist);
                this.historylist = historylist;

                bar.addEventListener('mouseenter', e => {
                    if (bar.classList.contains("grabbing")) return;
                    if (this.hideTimeout) {
                        clearTimeout(this.hideTimeout);
                    }
                    this.checkScroll(true);
                    if (searchData.prefConfig.mouseLeaveToHide) {
                        bar.classList.remove("initShow");
                    }
                }, false);
                bar.addEventListener('mouseleave', e => {
                    if (searchData.prefConfig.mouseLeaveToHide) {
                        if (bar.classList.contains("grabbing")) return;
                        self.waitForHide();
                    }
                    if (self.preList) {
                        self.preList.style.visibility = "hidden";
                        self.listArrow.style.cssText = "";
                    }
                }, false);

                this.touched = true;
                if (searchData.prefConfig.initShow) {
                    bar.classList.add("initShow");
                } else {
                    this.touched = false;
                }
                if (searchData.prefConfig.minSizeMode) {
                    bar.classList.add("minSizeMode");
                    bar.classList.add("minSizeModeClose");
                }
                if (isMobile && !searchData.prefConfig.resizePage) {
                    let touchBodyHandler = e => {
                        this.touched = false;
                        bar.classList.remove("initShow");
                    };
                    let touchHandler = e => {
                        if (this.touched || this.funcKeyCall) return;
                        this.touched = true;
                        bar.classList.add('disable-pointer');
                        e.stopPropagation();
                        setTimeout(() => {
                            bar.classList.remove('disable-pointer');
                        }, 250);
                    };
                    getBody(document).addEventListener("touchstart", touchBodyHandler, { passive: true, capture: false });
                    bar.addEventListener('touchstart', touchHandler, { passive: false, capture: true });
                }

                this.bar = bar;
                this.con = searchBarCon;

                let tips = document.createElement("span");
                tips.className = "search-jumper-tips";
                tips.style.opacity = 0;
                searchBarCon.appendChild(tips);
                tips.addEventListener('mouseenter', e => {
                    if (self.hideTimeout) {
                        clearTimeout(self.hideTimeout);
                    }
                }, false);
                tips.addEventListener('click', e => {
                    let dataset = e.target.dataset;
                    let text = e.target.innerText;
                    if (!dataset) return;
                    if (typeof dataset.read !== 'undefined') {
                        let msg = new SpeechSynthesisUtterance("");
                        msg.volume = dataset.volume || 1;
                        msg.rate = dataset.rate || 1;
                        msg.pitch = dataset.pitch || 1;
                        msg.lang = dataset.lang || "";
                        msg.text = dataset.read || text;
                        window.speechSynthesis.speak(msg);
                    }
                    if (typeof dataset.copy !== 'undefined') {
                        _GM_setClipboard(dataset.copy || text);
                    }
                    if (dataset.search) {
                        extSelectionText = text;
                        self.searchBySiteName(dataset.search);
                    }
                    if (typeof dataset.paste !== 'undefined') {
                        if (targetElement &&
                            ((/INPUT|TEXTAREA/i.test(targetElement.nodeName) &&
                              targetElement.getAttribute("aria-readonly") != "true"
                             ) ||
                             targetElement.contentEditable == 'true'
                            )
                           ) {
                            triggerPaste(targetElement, dataset.paste || text);
                        }
                    }
                    if (typeof dataset.close !== 'undefined') {
                        self.tips.style.opacity = 0;
                        self.tips.style.display = "none";
                        self.tips.innerHTML = createHTML("");
                    }
                }, false);
                let startMouse, startPos, mouseMoveHandler = e => {
                    let curX = clientX(e) - startMouse.x;
                    let curY = clientY(e) - startMouse.y;
                    if (Math.abs(curX) + Math.abs(curY) < 5) return;
                    if (tips.style.right === "") {
                        tips.style.setProperty("left", (startPos.left + curX) + "px", "important");
                        //tips.style.left = (startPos.left + curX) + "px!important";
                    } else {
                        tips.style.setProperty("right", (startPos.right - curX) + "px", "important");
                        //tips.style.right = (startPos.right - curX) + "px!important";
                    }
                    if (tips.style.bottom === "") {
                        tips.style.setProperty("top", (startPos.top + curY) + "px", "important");
                        //tips.style.top = (startPos.top + curY) + "px!important";
                    } else {
                        tips.style.setProperty("bottom", (startPos.bottom - curY) + "px", "important");
                        //tips.style.bottom = (startPos.bottom - curY) + "px!important";
                    }
                    tips.classList.add("draging");
                };
                let mouseUpHandler = e => {
                    document.removeEventListener('mouseup', mouseUpHandler, false);
                    document.removeEventListener('mousemove', mouseMoveHandler, false);
                    document.removeEventListener('touchend', mouseUpHandler, false);
                    document.removeEventListener('touchmove', mouseMoveHandler, false);
                    tips.classList.remove("draging");
                };
                let dragTips = (e, cb) => {
                    if (!e.target) return;
                    if (e.target !== tips && typeof e.target.dataset.drag === 'undefined') return;
                    e.preventDefault();
                    e.stopPropagation();
                    startMouse = {x: clientX(e), y: clientY(e)};
                    let tipsStyle = getComputedStyle(tips);
                    startPos = {
                        left: parseFloat(tipsStyle.left),
                        right: parseFloat(tipsStyle.right),
                        top: parseFloat(tipsStyle.top),
                        bottom: parseFloat(tipsStyle.bottom)
                    };
                    cb && cb();
                };
                tips.addEventListener('mousedown', e => {
                    dragTips(e, () => {
                        document.addEventListener('mouseup', mouseUpHandler, false);
                        document.addEventListener('mousemove', mouseMoveHandler, false);
                    });
                }, false);
                tips.addEventListener('touchstart', e => {
                    dragTips(e, () => {
                        document.addEventListener('touchend', mouseUpHandler, false);
                        document.addEventListener('touchmove', mouseMoveHandler, false);
                    });
                }, { passive: false, capture: false });
                this.tips = tips;

                //this.appendBar();

                let searchJumperNavBar = document.createElement("div");
                searchJumperNavBar.className = "searchJumperNavBar";
                searchJumperNavBar.style.display = "none";
                searchJumperNavBar.innerHTML = createHTML(`
                  <svg class="closeNavBtn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>Close navigation</title>${closePath}</svg>
                  <div class="minNavBtn" title="Minimize navigation">-</div>
                  <div id="navMarks"></div>
                  <div class="maxNavBtn" title="Restore input"><img src="${logoBase64}" /></div>
                  <div class="navPointer">></div>
                `);
                searchBarCon.appendChild(searchJumperNavBar);

                let searchJumperExpand = document.createElement("span");
                searchJumperExpand.title = i18n('expand');
                searchJumperExpand.className = "searchJumperExpand search-jumper-btn";
                searchJumperExpand.innerHTML = createHTML(`
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect height="450" width="600" y="300" x="200" fill="#fff"></rect><path d="M512 64C264.8 64 64 264.8 64 512s200.8 448 448 448 448-200.8 448-448S759.2 64 512 64z m0 640L240 432l45.6-45.6L512 613.6l226.4-226.4 45.6 45.6L512 704z"></path></svg>
                `);
                this.searchJumperExpand = searchJumperExpand;

                this.navMarks = searchJumperNavBar.querySelector("#navMarks");
                this.closeNavBtn = searchJumperNavBar.querySelector(".closeNavBtn");
                this.minNavBtn = searchJumperNavBar.querySelector(".minNavBtn");
                this.maxNavBtn = searchJumperNavBar.querySelector(".maxNavBtn");
                this.searchJumperNavBar = searchJumperNavBar;
                this.navPointer = searchJumperNavBar.querySelector(".navPointer");
                this.navPointer.style.display = "none";

                let searchInputDiv = document.createElement("div");
                searchInputDiv.className = "search-jumper-input";
                searchInputDiv.innerHTML = createHTML(`<span class="closeBtn">×</span>
                <input type="radio" id="filterSitesTab" name="tab" ${searchData.prefConfig.defaultFindTab? "" : "checked=\"checked\""} />
                <label for="filterSitesTab">${i18n("filterSites")}</label>
                <input type="radio" id="searchInPageTab" name="tab" ${searchData.prefConfig.defaultFindTab? "checked=\"checked\"" : ""} />
                <label for="searchInPageTab">${i18n("searchInPage")}</label>
                <div class="line"></div>
                <div class="content-container">
                  <div class="inputGroup" id="filterSites">
                    <input spellcheck="false" id="searchJumperInput" autocomplete="on" title="${i18n("inputTitle")}" placeholder="${i18n("inputPlaceholder")}" list="filterGlob" />
                    <input spellcheck="false" id="searchJumperInputKeyWords" autocomplete="on" placeholder="${i18n("inputKeywords")}" list="suggest" />
                    <datalist id="filterGlob">
                    </datalist>
                    <datalist id="suggest">
                    </datalist>
                    <span class="search-jumper-lock-input"></span>
                    <span class="svgBtns">
                      <svg id="copyEleBtn" style="display:none;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("copyEleBtn")}</title><path d="M706.5 188.4H190.2c-29.8 0-54 24.2-54 54v662.9c0 29.8 24.2 54 54 54h516.3c29.8 0 54-24.2 54-54V242.4c0-29.8-24.2-54-54-54z m-18 698.9H208.2V260.4h480.3v626.9zM313.7 512.2h275.2c19.9 0 36-16.1 36-36s-16.1-36-36-36H313.7c-19.9 0-36 16.1-36 36s16.1 36 36 36zM313.7 715.2h201.6c19.9 0 36-16.1 36-36s-16.1-36-36-36H313.7c-19.9 0-36 16.1-36 36s16.1 36 36 36zM837.2 64.7H302.9c-19.9 0-36 16.1-36 36s16.1 36 36 36h516.3v662.9c0 19.9 16.1 36 36 36s36-16.1 36-36V118.7c0-29.8-24.2-54-54-54z"></path></svg>
                      <svg id="openLinkBtn" style="display:none;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("openLinkBtn")}</title><path d="M429.013333 640A32 32 0 0 1 384 594.986667l37.76-37.76-22.826667-22.613334-135.68 135.68 90.453334 90.453334 135.68-135.68-22.613334-22.613334zM534.613333 398.933333l22.613334 22.613334L594.986667 384A32 32 0 0 1 640 429.013333l-37.76 37.76 22.613333 22.613334 135.68-135.68-90.453333-90.453334z"/><path d="M512 21.333333a490.666667 490.666667 0 1 0 490.666667 490.666667A490.666667 490.666667 0 0 0 512 21.333333z m316.8 354.986667l-181.12 181.12a32 32 0 0 1-45.226667 0L557.226667 512 512 557.226667l45.226667 45.226666a32 32 0 0 1 0 45.226667l-181.12 181.12a32 32 0 0 1-45.226667 0l-135.68-135.68a32 32 0 0 1 0-45.226667l181.12-181.12a32 32 0 0 1 45.226667 0L466.773333 512 512 466.773333l-45.226667-45.226666a32 32 0 0 1 0-45.226667l181.12-181.12a32 32 0 0 1 45.226667 0l135.68 135.68a32 32 0 0 1 0 45.226667z"/></svg>
                      <svg id="maxEleBtn" style="display:none;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("maxEleBtn")}</title><path d="M192 832h160a32 32 0 0 1 0 64H160a32 32 0 0 1-32-32V672a32 32 0 0 1 64 0zM182.72 886.72a32 32 0 0 1-45.44-45.44l224-224a32 32 0 0 1 45.44 45.44zM832 832V672a32 32 0 0 1 64 0v192a32 32 0 0 1-32 32H672a32 32 0 0 1 0-64zM886.72 841.28a32 32 0 0 1-45.44 45.44l-224-224a32 32 0 0 1 45.44-45.44zM192 192v160a32 32 0 0 1-64 0V160a32 32 0 0 1 32-32h192a32 32 0 0 1 0 64zM137.28 182.72a32 32 0 0 1 45.44-45.44l224 224a32 32 0 0 1-45.44 45.44zM832 192H672a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0zM841.28 137.28a32 32 0 1 1 45.44 45.44l-224 224a32 32 0 0 1-45.44-45.44z"></path></svg>
                      <svg id="minEleBtn" style="display:none;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("minEleBtn")}</title><path d="M672 352h160a32 32 0 0 1 0 64H640a32 32 0 0 1-32-32V192a32 32 0 0 1 64 0zM662.72 406.72a32 32 0 0 1-45.44-45.44l224-224a32 32 0 1 1 45.44 45.44zM352 352V192a32 32 0 0 1 64 0v192a32 32 0 0 1-32 32H192a32 32 0 0 1 0-64zM406.72 361.28a32 32 0 0 1-45.44 45.44l-224-224a32 32 0 0 1 45.44-45.44zM672 672v160a32 32 0 0 1-64 0V640a32 32 0 0 1 32-32h192a32 32 0 0 1 0 64zM617.28 662.72a32 32 0 0 1 45.44-45.44l224 224a32 32 0 0 1-45.44 45.44zM192 672a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V672zM361.28 617.28a32 32 0 0 1 45.44 45.44l-224 224a32 32 0 0 1-45.44-45.44z"></path></svg>
                      <svg id="pickerBtn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("multiPickerBtn")}</title><path d="M874.048 533.333333C863.424 716.629333 716.629333 863.424 533.333333 874.048V917.333333a21.333333 21.333333 0 0 1-42.666666 0v-43.285333C307.370667 863.424 160.576 716.629333 149.952 533.333333H106.666667a21.333333 21.333333 0 0 1 0-42.666666h43.285333C160.576 307.370667 307.370667 160.576 490.666667 149.952V106.666667a21.333333 21.333333 0 0 1 42.666666 0v43.285333c183.296 10.624 330.090667 157.418667 340.714667 340.714667h42.816a21.333333 21.333333 0 1 1 0 42.666666H874.026667z m-42.752 0h-127.786667a21.333333 21.333333 0 0 1 0-42.666666h127.786667C820.778667 330.922667 693.056 203.221333 533.333333 192.704V320a21.333333 21.333333 0 0 1-42.666666 0V192.704C330.922667 203.221333 203.221333 330.944 192.704 490.666667H320a21.333333 21.333333 0 0 1 0 42.666666H192.704c10.517333 159.744 138.24 287.445333 297.962667 297.962667V704a21.333333 21.333333 0 0 1 42.666666 0v127.296c159.744-10.517333 287.445333-138.24 297.962667-297.962667zM512 554.666667a42.666667 42.666667 0 1 1 0-85.333334 42.666667 42.666667 0 0 1 0 85.333334z"></path></svg>
                    </span>
                  </div>
                  <div class="inputGroup" id="searchInPage">
                    <span class="lockWords"></span>
                    <input spellcheck="false" id="searchJumperInPageInput" autocomplete="on" title="${i18n("inPageTips")}" placeholder="${i18n("inPagePlaceholder")}" />
                    <span class="svgBtns">
                      <svg id="editBtn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("editBtn")}</title><path d="M928 365.664a32 32 0 0 0-32 32V864a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h429.6a32 32 0 0 0 0-64H160a96 96 0 0 0-96 96v704a96 96 0 0 0 96 96h704a96 96 0 0 0 96-96V397.664a32 32 0 0 0-32-32z"></path><path d="M231.616 696.416a38.4 38.4 0 0 0 44.256 53.792l148-38.368L950.496 185.248 814.72 49.472 290.432 573.76l-58.816 122.656z m111.808-85.12L814.72 140l45.248 45.248-468.992 468.992-77.824 20.16 30.272-63.104z"></path></svg>
                      <svg id="addWord" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("addWord")}</title><path d="M821.364 962h-618.75C123.864 962 62 900.114 62 821.364v-618.75c0-78.75 61.864-140.635 140.614-140.635h618.75c78.75 0 140.636 61.885 140.636 140.635v618.75C962 900.114 900.114 962 821.364 962z m79.265-756.814c0-46.586-35.25-81.815-81.815-81.815H205.186c-46.843-0.214-84.557 34.758-83.165 82.393-0.128 14.4 1.35 613.05 1.35 613.05 0 46.565 35.25 81.815 81.815 81.815h613.628c46.565 0 81.815-35.25 81.815-81.815V205.186z m-173.55 347.657H552.843v174.236c0 16.95-13.736 30.685-30.686 30.685h-0.236a30.686 30.686 0 0 1-30.685-30.685V552.843H296.92a30.686 30.686 0 0 1-30.685-30.686v-0.236c0-16.95 13.735-30.685 30.685-30.685h194.315V296.92c0-16.95 13.735-30.685 30.685-30.685h0.236c16.95 0 30.686 13.735 30.686 30.685v194.315h174.236c16.95 0 30.685 13.735 30.685 30.685v0.236c0 16.95-13.735 30.686-30.685 30.686z"></path></svg>
                      <svg id="emptyBtn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("emptyBtn")}</title><path d="m159.45829,231.40004l-48.83334,0a36.625,34.1375 0 0 1 0,-68.275l805.75004,0a36.625,34.1375 0 0 1 0,68.275l-683.6667,0l0,603.09581a61.04167,56.89583 0 0 0 61.04167,56.89584l439.50002,0a61.04167,56.89583 0 0 0 61.04167,-56.89584l0,-500.68332a36.625,34.1375 0 0 1 73.25,0l0,500.68332c0,69.12844 -60.12604,125.17084 -134.29167,125.17084l-439.50002,0c-74.16563,0 -134.29167,-56.0424 -134.29167,-125.17084l0,-603.09581zm256.37501,-113.79167a36.625,34.1375 0 0 1 0,-68.275l195.33334,0a36.625,34.1375 0 0 1 0,68.275l-195.33334,0zm-36.625,307.23749a36.625,34.1375 0 0 1 73.25,0l0,273.09999a36.625,34.1375 0 0 1 -73.25,0l0,-273.09999zm195.33334,0a36.625,34.1375 0 0 1 73.25,0l0,273.09999a36.625,34.1375 0 0 1 -73.25,0l0,-273.09999z"/></svg>
                      <svg id="copyInPageBtn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("copyInPageBtn")}</title><path d="M706.5 188.4H190.2c-29.8 0-54 24.2-54 54v662.9c0 29.8 24.2 54 54 54h516.3c29.8 0 54-24.2 54-54V242.4c0-29.8-24.2-54-54-54z m-18 698.9H208.2V260.4h480.3v626.9zM313.7 512.2h275.2c19.9 0 36-16.1 36-36s-16.1-36-36-36H313.7c-19.9 0-36 16.1-36 36s16.1 36 36 36zM313.7 715.2h201.6c19.9 0 36-16.1 36-36s-16.1-36-36-36H313.7c-19.9 0-36 16.1-36 36s16.1 36 36 36zM837.2 64.7H302.9c-19.9 0-36 16.1-36 36s16.1 36 36 36h516.3v662.9c0 19.9 16.1 36 36 36s36-16.1 36-36V118.7c0-29.8-24.2-54-54-54z"></path></svg>
                      <svg id="wordModeBtn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("wordModeBtn")}</title><path d="M832 128c38.4 0 64 25.6 64 64v640c0 38.4-25.6 64-64 64H192c-38.4 0-64-25.6-64-64V192c0-38.4 25.6-64 64-64h640m0-64H192c-70.4 0-128 57.6-128 128v640c0 70.4 57.6 128 128 128h640c70.4 0 128-57.6 128-128V192c0-70.4-57.6-128-128-128z"></path><path d="M736 812.8h-448c-19.2 0-32-12.8-32-32s12.8-32 32-32h448c19.2 0 32 12.8 32 32 0 12.8-12.8 32-32 32zM320 704c-19.2-6.4-25.6-25.6-19.2-44.8l185.6-454.4c6.4-12.8 25.6-19.2 38.4-12.8 19.2 6.4 25.6 25.6 19.2 44.8l-185.6 454.4c-6.4 12.8-25.6 19.2-38.4 12.8z"></path><path d="M704 691.2c19.2-6.4 25.6-25.6 19.2-44.8L544 211.2c-6.4-19.2-25.6-25.6-38.4-19.2-19.2 6.4-25.6 25.6-19.2 38.4l179.2 441.6c6.4 19.2 25.6 25.6 38.4 19.2z"></path><path d="M371.2 492.8h256v64h-256z"></path></svg>
                      <svg id="recoverBtn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("recoverBtn")}</title><path d="M502.26 289.06c-0.02 16.95 13.26 30.94 30.18 31.8 123.47 8.79 236.97 70.94 310.89 170.21 73.92 99.28 100.91 225.84 73.93 346.65-41.65-181.74-195.38-316.12-381.05-333.08-8.89-0.6-17.63 2.55-24.09 8.7a31.798 31.798 0 0 0-9.86 23.64v85.15a32.343 32.343 0 0 1-50.67 26.41L114.21 413.02a32.341 32.341 0 0 1-14.46-26.95c0-10.84 5.43-20.96 14.46-26.95L451.6 124.68a32.358 32.358 0 0 1 33.28-2.03 32.355 32.355 0 0 1 17.39 28.44v137.97h-0.01z"></path></svg>
                      <svg id="saveRuleBtn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("saveRuleBtn")}</title><path d="M579.7 291.4c18.8 0 34.1-15.3 34.1-34.1v-34.1c0-18.8-15.4-34.1-34.1-34.1-18.8 0-34.1 15.3-34.1 34.1v34.1c0 18.7 15.4 34.1 34.1 34.1zM944.7 216.3L808.2 79.9c-6.8-6.8-15.3-10.2-23.9-10.2H170.4c-56.3 0-102.3 46-102.3 102.3v682.1c0 56.3 46 102.3 102.3 102.3H852.5c56.3 0 102.3-46 102.3-102.3V240.2c0.1-8.5-3.3-17-10.1-23.9zM358 137.9h307v182.5c0 11.9-10.2 22.2-22.2 22.2H380.2c-11.9 0-22.2-10.2-22.2-22.2V137.9z m358.1 750.3H306.9V652.9c0-20.5 17.1-37.5 37.5-37.5h334.2c20.5 0 37.5 17 37.5 37.5v235.3z m170.6-34.1c0 18.8-15.3 34.1-34.1 34.1h-66.5V652.9c0-58-47.7-105.7-105.7-105.7h-336c-58 0-105.7 47.7-105.7 105.7v235.3h-68.2c-18.8 0-34.1-15.3-34.1-34.1V172c0-18.8 15.3-34.1 34.1-34.1h119.4v182.5c0 49.5 40.9 90.4 90.4 90.4h262.6c49.5 0 90.4-40.9 90.4-90.4V137.9h37.5l116 116v600.2z"></path></svg>
                      <svg id="pinBtn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("pinBtn")}</title><path d="m674.8822,92.83803a81.61801,81.04246 0 0 1 25.30158,17.09996l213.75757,212.46631a81.61801,81.04246 0 0 1 -24.70304,131.36982l-75.74151,33.30845l-142.09696,141.257l-11.26329,155.3854a81.61801,81.04246 0 0 1 -139.13151,51.46196l-137.98885,-137.15085l-235.14149,234.56388l-57.83996,-57.18896l235.27751,-234.69896l-142.7499,-141.85131a81.61801,81.04246 0 0 1 51.6642,-138.09635l160.95072,-11.94025l139.5668,-138.74469l32.78324,-75.09935a81.61801,81.04246 0 0 1 107.35489,-42.14208zm-32.45675,74.36997l-38.95901,89.22775l-171.94193,170.99958l-191.25821,14.1284l338.46989,336.3262l13.43977,-185.47917l174.33607,-173.32279l89.69819,-39.44067l-213.78477,-212.43929z"></path></svg>
                      <svg id="locBtn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("locBtn")}</title><path d="M357.6 832l-255.2 56c-20 4.8-39.2-10.4-39.2-31.2V569.6c0-15.2 10.4-28 24.8-31.2L243.2 504l53.6 53.6L139.2 592c-7.2 1.6-12.8 8-12.8 16v188c0 10.4 9.6 17.6 19.2 16l192.8-42.4 12.8-3.2 12.8 2.4 306.4 60.8 210.4-47.2c7.2-1.6 12.8-8 12.8-16V580c0-10.4-9.6-17.6-19.2-16L688 606.4l-12 2.4L760 524.8l160.8-36c20-4.8 39.2 10.4 39.2 31.2v286.4c0 15.2-10.4 28-24.8 31.2L672.8 896M512 128c-115.2 0-206.4 101.6-190.4 220 5.6 41.6 26.4 80 56 109.6l0.8 0.8L512 591.2l133.6-132.8 0.8-0.8c29.6-29.6 49.6-68 56-109.6C719.2 229.6 627.2 128 512 128m0-64c141.6 0 256 114.4 256 256 0 70.4-28 133.6-74.4 180L512 681.6 330.4 500C284.8 453.6 256 390.4 256 320 256 178.4 371.2 64 512 64z m64.8 193.6c0-35.2-28.8-64-64-64s-64 28.8-64 64 28.8 64 64 64 64-28 64-64z"></path></svg>
                    </span>
                    <div id="addons"></div>
                  </div>
                </div>
                <div id="rightSizeChange"></div>
                `);
                searchBarCon.appendChild(searchInputDiv);
                this.searchInputDiv = searchInputDiv;
                this.searchInput = searchInputDiv.querySelector("#searchJumperInput");
                this.searchJumperInputKeyWords = searchInputDiv.querySelector("#searchJumperInputKeyWords");
                this.searchLockInput = searchInputDiv.querySelector(".search-jumper-lock-input");
                this.searchJumperInPageInput = searchInputDiv.querySelector("#searchJumperInPageInput");
                this.pickerBtn = searchInputDiv.querySelector("#pickerBtn");
                this.minEleBtn = searchInputDiv.querySelector("#minEleBtn");
                this.maxEleBtn = searchInputDiv.querySelector("#maxEleBtn");
                this.copyEleBtn = searchInputDiv.querySelector("#copyEleBtn");
                this.openLinkBtn = searchInputDiv.querySelector("#openLinkBtn");
                this.editBtn = searchInputDiv.querySelector("#editBtn");
                this.addWord = searchInputDiv.querySelector("#addWord");
                this.recoverBtn = searchInputDiv.querySelector("#recoverBtn");
                this.wordModeBtn = searchInputDiv.querySelector("#wordModeBtn");
                this.saveRuleBtn = searchInputDiv.querySelector("#saveRuleBtn");
                this.pinBtn = searchInputDiv.querySelector("#pinBtn");
                this.locBtn = searchInputDiv.querySelector("#locBtn");
                this.emptyBtn = searchInputDiv.querySelector("#emptyBtn");
                this.copyInPageBtn = searchInputDiv.querySelector("#copyInPageBtn");
                this.closeBtn = searchInputDiv.querySelector(".closeBtn");
                this.filterSites = searchInputDiv.querySelector("#filterSites");
                this.filterSitesTab = searchInputDiv.querySelector("#filterSitesTab");
                this.searchInPageTab = searchInputDiv.querySelector("#searchInPageTab");
                this.searchInPageLockWords = searchInputDiv.querySelector("#searchInPage>.lockWords");
                this.contentContainer = searchInputDiv.querySelector(".content-container");
                this.rightSizeChange = searchInputDiv.querySelector("#rightSizeChange");
                this.filterGlob = searchInputDiv.querySelector("#filterGlob");
                this.suggestDatalist = searchInputDiv.querySelector("#suggest");
                this.addonsList = searchInputDiv.querySelector("#addons");
                this.fakeTextareas = new Map();
                this.addonCheckboxDict = {};
            }

            showInPageSearch() {
                this.searchInPageTab.checked = true;
                this.showSearchInput();
                this.initSetInPageWords();
                this.searchJumperInPageInput.value = "";
                this.initShowSearchInput = true;
            }

            showFilterSearch() {
                this.filterSitesTab.checked = true;
                this.showSearchInput();
            }

            initSetInPageWords() {
                if (this.searchInPageTab.checked && !this.searchJumperInPageInput.value) {
                    let words = getSelectStr() || this.searchJumperInputKeyWords.value.replace(/^\*/, "") || getKeywords();
                    if (words) {
                        try {
                            words = decodeURIComponent(words);
                        } catch (e) {}
                    }
                    if (this.lockWords && this.lockWords.indexOf(words) !== -1) return;
                    this.searchJumperInPageInput.value = words || globalInPageWords;
                    if (!this.lockWords) {
                        this.submitIgnoreSpace(this.searchJumperInPageInput.value);
                        //this.submitInPageWords();
                    }
                }
            }

            anylizeInPageWords(words, init) {
                if (!words) return [];
                let self = this;
                let result = [];
                if (!this.lockWords) {
                    if (words.indexOf("$c") === 0 && words.length > 2) {
                        words = words.substr(3).trim();
                    } else if (words.indexOf("$o") === 0) {
                        words = words.substr(2).trim();
                    }
                }
                if (this.splitSep) {
                    let inWordMode = this.wordModeBtn.classList.contains("checked");
                    let splitSep = inWordMode ? new RegExp(`[\\${this.splitSep} ]`) : this.splitSep;

                    words.split(splitSep).sort((a, b) => b.length - a.length).forEach(word => {
                        let oriWord = word;
                        word = word.trim();
                        if (!word) return;
                        if (init) {
                            if (word.length < (searchData.prefConfig.limitInPageLen || 1)) return;
                            if ((searchData.prefConfig.ignoreWords || []).includes(word.toLowerCase())) return;
                        }
                        let title = "";
                        let style = "";
                        let popup = false;
                        let hideParent;
                        let link;
                        let inRange;
                        let isRe = false;
                        let reCase = "";
                        let titleReg = /\$t{(.*?)}($|\$)/;
                        let titleMatch = word.match(titleReg);
                        let showTips = 0;
                        if (titleMatch) {
                            title = titleMatch[1];
                            word = word.replace(titleReg, "$2");
                            if (title == "\\$popup") title = "$popup";
                            else if (title == "\\@popup") title = "@popup";
                            else {
                                let popupMatch = title.match(/^[\$@]popup(\((.*)\))?$/);
                                if (popupMatch) {
                                    title = "";
                                    popup = true;
                                    if (popupMatch[1]) {
                                        showTips = popupMatch[2] || "1";
                                    }
                                }
                            }
                        }
                        let hideParentReg = /\$p{(.*?)}($|\$)/;
                        let hideParentMatch = word.match(hideParentReg);
                        if (hideParentMatch) {
                            hideParent = parseInt(hideParentMatch[1]) || 0;
                            word = word.replace(hideParentReg, "$2");
                        }
                        let inRangeReg = /\$in{(.*?)}($|\$)/;
                        let inRangeMatch = word.match(inRangeReg);
                        if (inRangeMatch) {
                            inRange = inRangeMatch[1] || '';
                            word = word.replace(inRangeReg, "$2");
                        }
                        let styleReg = /\$s{(.*?)}($|\$)/;
                        let styleMatch = word.match(styleReg);
                        if (styleMatch) {
                            let bg = styleMatch[1], otherCss = "";
                            styleMatch = styleMatch[1].match(/(.*?);(.*)/);
                            if (styleMatch) {
                                bg = styleMatch[1];
                                otherCss = styleMatch[2];
                            }
                            style = self.getHighlightStyle(self.curWordIndex, bg, otherCss);
                            word = word.replace(styleReg, "$2");
                        } else {
                            style = self.getHighlightStyle(self.curWordIndex, "", "");
                        }
                        let showWords = "";
                        if (word.indexOf("@") === 0) {
                            showWords = word;
                            let wordTemp = searchData.prefConfig.inPageRule && searchData.prefConfig.inPageRule[word];
                            if (wordTemp) word = wordTemp;
                            //else return;
                        } else {
                            word = word.replace(/^\\@/, "@");
                        }
                        let reMatch = word.match(/^\/(.*)\/([il]*)($|\$)/);
                        if (reMatch) {
                            isRe = true;
                            word = reMatch[1];
                            reCase = reMatch[2].indexOf("i") != -1 ? "i" : "";
                            link = reMatch[2].indexOf("l") != -1;
                        }
                        if (!showWords) showWords = word;
                        if (self.highlightSpans[showWords]) return;
                        result.push({content: word, showWords: showWords, isRe: isRe, link: link, reCase: reCase, title: title, style: style, oriWord: oriWord, hideParent: hideParent, inRange: inRange, popup: popup, showTips: showTips, init: init});
                        self.curWordIndex++;
                    });
                } else {
                    this.curWordIndex = 0;
                    let word = (this.lockWords || "").replace(/^\$o/, "") + words;
                    result = [{content: word, showWords: word, isRe: false, reCase: "", title: "", style: self.getHighlightStyle(self.curWordIndex, "", ""), init: init}];
                }
                return result;
            }

            submitInPageWords(init) {
                let self = this;
                let words = this.searchJumperInPageInput.value;
                let wordSpans = [];
                if (!words) {
                    if (!this.lockWords) {
                        this.highlight("");
                    } else {
                        this.highlight("insert");
                        for (let i in this.highlightSpans) {
                            let span = this.highlightSpans[i];
                            let curList = this.marks[i];
                            this.setHighlightSpan(span, 0, curList);
                        }
                    }
                    return wordSpans;
                }
                this.initHighlight = !!init;
                if (this.initHighlight) {
                    setTimeout(() => {
                        this.initHighlight = false;
                    }, 500);
                }
                if (!this.lockWords) {
                    if (words.indexOf("$c") === 0 && words.length > 2) {
                        this.splitSep = words.substr(2, 1);
                    } else if (words.indexOf("$o") === 0) {
                        this.splitSep = null;
                    } else this.splitSep = "◎";
                    this.curWordIndex = 0;
                }
                this.searchJumperInPageInput.value = "";
                let targetWords = this.anylizeInPageWords(words, this.initHighlight);
                if (!targetWords || targetWords.length == 0) return wordSpans;
                if (this.lockWords) {
                    this.lockWords += (this.lockWords.indexOf(this.splitSep) === this.lockWords.length - this.splitSep.length ? "" : this.splitSep) + words;
                } else this.lockWords = words;
                if (!this.splitSep) {
                    this.searchInPageLockWords.innerHTML = createHTML();
                    this.highlight("");
                }
                this.highlight(targetWords);
                targetWords.forEach(word => {
                    if (!word) return;
                    let wordSpan = document.createElement("span");
                    wordSpan.innerHTML = createHTML(word.showWords);
                    wordSpan.title = word.title ? JSON.parse('"' + word.title + '"') : word.showWords;
                    let background = word.style.match(/background: *(#?\w+)/);
                    if (background && background[1].indexOf('unset') === -1) wordSpan.style.background = background[1];
                    let color = word.style.match(/color: *(#?\w+)/);
                    if (color) wordSpan.style.color = color[1];

                    wordSpan.addEventListener("click", e => {
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    });
                    wordSpan.oncontextmenu = e => {
                        e.preventDefault();
                    };
                    wordSpan.addEventListener('dblclick', e => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (e.target.nodeName.toUpperCase() === 'EM') return;
                        if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
                        if (this.lockWords.indexOf(word.oriWord) === -1) {
                            return;
                        }
                        this.showModifyWindow(word, wordSpan);
                    }, true);
                    wordSpan.addEventListener("mousedown", e => {
                        if (e.button === 0) {
                            this.focusHighlightByText(word.showWords, true, wordSpan);
                        } else if (e.button === 2){
                            this.focusHighlightByText(word.showWords, false, wordSpan);
                        }
                    });
                    let wheelScrolling = false;
                    wordSpan.addEventListener(getSupportWheelEventName(), e => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (wheelScrolling) return;
                        wheelScrolling = true;
                        setTimeout(() => {
                            wheelScrolling = false;
                        }, 100);
                        let deltaY;
                        if(e.type !== 'wheel'){
                            let y = 0;
                            if (typeof e.axis == 'number') {
                                if (e.axis == 2) {
                                    y = e.detail;
                                }
                            } else {
                                if (typeof e.wheelDeltaY == 'undefined' || e.wheelDeltaY != 0) {
                                    y = -e.wheelDelta / 40;
                                }
                            };
                            deltaY = y;

                        } else {
                            deltaY = e.deltaY;
                        }
                        this.focusHighlightByText(word.showWords, deltaY > 0, wordSpan);
                    }, { passive: false, capture: false });
                    wordSpan.addEventListener("editword", e => {
                        wordSpan.parentNode.removeChild(wordSpan);
                        this.removeHighlightWord(word);
                        this.searchJumperInPageInput.value = word.content;
                    });
                    let removeBtn = document.createElement("div");
                    removeBtn.addEventListener("mousedown", e => {
                        e.stopPropagation();
                        e.preventDefault();
                        /*if (this.wordModeBtn.classList.contains("checked")) {
                            this.wordModeBtn.classList.remove("checked");
                            if (this.lockWords) {
                                this.refreshPageWords(this.lockWords);
                            }
                            return;
                        }*/
                        wordSpan.parentNode.removeChild(wordSpan);
                        this.removeHighlightWord(word);
                    });
                    removeBtn.className = "lockWordTool";
                    removeBtn.innerHTML = createHTML(`<span title="${i18n("removeBtn")}">×</span>`);
                    wordSpan.appendChild(removeBtn);

                    let modifyBtn = document.createElement("div");
                    modifyBtn.addEventListener("mousedown", e => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (this.lockWords.indexOf(word.oriWord) === -1) {
                            return;
                        }
                        this.showModifyWindow(word, wordSpan);
                    });
                    modifyBtn.className = "lockWordTool modifyBtn";
                    modifyBtn.innerHTML = createHTML(`<span>+</span>`);
                    wordSpan.appendChild(modifyBtn);

                    let curList = this.marks[word.showWords];
                    this.setHighlightSpan(wordSpan, -1, curList);
                    this.highlightSpans[word.showWords] = wordSpan;

                    this.searchInPageLockWords.appendChild(wordSpan);
                    wordSpans.push(wordSpan);
                });
                if (this.searchInPageLockWords.scrollTop <= 0) this.searchInPageLockWords.scrollTop = this.searchInPageLockWords.scrollHeight;
                this.searchJumperInPageInput.style.paddingLeft = this.searchInPageLockWords.clientWidth + 3 + "px";
                if (this.navMarks.innerHTML && this.con.style.display === "none") this.con.style.display = "";
                return wordSpans;
            }

            async showCustomInputWindow(url, callback) {
                return new Promise((resolve) => {
                    this.customInputCallback = callback;
                    let geneFinalUrl = () => {
                        let finalValue = this.finalSearch.dataset.url;
                        let index = 0;
                        [].forEach.call(this.customGroup.children, ele => {
                            let value = ele.value;
                            if (ele.className == "select") {
                                value = ele.children[0].value;
                            } else if (/^DIV$/i.test(ele.nodeName)) return;
                            finalValue = finalValue.replaceAll('◎' + index, value || '');
                            index++;
                        });
                        this.finalSearch.value = finalValue;
                    };
                    if (!this.customInputFrame) {
                        let customInputCssText = `
                         .customInputFrame-body {
                             width: 300px;
                             min-height: 200px;
                             position: fixed;
                             text-align: left;
                             left: 50%;
                             top: 50%;
                             margin-top: -160px;
                             margin-left: -150px;
                             z-index: 2147483647;
                             background-color: #ffffff;
                             border: 1px solid #afb3b6;
                             border-radius: 10px;
                             opacity: 0.95;
                             filter: alpha(opacity=95);
                             box-shadow: 5px 5px 20px 0px #000;
                             color: #6e7070;
                             font-size: initial;
                         }
                         .customInputFrame-body #customGroup {
                             max-height: 50vh;
                             overflow: auto;
                             scrollbar-width: none;
                         }
                         .customInputFrame-body #customGroup::-webkit-scrollbar {
                             width: 0 !important;
                             height: 0 !important;
                         }
                         .customInputFrame-title {
                             background: #458bd1!important;
                             display: flex!important;
                             align-items: center!important;
                             justify-content: center!important;
                             color: white!important;
                             font-weight: bold;
                             font-size: 18px!important;
                             border-radius: 10px 10px 0 0!important;
                         }
                         .customInputFrame-title>img {
                             margin: 5px;
                             height: 32px;
                             width: 32px;
                         }
                         .customInputFrame-input-title {
                             font-size: 9pt;
                             font-family: Arial, sans-serif,微软雅黑,"Noto Sans SC";
                             display: inline-block;
                             background-color: white;
                             position: relative;
                             left: 20px;
                             padding: 0px 4px;
                             text-align: left;
                             color: #646464;
                             word-break: break-all;
                             max-width: 85%;
                             z-index: 1;
                         }
                         .customInputFrame-body input[type=text],
                         .customInputFrame-body input[type=number],
                         .customInputFrame-body textarea,
                         .customInputFrame-body .select {
                             resize: both;
                             font-size: 11pt;
                             font-weight: normal;
                             border-radius: 4px;
                             border: 1px solid rgba(0, 0, 0, 0.23);
                             margin: 4px;
                             font-family: inherit;
                             background-color: #FFF;
                             width: calc(100% - 8px);
                             color: #4A4A4A;
                             margin-top: -8px;
                             padding: 4px;
                             padding-top: 8px;
                             box-sizing: border-box;
                         }
                         .customInputFrame-buttons {
                             text-align: center;
                             margin-bottom: 5px;
                             display: flex;
                             justify-content: space-evenly;
                         }
                         .customInputFrame-buttons>button {
                             width: 32%;
                             font-size: 16px;
                             cursor: pointer;
                             border: 1px solid #1976d2;
                             border-radius: 4px;
                             transition: all .3s;
                             color: #fff;
                             background-color: #458bd1;
                             line-height: 25px;
                         }
                         .customInputFrame-buttons>button:hover {
                             color: #e3f2fd;
                         }
                         .customInputFrame-body .select {
                             height: 30px;
                             position: relative;
                         }
                         .customInputFrame-body .select>input[type=text] {
                             top: 0px;
                             left: -7px;
                             position: relative;
                             border: unset!important;
                             width: calc(100% - 25px);
                             padding-bottom: 3px;
                             margin-bottom: -30px;
                             float: left;
                             background: unset;
                             height: 28px;
                             outline: unset;
                         }
                         .customInputFrame-body .select>p {
                             padding: 0;
                             margin: 0;
                             position: absolute;
                             pointer-events: none;
                         }
                         .customInputFrame-body .select>.options {
                             position: absolute;
                             visibility: hidden;
                             opacity: 0;
                             transition: opacity .1s;
                             background-color: #FFF;
                             color: #4A4A4A;
                             border: 1px solid rgba(0, 0, 0, 0.23);
                             border-radius: 4px;
                             z-index: 10;
                             width: auto;
                             max-width: 35%;
                             right: calc(50% - 147px);
                             margin-top: -10px;
                             position: fixed;
                         }
                         .customInputFrame-body .select>input:focus+p {
                             display: none;
                         }
                         .customInputFrame-body .select:hover>.options {
                             visibility: visible;
                             opacity: 1;
                         }
                         .customInputFrame-body .select>.options>p {
                             cursor: pointer;
                             min-height: 20px;
                             padding: 3px 0;
                             margin: 0;
                         }
                         .customInputFrame-body .select>.options>p:hover {
                             background: aliceblue;
                         }
                         .customInputFrame-body div.select:after {
                             content: "▼";
                             position: absolute;
                             right: 6px;
                             top: 8px;
                             font-size: 9px;
                         }
                         @media (prefers-color-scheme: dark) {
                           .customInputFrame-body,
                           .customInputFrame-input-title,
                           .customInputFrame-body input,
                           .customInputFrame-body textarea,
                           .customInputFrame-body .select {
                             background-color: black!important;
                             color: #d5d5d5!important;
                           }
                           .customInputFrame-body input:focus,
                           .customInputFrame-body textarea:focus,
                           .customInputFrame-body .select:focus {
                             background-color: #1e1e1e!important;
                           }
                           .customInputFrame-body input,
                           .customInputFrame-body textarea,
                           .customInputFrame-body .select {
                             border: 1px solid rgb(255 255 255 / 36%)!important;
                             background-color: #0c0c0c!important;
                           }
                           .customInputFrame-title,
                           .customInputFrame-buttons>button {
                             background: #245d8f!important;
                           }
                           .customInputFrame-body .select>.options {
                             border: 1px solid rgb(255 255 255 / 36%)!important;
                             background-color: black;
                             color: #d5d5d5;
                           }
                           .customInputFrame-body .select>.options>p:hover {
                             background: #1e1e1e;
                           }
                         }
                        `;
                        let customInputCssEle = _GM_addStyle(customInputCssText);
                        let customInputFrame = document.createElement("div");
                        this.customInputFrame = customInputFrame;
                        customInputFrame.innerHTML = createHTML(`
                         <div class="customInputFrame-body">
                             <a href="${homePage}" class="customInputFrame-title" target="_blank">
                                 <img width="32px" height="32px" src="${logoBase64}" />${i18n("customInputFrame")}
                             </a>
                             <div id="customGroup">
                             </div>
                             <div class="customInputFrame-input-title">${i18n("finalSearch")}</div>
                             <textarea name="finalSearch" type="text"></textarea>
                             <div class="customInputFrame-buttons">
                                 <button id="cancel" type="button">${i18n("cancel")}</button>
                                 <button id="customSubmit" type="button">${i18n("customSubmit")}</button>
                             </div>
                         </div>
                        `);
                        if (!disabled) customInputFrame.appendChild(customInputCssEle);
                        let cancelBtn = customInputFrame.querySelector("#cancel");
                        cancelBtn.addEventListener("click", e => {
                            if (customInputFrame.parentNode) {
                                customInputFrame.parentNode.removeChild(customInputFrame);
                            }
                            resolve("");
                        });
                        customInputFrame.addEventListener("keydown", e => {
                            if (e.keyCode == 13) {
                                customSubmit.click();
                            }
                        });
                        let customGroup = this.customInputFrame.querySelector("#customGroup");
                        this.customGroup = customGroup;
                        let finalSearch = this.customInputFrame.querySelector("[name='finalSearch']");
                        this.finalSearch = finalSearch;
                        finalSearch.addEventListener("click", e => {
                            geneFinalUrl();
                        });
                        let customSubmit = customInputFrame.querySelector("#customSubmit");
                        customSubmit.addEventListener("click", e => {
                            geneFinalUrl();
                            if (finalSearch.value) {
                                if (this.customInputCallback) this.customInputCallback(finalSearch.value);
                            }
                            resolve(finalSearch.value);
                            if (customInputFrame.parentNode) {
                                customInputFrame.parentNode.removeChild(customInputFrame);
                            }
                        });
                    }
                    if (this.customInputFrame.parentNode) {
                        this.customInputFrame.parentNode.removeChild(this.customInputFrame);
                    }
                    this.customGroup.innerHTML = createHTML();
                    let tempUrl = url;
                    let inputMatch = tempUrl.match(/%input{(.*?[^\\])}/);
                    let index = 0;
                    while (inputMatch) {
                        let inputTitle = document.createElement('div');
                        inputTitle.className = 'customInputFrame-input-title';
                        let param = inputMatch[1];
                        if (/^".*","/.test(param)) {
                            param = param.substr(1, param.length - 2).split('","');
                        } else {
                            param = param.replace(/\\,/g, "◎SJ").split(",").map(str => str.replace(/◎SJ/g, ","));
                        }
                        if (param.length === 1) {//input
                            param = param[0].replace(/\\\|/g, "◎SJ").split("|").map(str => str.replace(/◎SJ/g, "|"));
                            inputTitle.innerText = param[0];
                            this.customGroup.appendChild(inputTitle);
                            let paramInput = document.createElement('input');
                            paramInput.type = 'text';
                            if (param.length > 1) paramInput.title = param[1];
                            this.customGroup.appendChild(paramInput);
                        } else if (param.length >= 2) {//select
                            let titleSplit = param[0].replace(/\\}/g, "}");
                            if (/^'.*'\/'/.test(titleSplit)) {
                                titleSplit = titleSplit.substr(1, titleSplit.length - 2).split("'/'");
                            } else {
                                titleSplit = titleSplit.replace(/\\\//g, "◎SJ").split("/").map(str => str.replace(/◎SJ/g, "/"));
                            }
                            let optionSplit = param.slice(1).join(",");
                            if (/^'.*'\/'/.test(optionSplit)) {
                                optionSplit = optionSplit.substr(1, optionSplit.length - 2).split("'/'");
                            } else {
                                optionSplit = optionSplit.replace(/\\\//g, "◎SJ").split("/").map(str => str.replace(/◎SJ/g, "/"));
                            }
                            let singleTitle = titleSplit.length === optionSplit.length + 1;
                            inputTitle.innerText = titleSplit[0];
                            this.customGroup.appendChild(inputTitle);
                            let paramSelectInput = document.createElement('input');
                            paramSelectInput.type = "text";
                            let paramSelect = document.createElement('div');
                            paramSelect.className = "select";
                            paramSelect.appendChild(paramSelectInput);

                            let selectTips = document.createElement('p');
                            selectTips.innerText = 'Select option';
                            paramSelect.appendChild(selectTips);

                            let options = document.createElement('div');
                            options.className = "options";
                            paramSelect.appendChild(options);

                            let option = document.createElement("p");
                            option.setAttribute("value", "");
                            option.innerHTML = createHTML('<b>Select option</b>');
                            options.appendChild(option);
                            option.addEventListener("click", e => {
                                options.style.visibility = "hidden";
                                setTimeout(() => {
                                    options.style.visibility = "";
                                }, 0);
                                paramSelectInput.value = "";
                                selectTips.innerText = 'Select option';
                                geneFinalUrl();
                            });

                            for (let i = 0; i < optionSplit.length; i++) {
                                let value = optionSplit[i];
                                let option = document.createElement("p");
                                option.setAttribute("value", value);
                                if (singleTitle) {
                                    let title = titleSplit[i + 1];
                                    title = title.replace(/\\\|/g, "◎SJ").split("|").map(str => str.replace(/◎SJ/g, "|"));
                                    option.innerText = title[0];
                                    if (title.length > 1) {
                                        option.title = title[1];
                                    }
                                } else {
                                    option.innerText = value;
                                }
                                option.addEventListener("click", e => {
                                    options.style.visibility = "hidden";
                                    setTimeout(() => {
                                        options.style.visibility = "";
                                    }, 0);
                                    paramSelectInput.value = option.getAttribute("value");
                                    selectTips.innerText = '';
                                    geneFinalUrl();
                                });
                                options.appendChild(option);
                            }
                            paramSelectInput.addEventListener("change", e => {
                                selectTips.innerText = '';
                            });
                            paramSelect.addEventListener("mouseenter", e => {
                                paramSelect.focus();
                                options.style.marginTop = - this.customGroup.scrollTop + 20 + "px";
                            });
                            this.customGroup.appendChild(paramSelect);
                        }
                        tempUrl = tempUrl.replace(inputMatch[0], '◎' + index).replaceAll(`input{${inputTitle.innerText}}`, '◎' + index);
                        index++;
                        inputMatch = tempUrl.match(/%input{(.*?[^\\])}/);
                    }
                    this.finalSearch.dataset.url = tempUrl;
                    this.finalSearch.value = tempUrl.replace(/◎/g, '');
                    this.addToShadow(this.customInputFrame);
                    let frameBody = this.customInputFrame.children[0];
                    frameBody.style.marginTop = -frameBody.offsetHeight / 2 + "px";
                });
            }

            showModifyWindow(word, wordSpan) {
                let oriWord;
                this.modifyWord = {};
                this.addNew = !word && !wordSpan;
                if (!this.addNew) {
                    oriWord = word.oriWord;
                    if (!oriWord) return;
                    this.modifyWord = word;
                    this.modifySpan = wordSpan;
                }
                if (!this.modifyFrame) {
                    let modifyCssText = `
                    .searchJumperModify-body {
                        width: 300px;
                        min-height: 200px;
                        position: fixed;
                        text-align: left;
                        left: 50%;
                        top: 50%;
                        margin-top: -160px;
                        margin-left: -150px;
                        z-index: 100000;
                        background-color: #ffffff;
                        border: 1px solid #afb3b6;
                        border-radius: 10px;
                        opacity: 0.95;
                        filter: alpha(opacity=95);
                        box-shadow: 5px 5px 20px 0px #000;
                        color: #6e7070;
                    }
                    .searchJumperModify-title {
                        background: #458bd1!important;
                        display: flex!important;
                        align-items: center!important;
                        justify-content: center!important;
                        color: white!important;
                        font-weight: bold;
                        font-size: 18px!important;
                        border-radius: 10px 10px 0 0!important;
                    }
                    .searchJumperModify-title>img {
                        margin: 5px;
                        height: 32px;
                        width: 32px;
                    }
                    .searchJumperModify-input-title {
                        font-size: 9pt;
                        font-family: Arial, sans-serif,微软雅黑,"Noto Sans SC";
                        display: inline-block;
                        background-color: white;
                        position: relative;
                        left: 20px;
                        padding: 0px 4px;
                        text-align: left;
                        color: #646464;
                    }
                    .searchJumperModify-body>input[type=text],
                    .searchJumperModify-body>input[type=number],
                    .searchJumperModify-body>textarea {
                        resize: both;
                        font-size: 11pt;
                        font-weight: normal;
                        border-radius: 4px;
                        border: 1px solid rgba(0, 0, 0, 0.23);
                        margin: 4px;
                        font-family: inherit;
                        background-color: #FFF;
                        width: calc(100% - 8px);
                        color: #4A4A4A;
                        margin-top: -8px;
                        padding: 4px;
                        padding-top: 8px;
                        box-sizing: border-box;
                    }
                    .searchJumperModify-buttons {
                        text-align: center;
                        margin-bottom: 5px;
                        display: flex;
                        justify-content: space-evenly;
                    }
                    .searchJumperModify-buttons>button {
                        width: 32%;
                        font-size: 16px;
                        cursor: pointer;
                        border: 1px solid #1976d2;
                        border-radius: 4px;
                        transition: all .3s;
                        color: #fff;
                        background-color: #458bd1;
                        line-height: 25px;
                    }
                    .searchJumperModify-buttons>button:hover {
                        color: #e3f2fd;
                    }
                    #rangePickerBtn {
                        width: 28px;
                        float: right;
                        margin-top: -33px;
                        margin-right: 6px;
                        position: sticky;
                        display: block;
                        cursor: pointer;
                        background: rgb(255 255 255 / 80%);
                    }
                    .searchJumperModify-checkGroup {
                        margin: 5px;
                    }
                    #searchJumperModify-re + label ~ * {
                        display: none;
                    }
                    #searchJumperModify-re:checked + label ~ * {
                        display: inline;
                    }
                    @media (prefers-color-scheme: dark) {
                      .searchJumperModify-body,
                      .searchJumperModify-input-title,
                      .searchJumperModify-body>input[type=text],
                      .searchJumperModify-body>input[type=number],
                      .searchJumperModify-body>textarea,
                      .searchJumperModify-body>select {
                        background-color: black!important;
                        color: #d5d5d5!important;
                      }
                      .searchJumperModify-body>input:focus,
                      .searchJumperModify-body>textarea:focus,
                      .searchJumperModify-body>select:focus {
                        background-color: #1e1e1e!important;
                      }
                      .searchJumperModify-body>input[type=text],
                      .searchJumperModify-body>input[type=number],
                      .searchJumperModify-body>textarea {
                        border: 1px solid rgb(255 255 255 / 36%)!important;
                      }
                      .searchJumperModify-title,
                      .searchJumperModify-buttons>button {
                        background: #245d8f!important;
                      }
                      #rangePickerBtn {
                        background: rgb(0 0 0 / 80%);
                        fill: white;
                      }
                    }
                    `;
                    let modifyCssEle = _GM_addStyle(modifyCssText);
                    let modifyFrame = document.createElement("div");
                    this.modifyFrame = modifyFrame;
                    modifyFrame.id = "searchJumperModifyWord";
                    modifyFrame.innerHTML = createHTML(`
                     <div class="searchJumperModify-body">
                         <a href="${homePage}" class="searchJumperModify-title" target="_blank">
                             <img onerror="this.style.display='none'" width="32px" height="32px" src="${logoBase64}" />${i18n("modifyWord")}
                         </a>
                         <div class="searchJumperModify-input-title">${i18n("wordContent")}</div>
                         <input id="searchJumperHighlightWord" name="wordContent" placeholder="words" type="text"/>
                         <div class="searchJumperModify-checkGroup">
                             <input id="searchJumperModify-re" type="checkbox"/>
                             <label for="searchJumperModify-re">${i18n("re")}</label>
                             <input id="searchJumperModify-case" type="checkbox"/>
                             <label for="searchJumperModify-case">${i18n("ignoreCase")}</label>
                             <input id="searchJumperModify-link" type="checkbox"/>
                             <label for="searchJumperModify-link">${i18n("filterLink")}</label>
                         </div>
                         <div class="searchJumperModify-input-title">${i18n("wordHide")}</div>
                         <input name="wordHide" min="0" placeholder="${i18n("wordHideTips")}" type="number" />
                         <div class="searchJumperModify-input-title">${i18n("wordRange")}</div>
                         <input name="wordRange" placeholder="#main" type="text" />
                         <svg id="rangePickerBtn" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("pickerBtn")}</title><path d="M874.048 533.333333C863.424 716.629333 716.629333 863.424 533.333333 874.048V917.333333a21.333333 21.333333 0 0 1-42.666666 0v-43.285333C307.370667 863.424 160.576 716.629333 149.952 533.333333H106.666667a21.333333 21.333333 0 0 1 0-42.666666h43.285333C160.576 307.370667 307.370667 160.576 490.666667 149.952V106.666667a21.333333 21.333333 0 0 1 42.666666 0v43.285333c183.296 10.624 330.090667 157.418667 340.714667 340.714667h42.816a21.333333 21.333333 0 1 1 0 42.666666H874.026667z m-42.752 0h-127.786667a21.333333 21.333333 0 0 1 0-42.666666h127.786667C820.778667 330.922667 693.056 203.221333 533.333333 192.704V320a21.333333 21.333333 0 0 1-42.666666 0V192.704C330.922667 203.221333 203.221333 330.944 192.704 490.666667H320a21.333333 21.333333 0 0 1 0 42.666666H192.704c10.517333 159.744 138.24 287.445333 297.962667 297.962667V704a21.333333 21.333333 0 0 1 42.666666 0v127.296c159.744-10.517333 287.445333-138.24 297.962667-297.962667zM512 554.666667a42.666667 42.666667 0 1 1 0-85.333334 42.666667 42.666667 0 0 1 0 85.333334z"></path></svg>
                         <div class="searchJumperModify-input-title">${i18n("wordStyle")}</div>
                         <input name="wordStyle" placeholder="orange or #333333;color:red;" type="text" />
                         <div class="searchJumperModify-input-title">${i18n("wordTitle")}</div>
                         <textarea name="wordTitle" type="text" placeholder="Text comment, or @popup to popup, @popup(1) to popup 1st showTips, @popup(name) to popup showTips of target engine"></textarea>
                         <div class="searchJumperModify-buttons">
                             <button id="cancel" type="button">${i18n("cancel")}</button>
                             <button id="modify" type="button">${i18n("modify")}</button>
                         </div>
                     </div>
                    `);
                    if (!disabled) modifyFrame.appendChild(modifyCssEle);
                    let cancelBtn = modifyFrame.querySelector("#cancel");
                    cancelBtn.addEventListener("click", e => {
                        if (modifyFrame.parentNode) {
                            modifyFrame.parentNode.removeChild(modifyFrame);
                        }
                    });
                    let rangePickerBtn = modifyFrame.querySelector("#rangePickerBtn");
                    rangePickerBtn.addEventListener("click", e => {
                        picker.getSelector(selector => {
                            wordRange.value = selector;
                            modifyFrame.style.display = '';
                        });
                        modifyFrame.style.display = 'none';
                    });
                    let modifyBtn = modifyFrame.querySelector("#modify");
                    this.modifyBtn = modifyBtn;
                    modifyBtn.addEventListener("click", e => {
                        let newWord = wordContent.value;
                        if (this.splitSep) newWord = newWord.replaceAll(this.splitSep, "");
                        if (!newWord) return;
                        let contentChange = newWord !== this.modifyWord.showWords || wordReCase.checked !== this.modifyWord.isRe || wordLink.checked !== this.modifyWord.link;
                        if (wordIsRe.checked && newWord.indexOf("@") !== 0) {
                            newWord = `/${newWord}/${wordReCase.checked ? "i" : ""}${wordLink.checked ? "l" : ""}`;
                        }
                        let hide = wordHide.value;
                        if (hide) {
                            if (this.splitSep) hide = hide.replaceAll(this.splitSep, "");
                            hide = hide >= 0 ? hide : 0;
                            newWord += `$p{${hide}}`;
                        }
                        let style = wordStyle.value;
                        if (style) {
                            if (this.splitSep) style = style.replaceAll(this.splitSep, "");
                            newWord += `$s{${style}}`;
                        }
                        let title = JSON.stringify(wordTitle.value).replace(/^"|"$/g, "");
                        if (title) {
                            if (this.splitSep) title = title.replaceAll(this.splitSep, "");
                            newWord += `$t{${title}}`;
                        }
                        let range = wordRange.value;
                        if (range) {
                            if (this.splitSep) range = range.replaceAll(this.splitSep, "");
                            if (range !== this.modifyWord.inRange) contentChange = true;
                            newWord += `$in{${range}}`;
                        }
                        if (this.addNew) {
                            if (this.wordModeBtn.classList.contains("checked")) {
                                this.wordModeBtn.classList.remove("checked");
                                if (this.lockWords) {
                                    this.refreshPageWords(this.lockWords);
                                }
                            }
                            this.searchJumperInPageInput.value = newWord;
                            this.submitInPageWords();
                        } else {
                            this.replaceWord(this.modifyWord, newWord, this.modifySpan, contentChange);
                        }
                        if (modifyFrame.parentNode) {
                            modifyFrame.parentNode.removeChild(modifyFrame);
                        }
                    });
                    modifyFrame.addEventListener("keydown", e => {
                        if (e.keyCode == 13 && e.target && e.target.nodeName == 'INPUT') {
                            modifyBtn.click();
                        }
                    });
                }
                let wordContent = this.modifyFrame.querySelector("[name='wordContent']"),
                    wordStyle = this.modifyFrame.querySelector("[name='wordStyle']"),
                    wordTitle = this.modifyFrame.querySelector("[name='wordTitle']"),
                    wordRange = this.modifyFrame.querySelector("[name='wordRange']"),
                    wordHide = this.modifyFrame.querySelector("[name='wordHide']"),
                    wordIsRe = this.modifyFrame.querySelector("#searchJumperModify-re"),
                    wordReCase = this.modifyFrame.querySelector("#searchJumperModify-case"),
                    wordLink = this.modifyFrame.querySelector("#searchJumperModify-link");

                if (this.addNew) {
                    wordContent.value = "";
                    wordStyle.value = "";
                    wordRange.value = "";
                    wordHide.value = "";
                    wordTitle.value = "";
                    wordIsRe.checked = false;
                    wordReCase.checked = false;
                    wordLink.checked = false;
                    this.modifyBtn.innerText = i18n('add');
                } else {
                    this.modifyBtn.innerText = i18n('modify');
                    let style = "";
                    let styleReg = /\$s{(.*?)}($|\$)/;
                    let styleMatch = oriWord.match(styleReg);
                    if (styleMatch) {
                        style = styleMatch[1];
                    }

                    wordContent.value = word.showWords || "";
                    wordStyle.value = style || "";
                    wordRange.value = word.inRange || "";
                    wordIsRe.checked = !!word.isRe;
                    wordReCase.checked = !!word.reCase;
                    wordLink.checked = !!word.link;
                    if (typeof word.hideParent !== 'undefined') wordHide.value = word.hideParent;
                    try {
                        if (word.popup) {
                            wordTitle.value = "@popup";
                            if (word.showTips) {
                                wordTitle.value = `@popup(${word.showTips})`;
                            }
                        } else {
                            wordTitle.value = word.title !== word.showWords ? JSON.parse('"' + word.title + '"') : "";
                        }
                    } catch (e) {
                        debug(e);
                    }
                }
                this.addToShadow(this.modifyFrame);
            }

            replaceWord(word, newWord, modifySpan, contentChange) {
                if (contentChange) {
                    if (modifySpan.parentNode) modifySpan.parentNode.removeChild(modifySpan);
                    this.removeHighlightWord(word);
                    this.searchJumperInPageInput.value = newWord;
                    this.submitInPageWords();
                } else {
                    let title = "";
                    let style = "";
                    let hideParent = -1;
                    let titleReg = /\$t{(.*?)}($|\$)/;
                    let titleMatch = newWord.match(titleReg);
                    if (titleMatch) {
                        title = titleMatch[1];
                        title = JSON.parse('"' + title + '"');
                    }
                    word.title = title;
                    modifySpan.title = title;
                    let styleReg = /\$s{(.*?)}($|\$)/;
                    let styleMatch = newWord.match(styleReg);
                    if (styleMatch) {
                        let bg = styleMatch[1], otherCss = "";
                        styleMatch = styleMatch[1].match(/(.*?);(.*)/);
                        if (styleMatch) {
                            bg = styleMatch[1];
                            otherCss = styleMatch[2];
                        }
                        style = this.getHighlightStyle(this.curWordIndex, bg, otherCss);
                        word.style = style;
                        modifySpan.style = style;
                    }
                    let hideChange = false;
                    let hideParentReg = /\$p{(.*?)}($|\$)/;
                    let hideParentMatch = newWord.match(hideParentReg);
                    if (hideParentMatch) {
                        hideParent = parseInt(hideParentMatch[1]) || 0;
                        hideChange = hideParent != word.hideParent;
                    } else hideChange = typeof word.hideParent !== 'undefined';

                    if (hideChange) {
                        [].forEach.call(document.querySelectorAll(".searchJumper-hide"), hide => {
                            if (hide.dataset.content === word.showWords) {
                                hide.classList.remove("searchJumper-hide");
                                hide.style.display = "";
                                hide.removeAttribute('data-content');
                            }
                        });
                    }

                    this.marks[word.showWords].forEach(mark => {
                        if (mark) {
                            mark.title = title;
                            if (style) mark.style = style;

                            if (hideChange && hideParent != -1) {
                                let parentDepth = hideParent;
                                let parent = mark.parentElement;
                                while(parentDepth-- > 0 && parent) {
                                    parent = parent.parentElement;
                                }
                                if (parent) {
                                    parent.dataset.content = word.showWords;
                                    parent.classList.add("searchJumper-hide");
                                    parent.innerHTML = createHTML("");
                                }
                            }
                        }
                    });
                    if (hideParent == -1) {
                        delete word.hideParent;
                    } else word.hideParent = hideParent;
                    this.lockWords = this.lockWords.replace(word.oriWord, newWord);
                    word.oriWord = newWord;
                }
            }

            removeHighlightWord(word) {
                if (!this.lockWords) return;
                if (!this.splitSep) this.emptyInPageWords();
                if (!word.oriWord) return;
                if (this.lockWords.indexOf(word.oriWord) === -1) return;
                let preStr = this.lockWords.match(/^\$(c.|o)/), findIndex, findNum = 0;
                preStr = preStr ? preStr[0] : "";
                let targetArr = this.lockWords.replace(preStr, "").split(this.splitSep);
                findIndex = targetArr.indexOf(word.oriWord);
                if (this.wordModeBtn.classList.contains("checked")) {
                    if (findIndex != -1) {
                        targetArr.splice(findIndex, 1);
                        findNum = 1;
                    }
                    for (let i = 0; i < targetArr.length; i++) {
                        let wordArr = targetArr[i].split(/[ ]/);
                        findIndex = wordArr.indexOf(word.oriWord);
                        if (findIndex != -1) {
                            findNum++;
                            if (findNum == 1) {
                                wordArr.splice(findIndex, 1);
                                targetArr[i] = wordArr.join(" ");
                            } else {
                                break;
                            }
                        }
                    }
                    this.lockWords = preStr + targetArr.join(this.splitSep);
                } else {
                    if (findIndex < 0) return;
                    targetArr.splice(findIndex, 1);
                    findNum = targetArr.indexOf(word.oriWord) != -1 ? 2 : 1;
                    this.lockWords = preStr + targetArr.join(this.splitSep);
                }
                delete this.highlightSpans[word.showWords];
                findIndex = this.curHighlightWords.indexOf(word);
                if (findIndex < 0) return;
                this.curHighlightWords.splice(findIndex, 1);

                this.searchJumperInPageInput.style.paddingLeft = this.searchInPageLockWords.clientWidth + 3 + "px";
                if (findNum > 1) return;
                this.marks[word.showWords].forEach(mark => {
                    if (mark.parentNode) {
                        if (mark.dataset.block) {
                            mark.parentNode && mark.parentNode.removeChild(mark);
                        } else if (!/^MARK$/i.test(mark.nodeName)) {
                            mark.classList.remove("searchJumper");
                            mark.style.cssText = mark.dataset.css || "";
                            delete mark.dataset.css;
                        } else {
                            let newNode = document.createTextNode(mark.firstChild.data);
                            mark.parentNode.replaceChild(newNode, mark);
                            newNode.parentNode.normalize();
                        }
                    }
                });
                delete this.marks[word.showWords];
                let children = [].slice.call(this.navMarks.children);
                [].forEach.call(children, nav => {
                    if (nav.dataset.content == word.showWords) {
                        nav.parentNode.removeChild(nav);
                    }
                });
            }

            emptyInPageWords() {
                this.searchInPageLockWords.innerHTML = createHTML();
                this.highlight("");
            }

            focusHighlightByText(text, fw, span) {
                let curList = this.marks[text];
                if (!curList || curList.length === 0) return;
                if (text != this.focusText) {
                    this.focusIndex = 0;
                    this.focusText = text;
                } else {
                    if (fw) {
                        if (this.focusIndex != curList.length - 1) {
                            this.focusIndex = this.focusIndex + 1;
                        } else this.focusIndex = 0;
                    } else {
                        if (this.focusIndex != 0) {
                            this.focusIndex = this.focusIndex - 1;
                        } else this.focusIndex = curList.length - 1;
                    }
                }
                let newIndex = this.focusIndex;
                if (newIndex >= curList.length) newIndex = 0;
                if (fw) {
                    while (!curList[newIndex].offsetParent || curList[newIndex].dataset.type) {
                        if (newIndex != curList.length - 1) {
                            newIndex = newIndex + 1;
                        } else newIndex = 0;
                        if (newIndex == this.focusIndex) break;
                    }
                } else {
                    while (!curList[newIndex].offsetParent || curList[newIndex].dataset.type) {
                        if (newIndex != 0) {
                            newIndex = newIndex - 1;
                        } else newIndex = curList.length - 1;
                        if (newIndex == this.focusIndex) break;
                    }
                }
                this.focusIndex = newIndex;
                this.focusHighlight(curList[this.focusIndex]);
                this.setHighlightSpan(span, this.focusIndex, curList);
            }

            getRect(ele) {
                let eleBCR = ele.getBoundingClientRect();
                let rect = {
                    left: eleBCR.left,
                    top: eleBCR.top,
                    width: eleBCR.width,
                    height: eleBCR.height
                };

                let currentWindow = ele.ownerDocument && ele.ownerDocument.defaultView;
                let currentFrame = currentWindow && currentWindow.frameElement;

                while (currentFrame) {
                    const frameRect = currentFrame.getBoundingClientRect();
                    rect.left += frameRect.left;
                    rect.top += frameRect.top;

                    currentWindow = currentWindow.parent;
                    currentFrame = currentWindow.frameElement;
                }
                return rect;
            }

            focusHighlight(ele) {
                if (!ele) return;
                if (this.focusMark) this.focusMark.removeAttribute('data-current');
                this.focusMark = ele;
                if (!this.wPosBar) {
                    this.wPosBar = document.createElement("div");
                    this.hPosBar = document.createElement("div");
                    this.wPosBar.className = "searchJumperPosBar searchJumperPosW";
                    this.hPosBar.className = "searchJumperPosBar searchJumperPosH";
                }
                if (!this.wPosBar.parentNode) {
                    this.addToShadow(this.wPosBar);
                    this.addToShadow(this.hPosBar);
                }

                let rect = this.getRect(ele);

                this.wPosBar.style.top = rect.top + document.documentElement.scrollTop + getBody(document).scrollTop + "px";
                this.wPosBar.style.height = rect.height + "px";

                this.hPosBar.style.left = rect.left + "px";
                this.hPosBar.style.width = rect.width + "px";

                this.wPosBar.style.animationName = "";
                this.hPosBar.style.animationName = "";
                let self = this;
                setTimeout(async () => {
                    ele.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
                    ele.dataset.current = true;
                    self.wPosBar.style.animationName = "fadeit";
                    self.hPosBar.style.animationName = "fadeit";
                    self.fixTimes = 0;
                    let viewHeight = window.innerHeight || document.documentElement.clientHeight;
                    function fixPosBar() {
                        if (self.focusMark != ele) return;
                        let rect = self.getRect(ele);
                        self.wPosBar.style.top = rect.top + document.documentElement.scrollTop + getBody(document).scrollTop + "px";
                        self.hPosBar.style.left = rect.left + "px";
                        if (self.fixTimes > 0 && rect.top > viewHeight / 3 && rect.top < viewHeight / 3 * 2) return;
                        if (++self.fixTimes == 5) {
                            ele.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
                        } else if (self.fixTimes > 10) {
                            ele.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
                            self.wPosBar.style.animationName = "";
                            self.hPosBar.style.animationName = "";
                            return;
                        }
                        setTimeout(() => {
                            fixPosBar();
                        }, 200);
                    }
                    fixPosBar();
                }, 0);

            }

            getHighlightSpanByText(text) {
                return this.highlightSpans[text];
            }

            setHighlightSpan(span, index, list) {
                if (!span) return;
                let numEle = span.querySelector("em");
                if (!numEle) {
                    numEle = document.createElement("em");
                    span.insertBefore(numEle, span.firstChild);
                }
                index++;
                let len = 0;
                if (list && list.length) {
                    len = 0;
                    list.forEach(e => {
                        if (!e.dataset.type) len++;
                    });
                }
                numEle.innerHTML = createHTML("[" + index + "/" + len + "]");
            }

            getHighlightStyle(index, background, addCssText) {
                if (!background && !addCssText) {
                    let setCss = searchData.prefConfig.inPageWordsStyles[index];
                    if (setCss) return setCss;
                }
                addCssText = addCssText || "";
                function geneRandomColor() {
                    let r, g, b;
                    r = Math.floor(256 * Math.random());
                    g = Math.floor(256 * Math.random());
                    b = Math.floor(256 * Math.random());
                    r = r.toString(16);
                    if (r.length === 1) r = "0" + r;
                    g = g.toString(16);
                    if (g.length === 1) g = "0" + g;
                    b = b.toString(16);
                    if (b.length === 1) b = "0" + b;
                    return "#" + r + g + b;
                }

                function getWordColor(bg) {
                    if (bg.indexOf("#") !== 0) return "";
                    if (bg === "#ffff00") return "black";
                    bg = bg.substr(1);
                    let r, g, b;
                    r = parseInt(bg.substr(0, 2), 16);
                    g = parseInt(bg.substr(2, 2), 16);
                    b = parseInt(bg.substr(4, 2), 16);
                    let bgBrightness = r * 0.299 + g * 0.587 + b * 0.114;
                    r = 255 - r;
                    g = 255 - g;
                    b = 255 - b;

                    let wordBrightness = r * 0.299 + g * 0.587 + b * 0.114;
                    let diff = Math.abs(wordBrightness - bgBrightness);
                    if (diff <= 128) {
                        if (bgBrightness > 158) {
                            return "#000000";
                        } else {
                            return "#FFFFFF";
                        }
                    }
                    r = r.toString(16);
                    if (r.length === 1) r = "0" + r;
                    g = g.toString(16);
                    if (g.length === 1) g = "0" + g;
                    b = b.toString(16);
                    if (b.length === 1) b = "0" + b;
                    return "#" + r + g + b;
                }
                if (!background) {
                    background = searchData.prefConfig.firstFiveWordsColor[index];
                }
                if (!background) {
                    switch (index) {
                        case 0:
                            background = "#ffff00";
                            break;
                        case 1:
                            background = "#e91e63";
                            break;
                        case 2:
                            background = "#00bcd4";
                            break;
                        case 3:
                            background = "#008000";
                            break;
                        case 4:
                            background = "#800080";
                            break;
                        default:
                            background = geneRandomColor();
                            break;
                    }
                }
                if (background) {
                    let color = getWordColor(background);
                    if (color) color = "color:" + color + "!important;";
                    background = `background:${background}!important;${color}`;
                }
                return `${background}${addCssText}`;
            }

            createNavMark(node, word, index, curList, scrollHeight) {
                let self = this;
                let navMark = document.createElement("span");
                let top = getElementTop(node, self.targetIframe);
                navMark.title = word.title || word.showWords;
                navMark.dataset.top = top;
                navMark.dataset.content = word.showWords;
                navMark.style.top = top / scrollHeight * 100 + "%";
                navMark.style.background = node.style.background || "yellow";
                navMark.addEventListener("click", e => {
                    e.stopPropagation();
                    e.preventDefault();
                    self.focusIndex = index;
                    self.focusHighlight(node);
                    self.setHighlightSpan(self.getHighlightSpanByText(word.showWords), index, curList);
                    self.navPointer.style.display = "";
                    self.navPointer.style.top = navMark.offsetTop + 33 + "px";
                    return false;
                }, true);
                self.navMarks.appendChild(navMark);
            }

            anylizeDomWithTextPos(dom, result) {
                if (!result) result = {text: "", data:[]};
                if (!dom || !dom.childNodes || !dom.childNodes.length || (dom.nodeType == 1 && !dom.offsetParent && !dom.offsetHeight && (!dom.firstElementChild || !dom.firstElementChild.offsetParent))) {
                    return result;
                }
                dom.childNodes.forEach(ele => {
                    if ((ele.classList && ele.classList.contains("searchJumper")) || /^(img|svg|picture|br|hr|textarea)$/i.test(ele.nodeName)) {
                        const start = result.text.length;
                        result.text += "\n";
                        result.data.push({index: start, node: ele, text: "\n"});
                    } else if (ele.offsetParent || ele.offsetHeight || (ele.firstElementChild && ele.firstElementChild.offsetParent)) {
                        if (/^(div|h\d|p|form|ul|li|ol|dl|address|menu|table|fieldset|td)$/i.test(ele.nodeName)) {
                            let start = result.text.length;
                            result.text += "\n";
                            result.data.push({index: start, node: {}, text: "\n"});
                            result = this.anylizeDomWithTextPos(ele, result);
                            start = result.text.length;
                            result.text += "\n";
                            result.data.push({index: start, node: {}, text: "\n"});
                        } else {
                            result = this.anylizeDomWithTextPos(ele, result);
                        }
                    } else if (ele.nodeType === 3) {
                        let textData;
                        if (ele.parentNode.nodeType == 1 && ele.parentNode.childNodes.length == 1) {
                            textData = ele.parentNode.innerText || ele.data;
                        } else {
                            textData = ele.data;
                        }
                        if (!textData || !textData.trim()) return;
                        const start = result.text.length;
                        result.text += textData;
                        result.data.push({index: result.text.length - 1, node: ele, text: textData});
                    }
                });
                return result;
            }

            highlightPopup(spannode, word) {
                let self = this;
                let targetShowTipsSite;
                let mouseMoveHandler = e => {
                    if (targetShowTipsSite) {
                        self.clingPos(spannode, self.tips);
                    }
                };
                spannode.addEventListener("mouseenter", e => {
                    spannode.addEventListener("mousemove", mouseMoveHandler);
                    if (targetElement != spannode || !self.funcKeyCall) {
                        targetShowTipsSite = null;
                        targetElement = spannode;
                        if (word.showTips) {
                            if (/^\d+$/.test(word.showTips)) {
                                let firstType = self.autoGetFirstType();
                                let targetSites = firstType.querySelectorAll('a.search-jumper-btn[data-show-tips]:not(.notmatch)');
                                let index = parseInt(word.showTips) - 1;
                                targetShowTipsSite = targetSites[index];
                            } else {
                                targetShowTipsSite = self.getTargetSitesByName([word.showTips])[0];
                            }
                        }
                        self.setFuncKeyCall(true);
                        if (targetShowTipsSite) {
                            self.bar.style.setProperty("display", "none", "important");
                            targetShowTipsSite.dispatchEvent(new CustomEvent('showTips'));
                        } else {
                            self.showInPage(true, e);
                        }
                    }
                });
                spannode.addEventListener("mouseleave", e => {
                    spannode.removeEventListener("mousemove", mouseMoveHandler);
                });
            }

            createHighlightMark(word, index, curList) {
                let self = this;
                let spannode = document.createElement("mark");
                spannode.className = "searchJumper";
                if (word.title) spannode.title = JSON.parse('"' + word.title + '"');
                if (word.popup) {
                    this.highlightPopup(spannode, word);
                }
                spannode.style.cssText = word.style;
                spannode.addEventListener("click", e => {
                    if (!e.altKey) return;
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });
                spannode.dataset.content = word.showWords;
                let longPressTimer;
                let setLongPressTimer = () => {
                    clearTimeout(longPressTimer);
                    longPressTimer = setTimeout(() => {
                        let highlightUrl = location.href.replace(/#.*/, "") + "#sjhl=" + encodeURIComponent(word.oriWord) + "&i=" + (index + 1);
                        _unsafeWindow.history.replaceState('', '', highlightUrl);
                    }, 800);
                };
                spannode.addEventListener("mousedown", e => {
                    setLongPressTimer();
                    if (!e.altKey) return;
                    let target;
                    let newIndex = index;
                    while (!target || target.dataset.type) {
                        if (e.button === 0) {
                            if (newIndex != curList.length - 1) {
                                newIndex++;
                                self.focusIndex = newIndex;
                            } else self.focusIndex = 0;
                        } else if (e.button === 2){
                            if (newIndex != 0) {
                                newIndex--;
                                self.focusIndex = newIndex;
                            } else self.focusIndex = curList.length - 1;
                        }
                        target = curList[self.focusIndex];
                        if (newIndex == index) break;
                    }
                    self.focusHighlight(target);
                    self.setHighlightSpan(self.getHighlightSpanByText(word.showWords), self.focusIndex, curList);
                    self.focusText = word.showWords;
                });
                spannode.addEventListener("mouseup", e => {
                    clearTimeout(longPressTimer);
                });
                return spannode;
            }

            createAddonSpan(name, data) {
                let index = "addon_" + this.addonsList.children.length, self = this;
                let con = document.createElement("div");
                let checkbox = document.createElement("input");
                checkbox.type = 'checkbox';
                checkbox.id = index;
                checkbox.checked = !data.disable;
                checkbox.addEventListener("change", e => {
                    searchData.prefConfig.disableAddon[name] = !checkbox.checked;
                    data.disable = !checkbox.checked;
                    if (checkbox.checked) {
                        self.findInpageAddons.forEach(addon => {
                            if (addon != data && addon.sort == data.sort) {
                                addon.disable = true;
                                let _name = addon.name || ("addon" + index++);
                                self.addonCheckboxDict[_name].checked = false;
                                searchData.prefConfig.disableAddon[_name] = true;
                            }
                        });
                    }
                    storage.setItem("searchData", searchData);
                    if (self.lockWords) {
                        self.refreshPageWords(self.lockWords);
                    }
                });
                con.appendChild(checkbox);
                con.title = data.title || "";
                let label = document.createElement("label");
                label.setAttribute("for", index);
                label.innerText = name;
                con.appendChild(label);
                this.addonCheckboxDict[name] = checkbox;
                this.addonsList.appendChild(con);
            }

            findAccentedWord(text, searchWord, normalizeArray) {
                const searchLength = searchWord.length;
                let normalizedIndex = 0;
                let startIndex = -1;

                for (let i = 0; i < text.length; i++) {
                    const normalized = normalizeArray[i];
                    if (normalized === "") {
                        continue;
                    }
                    if (normalized === searchWord[normalizedIndex]) {
                        if (normalizedIndex === 0) startIndex = i;
                        normalizedIndex++;
                        if (normalizedIndex === searchLength) {
                            return {
                                pos: startIndex,
                                len: i - startIndex + 1
                            };
                        }
                    } else {
                        normalizedIndex = 0;
                        startIndex = -1;
                        if (normalized === searchWord[0]) {
                            startIndex = i;
                            normalizedIndex = 1;
                        }
                    }
                }

                startIndex = text.indexOf(searchWord);
                return {len: searchWord.length, pos: startIndex};
            }

            findPosInStr(content, kw, contentUp, wordUp, normalizeArray) {
                if (!content) {
                    return {len: 0, pos: -1};
                }
                let len = 0, pos = -1, hasAddon = false;
                if (this.findInpageAddons.length) {
                    for (let i = 0; i < this.findInpageAddons.length; i++) {
                        let curAddon = this.findInpageAddons[i];
                        if (!curAddon || !curAddon.run || curAddon.disable) continue;
                        hasAddon = true;
                        let curData = curAddon.run(content, kw);
                        if (curData && curData.matched) {
                            len = curData.len;
                            pos = curData.pos;
                            break;
                        }
                    }
                }
                if (pos == -1 && !hasAddon) {
                    return this.findAccentedWord(contentUp, wordUp, normalizeArray);
                }
                return {len: len, pos: pos};
            }

            highlight(words, ele, root, iframe) {
                if (!words && (!this.curHighlightWords || this.curHighlightWords.length === 0)) return;
                if (!ele) {
                    this.highlight(words, getBody(document), root);
                    return;
                }
                [].forEach.call(ele.getElementsByTagName("iframe"), iframe => {
                    if (!iframe.offsetParent) return;
                    if (iframe.offsetHeight < 100 || iframe.offsetWidth < 100) return;
                    let iframeDoc;
                    try {
                        iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    } catch(e) {
                        return;
                    }
                    if (iframeDoc && getBody(iframeDoc)) {
                        this.highlight(words, getBody(iframeDoc), root, iframe);
                    }
                });
                this.targetIframe = iframe || false;
                if (ele.id == "searchJumperModifyWord") return;
                ele = ele || getBody(document);
                let inWordMode = this.wordModeBtn.classList.contains("checked");
                let preEles = [];
                let searchingPre = false;
                let self = this;
                if (words === "") {
                    this.highlightSpans = {};
                    Object.values(this.marks).forEach(async markList => {
                        if (!markList) return;
                        let normalizeSet = new Set();
                        for (let mark of markList) {
                            if (!mark.parentNode) continue;
                            if (mark.dataset.block) {
                                mark.parentNode && mark.parentNode.removeChild(mark);
                            } else if (!/^MARK$/i.test(mark.nodeName)) {
                                mark.classList.remove("searchJumper");
                                mark.style.cssText = mark.dataset.css || "";
                                delete mark.dataset.css;
                            } else {
                                let newNode = document.createTextNode(mark.firstChild.data);
                                mark.parentNode.replaceChild(newNode, mark);
                                const pa = newNode.parentNode;
                                if (pa && pa.nodeName === 'SPAN' && pa.style.cssText === 'all: unset;') {
                                    const papa = pa.parentNode;
                                    if (papa) {
                                        const newTextNodeCon = document.createDocumentFragment();
                                        newTextNodeCon.append(...pa.childNodes);
                                        papa.replaceChild(newTextNodeCon, pa);
                                    }
                                }
                                normalizeSet.add(newNode.parentNode);
                            }
                        }
                        normalizeSet.forEach(node => {node.normalize();});
                    });
                    [].forEach.call(ele.querySelectorAll(".searchJumper-hide"), hide => {
                        hide.classList.remove("searchJumper-hide");
                        hide.style.display = "";
                        hide.removeAttribute('data-content');
                    });
                    this.navMarks.innerHTML = createHTML();
                    this.marks = {};
                    this.curHighlightWords = [];
                    return;
                }
                if (!this.inPageStyle) {
                    this.inPageStyle = _GM_addStyle(this.inPageCss);
                }
                if (!this.inPageStyle.parentNode) {
                    document.head.appendChild(this.inPageStyle);
                }
                let insert = (words === "insert");
                if (insert) {
                    words = this.curHighlightWords;
                    this.refreshNavMarks();
                } else {
                    this.curHighlightWords = (this.curHighlightWords || []).concat(words);
                }
                this.fakeTextareas = new Map();
                let scrollHeight = Math.max(document.documentElement.scrollHeight, getBody(document).scrollHeight);
                this.navMarks.style.display = "none";
                let navMarkParams = [];
                function searchWithinNode(node, word, start) {
                    let len, pos = -1, skip, spannode, middlebit, middleclone;
                    skip = 0;
                    let pa = node.parentNode;
                    if (node.nodeType == 1 && node.className && node.className.indexOf && node.className.indexOf("searchJumper") != -1) return 0;
                    if (start && (node.nodeType == 1 || node.nodeType == 11)) {
                        let domTextResult = self.anylizeDomWithTextPos(node);
                        let textRes = domTextResult.text;
                        let textResUp = textRes.toUpperCase();

                        let normalizeArray = [];
                        for (let i = 0; i < textResUp.length; i++) {
                            const normalized = textResUp[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                            normalizeArray.push(normalized);
                        }

                        let wordUp = word.content.toUpperCase();
                        let dataRes = domTextResult.data;
                        let index = 0;
                        let nodeAndPos = [];
                        let validWord = (word.init || inWordMode) && /^[a-z]+$/i.test(word.content);
                        function getNodePos(pos, len, matchedText) {
                            let findNodes = [], leftLen = len;
                            let pre = "", after = "", after2 = "";
                            for (const curnode of dataRes) {
                                const end = curnode.index;
                                if (pos > end) continue;
                                let curpos = pos - (end - curnode.text.length) - 1;
                                let type = "full";
                                if (curpos < 0) {
                                    if (curnode.text.length < leftLen) {
                                        type = "middle";
                                    } else {
                                        type = "end";
                                    }
                                } else {
                                    if (curnode.text.length - curpos < leftLen) {
                                        type = "start";
                                    }
                                }
                                if (type === "full") matchedText = "";

                                if (validWord) {
                                    if (type == "full") {
                                        pre = curpos == 0 ? "\n" : curnode.text[curpos - 1];
                                        after = (curpos + leftLen) == curnode.text.length ? "\n" : curnode.text[curpos + leftLen];
                                        if (after !== "\n") {
                                            after2 = (curpos + leftLen + 1) == curnode.text.length ? "\n" : curnode.text[curpos + leftLen + 1];
                                        }
                                    } else if (type == "start" && !pre) {
                                        pre = curpos == 0 ? "\n" : curnode.text[curpos - 1];
                                    } else if ((type == "end" || type == "full") && !after) {
                                        after = (curpos + leftLen) == curnode.text.length ? "\n" : curnode.text[curpos + leftLen];
                                        if (after !== "\n") {
                                            after2 = (curpos + leftLen + 1) == curnode.text.length ? "\n" : curnode.text[curpos + leftLen + 1];
                                        }
                                    }
                                    if (pre && after) {
                                        if (/[a-z]/i.test(pre) || /[a-rt-z]/i.test(after) || (after.toLowerCase() == 's' && /[a-z]/i.test(after2))) {
                                            break;
                                        }
                                    }
                                }

                                if (curpos < 0) curpos = 0;
                                let curlen = Math.min(leftLen, curnode.text.length - curpos);
                                leftLen -= curlen;
                                if (!curnode.text.trim()) {
                                    if (type === "start") pos += curnode.text.length;
                                    continue;
                                }
                                let nodeInfo;
                                for (let j = 0; j < nodeAndPos.length; j++) {
                                    if (nodeAndPos[j].node == curnode.node) {
                                        nodeInfo = nodeAndPos[j];
                                        break;
                                    }
                                }
                                if (!nodeInfo) nodeAndPos.push({node: curnode.node, text: curnode.text, match:[{pos: curpos, len: curlen, type: type, matched: matchedText}]});
                                else nodeInfo.match.push({pos: curpos, len: curlen, type: type, matched: matchedText});
                                if (leftLen <= 0) break;
                            }
                        }
                        function getIndex() {
                            pos = -1;
                            if (word.isRe) {
                                let wordMatch = textRes.match(new RegExp(word.content, word.reCase));
                                if (wordMatch) {
                                    let content = wordMatch[0];
                                    len = content.length;
                                    pos = wordMatch.index;
                                }
                            } else {
                                let result = self.findPosInStr(textRes, word.content, textResUp, wordUp, normalizeArray);
                                len = result.len;
                                pos = result.pos;
                            }
                            if (pos > -1) {
                                let matchedText = textRes.slice(pos, pos + len);
                                textRes = textRes.slice(pos + len);
                                textResUp = textResUp.slice(pos + len);
                                normalizeArray = normalizeArray.slice(pos + len);
                                pos += index;
                                index = pos + len;
                                getNodePos(pos, len, matchedText);
                                getIndex();
                            }
                        }
                        getIndex();
                        if (nodeAndPos.length) {
                            nodeAndPos.forEach(data => {
                                if (typeof word.hideParent !== 'undefined') {
                                    let parentDepth = word.hideParent;
                                    let parent = data.node.parentElement;
                                    while(parentDepth-- > 0 && parent) {
                                        parent = parent.parentElement;
                                    }
                                    if (parent && parent.classList && !parent.classList.contains("searchJumper-hide")) {
                                        parent.innerHTML = createHTML("");
                                        parent.dataset.content = word.showWords;
                                        parent.classList.add("searchJumper-hide");
                                    }
                                } else {
                                    let curList = self.marks[word.showWords];
                                    let index = curList.length;
                                    let spannode;
                                    /*let newTextNodeCon;
                                    let parentDisplay = "";
                                    if (data.node.parentNode.nodeType == 1) {
                                        let parentStyle = getComputedStyle(data.node.parentNode);
                                        parentDisplay = parentStyle.display;
                                    }
                                    if (parentDisplay.indexOf("flex") != -1 || parentDisplay.indexOf("grid") != -1 || parentDisplay.indexOf("layer") != -1) {
                                        newTextNodeCon = document.createElement("span");
                                        newTextNodeCon.style.all = "unset";
                                    } else {
                                        newTextNodeCon = document.createDocumentFragment();
                                    }*/
                                    const newTextNodeCon = document.createElement("span");
                                    newTextNodeCon.style.all = "unset";
                                    let newTextNode = document.createTextNode(data.text);
                                    newTextNodeCon.appendChild(newTextNode);
                                    let matches = data.match.reverse();
                                    let spannodes = [], j = matches.length - 1;
                                    matches.forEach(d => {
                                        spannode = self.createHighlightMark(word, index + j, curList);
                                        switch (d.type) {
                                            case "start":
                                                spannode.style.borderTopRightRadius = 0;
                                                spannode.style.borderBottomRightRadius = 0;
                                                j--;
                                                break;
                                            case "middle":
                                                spannode.style.borderRadius = 0;
                                                break;
                                            case "end":
                                                spannode.style.borderTopLeftRadius = 0;
                                                spannode.style.borderBottomLeftRadius = 0;
                                                break;
                                            default:
                                                j--;
                                                break;
                                        }
                                        middlebit = newTextNode.splitText(d.pos);
                                        if (d.type != 'start' && d.type != 'middle' && middlebit.data.length) {
                                            middlebit.splitText(d.len);
                                        }
                                        middleclone = middlebit.cloneNode(true);
                                        spannode.appendChild(middleclone);
                                        if (d.type != "full" && d.type != "start") {
                                            spannode.dataset.type = d.type;
                                        }
                                        if (d.matched) {
                                            spannode.dataset.matched = d.matched;
                                        }
                                        newTextNodeCon.replaceChild(spannode, middlebit);
                                        spannodes.unshift(spannode);
                                    });
                                    data.node.parentNode.replaceChild(newTextNodeCon, data.node);
                                    self.marks[word.showWords].push(...spannodes);
                                    spannodes.forEach(n => {
                                        if (!n.dataset.type) {
                                            navMarkParams.push([n, word, index, curList, scrollHeight]);
                                        }
                                    });
                                }
                            });
                        }
                    }
                    let checkChildren = true;
                    if (word.link) {
                        if (node.nodeType == 1 && node.href && node.href.match) {
                            checkChildren = false;
                            let wordMatch = node.href.match(new RegExp(word.content, word.reCase));
                            if (wordMatch) {
                                if (typeof word.hideParent !== 'undefined') {
                                    let parentDepth = word.hideParent;
                                    let parent = node;
                                    while(parentDepth-- > 0 && parent) {
                                        parent = parent.parentElement;
                                    }
                                    if (parent) {
                                        parent.innerHTML = createHTML("");
                                        parent.dataset.content = word.showWords;
                                        parent.classList.add("searchJumper-hide");
                                        return 0;
                                    }
                                } else {
                                    let curList = self.marks[word.showWords];
                                    let index = curList.length;
                                    node.classList.add("searchJumper");
                                    if (word.title) node.title = JSON.parse('"' + word.title + '"');
                                    if (word.popup) {
                                        self.highlightPopup(node, word);
                                    }
                                    if (!node.dataset.css) node.dataset.css = node.style.cssText;
                                    if (word.style) {
                                        node.style.cssText += word.style;
                                    }
                                    node.addEventListener("click", e => {
                                        if (!e.altKey) return;
                                        e.stopPropagation();
                                        e.preventDefault();
                                        return false;
                                    });
                                    node.dataset.content = word.showWords;
                                    node.addEventListener("mousedown", e => {
                                        if (!e.altKey) return;
                                        let target;
                                        if (e.button === 0) {
                                            if (index != curList.length - 1) {
                                                self.focusIndex = index + 1;
                                            } else self.focusIndex = 0;
                                        } else if (e.button === 2){
                                            if (index != 0) {
                                                self.focusIndex = index - 1;
                                            } else self.focusIndex = curList.length - 1;
                                        }
                                        target = curList[self.focusIndex];
                                        self.focusHighlight(target);
                                        self.setHighlightSpan(self.getHighlightSpanByText(word.showWords), self.focusIndex, curList);
                                        self.focusText = word.showWords;
                                    });
                                    self.marks[word.showWords].push(node);

                                    navMarkParams.push([node, word, index, curList, scrollHeight]);
                                }
                            }
                        }
                    } else {
                        let blockValue = "";
                        if (node.nodeType == 1 && node.value && (node.offsetParent || node.offsetHeight) && !word.init && /^(button|select|input|textarea)$/i.test(node.nodeName) && !/^(hidden|file|password|radio|range|checkbox|image)$/i.test(node.type)) {
                            blockValue = node.value;
                        }
                        if (blockValue) {
                            checkChildren = false;
                            let wordMatch = false;
                            let lastIndex = 0;
                            let fakeTextarea = self.fakeTextareas.get(node);
                            if (insert && fakeTextarea) return 0;
                            let nodeStyle = getComputedStyle(node);
                            let baseLeft = node.offsetLeft;//textareaLoc.left - textareaParentLoc.left;
                            let baseTop = node.offsetTop//textareaLoc.top - textareaParentLoc.top;
                            let blockValueUp = blockValue.toUpperCase();

                            let normalizeArray = [];
                            for (let i = 0; i < blockValueUp.length; i++) {
                                const normalized = blockValueUp[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                normalizeArray.push(normalized);
                            }

                            let wordUp = word.content.toUpperCase();
                            while (true) {
                                if (word.isRe) {
                                    wordMatch = blockValue.match(new RegExp(word.content, word.reCase));
                                    if (wordMatch) {
                                        pos = wordMatch.index;
                                        wordMatch = wordMatch[0];
                                    }
                                } else {
                                    let result = self.findPosInStr(blockValue, word.content, blockValueUp, wordUp, normalizeArray);
                                    len = result.len;
                                    pos = result.pos;
                                    if ((word.init || inWordMode) && pos >= 0 && /^[a-z]+$/i.test(word.content)) {
                                        if (pos !== 0 && /[a-z]/i.test(blockValue[pos - 1])) {
                                            pos = -1;
                                        }
                                        if (pos + word.content.length !== blockValue.length && /[a-z]/i.test(blockValue[pos + len])) {
                                            pos = -1;
                                        }
                                    }
                                    wordMatch = (pos >= 0 ? blockValue.slice(pos, pos + len) : false);
                                }
                                if (wordMatch) {
                                    findTextInBlock(wordMatch, lastIndex + pos);
                                    lastIndex += (pos + wordMatch.length);
                                    blockValue = blockValue.slice(pos + wordMatch.length);
                                    blockValueUp = blockValueUp.slice(pos + wordMatch.length);
                                    normalizeArray = normalizeArray.slice(pos + wordMatch.length);
                                } else break;
                            }
                            function findTextInBlock(curWord, pos) {
                                if (curWord) {
                                    if (!fakeTextarea) {
                                        fakeTextarea = document.createElement("pre");
                                        fakeTextarea.className = "searchJumper";
                                        let textNode = document.createTextNode(blockValue);
                                        fakeTextarea.appendChild(textNode);

                                        let name, rstyle =/^(number|string)$/;
                                        let cssText = [], sStyle = node.style;

                                        for (name in sStyle) {
                                            if (!/^(content|outline|outlineWidth)$/.test(name)) {
                                                let val = nodeStyle[name];
                                                if (val !=='' && rstyle.test(typeof val)) {
                                                    name = name.replace(/([A-Z])/g, "-$1").toLowerCase();
                                                    cssText.push(name);
                                                    cssText.push(':');
                                                    cssText.push(val);
                                                    cssText.push(';');
                                                };
                                            };
                                        };
                                        cssText = cssText.join('');
                                        fakeTextarea.style.cssText = cssText;
                                        fakeTextarea.style.position = "fixed";
                                        fakeTextarea.style.left = "0px";
                                        fakeTextarea.style.top = "0px";
                                        fakeTextarea.style.margin = "0";
                                        if (node.nodeName && node.nodeName.toLowerCase && node.nodeName.toLowerCase() !== "textarea") {
                                            fakeTextarea.style.display = "inline-grid";
                                            fakeTextarea.style.lineHeight = fakeTextarea.style.height;
                                            if (fakeTextarea.style.boxSizing == "border-box") fakeTextarea.style.paddingTop = 0;
                                        }
                                        self.fakeTextareas.set(node, fakeTextarea);
                                    }

                                    document.body.appendChild(fakeTextarea);
                                    let range = document.createRange();
                                    range.setStart(fakeTextarea.firstChild, Math.min(fakeTextarea.firstChild.length, pos));
                                    range.setEnd(fakeTextarea.firstChild, Math.min(fakeTextarea.firstChild.length, pos + 1));
                                    let rect = range.getBoundingClientRect();
                                    document.body.removeChild(fakeTextarea);

                                    if (typeof word.hideParent !== 'undefined') {
                                        let parentDepth = word.hideParent;
                                        let parent = node.parentElement;
                                        while(parentDepth-- > 0 && parent) {
                                            parent = parent.parentElement;
                                        }
                                        if (parent) {
                                            parent.innerHTML = createHTML("");
                                            parent.dataset.content = word.showWords;
                                            parent.classList.add("searchJumper-hide");
                                            return 0;
                                        }
                                    } else {
                                        let curList = self.marks[word.showWords];
                                        let index = curList.length;

                                        let spannode = document.createElement("mark");
                                        spannode.className = "searchJumper";
                                        spannode.dataset.block = true;
                                        if (word.title) spannode.title = JSON.parse('"' + word.title + '"');
                                        spannode.style.cssText = word.style;
                                        spannode.dataset.content = word.showWords;
                                        spannode.innerText = curWord;
                                        spannode.style.padding = "0";
                                        spannode.style.position = "absolute";
                                        spannode.style.fontSize = fakeTextarea.style.fontSize;
                                        spannode.style.fontFamily = fakeTextarea.style.fontFamily;
                                        spannode.style.lineHeight = "1";
                                        spannode.style.pointerEvents = "none";
                                        node.parentNode.appendChild(spannode);
                                        let _baseLeft = rect.left + baseLeft;
                                        let _baseTop = rect.top + baseTop;
                                        spannode.style.left = _baseLeft + "px";
                                        spannode.style.top = _baseTop + "px";
                                        self.marks[word.showWords].push(spannode);

                                        navMarkParams.push([spannode, word, index, curList, scrollHeight]);
                                        if (node.nodeName && node.nodeName.toLowerCase && node.nodeName.toLowerCase() == "textarea") {
                                            let nodeScrollHandler = e => {
                                                if (!spannode.parentNode) {
                                                    spannode.parentNode.removeChild(spannode);
                                                    node.removeEventListener("scroll", nodeScrollHandler);
                                                } else {
                                                    spannode.style.left = _baseLeft - node.scrollLeft + "px";
                                                    spannode.style.top = _baseTop - node.scrollTop + "px";
                                                }
                                            }
                                            node.addEventListener("scroll", nodeScrollHandler);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (checkChildren &&
                        (!root ||
                         node === ele
                        ) &&
                        (node.nodeType == 1 ||
                         node.nodeType == 11
                        ) &&
                        node.childNodes &&
                        !/^(SCRIPT|STYLE|MARK|SVG|TEXTAREA)$/i.test(node.nodeName) &&
                        (!word.init ||
                         (node.ariaHidden != 'true' &&
                          node.role != "search" &&
                          (!node.hasAttribute ||
                           node.hasAttribute('jsname') == false
                          )
                         )
                        )
                       ) {
                        if (!searchingPre && /^(PRE|CODE)$/i.test(node.nodeName)) {
                            preEles.push(node);
                        } else {
                            for (var child = 0; child < node.childNodes.length; ++child) {
                                child = child + searchWithinNode(node.childNodes[child], word);
                            }
                            try {
                                if (node.shadowRoot) {
                                    child = child + searchWithinNode(node.shadowRoot, word, true);
                                }
                            } catch(e) {
                                debug(e);
                            }
                        }
                    }
                    return skip;
                }
                words.forEach(w => {
                    if (!self.marks[w.showWords]) {
                        self.marks[w.showWords] = [];
                    }
                    if (w.inRange) {
                        let searchEle = ele;
                        if (ele.parentNode) searchEle = ele.parentNode;
                        [].forEach.call(searchEle.querySelectorAll(w.inRange), e => {
                            if (e == ele || ele.contains(e)) {
                                searchWithinNode(e, w, true);
                            }
                        })
                    } else searchWithinNode(ele, w, true);
                });
                navMarkParams.forEach(param => {
                    self.createNavMark(...param);
                });
                this.navMarks.style.display = "";
                setTimeout(() => {
                    self.navMarks.style.display = "none";
                    navMarkParams = [];
                    searchingPre = true;
                    words.forEach(w => {
                        if (!self.marks[w.showWords]) {
                            self.marks[w.showWords] = [];
                        }
                        preEles.forEach(e => {
                            searchWithinNode(e, w, true);
                        });
                    });
                    navMarkParams.forEach(param => {
                        self.createNavMark(...param);
                    });
                    self.navMarks.style.display = "";
                }, 1000);
                if (this.navMarks.innerHTML != "") {
                    this.searchJumperNavBar.classList.add("sjNavShow");
                    if (navEnable) {
                        this.appendBar();
                        this.con.style.display = "";
                        this.setNav(true, true);
                    }
                }
            }

            refreshPageWords(newWords) {
                this.lockWords = "";
                this.searchJumperInPageInput.value = "";
                this.searchInPageLockWords.innerHTML = createHTML();
                this.searchJumperInPageInput.style.paddingLeft = "";
                this.submitInPageWords();
                let words = newWords || globalInPageWords;
                if (words) {
                    this.searchJumperInPageInput.value = words;
                    this.submitInPageWords(words == this.lastSearchEngineWords);
                    this.appendBar();
                }
            }

            refreshNav() {
                this.setNav(navEnable);
            }

            refreshNavMarks() {
                if (this.refreshNavMarksTimer) clearTimeout(this.refreshNavMarksTimer);
                this.refreshNavMarksTimer = setTimeout(() => {
                    let scrollHeight = Math.max(document.documentElement.scrollHeight, getBody(document).scrollHeight);
                    this.navPointer.style.display = "none";
                    this.navMarks.style.display = "none";
                    [].forEach.call(this.navMarks.children, m => {
                        m.style.top = m.dataset.top / scrollHeight * 100 + "%";
                    });
                    this.navMarks.style.display = "";
                }, 1000);
            }

            checkCharacterData(target) {
                setTimeout(() => {
                    this.highlight("insert", target, true);
                }, 0);
            }

            removeMark(removedNode) {
                let content = removedNode.dataset.content;
                let markList = this.marks[content];
                if (!markList) return;
                var index = markList.indexOf(removedNode);
                if (index === -1) return;
                markList.splice(index, 1);
                this.marks[content] = markList;
                let navMark = this.navMarks.querySelectorAll(`span[data-content="${content}"]`)[index];
                if (navMark) this.navMarks.removeChild(navMark);
            }

            submitIgnoreSpace(value) {
                if (!value) return;
                if (!this.lockWords && value.indexOf("$c") !== 0 && value.indexOf("$o") !== 0 && value.indexOf(" ") !== -1) {
                    this.splitSep = "◎";
                }
                this.searchJumperInPageInput.value = value;
                this.submitInPageWords();
            }

            siteBtnReturnHome(btn) {
                if (btn.parentNode) btn.parentNode.removeChild(btn);
                /*for (let i = 0; i < searchTypes.length; i++) {
                    let typeBtn = searchTypes[i];
                    if (typeBtn.dataset.type == btn.dataset.type) {
                        if (btn.dataset.id) {
                            let curIndex = parseInt(btn.dataset.id);
                            for (let j = 1; j < typeBtn.children.length; j++) {
                                let targetIndex = parseInt(typeBtn.children[j].dataset.id);
                                if (isNaN(targetIndex) || curIndex < targetIndex) {
                                    typeBtn.insertBefore(btn, typeBtn.children[j]);
                                    break;
                                } else if (j == typeBtn.children.length - 1) {
                                    typeBtn.appendChild(btn);
                                    break;
                                }
                            }
                            //typeBtn.insertBefore(btn, typeBtn.children[parseInt(btn.dataset.id) - parseInt(typeBtn.dataset.id) + 1]);
                        } else typeBtn.insertBefore(btn, typeBtn.children[1]);
                        break;
                    }
                }*/
            }

            closeShowAll() {
                if (!this.con.classList.contains("search-jumper-showall") || isAllPage) return;
                this.clearInputHide();
                clearInterval(this.showAllTimeTimer);
                document.removeEventListener("mousedown", self.showAllMouseHandler);
                document.removeEventListener("keydown", self.showAllKeydownHandler);
                this.con.classList.remove("search-jumper-showall");
                document.documentElement.style.scrollbarWidth = this.preScrollbarWidth;
                this.searchJumperInputKeyWords.value = "";
                this.historylist.innerHTML = createHTML();
                /*this.historySiteBtns.slice(0, 10).forEach(btn => {
                    this.siteBtnReturnHome(btn);
                });*/
                this.touched = false;
                this.initPos();
                if (this.funcKeyCall) {
                    this.setFuncKeyCall(false);
                }
                if (!searchData.prefConfig.disableAutoOpen && !searchData.prefConfig.disableTypeOpen) {
                    let firstType = this.bar.querySelector('.search-jumper-type:nth-child(1)>span');
                    if (firstType && !firstType.classList.contains("search-jumper-open")) {
                        if (firstType.onmouseup) {
                            firstType.onmouseup();
                        } else {
                            let mouseEvent = new PointerEvent("mouseup");
                            firstType.dispatchEvent(mouseEvent);
                        }
                    }
                }
                this.bar.style.display = '';
            }

            toggleShowAll() {
                this.appendBar();
                if (!this.con || !this.con.parentNode) return;
                if (this.con.classList.contains("search-jumper-showall")) {
                    this.closeShowAll();
                } else {
                    this.showAllSites();
                }
            }

            showAllSites() {
                if (!this.con || !this.con.parentNode || this.con.classList.contains("search-jumper-showall")) return;
                this.con.style.display = "";
                this.clearInputHide();
                this.alllist.appendChild(this.filterSites);
                this.filterGlob.innerHTML = createHTML();
                let self = this;
                let kw = this.tileInput.value;
                this.setFuncKeyCall(false);
                this.hideSearchInput();
                this.con.classList.add("search-jumper-showall");
                this.preScrollbarWidth = document.documentElement.style.scrollbarWidth || "";
                document.documentElement.style.scrollbarWidth = "none";
                clearInterval(this.showAllTimeTimer);
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                if (window.innerWidth < 1000) {
                    self.timeInAll.style.fontSize = "15px";
                    self.dayInAll.style.fontSize = "15px";
                } else {
                    self.timeInAll.style.fontSize = "";
                    self.dayInAll.style.fontSize = "";
                }
                let now = new Date();
                let year = now.getFullYear(), month = now.getMonth(), date = now.getDate();
                let dayLabelStr = i18n(days[now.getDay()]) + "<br/>" + year + '-' + (++month < 10 ? '0' + month : month) + '-' + (date < 10 ? '0' + date : date);
                if (lang.indexOf("zh") == 0) {
                    let lunar = sloarToLunar(year, month, date);
                    if (lunar) {
                        let lunarStr = `${lunar.lunarYear}年${lunar.lunarMonth}月${lunar.lunarDay}`;
                        dayLabelStr = dayLabelStr + "<br/>" + lunarStr;
                    }
                }
                self.dayInAll.innerHTML = createHTML(dayLabelStr);
                let setTimeLabel = () => {
                    let now = new Date();
                    let hour = now.getHours(), minute = now.getMinutes(), seconds = now.getSeconds();
                    self.timeInAll.innerText = (hour < 10 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute) + ':' + (seconds < 10 ? '0' + seconds : seconds);
                };
                this.showAllTimeTimer = setInterval(setTimeLabel, 1000);
                setTimeLabel();
                searchTypes.forEach(type => {
                    if (type.style.display != 'none') {
                        let sitelist = type.querySelector('.sitelist');
                        if (sitelist) {
                            self.sitelistBox.appendChild(sitelist);
                            self.initList(sitelist);
                        }
                    }
                });
                this.historySiteBtns.slice(0, 20).forEach(btn => {
                    let siteImg = btn.querySelector('img');
                    if (siteImg && siteImg.dataset.src) {
                        siteImg.src = siteImg.dataset.src;
                        delete siteImg.dataset.src;
                    }
                    self.historylist.appendChild(btn);
                });
                let targetKw = "";
                if (targetElement &&
                    (targetElement.nodeName.toUpperCase() == 'A' ||
                     (targetElement.parentNode && targetElement.parentNode.nodeName.toUpperCase() == 'A'))) {
                    targetKw = targetElement.textContent.trim();
                }
                kw = kw || getKeywords() || targetKw;
                this.searchJumperInputKeyWords.value = kw;
                setTimeout(() => {
                    if (!self.showAllMouseHandler) {
                        self.showAllMouseHandler = e => {
                            if (e.isTrusted == false || e.target.className === 'sitelistBox' || e.target.className === 'search-jumper-showallBg') {
                                self.closeShowAll();
                            }
                        };
                    }
                    self.con.addEventListener("mousedown", self.showAllMouseHandler);

                    if (!self.showAllKeydownHandler) {
                        self.showAllKeydownHandler = e => {
                            if (e.keyCode == 27) {
                                self.closeShowAll();
                            }
                        };
                    }
                    document.addEventListener("keydown", self.showAllKeydownHandler, true);
                    if (cacheFilter) {
                        this.searchInput.value = cacheFilter;
                        this.searchInput.dispatchEvent(new Event("input"));
                        this.searchInput.focus();
                        this.searchInput.select();
                    } else if (this.searchJumperInputKeyWords.value) {
                        this.searchJumperInputKeyWords.focus();
                        this.searchJumperInputKeyWords.select();
                    }
                }, 0);
            }

            switchSite(next) {
                if (!currentSite || this.bar.style.display == "none") return;
                let siteEle = this.con.querySelector(".search-jumper-btn.current");
                if (next) {
                    siteEle = siteEle.nextElementSibling;
                    while(siteEle) {
                        if (!siteEle.classList.contains("notmatch") && siteEle.style.display != "none" && siteEle.dataset.current != "true" && siteEle.dataset.isPage == "true") {
                            break;
                        }
                        siteEle = siteEle.nextElementSibling;
                    }
                } else {
                    siteEle = siteEle.previousElementSibling;
                    while(siteEle) {
                        if (!siteEle.classList.contains("notmatch") && siteEle.style.display != "none" && siteEle.dataset.current != "true" && siteEle.dataset.isPage == "true") {
                            break;
                        }
                        siteEle = siteEle.previousElementSibling;
                    }
                }
                if (siteEle) {
                    this.openSiteBtn(siteEle, "_self");
                }
            }

            clearInputHide() {
                searchTypes.forEach(type => {
                    type.classList.remove("input-hide");
                });
                this.allSiteBtns.forEach(btn => {
                    btn[0].classList.remove("input-hide");
                });
                this.allListBtns.forEach(listItem => {
                    listItem.classList.remove("input-hide");
                });
                this.allLists.forEach(listCon => {
                    listCon.classList.remove("input-hide");
                });
            }

            showSearchInput() {
                if (this.con && this.con.classList.contains("search-jumper-showall")) return;
                this.recoveHistory();
                this.con.classList.add("in-input");
                this.searchInput.value = "";
                this.contentContainer.appendChild(this.filterSites);
                let selStr = getSelectStr();
                if (selStr) {
                    this.searchJumperInputKeyWords.value = selStr;
                }
                if (this.filterSitesTab.checked) {
                    this.con.classList.remove("in-find");
                    if (searchData.prefConfig.defaultPicker) {
                        this.togglePicker();
                    }
                    if (!this.searchJumperInputKeyWords.value) {
                        this.searchJumperInputKeyWords.value = getKeywords();
                    }
                    let firstType = this.bar.querySelector('.search-jumper-needInPage:not(.notmatch)>span');
                    if (firstType && !firstType.parentNode.classList.contains('search-jumper-open')) {
                        if (firstType.onmouseup) {
                            firstType.onmouseup();
                        } else {
                            let mouseEvent = new PointerEvent("mouseup");
                            firstType.dispatchEvent(mouseEvent);
                        }
                    }
                    if (cacheFilter) {
                        this.searchInput.value = cacheFilter;
                        this.searchInput.dispatchEvent(new Event("input"));
                    }
                    this.searchJumperInputKeyWords.focus();
                    this.searchJumperInputKeyWords.select();
                } else if (this.searchInPageTab.checked) {
                    this.con.classList.add("in-find");
                    this.searchJumperInPageInput.focus();
                    setTimeout(() => {
                        if (selStr && this.lockWords.indexOf(selStr) == -1) {
                            this.searchJumperInPageInput.value = "";
                            if (!this.navMarks.innerHTML) {
                                this.submitIgnoreSpace(selStr);
                            } else {
                                this.searchJumperInPageInput.value = selStr;
                                this.submitInPageWords();
                            }
                        } else if (this.searchJumperInPageInput.value) {
                            this.submitInPageWords();
                        } else if (!this.initShowSearchInput && cacheKeywords && this.lockWords !== cacheKeywords) {
                            this.searchJumperInPageInput.value = cacheKeywords;
                            this.initShowSearchInput = true;
                            this.searchJumperInPageInput.select();
                        }
                    }, 10);
                }
                this.inInput = true;
                this.clearInputHide();
                if (this.lockWords) this.searchJumperInPageInput.style.paddingLeft = this.searchInPageLockWords.clientWidth + 3 + "px";
                else this.searchJumperInPageInput.style.paddingLeft = "";
                if (searchData.prefConfig.altToHighlight) {
                    document.removeEventListener("mouseup", this.checkSelHandler);
                    document.addEventListener("mouseup", this.checkSelHandler);
                }
            }

            togglePicker() {
                this.pickerBtn.classList.toggle("checked");
                this.con.classList.toggle("in-pick");
                this.searchJumperInputKeyWords.disabled = !this.searchJumperInputKeyWords.disabled;
                picker.toggle(true);
                if (this.searchJumperInputKeyWords.disabled) {
                    this.searchJumperInputKeyWords.value = "";
                }
            }

            hideSearchInput() {
                this.inInput = false;
                this.clearInputHide();
                this.con.classList.remove("in-find");
                this.con.classList.remove("in-input");
                this.con.classList.remove("lock-input");
                this.bar.classList.remove("initShow");
                this.searchInput.value = "";
                this.searchJumperInputKeyWords.value = "";
                this.pickerBtn.classList.remove("checked");
                this.searchJumperInputKeyWords.disabled = false;
                picker.close();
                document.removeEventListener("mouseup", this.checkSelHandler);
                this.setFuncKeyCall(false);
                this.closeOpenType();
            }

            removeBar() {
                if (this.shadowContainer && this.shadowContainer.parentNode) {
                    this.shadowContainer.parentNode.removeChild(this.shadowContainer);
                }
                if (this.con.parentNode) {
                    this.con.parentNode.removeChild(this.con);
                }
            }

            async testCSP() {
                let self = this;
                let cspHandler = e => {
                    if (!e.violatedDirective || e.violatedDirective.indexOf("style-src") == -1) return;
                    disabled = true;
                };
                window.addEventListener('securitypolicyviolation', cspHandler);
                let testStyleEle = _GM_addStyle(`html {color: #000;}`);
                this.addToShadow(testStyleEle);
                await sleep(0);
                window.removeEventListener('securitypolicyviolation', cspHandler);
                testStyleEle.parentNode && testStyleEle.parentNode.removeChild(testStyleEle);
            }

            addToShadow(ele) {
                if (!this.shadowContainer) {
                    this.shadowContainer = document.createElement("div");
                }
                if (!this.shadowContainer.parentNode) {
                    if (shareEngines) {
                        document.body.appendChild(this.shadowContainer);
                    } else {
                        document.documentElement.appendChild(this.shadowContainer);
                    }
                }
                let shadow;
                if (disabled) {
                    if (/^style$/i.test(ele.nodeName)) return true;
                    shadow = this.shadowContainer;
                } else {
                    if (this.shadowRoot) {
                        shadow = this.shadowRoot;
                    } else {
                        //this.shadowContainer.setAttribute('contenteditable', 'true');
                        this.shadowContainer.className = "search-jumper-shadow";
                        let style = _GM_addStyle(`
                         .search-jumper-shadow {
                          display: block !important;
                          width: 0px !important;
                          height: 0px !important;
                          margin: 0px !important;
                          padding: 0px !important;
                          border-width: initial !important;
                          border-style: none !important;
                          border-color: initial !important;
                          border-image: initial !important;
                          outline: none !important;
                          position: unset !important;
                         }
                        `);
                        this.shadowContainer.appendChild(style);
                        let shadowRoot = this.shadowContainer.attachShadow({ mode: "closed" });
                        shadow = document.createElement("div");
                        shadow.id = "search-jumper-root";
                        shadow.style.display = "none";
                        shadow.setAttribute('contenteditable', 'false');
                        let hideShadowStyle = document.createElement("style");
                        hideShadowStyle.innerHTML = createHTML("#search-jumper-root{display: block!important;}");
                        shadow.appendChild(hideShadowStyle);
                        shadowRoot.appendChild(shadow);
                        this.shadowRoot = shadow;
                    }
                }
                if (ele.parentNode != shadow) shadow.appendChild(ele);
                return true;
            }

            contains(ele) {
                return ele == this.shadowContainer || this.bar.contains(ele);
            }

            appendBar() {
                if (!mainStyleEle || !mainStyleEle.parentNode) {
                    mainStyleEle = _GM_addStyle(cssText);
                    if (!disabled) this.addToShadow(mainStyleEle);
                }
                if (this.addToShadow(this.con)) {
                    let self = this;
                    let checkZIndex = () => {
                        setTimeout(() => {
                            if (self.shadowContainer && !self.shadowContainer.parentNode) {
                                if (shareEngines) {
                                    document.body.appendChild(self.shadowContainer);
                                } else {
                                    document.documentElement.appendChild(self.shadowContainer);
                                }
                                checkZIndex();
                                return;
                            }
                            if (!isAllPage && self.con.parentNode) {
                                if (getComputedStyle(self.con).zIndex != "2147483646") {
                                    this.removeBar();
                                    if (disabled) {
                                        debug(i18n("cspDisabled"));
                                    } else {
                                        disabled = true;
                                        mainStyleEle = _GM_addStyle(cssText);
                                        self.shadowContainer.parentNode.removeChild(self.shadowContainer);
                                        self.shadowContainer = document.createElement("div");
                                        self.shadowContainer.setAttribute('contenteditable', 'false');
                                        document.documentElement.appendChild(self.shadowContainer);
                                        self.appendBar();
                                    }
                                }
                            }
                        }, 100);
                    };
                    checkZIndex();
                }
            }

            async searchBySiteName(siteName, e, selfTab) {
                if (!e) e = {};
                if (e && e.type === 'drop') {
                    this.closeShowAll();
                }
                for (let [siteBtn, siteData] of this.allSiteBtns) {
                    if (siteBtn.dataset.name == siteName) {
                        if (siteBtn.dataset.showTips) {
                            siteBtn.dispatchEvent(new CustomEvent('showTips'));
                            return;
                        }
                        await this.siteSetUrl(siteBtn, {button: e.button, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, metaKey: e.metaKey});
                        let isPage = /^(https?|ftp):/.test(siteBtn.href);
                        if (isPage) {
                            siteBtn.setAttribute("target", selfTab ? "_self" : "_blank");
                        }
                        siteBtn.click();
                        if (isPage) {
                            siteBtn.setAttribute("target", siteBtn.dataset.target == 1 ? "_blank" : "_self");
                        }
                        return;
                    }
                }
                for (let i = searchTypes.length - 1; i >= 0; i--) {
                    let typeEle = searchTypes[i];
                    if (typeEle.dataset.type == siteName) {
                        typeEle.firstChild.onmouseup && typeEle.firstChild.onmouseup({button: 2});
                        return;
                    }
                }
            }

            async searcAllhByTypeName(siteName) {
                for (let i = searchTypes.length - 1; i >= 0; i--) {
                    let typeEle = searchTypes[i];
                    if (typeEle.dataset.type == siteName) {
                        typeEle.firstChild.onmouseup && typeEle.firstChild.onmouseup({button: 2});
                        return;
                    }
                }
            }


            autoGetFirstType() {
                if (!targetElement) targetElement = getBody(document);
                let firstType;
                switch (targetElement.nodeName.toUpperCase()) {
                    case 'IMG':
                        firstType = this.bar.querySelector('.search-jumper-targetImg:not(.notmatch)');
                        break;
                    case 'AUDIO':
                        firstType = this.bar.querySelector('.search-jumper-targetAudio:not(.notmatch)');
                        break;
                    case 'VIDEO':
                        firstType = this.bar.querySelector('.search-jumper-targetVideo:not(.notmatch)');
                        break;
                    case 'A':
                        if (getSelectStr()) {
                            firstType = this.bar.querySelector('.search-jumper-needInPage:not(.notmatch)');
                        } else {
                            firstType = this.bar.querySelector('.search-jumper-targetLink:not(.notmatch)');
                        }
                        break;
                    default:
                        if (getSelectStr()) {
                            firstType = this.bar.querySelector('.search-jumper-needInPage:not(.notmatch)');
                        } else if (targetElement.parentNode.nodeName.toUpperCase() === 'A') {
                            firstType = this.bar.querySelector('.search-jumper-targetLink:not(.notmatch)');
                        } else {
                            firstType = this.bar.querySelector('.search-jumper-targetPage:not(.notmatch)');
                        }
                        break;
                }
                if (!firstType) firstType = this.bar.querySelector('.search-jumper-targetAll:not(.notmatch)') || this.bar.querySelector('.search-jumper-type');
                if (firstType) {
                    this.setFuncKeyCall(false);
                    let mouseEvent = new PointerEvent("mouseup");
                    if (firstType.classList.contains('search-jumper-open')) {
                        if (firstType.children[0].onmouseup) firstType.children[0].onmouseup();
                        else {
                            firstType.children[0].dispatchEvent(mouseEvent);
                        }
                    }
                    if (firstType.children[0].onmouseup) firstType.children[0].onmouseup();
                    else {
                        firstType.children[0].dispatchEvent(mouseEvent);
                    }
                }
                return firstType;
            }

            searchAuto(index, e) {
                if (!index) index = 0;
                let firstType = this.autoGetFirstType();
                if (!firstType) return;
                let targetSites = firstType.querySelectorAll('a.search-jumper-btn:not(.notmatch)');
                if (index < targetSites.length) {
                    let targetSite = targetSites[index];
                    this.searchBySiteName(targetSite.dataset.name, e);
                }
            }

            setNav(enable, noSave) {
                if (!noSave && navEnable != enable) {
                    storage.setItem("navEnable", enable || "");
                    navEnable = enable;
                }
                if (enable) {
                    if (!noSave) this.locBtn.classList.add("checked");
                    this.searchJumperNavBar.style.display = "";
                } else {
                    if (!noSave) this.locBtn.classList.remove("checked");
                    this.searchJumperNavBar.style.display = "none";
                    this.navPointer.style.display = "none";
                }
            }

            lockSearchInput(lockWords) {
                this.lockSiteKeywords = true;
                this.searchLockInput.innerText = lockWords;
                this.con.classList.add("lock-input");
                this.searchInput.value = "";
                this.searchInput.style.paddingLeft = `${15 + this.searchLockInput.scrollWidth}px`;
                this.searchInput.placeholder = i18n("inputKeywords");
            }

            async initRun() {
                let self = this;
                this.siteIndex = 1;
                this.customInput = false;
                this.fontPool = [];
                this.allSiteBtns = [];
                this.allListBtns = [];
                this.allLists = [];
                this.dockerScaleBtns = [];
                this.bar.style.visibility = "hidden";
                let sitesNum = 0;
                let bookmarkTypes = [];
                this.checkSelHandler = e => {
                    if (!e.altKey) return;
                    if (this.searchInPageTab.checked && window.getSelection().toString()) {
                        this.showSearchInput();
                    }
                };

                //Search in page
                this.splitSep = "◎";
                this.lockWords = "";
                this.marks = {};
                this.initInPageWords = [];
                this.highlightSpans = {};
                this.curHighlightWords = [];
                this.curWordIndex = 0;
                let editFunc = () => {
                    this.searchJumperInPageInput.focus();
                    this.highlight("");
                    let words = this.lockWords.trim();
                    if (!words) {
                        this.submitInPageWords();
                        return;
                    }
                    if (this.searchJumperInPageInput.value) words += this.splitSep + this.searchJumperInPageInput.value;
                    this.lockWords = "";
                    this.searchJumperInPageInput.value = words;
                    this.searchInPageLockWords.innerHTML = createHTML();
                    this.searchJumperInPageInput.style.paddingLeft = "";
                };
                document.addEventListener("keydown", e => {
                    if (e.keyCode === 27) {
                        if (isAllPage) {
                            this.searchInput.value = "";
                            this.searchInput.dispatchEvent(new CustomEvent("input"));
                        } else if (this.inInput) {
                            this.hideSearchInput();
                        } else if (this.lockWords) {
                            this.highlight("");
                            this.searchJumperInPageInput.value = this.lockWords;
                            this.lockWords = "";
                            this.searchInPageLockWords.innerHTML = createHTML();
                            this.setNav(false, true);
                        } else if (this.funcKeyCall) {
                            this.removeBar();
                        }
                    }
                }, true);
                this.searchJumperInPageInput.addEventListener("focus", e => {
                    this.searchInputDiv.classList.add("active");
                });
                this.searchJumperInPageInput.addEventListener("blur", e => {
                    this.searchInputDiv.classList.remove("active");
                });
                this.searchJumperInPageInput.addEventListener("keydown", e => {
                    e.stopPropagation();
                    switch(e.keyCode) {
                        case 8://退格
                            if (!this.searchJumperInPageInput.value) {
                                let lastWordSpan = this.searchInPageLockWords.lastChild;
                                if (lastWordSpan) {
                                    lastWordSpan.dispatchEvent(new CustomEvent("editword"));
                                    e.preventDefault();
                                }
                            }
                            break;
                        case 9://tab
                            e.preventDefault();
                            this.filterSitesTab.checked = true;
                            this.con.classList.remove("in-find");
                            this.searchInput.focus();
                            break;
                        case 13://回车
                            {
                                //let spans = this.submitInPageWords();
                                let spans = this.searchJumperInPageInput.value ? this.submitInPageWords() : [];
                                if (spans && spans.length > 0) {
                                    let lastSpan = spans.pop();
                                    if (this.currentSearchInPageLockWords) {
                                        this.currentSearchInPageLockWords.firstChild.style.transform = "";
                                    }
                                    this.currentSearchInPageLockWords = lastSpan;
                                    let mouseEvent = new PointerEvent("mousedown", {button: e.shiftKey ? 2 : 0});
                                    lastSpan.dispatchEvent(mouseEvent);
                                } else if (this.lockWords) {
                                    if (!this.currentSearchInPageLockWords) {
                                        this.currentSearchInPageLockWords = this.searchInPageLockWords.lastChild;
                                        this.currentSearchInPageLockWords.firstChild.style.transform = "scale(1.1)";
                                    }
                                    let mouseEvent = new PointerEvent("mousedown", {button: e.shiftKey ? 2 : 0});
                                    this.currentSearchInPageLockWords.dispatchEvent(mouseEvent);
                                }
                            }
                            break;
                        case 37://←
                            if (this.searchJumperInPageInput.value == "" && this.lockWords) {
                                if (!this.currentSearchInPageLockWords) {
                                    this.currentSearchInPageLockWords = this.searchInPageLockWords.lastChild;
                                    this.currentSearchInPageLockWords.firstChild.style.transform = "scale(1.1)";
                                } else if (this.currentSearchInPageLockWords.previousElementSibling){
                                    this.currentSearchInPageLockWords.firstChild.style.transform = "";
                                    this.currentSearchInPageLockWords = this.currentSearchInPageLockWords.previousElementSibling;
                                    this.currentSearchInPageLockWords.firstChild.style.transform = "scale(1.1)";
                                }
                            }
                            break;
                        case 39://→
                            if (this.searchJumperInPageInput.value == "" && this.lockWords) {
                                if (!this.currentSearchInPageLockWords) {
                                    this.currentSearchInPageLockWords = this.searchInPageLockWords.lastChild;
                                    this.currentSearchInPageLockWords.firstChild.style.transform = "scale(1.1)";
                                } else if (this.currentSearchInPageLockWords.nextElementSibling){
                                    this.currentSearchInPageLockWords.firstChild.style.transform = "";
                                    this.currentSearchInPageLockWords = this.currentSearchInPageLockWords.nextElementSibling;
                                    this.currentSearchInPageLockWords.firstChild.style.transform = "scale(1.1)";
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }, true);
                this.editBtn.addEventListener("click", e => {
                    editFunc();
                });
                this.addWord.addEventListener("click", e => {
                    this.showModifyWindow();
                });
                this.searchInPageTab.addEventListener("change", e => {
                    this.initSetInPageWords();
                    this.searchJumperInPageInput.focus();
                    this.con.classList.add("in-find");
                });
                this.filterSitesTab.addEventListener("change", e => {
                    this.searchInput.focus();
                    this.con.classList.remove("in-find");
                });
                if (globalInPageWords) {
                    this.recoverBtn.addEventListener("click", e => {
                        this.lockWords = "";
                        this.searchJumperInPageInput.value = globalInPageWords;
                        this.searchInPageLockWords.innerHTML = createHTML();
                        this.highlight("");
                        this.submitInPageWords();
                        this.searchJumperInPageInput.focus();
                    });
                    this.pinBtn.classList.add("checked");
                } else {
                    this.recoverBtn.style.display = "none";
                }
                this.pinBtn.addEventListener("click", e => {
                    this.submitInPageWords();
                    if (this.pinBtn.classList.contains("checked")) {
                        globalInPageWords = "";
                        this.pinBtn.classList.remove("checked");
                    } else if (this.lockWords) {
                        globalInPageWords = this.lockWords;
                        this.pinBtn.classList.add("checked");
                    }
                    storage.setItem("globalInPageWords", globalInPageWords);
                });
                this.wordModeBtn.addEventListener("click", e => {
                    let inWordMode = this.wordModeBtn.classList.contains("checked");
                    if (inWordMode) {
                        this.wordModeBtn.classList.remove("checked");
                    } else {
                        this.wordModeBtn.classList.add("checked");
                    }
                    if (this.lockWords) {
                        this.refreshPageWords(this.lockWords);
                    }
                });
                this.saveRuleBtn.addEventListener("click", e => {
                    if (!this.lockWords) return;
                    if (shareEngines) return;
                    dataChanged(() => {
                        let inPageRule = searchData.prefConfig.inPageRule || {};
                        inPageRule[this.inPageRuleKey || href.replace(/([&\?]_i=|#).*/, "")] = this.lockWords;
                        searchData.prefConfig.inPageRule = inPageRule;
                        searchData.lastModified = new Date().getTime();
                        lastModified = searchData.lastModified;
                        storage.setItem("searchData", searchData);
                        _GM_notification(i18n("save completed"));
                    });
                });
                this.emptyBtn.addEventListener("click", e => {
                    this.lockWords = "";
                    this.searchJumperInPageInput.value = "";
                    this.searchInPageLockWords.innerHTML = createHTML();
                    this.searchJumperInPageInput.style.paddingLeft = "";
                    this.submitInPageWords();
                    this.searchJumperInPageInput.focus();
                });
                this.copyInPageBtn.addEventListener("click", e => {
                    if (!this.lockWords) return;
                    _GM_setClipboard(this.lockWords.replace(/◎/g, "\n"));
                    _GM_notification('Copied successfully!');
                });
                this.setNav(navEnable);
                this.locBtn.addEventListener("click", e => {
                    this.setNav(!this.locBtn.classList.contains("checked"));
                });
                this.closeNavBtn.addEventListener("click", e => {
                    if (this.lockWords) {
                        this.searchJumperInPageInput.value = this.lockWords || "";
                        this.lockWords = "";
                        this.searchInPageLockWords.innerHTML = createHTML();
                        this.searchJumperInPageInput.style.paddingLeft = "";
                        this.highlight("");
                        this.searchJumperInPageInput.focus();
                        this.setNav(false, true);
                        storage.setItem("disableHighlight", location.hostname);
                        if (this.bar.style.display === "none") {
                            this.removeBar();
                        }
                    } else {
                        this.setNav(false);
                    }
                });
                this.minNavBtn.addEventListener("click", e => {
                    if (this.searchJumperNavBar.classList.contains("minimize")) {
                        this.searchJumperNavBar.classList.remove("minimize");
                        if (this.lockWords.trim()) return;
                        this.submitInPageWords();
                    } else {
                        this.searchJumperNavBar.classList.add("minimize");
                        this.highlight("");
                        let words = this.lockWords.trim();
                        if (!words) return;
                        if (this.searchJumperInPageInput.value) words += this.splitSep + this.searchJumperInPageInput.value;
                        this.lockWords = "";
                        this.searchJumperInPageInput.value = words;
                        this.searchInPageLockWords.innerHTML = createHTML();
                        this.searchJumperInPageInput.style.paddingLeft = "";
                    }
                });
                this.maxNavBtn.addEventListener("click", e => {
                    self.showInPage();
                    self.showInPageSearch();
                });
                this.navMarks.addEventListener("click", e => {
                    let topPercent = e.offsetY / this.navMarks.clientHeight * 100;
                    let sortedMarks = [].slice.call(this.navMarks.querySelectorAll("span"));
                    sortedMarks.sort((a, b) => {
                        a = parseFloat(a.style.top);
                        b = parseFloat(b.style.top);
                        if (a > b) return 1;
                        if (a < b) return -1;
                        return 0;
                    });
                    let mark;
                    for (let i = 0; i < sortedMarks.length; i++) {
                        mark = sortedMarks[i];
                        let markTop = parseFloat(mark.style.top);
                        if (markTop > topPercent) {
                            if (i > 0) {
                                let preMark = sortedMarks[i - 1];
                                let preMarkTop = parseFloat(preMark.style.top);
                                if (markTop - topPercent > topPercent - preMarkTop) {
                                    mark = preMark;
                                }
                            }
                            break;
                        }
                    }
                    if (mark) {
                        mark.click();
                    }
                });
                this.bar.addEventListener("mousedown", e => {
                    e && e.stopPropagation && e.stopPropagation();
                    e && e.preventDefault && e.preventDefault();
                });

                this.con.addEventListener('dblclick', e=>{
                    e.stopPropagation();
                    e.preventDefault();
                });
                //Search in page

                let expandTypeHandler = e => {
                    e.stopPropagation();
                    e.preventDefault();
                    let typeEle = self.searchJumperExpand.parentNode;
                    if (!typeEle || !typeEle.classList.contains('not-expand')) return;
                    typeEle.classList.remove('not-expand');
                    typeEle.classList.remove('search-jumper-move');
                    let leftRight = self.con.classList.contains("search-jumper-left") ||
                        self.con.classList.contains("search-jumper-right");
                    typeEle.removeChild(self.searchJumperExpand);
                    let scrollSize = Math.max(typeEle.scrollWidth, typeEle.scrollHeight) + 5 + "px";
                    if (leftRight) {
                        typeEle.style.height = scrollSize;
                        typeEle.style.width = "";
                    } else {
                        typeEle.style.width = scrollSize;
                        typeEle.style.height = "";
                    }
                    setTimeout(() => {
                        self.checkScroll();
                        typeEle.classList.add('search-jumper-move');
                    }, 251);
                }, showTimer;
                this.searchJumperExpand.addEventListener("click", expandTypeHandler, true);
                this.searchJumperExpand.addEventListener("contextmenu", expandTypeHandler, true);
                this.searchJumperExpand.addEventListener('mouseenter', e => {
                    if (searchData.prefConfig.overOpen) {
                        clearTimeout(showTimer);
                        showTimer = setTimeout(() => {
                            expandTypeHandler(e);
                        }, 500);
                    }
                    let sitelistEvent = new CustomEvent("sitelist", {
                        detail: {
                            bind: e.currentTarget,
                        }
                    });
                    e.currentTarget.parentNode.dispatchEvent(sitelistEvent);
                }, false);
                if (searchData.prefConfig.overOpen) {
                    this.searchJumperExpand.addEventListener('mouseleave', e => {
                        clearTimeout(showTimer);
                    }, false);
                }
                this.pickerBtn.addEventListener("click", e => {
                    this.togglePicker();
                });
                this.maxEleBtn.addEventListener("click", e => {
                    picker.expand();
                });
                this.minEleBtn.addEventListener("click", e => {
                    picker.collapse();
                });
                this.copyEleBtn.addEventListener("click", e => {
                    picker.copy();
                });
                this.openLinkBtn.addEventListener("click", e => {
                    picker.openLinks();
                });
                let listArrow = document.createElement("div");
                listArrow.className = "listArrow";
                this.listArrow = listArrow;
                this.con.appendChild(listArrow);
                for (let siteConfig of searchData.sitesConfig) {
                    let isBookmark = siteConfig.bookmark || siteConfig.sites.length > 100 || (/^BM/.test(siteConfig.type) && siteConfig.icon === "bookmark");
                    if (isBookmark) {
                        bookmarkTypes.push(siteConfig);
                        continue;
                    }
                    await this.createType(siteConfig);
                    sitesNum += siteConfig.sites.length;
                    if (sitesNum > 100) {
                        await sleep(1);
                        sitesNum = 0;
                    }
                }
                this.initHistorySites();
                this.initSort();
                this.bar.style.visibility = "";
                this.bar.style.display = "none";
                this.searchInPageRule();
                if (currentSite && wordParamReg.test(currentSite.url)) {
                    this.inSearchEngine();
                } else if (searchData.prefConfig.alwaysShow && !inIframe && !isInConfigPage) {
                    this.bar.style.display = "";
                    this.initPos();
                    this.appendBar();
                }

                if (lastSign) {
                    targetElement = lastSign.target;
                    this.batchOpen(lastSign.sites, {button: 2});
                }
                lastSign = false;

                if (inPagePostParams) {
                    this.submitAction(inPagePostParams);
                    setTimeout(() => {
                        storage.setListItem("inPagePostParams", location.hostname, "");
                    }, 10000);
                }
                let searchWithCurrentFilter = e => {
                    clearTimeout(inputTimer);
                    let siteEle, forceTarget = "";
                    if (currentSite && !self.searchInput.value) {
                        siteEle = self.con.querySelector(".search-jumper-btn.current");
                        forceTarget = "_self";
                    } else {
                        siteEle = self.con.querySelector(".search-jumper-type.search-jumper-open>a.search-jumper-btn:not(.input-hide)") || self.con.querySelector(".search-jumper-needInPage>a.search-jumper-btn:not(.input-hide)") || self.con.querySelector("a.search-jumper-btn:not(.input-hide)");
                        forceTarget = "_blank";
                    }
                    if (siteEle) {
                        self.openSiteBtn(siteEle, forceTarget, !e.ctrlKey);
                    }
                };
                let inputTimer;
                let isComposing = false;
                this.inInput = false;
                let saveCacheFilter = () => {
                    if (cacheFilter !== self.searchInput.value) {
                        cacheFilter = self.searchInput.value;
                        storage.setItem("cacheFilter", cacheFilter);
                    }
                };
                this.searchInput.addEventListener("input", e => {
                    clearTimeout(inputTimer);
                    inputTimer = setTimeout(() => {
                        if (!isComposing) self.searchSiteBtns(self.searchInput.value)
                    }, 500);
                });
                this.searchInput.addEventListener('compositionstart', function() {
                    isComposing = true;
                });
                this.searchInput.addEventListener('compositionend', function() {
                    isComposing = false;
                });
                this.searchInput.addEventListener("click", e => {
                    self.searchInput.select();
                });
                this.searchInput.addEventListener("blur", e => {
                    saveCacheFilter();
                });
                this.searchInput.addEventListener("keydown", e => {
                    e.stopPropagation();
                    switch(e.keyCode) {
                        case 9:
                            if (e.shiftKey) {
                                e.preventDefault();
                                this.searchInPageTab.checked = true;
                                this.con.classList.add("in-find");
                                this.searchJumperInPageInput.focus();
                                this.initSetInPageWords();
                            }
                            break;
                        case 13://回车
                            if (this.searchJumperInputKeyWords.disabled) {
                                clearTimeout(inputTimer);
                                let siteEle, forceTarget = "";
                                if (currentSite && !self.searchInput.value) {
                                    siteEle = self.con.querySelector(".search-jumper-btn.current");
                                    forceTarget = "_self";
                                } else {
                                    siteEle = self.con.querySelector(".search-jumper-type.search-jumper-open>a.search-jumper-btn:not(.input-hide)") || self.con.querySelector(".search-jumper-needInPage>a.search-jumper-btn:not(.input-hide)") || self.con.querySelector("a.search-jumper-btn:not(.input-hide)");
                                    forceTarget = "_blank";
                                }
                                if (siteEle) {
                                    self.openSiteBtn(siteEle, forceTarget, !e.ctrlKey);
                                }
                            } else {
                                this.searchJumperInputKeyWords.focus();
                                if (this.searchJumperInputKeyWords.value) {
                                    //searchWithCurrentFilter(e);
                                }
                                saveCacheFilter();
                            }
                            break;
                        case 8://退格
                            /*if (self.lockSiteKeywords && !self.searchInput.value) {
                                self.searchInput.value = self.searchLockInput.innerText;
                                self.searchLockInput.innerText = "";
                                self.lockSiteKeywords = false;
                                self.con.classList.remove("lock-input");
                                self.searchInput.style.paddingLeft = "";
                                self.searchInput.placeholder = i18n("inputPlaceholder");
                            }*/
                            break;
                        default:
                            break;
                    }
                });
                this.searchJumperInputKeyWords.addEventListener("input", e => {
                    clearTimeout(inputTimer);
                    inputTimer = setTimeout(() => {
                        if (!isComposing) self.getSuggest(self.searchJumperInputKeyWords.value)
                    }, 200);
                });
                this.searchJumperInputKeyWords.addEventListener('compositionstart', function() {
                    isComposing = true;
                });
                this.searchJumperInputKeyWords.addEventListener('compositionend', function() {
                    isComposing = false;
                });
                this.searchJumperInputKeyWords.addEventListener("keydown", e => {
                    if (e.keyCode !== 27) e.stopPropagation();
                    switch(e.keyCode) {
                        case 9:
                            if (!this.inInput) {
                                e.preventDefault();
                                this.searchInput.focus();
                            } else if (!e.shiftKey) {
                                e.preventDefault();
                                this.searchInPageTab.checked = true;
                                this.con.classList.add("in-find");
                                this.searchJumperInPageInput.focus();
                                this.initSetInPageWords();
                            }
                            break;
                        case 13://回车
                            searchWithCurrentFilter(e);
                            break;
                        default:
                            break;
                    }
                }, true);
                this.con.addEventListener("keypress", e => {
                    e.stopPropagation();
                }, true);
                this.closeBtn.addEventListener("mousedown", e => {
                    self.hideSearchInput();
                    if (searchData.prefConfig.emptyAfterCloseInput) {
                        self.highlight("");
                        self.searchJumperInPageInput.value = self.lockWords || "";
                        self.lockWords = "";
                        self.searchInPageLockWords.innerHTML = createHTML();
                        self.setNav(false, true);
                    }
                });

                let startLeft = window.innerWidth / 2;
                let startBottom;
                let currentGroup, startX, startY;

                let clientX = e => {
                    if (e.type.indexOf('mouse') === 0) {
                        return e.clientX;
                    } else {
                        return e.changedTouches[0].clientX;
                    }
                };

                let clientY = e => {
                    if (e.type.indexOf('mouse') === 0) {
                        return e.clientY;
                    } else {
                        return e.changedTouches[0].clientY;
                    }
                };

                let grabMousemoveHandler = e => {
                    let halfContainerWidth = 0.25 * window.innerWidth;
                    let left = startLeft + clientX(e) - startX;
                    self.searchInputDiv.style.top = 'unset';
                    self.searchInputDiv.style.left = left + "px";
                    self.searchInputDiv.style.bottom = startBottom - (clientY(e) - startY) + "px";
                    if (left > window.innerWidth / 2) {
                        let maxWidth = window.innerWidth - left + halfContainerWidth - 50;
                        self.searchInputDiv.style.maxWidth = maxWidth + "px";
                    } else {
                        let maxWidth = left + halfContainerWidth;
                        if (left < halfContainerWidth) {
                            left += halfContainerWidth - left;
                            self.searchInputDiv.style.left = left + "px";
                        }
                        self.searchInputDiv.style.maxWidth = maxWidth + "px";
                    }
                    e.stopPropagation();
                    e.preventDefault();
                };

                let grabMouseupHandler = e => {
                    document.removeEventListener("mouseup", grabMouseupHandler);
                    document.removeEventListener("mousemove", grabMousemoveHandler);
                    document.removeEventListener("touchend", grabMouseupHandler);
                    document.removeEventListener("touchmove", grabMousemoveHandler);
                    currentGroup.style.cursor = "";
                    startLeft += clientX(e) - startX;
                    startBottom -= clientY(e) - startY;
                };

                let setStartBottom = () => {
                    if (!startBottom) startBottom = self.con.classList.contains('search-jumper-bottom') ? window.innerHeight * 0.95 - 60 : window.innerHeight * 0.03;
                };

                let touchStart = false;
                this.searchInputDiv.addEventListener("touchstart", e => {
                    touchStart = true;
                    if (e.target.className === 'inputGroup' || e.target.nodeName.toUpperCase() === 'LABEL') {
                        setStartBottom();
                        currentGroup = e.target;
                        currentGroup.style.cursor = "grabbing";
                        startX = clientX(e);
                        startY = clientY(e);
                        document.addEventListener("touchend", grabMouseupHandler);
                        document.addEventListener("touchmove", grabMousemoveHandler);
                    }
                }, { passive: true, capture: false });

                this.searchInputDiv.addEventListener("mousedown", e => {
                    if (touchStart) {
                        touchStart = false;
                        return;
                    }
                    if (e.target.className === 'inputGroup' || e.target.nodeName.toUpperCase() === 'LABEL') {
                        setStartBottom();
                        currentGroup = e.target;
                        currentGroup.style.cursor = "grabbing";
                        startX = e.clientX;
                        startY = e.clientY;
                        document.addEventListener("mouseup", grabMouseupHandler);
                        document.addEventListener("mousemove", grabMousemoveHandler);
                        e.stopPropagation();
                        e.preventDefault();
                    }
                });
                let initWidth, initX;
                let sizeChangeMouseMove = e => {
                    let width = e.clientX - initX + initWidth + 20;
                    this.searchInputDiv.style.width = width + "px";
                };
                let sizeChangeMouseUp = e => {
                    document.removeEventListener("mousemove", sizeChangeMouseMove);
                    document.removeEventListener("mouseup", sizeChangeMouseUp);
                };
                this.rightSizeChange.addEventListener("mousedown", e => {
                    initX = e.clientX;
                    initWidth = this.searchInput.clientWidth * 2 + 2;
                    document.addEventListener("mousemove", sizeChangeMouseMove);
                    document.addEventListener("mouseup", sizeChangeMouseUp);
                    e.stopPropagation();
                    e.preventDefault();
                });

                let dragSiteBtn;
                let dragOpenDropHandler = e => {
                    if (!this.contains(e.target)){
                        let isPage = /^(https?|ftp):/.test(dragSiteBtn.href);
                        if (isPage) {
                            dragSiteBtn.setAttribute("target", "_blank");
                        }
                        if (!isPage) {
                            dragSiteBtn.click();
                        } else {
                            _GM_openInTab(dragSiteBtn.href, {active: false, insert: true});
                        }
                        if (isPage) {
                            dragSiteBtn.setAttribute("target", dragSiteBtn.dataset.target == 1 ? "_blank" : "_self");
                        }
                    }
                    getBody(document).removeEventListener('dragover', dragOpenOverHandler);
                    document.removeEventListener('drop', dragOpenDropHandler);
                    document.removeEventListener('dragover', dragOpenOverHandler);
                };
                let dragOpenOverHandler = e => {
                    e.preventDefault();
                };
                let dragOpenEndHandler = e => {
                    getBody(document).removeEventListener('dragover', dragOpenOverHandler);
                    document.removeEventListener('drop', dragOpenDropHandler);
                    document.removeEventListener('dragover', dragOpenOverHandler);
                };
                this.bar.addEventListener("dragstart", e => {
                    let target = e.target;
                    let parentNode = target.parentNode;
                    if (target.nodeName.toUpperCase() !== 'IMG' && target.nodeName.toUpperCase() !== 'A') return;
                    if (target.classList && target.classList.contains('search-jumper-btn')) {
                        dragSiteBtn = target;
                        getBody(document).addEventListener('dragover', dragOpenOverHandler);
                        document.addEventListener('drop', dragOpenDropHandler);
                        document.addEventListener('dragend', dragOpenEndHandler);
                    } else if (parentNode && parentNode.classList && parentNode.classList.contains('search-jumper-btn')) {
                        dragSiteBtn = parentNode;
                        getBody(document).addEventListener('dragover', dragOpenOverHandler);
                        document.addEventListener('drop', dragOpenDropHandler);
                        document.addEventListener('dragend', dragOpenEndHandler);
                    }
                }, true);

                sitesNum = 0;
                let hasCurrent = currentSite !== false;
                for (let siteConfig of bookmarkTypes) {
                    await this.createType(siteConfig);
                    sitesNum += siteConfig.sites.length;
                    if (sitesNum > 200) {
                        await sleep(1);
                        sitesNum = 0;
                    }
                }
                if (!this.findInpageAddons) {
                    this.findInpageAddons = _unsafeWindow.searchJumperAddons.filter(
                        data => data.type == "findInPage"
                    ).sort((a, b) => (a.sort || 0) - (b.sort || 0));
                    let self = this, index = 0, addonDict = {};
                    this.findInpageAddons.forEach(addon => {
                        let name = addon.name || ("addon" + index++);
                        if (addonDict[addon.sort]) addon.disable = true;
                        else if (searchData.prefConfig.disableAddon[name] === true) {
                            addon.disable = true;
                        } else if (searchData.prefConfig.disableAddon[name] === false) {
                            addon.disable = false;
                        } else {
                            addon.disable = ext ? true : false;
                        }
                        addonDict[addon.sort] = true;
                        self.createAddonSpan(name, addon);
                    });
                }
                if (this.fontPool.length > 0 || isInConfigPage) {
                    let linkEle = document.createElement("link");
                    linkEle.rel="stylesheet";
                    linkEle.href = searchData.prefConfig.fontAwesomeCss || "https://lib.baomitu.com/font-awesome/6.1.2/css/all.css";
                    document.documentElement.insertBefore(linkEle, document.documentElement.children[0]);
                    this.addToShadow(linkEle.cloneNode());
                    waitForFontAwesome(() => {
                        let hasFont = false;
                        this.fontPool.forEach(font => {
                            font.innerText = '';
                            font.style.fontSize = '';
                            font.style.color = '';
                            hasFont = true;
                            cacheFontPool.unshift(font);
                        });
                        if (hasFont && isInConfigPage) {
                            setTimeout(() => {cacheFontManager()}, 500);
                        }
                        this.buildAllPageGroupTab();
                    });
                } else {
                    this.buildAllPageGroupTab();
                }
                if (isAllPage) return;
                if (disableHighlight && disableHighlight != location.hostname && window.top == window.self) {
                    storage.setItem("disableHighlight", "");
                }
                await this.testCSP();
                let foundKeyword = currentSite && wordParamReg.test(currentSite.url);
                if (!hasCurrent && foundKeyword) {
                    this.inSearchEngine();
                } else if (!currentSite && window.top == window.self) {
                    this.checkSearchJump();
                }

                if (/^#sjhl=/.test(location.hash)) {
                    let sjhlMatch = location.hash.match(/^#sjhl=(.*?)(&i=(\d+))?$/);
                    let sjhlText = sjhlMatch[1];
                    let sjhlIndex = parseInt(sjhlMatch[3] || 1) - 1;
                    try {
                        sjhlText = decodeURIComponent(sjhlText);
                    } catch(e) {
                        console.log(e);
                    }
                    this.setInPageWords(sjhlText, () => {
                        let hlEles = document.querySelectorAll("mark.searchJumper");
                        let targetHl = hlEles[sjhlIndex];
                        targetHl && targetHl.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
                    });
                } else this.checkDiscussions();

                let hasHighlightWords = this.initInPageWords && this.initInPageWords.length;
                if (inMinMode || (this.bar.style.display === "none" && (!navEnable || !hasHighlightWords))) {
                    this.removeBar();
                }
            }

            checkDiscussions() {
                if (location.pathname === '/hoothin/SearchJumper/discussions/new' && location.search === '?category=search-engines') {
                    let copyTarget = searchData.sitesConfig.filter(type => {return type && !(/^BM/.test(type.type) && type.icon === "bookmark")});
                    emuInput('textarea[name="discussion[body]"]', "```json\n" + JSON.stringify(copyTarget, null, 2) + "\n```");
                }
            }

            buildAllPageGroupTab() {
                let self = this;
                this.groupTab.innerHTML = createHTML();
                searchTypes.forEach(type => {
                    if (type.classList.contains("notmatch")) return;
                    let typeName = type.dataset.type;
                    let icon = type.firstElementChild.cloneNode(true);
                    if (icon.children.length > 1) {
                        icon.children[0].style.display = "none";
                        icon.children[1].style.display = "";
                    }
                    let groupSpan = document.createElement("span");
                    groupSpan.appendChild(icon);
                    groupSpan.dataset.type = typeName;
                    groupSpan.addEventListener("click", e => {
                        let targetType = self.sitelistBox.querySelector(`[data-type="${typeName}"]`);
                        if (targetType) targetType.scrollIntoView({behavior: "smooth", block: "start", inline: "center"});
                    });
                    self.groupTab.appendChild(groupSpan);
                });
            }

            async refreshEngines() {
                if (!searchData) return;
                if (this.refreshing) return;
                this.refreshing = true;
                setTimeout(() => {
                    this.refreshing = false;
                }, 500);
                lastModified = searchData.lastModified;
                this.removeBar();
                if (searchTypes && searchTypes.length) {
                    searchTypes.forEach(type => {
                        type.parentNode && type.parentNode.removeChild(type);
                    });
                }
                searchTypes = [];
                this.allSiteBtns = [];
                this.allListBtns = [];
                this.allLists = [];
                this.historyTypeEle = null;
                for (let siteConfig of searchData.sitesConfig) {
                    await this.createType(siteConfig);
                }
                this.initHistorySites();
                this.initSort();
                this.buildAllPageGroupTab();
                if (isAllPage) {
                    this.appendBar();
                }
            }

            waitForHide(delay) {
                let self = this;
                if (this.bar.classList.contains("grabbing") || this.hiding) return;
                if (delay === 0) {
                    this.hiding = true;
                    setTimeout(() => {
                        self.hiding = false;
                    }, 500);
                }
                this.touched = false;
                var hideHandler = () => {
                    //self.bar.classList.remove("search-jumper-isInPage");
                    self.bar.classList.remove("search-jumper-isTargetImg");
                    self.bar.classList.remove("search-jumper-isTargetAudio");
                    self.bar.classList.remove("search-jumper-isTargetVideo");
                    self.bar.classList.remove("search-jumper-isTargetLink");
                    //self.bar.classList.remove("search-jumper-isTargetPage");
                    self.bar.classList.remove("initShow");
                    self.tips.style.opacity = 0;
                    self.tips.style.display = "none";
                    self.tips.innerHTML = createHTML("");
                    //self.recoveHistory();
                    if (self.funcKeyCall) {
                        self.setFuncKeyCall(false);
                        if ((currentSite && !currentSite.hideNotMatch && !searchData.prefConfig.hideOnSearchEngine) || self.con.classList.contains("resizePage")) {
                            self.initPos();
                            let firstType = self.bar.querySelector('.search-jumper-type:nth-child(1)>span');
                            if (firstType && !firstType.classList.contains("search-jumper-open")) {
                                if (firstType.onmouseup) {
                                    firstType.onmouseup();
                                } else {
                                    let mouseEvent = new PointerEvent("mouseup");
                                    firstType.dispatchEvent(mouseEvent);
                                }
                            }
                        } else {
                            self.bar.style.display = 'none';
                        }
                    }
                    if (searchData.prefConfig.autoClose) {
                        self.closeOpenType();
                    }
                    self.hideTimeout = null;
                };
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                }
                let delayTime = typeof delay === 'undefined' ? (this.funcKeyCall ? 500 : (searchData.prefConfig.autoDelay || 1000)) : delay;

                if (delayTime) {
                    this.hideTimeout = setTimeout(hideHandler, delayTime);
                } else hideHandler();
                if (this.preList) {
                    this.preList.style.visibility = "hidden";
                    this.listArrow.style.cssText = "";
                }
            }

            searchEngineWords(words) {
                words = words.replace(/( |^)-\S+/g, "");
                if (/".+"/.test(words)) {
                    words = words.replace(/"(.+)"/g, (match, p, offset, string) => {
                        return `◎${p}◎`;
                    }).replace(/^◎|◎$/g, "");
                }
                this.lastSearchEngineWords = words.replace(/['";]/g, ' ');
                return this.lastSearchEngineWords;
            }

            setInPageWords(inPageWords, cb, init) {
                this.initInPageWords.push(inPageWords);
                //this.searchInPageTab.checked = true;
                this.con.classList.add("in-find");
                let beginHandler = () => {
                    setTimeout(async () => {
                        if (getBody(document).style.display === "none") getBody(document).style.display = "";
                        if (this.lockWords) {
                            this.initInPageWords = [];
                        } else {
                            while (document.hidden) {
                                await sleep(1000);
                            }
                            storage.setItem("lastHighlight", location.hostname);
                            let word = this.initInPageWords.shift();
                            while (word) {
                                this.searchJumperInPageInput.value = word;
                                this.submitInPageWords(!!init);
                                word = this.initInPageWords.shift();
                            }
                        }
                        if (cb) cb();
                        await sleep(100);
                        storage.setItem("lastHighlight", "");
                    }, 300);
                };
                if (document.readyState != "complete") {
                    let loadHandler = e => {
                        if (document.readyState == "complete") {
                            document.removeEventListener("readystatechange", loadHandler);
                            window.removeEventListener('load', loadHandler);
                            beginHandler();
                        }
                    };
                    document.addEventListener("readystatechange", loadHandler);
                    window.addEventListener('load', loadHandler);
                } else {
                    beginHandler();
                }
            }

            searchInPageRule() {
                if (searchData.prefConfig.disableAutoHighlight) {
                    let sites = searchData.prefConfig.disableAutoHighlight.trim().split("\n");
                    for (let i = 0; i < sites.length; i++) {
                        let key = sites[i], isMatch = false;
                        if (key.indexOf("/") === 0) {
                            let keyMatch = key.match(/^\/(.*)\/([igm]*)$/);
                            if (keyMatch) {
                                isMatch = new RegExp(keyMatch[1], keyMatch[2]).test(href);
                            }
                        } else {
                            isMatch = this.globMatch(key, href);
                        }
                        if (isMatch) {
                            this.disableAutoHighlight = true;
                            return;
                        }
                    }
                }
                if (lastHighlight === location.hostname) {
                    this.disableAutoHighlight = true;
                }
                if (searchData.prefConfig.inPageRule) {
                    let keys = Object.keys(searchData.prefConfig.inPageRule);
                    for (let i = 0; i < keys.length; i++) {
                        let key = keys[i];
                        if (!key) continue;
                        let isMatch = false;
                        if (key.indexOf("/") === 0) {
                            let keyMatch = key.match(/^\/(.*)\/([igm]*)$/);
                            if (keyMatch) {
                                isMatch = new RegExp(keyMatch[1], keyMatch[2]).test(href);
                            }
                        } else {
                            isMatch = this.globMatch(key, href);
                        }
                        if (isMatch) {
                            let rule = searchData.prefConfig.inPageRule[key];
                            if (!rule) continue;
                            this.inPageRuleKey = key;
                            this.disableAutoHighlight = true;
                            this.setInPageWords(rule);
                            break;
                        }
                    }
                }
            }

            checkSearchJump() {
                if (this.inPageRuleKey || this.disableAutoHighlight) return;
                let inPageWords;
                if (searchData.prefConfig.showInSearchJumpPage && referrer && !disableHighlight) {
                    let noreferrerLink = !curRef && clickLink && location.href.indexOf(clickLink) != -1;
                    if (noreferrerLink) {
                        storage.setItem("clickLink", '');
                    }
                    if ((curRef && curRef.indexOf(referrer) != -1) || noreferrerLink) {
                        if (cacheKeywords) {
                            this.wordModeBtn.classList.add("checked");
                        }
                        inPageWords = cacheKeywords;
                        try {
                            inPageWords = decodeURIComponent(inPageWords);
                            inPageWords = this.searchEngineWords(inPageWords);
                        } catch (e) {}
                        //storage.setItem("referrer", location.hostname);
                    } else {
                        //storage.setItem("referrer", "");
                    }
                }
                inPageWords = inPageWords || globalInPageWords;
                if (inPageWords) {
                    this.appendBar();
                    let self = this;
                    this.setInPageWords(inPageWords, () => {
                        if (!self.navMarks.innerHTML && self.bar.style.display === "none") self.removeBar();
                    }, true);
                } else if (!this.searchJumperInPageInput.value && curRef.indexOf(referrer) != -1 && cacheKeywords) {
                    inPageWords = cacheKeywords;
                    this.wordModeBtn.classList.add("checked");
                    try {
                        inPageWords = decodeURIComponent(inPageWords);
                    } catch (e) {}
                    this.searchJumperInPageInput.value = inPageWords;
                }
            }

            inSearchEngine() {
                if (!this.currentType || !currentSite || inIframe || this.inPageRuleKey || this.disableAutoHighlight) return;
                if (!/sidesearch=(1|true)$/i.test(location.search)) {
                    if (!/#p{/.test(currentSite.url) || currentSite.keywords) {
                        this.appendBar();
                        if (this.currentType.classList.contains("search-jumper-needInPage")) {
                            this.bar.classList.add("search-jumper-isTargetPage");
                        } else if (this.currentType.classList.contains("search-jumper-targetAll") ||
                                   this.currentType.classList.contains("search-jumper-targetImg") ||
                                   this.currentType.classList.contains("search-jumper-targetAudio") ||
                                   this.currentType.classList.contains("search-jumper-targetVideo") ||
                                   this.currentType.classList.contains("search-jumper-targetLink") ||
                                   this.currentType.classList.contains("search-jumper-targetPage")) {
                            return;
                        }
                        if (!searchData.prefConfig.hideOnSearchEngine) {
                            this.bar.style.display = "";
                            this.initPos();
                        }
                    }
                }
                this.insertHistory(this.currentType, true);
                this.wordModeBtn.classList.add("checked");
                let inPageWords = searchData.prefConfig.showInSearchEngine ? this.searchEngineWords(localKeywords) : globalInPageWords;
                if (inPageWords) {
                    this.setInPageWords(inPageWords, null, true);
                }
            }

            getSuggest(searchWords) {
                let suggestDatalist = this.suggestDatalist;
                suggestDatalist.innerHTML = createHTML();
                if (!searchWords) return;
                let requestSuggest = (api, cb, charset) => {
                    _GM_xmlhttpRequest({
                        method: 'GET',
                        url: api,
                        responseType: charset ? 'blob' : '',
                        headers: {
                            referer: api,
                            origin: api
                        },
                        onload: function(d) {
                            let response = d.response;
                            if (d.status >= 400 || !response) return;
                            if (charset) {
                                let reader = new FileReader();
                                reader.onload = () => {
                                    cb(reader.result);
                                }
                                reader.readAsText(response, charset);
                            } else {
                                cb(response);
                            }
                        },
                        onerror: function(e){
                            debug(e);
                        },
                        ontimeout: function(e){
                            debug(e);
                        }
                    });
                };
                if (ext) {
                    requestSuggest = (api, cb) => {
                        chrome.runtime.sendMessage({action: "getSuggest", detail: {suggestType: searchData.prefConfig.suggestType, searchWords: searchWords}}, function(r) {
                            cb(r);
                        });
                    }
                }
                switch (searchData.prefConfig.suggestType) {
                    case "google":
                        requestSuggest("https://suggestqueries.google.com/complete/search?client=youtube&q=%s&jsonp=window.google.ac.h".replace("%s", searchWords), res => {
                            res = res.match(/window.google.ac.h\((.*)\)$/, "$1");
                            if (res) {
                                res = JSON.parse(res[1])[1];
                                for (let i in res) {
                                    let option = document.createElement('option');
                                    option.value = res[i][0];
                                    suggestDatalist.appendChild(option);
                                }
                            }
                        });
                        break;
                    case "baidu":
                        requestSuggest("https://suggestion.baidu.com/su?wd=%s&cb=".replace("%s", searchWords), res => {
                            res = res.match(/.*,s:(.*)}\);$/, "$1");
                            if (res) {
                                res = JSON.parse(res[1]);
                                for (let i in res) {
                                    let option = document.createElement('option');
                                    option.value = res[i];
                                    suggestDatalist.appendChild(option);
                                }
                            }
                        }, "GBK");
                        break;
                    case "bing":
                        requestSuggest("https://api.bing.com/qsonhs.aspx?type=json&q=%s".replace("%s", searchWords), res => {
                            if (res) {
                                res = JSON.parse(res).AS.Results;
                                for (let i in res) {
                                    let result = res[i].Suggests;
                                    for (let j in result) {
                                        let option = document.createElement('option');
                                        option.value = result[j].Txt;
                                        suggestDatalist.appendChild(option);
                                    }
                                }
                            }
                        });
                        break;
                    default:
                        break;
                }
            }

            searchSiteBtns(inputWords) {
                let checkIndex = inputWords.indexOf('**'), checkType = "", accurate = false;
                if (checkIndex > 0) {
                    checkType = inputWords.slice(0, checkIndex);
                    inputWords = inputWords.slice(checkIndex + 2);
                }
                if (inputWords.indexOf('^') === 0) {
                    accurate = true;
                } else {
                    checkType = checkType.toLowerCase();
                    inputWords = inputWords.toLowerCase();
                }
                if (inputWords) {
                    this.con.classList.add("searching");
                } else {
                    this.con.classList.remove("searching");
                }
                let canCheckHost = !/[^\w\.\/\:\*\?\^\$]/.test(inputWords);
                this.allListBtns.forEach(listItem => {
                    listItem.classList.add("input-hide");
                });
                searchTypes.forEach(type => {
                    type.classList.add("input-hide");
                });
                let optionNum = 0;
                this.filterGlob.innerHTML = createHTML();
                this.allSiteBtns.forEach(arr => {
                    let btn = arr[0];
                    let data = arr[1];
                    let typeNode = btn.parentNode;
                    let targetType = btn.dataset.type;
                    let targetName = btn.dataset.name;
                    let targetTitle = btn.title;
                    if (!accurate) {
                        targetType = targetType.toLowerCase();
                        targetName = targetName.toLowerCase();
                        targetTitle = targetTitle.toLowerCase();
                    }
                    let globMatchName = "";
                    if (checkType) {
                        let typeMatch = this.globMatch(checkType, targetType);
                        if (!typeMatch) return;
                        globMatchName = btn.dataset.type + "**";
                    }
                    let canMatch = false;
                    if (!btn.dataset.clone) {
                        if (this.globMatch(inputWords, targetName)) {
                            canMatch = true;
                            globMatchName += '^' + btn.dataset.name + '$';
                        } else if (btn.title && this.globMatch(inputWords, targetTitle)) {
                            canMatch = true;
                            globMatchName += '^' + btn.title + '$';
                        }
                    }
                    if (!canMatch) {
                        if (canCheckHost) {
                            if (!btn.dataset.host) {
                                let hostReg = /^https?:\/\/([^\/]*)\/[\s\S]*$/;
                                let href = data.url;
                                let host = hostReg.test(href) ? href.replace(hostReg, "$1") : href;
                                btn.dataset.host = host && host.split("\n")[0].toLowerCase();
                            }
                            canMatch = this.globMatch(inputWords, btn.dataset.host);
                        }
                        if (!canMatch) {
                            btn.classList.add("input-hide");
                        } else if(btn.dataset.isPage) {
                            globMatchName += '^' + btn.dataset.host + '$';
                        }
                    }
                    if (canMatch) {
                        btn.classList.remove("input-hide");
                        if (typeNode) typeNode.classList.remove("input-hide");
                        let listItem;
                        for (let i = 0; i < this.allListBtns.length; i++) {
                            if (this.allListBtns[i].id == "list" + btn.dataset.id) {
                                listItem = this.allListBtns[i];
                                break;
                            }
                        }
                        if (listItem) listItem.classList.remove("input-hide");
                        if (optionNum < 50 && inputWords && this.searchInput.value !== globMatchName) {
                            const isExist = this.filterGlob.querySelector(`option[value="${globMatchName}"]`);
                            if (!isExist) {
                                optionNum++;
                                let option = document.createElement('option');
                                option.value = globMatchName;
                                this.filterGlob.appendChild(option);
                            }
                        }
                    }
                });
                searchTypes.forEach(type => {
                    let targetList;
                    for (let i = 0; i < this.allLists.length; i++) {
                        if (this.allLists[i].dataset.type == type.dataset.type) {
                            targetList = this.allLists[i];
                            break;
                        }
                    }
                    if (!targetList) return;
                    if (type.classList.contains("input-hide")) {
                        targetList.classList.add("input-hide");
                    } else targetList.classList.remove("input-hide");
                });
                let showType = this.bar.querySelector(".search-jumper-type:not(.input-hide)");
                if (showType) {
                    if (!showType.classList.contains("search-jumper-open")) {
                        let typeBtn = showType.querySelector("span.search-jumper-btn");
                        if (typeBtn.onmouseup) {
                            typeBtn.onmouseup();
                        } else {
                            let mouseEvent = new PointerEvent("mouseup");
                            typeBtn.dispatchEvent(mouseEvent);
                        }
                    }
                    if (this.searchJumperExpand.parentNode == showType) {
                        let mouseEvent = new PointerEvent("click");
                        this.searchJumperExpand.dispatchEvent(mouseEvent);
                    }
                }
            }

            globMatch(glob, target, inner) {
                if (target.length > 500) return false;
                try {
                    if (glob.length == 0 || glob === '*') {
                        return true;
                    }

                    if (glob.length === 1 && glob[0] === '$') {
                        return !target || target.length === 0;
                    }

                    if (glob.length > 1 && glob[0] === '*' &&
                        (!target || target.length === 0)) {
                        return false;
                    }

                    if (!inner) {
                        inner = true;
                        if (glob.length > 1 && glob[0] === '^' &&
                            target && target.length !== 0) {
                            glob = glob.substring(1);
                            if (glob[0] !== target[0]) {
                                return false;
                            }
                        } else if (glob[0] !== '*') {
                            glob = '*' + glob;
                        }
                    }

                    if ((glob.length > 1 && glob[0] === '?') ||
                        (glob.length != 0 && target && target.length !== 0 &&
                         glob[0] === target[0])) {
                        return this.globMatch(glob.substring(1),
                                              target.substring(1), !!inner);
                    }

                    if (glob.length > 0 && glob[0] === '*') {
                        return this.globMatch(glob.substring(1), target, !!inner) ||
                            this.globMatch(glob, target && target.substring(1), !!inner);
                    }
                } catch(e) {
                    debug(e);
                }

                return false;
            }

            setCurrentSite(data, siteEle) {
                currentSite = data;
                siteEle.classList.add('current');
                localKeywords = "";
                if (!/#p{|^(showTips|find)/.test(data.url) && wordParamReg.test(data.url)) {
                    this.updateCacheKeywords();
                    storage.setItem("referrer", location.hostname);
                }
            }

            updateCacheKeywords() {
                let keywords = getKeywords();
                if (keywords && keywords != cacheKeywords) {
                    cacheKeywords = keywords;
                    storage.setItem("cacheKeywords", keywords);
                }
            }

            refresh() {
                if (this.refreshInPageTimer) {
                    clearTimeout(this.refreshInPageTimer);
                }
                this.refreshInPageTimer = setTimeout(() => {
                    if (this.bar.style.display == "none") {
                        currentSite = null;
                        let typeData;
                        for (let i in searchData.sitesConfig) {
                            if (currentSite) break;
                            typeData = searchData.sitesConfig[i];
                            if (!typeData) {
                                continue;
                            }
                            let sites = typeData.sites;
                            for (let j in sites) {
                                if (currentSite) break;
                                let data = sites[j];
                                if (!data || !data.url) {
                                    continue;
                                }
                                let currentData;
                                if (data.match === '0') {
                                } else if (data.match) {
                                    if (new RegExp(data.match).test(href)) {
                                        currentData = data;
                                    }
                                } else if (data.url.indexOf(location.hostname) != -1) {
                                    if (data.url.indexOf("site") != -1) {
                                        let siteMatch = data.url.match(/site(%3A|:)([\s\S]+?)[\s%]/);
                                        if (siteMatch && href.indexOf(siteMatch[2]) != -1 && data.url.replace(siteMatch[0], "").indexOf(location.hostname) != -1) {
                                            currentData = data;
                                        }
                                    } else if (!currentSite && data.url.replace(/^https?:\/\//, "").replace(location.host, "").replace(/\/?[\?#][\s\S]*/, "") == location.pathname.replace(/\/$/, "")) {
                                        let urlReg = data.url.match(/[^\/\?&]+(?=%[stb])/g);
                                        if (urlReg) {
                                            urlReg = urlReg.join('.*');
                                            if (new RegExp(urlReg).test(href)) {
                                                currentData = data;
                                            }
                                        }
                                    }
                                }
                                if (currentData) {
                                    let siteEle = this.getTargetSitesByName([currentData.name])[0];
                                    this.currentType = siteEle.parentNode;
                                    this.setCurrentSite(currentData, siteEle);
                                }
                            }
                        }
                        if (currentSite && wordParamReg.test(currentSite.url) && (!/#p{/.test(currentSite.url) || currentSite.keywords) && !searchData.prefConfig.hideOnSearchEngine) {
                            if (this.currentType.classList.contains("search-jumper-targetAll") ||
                                this.currentType.classList.contains("search-jumper-targetImg") ||
                                this.currentType.classList.contains("search-jumper-targetAudio") ||
                                this.currentType.classList.contains("search-jumper-targetVideo") ||
                                this.currentType.classList.contains("search-jumper-targetLink") ||
                                this.currentType.classList.contains("search-jumper-targetPage")) {
                                return;
                            }
                            this.appendBar();
                            this.bar.style.display = "";
                            this.initPos();
                            let typeBtn = this.bar.querySelector(`.search-jumper-type[data-type="${typeData.type}"]>span`);
                            if (typeBtn && !typeBtn.classList.contains("search-jumper-open")) {
                                this.bar.insertBefore(typeBtn.parentNode, this.bar.children[0]);
                                if (!searchData.prefConfig.disableAutoOpen && !searchData.prefConfig.disableTypeOpen) {
                                    if (typeBtn.onmouseup) {
                                        typeBtn.onmouseup();
                                    } else {
                                        let mouseEvent = new PointerEvent("mouseup");
                                        typeBtn.dispatchEvent(mouseEvent);
                                    }
                                }
                            }
                        }
                    }
                    let oldWords = this.curHighlightWords;
                    this.highlight("");
                    if (currentSite && searchData.prefConfig.showInSearchEngine) {
                        let oldKeywords = this.lastSearchEngineWords;
                        let newKeywords = this.searchEngineWords(getKeywords());
                        if (newKeywords && oldKeywords != newKeywords) {
                            let targetWords = this.anylizeInPageWords(newKeywords, true);
                            this.highlight(targetWords);
                        } else {
                            oldWords && this.highlight(oldWords);
                        }
                    } else if (oldWords) {
                        this.highlight(oldWords);
                    }
                }, 500);
            }

            initSort() {
                if (searchData.prefConfig.shiftLastUsedType && this.historyTypeEle) {
                    if (currentSite) {
                        this.bar.insertBefore(this.historyTypeEle, this.bar.children[1]);
                    } else {
                        this.bar.insertBefore(this.historyTypeEle, this.bar.children[0]);
                    }
                }
                if (searchData.prefConfig.sortType) {
                    let self = this;
                    searchTypes.sort((a, b) => {
                        let aTypeValue = sortTypeNames[a.dataset.type] || 0;
                        let bTypeValue = sortTypeNames[b.dataset.type] || 0;
                        return bTypeValue - aTypeValue;
                    });
                    let changed = false;
                    let allHide = !self.bar.children[0].classList.contains("search-jumper-open");
                    for (let i = searchTypes.length - 1; i >= 0; i--) {
                        let typeEle = searchTypes[i];
                        let curValue = sortTypeNames[typeEle.dataset.type] || 0;
                        if (i == searchTypes.length - 1) {
                            if (curValue > 0) {
                                changed = true;
                                sortTypeNames[typeEle.dataset.type] = 0;
                            }
                        } else {
                            let preValue = sortTypeNames[searchTypes[i + 1].dataset.type] || 0;
                            if (curValue - preValue > 10) {
                                changed = true;
                                sortTypeNames[typeEle.dataset.type] = preValue + 10;
                            }
                        }
                        self.bar.insertBefore(typeEle, self.bar.children[allHide ? 0 : 1]);
                    }
                    if (changed) storage.setItem("sortTypeNames", sortTypeNames);
                }
            }

            initHistorySites() {
                this.historySiteBtns = [];
                this.txtHistorySiteBtns = [];
                this.imgHistorySiteBtns = [];
                this.linkHistorySiteBtns = [];
                this.videoHistorySiteBtns = [];
                this.audioHistorySiteBtns = [];
                let self = this;
                historySites.forEach(async n => {
                    for (let siteConfig of searchData.sitesConfig) {
                        let found = false;
                        let isBookmark = siteConfig.bookmark || siteConfig.sites.length > 100 || (/^BM/.test(siteConfig.type) && siteConfig.icon === "bookmark");
                        for (let i = 0; i < siteConfig.sites.length; i++) {
                            let site = siteConfig.sites[i];
                            if (site.name == n) {
                                let siteBtn = await self.createSiteBtn((searchData.prefConfig.noIcons ? "0" : site.icon), site, true, isBookmark, siteConfig, true);
                                siteBtn.classList.add("historySite");
                                self.historySiteBtns.push(siteBtn);
                                if (!siteConfig.selectImg && !siteConfig.selectLink && !siteConfig.selectPage && !siteConfig.selectVideo && !siteConfig.selectAudio) {
                                    self.txtHistorySiteBtns.push(siteBtn);
                                }
                                if (siteConfig.selectImg) {
                                    self.imgHistorySiteBtns.push(siteBtn);
                                }
                                if (siteConfig.selectLink || siteConfig.selectPage) {
                                    self.linkHistorySiteBtns.push(siteBtn);
                                }
                                if (siteConfig.selectVideo) {
                                    self.videoHistorySiteBtns.push(siteBtn);
                                }
                                if (siteConfig.selectAudio) {
                                    self.audioHistorySiteBtns.push(siteBtn);
                                }
                                found = true;
                                break;
                            }
                        }
                        if (found) break;
                    }
                });
            }

            insertHistory(typeEle, init) {
                if (!searchData.prefConfig.historyLength) {
                    return;
                }
                typeEle.style.width = "auto";
                typeEle.style.height = "auto";
                let self = this;
                this.historyInserted = true;
                let num = 0;
                let toFirst = !init && searchData.prefConfig.historyInsertFirst;
                let insertBefore = false, maxSiteNum = 0;
                if (!toFirst) {
                    insertBefore = this.searchJumperExpand.parentNode == typeEle && !searchData.prefConfig.expandType;
                    if (insertBefore) {
                        maxSiteNum = (searchData.prefConfig.numPerLine || 7) - 1;
                        maxSiteNum = searchData.prefConfig.historyLength < maxSiteNum ? (maxSiteNum + maxSiteNum - searchData.prefConfig.historyLength) : maxSiteNum;
                        if (searchData.prefConfig.hideTileType) {
                            maxSiteNum++;
                        }
                    }
                }
                let historySiteBtns = this.historySiteBtns;
                if (typeEle.classList.contains("search-jumper-needInPage")) {
                    historySiteBtns = this.txtHistorySiteBtns;
                } else if (typeEle.classList.contains("search-jumper-targetImg")) {
                    historySiteBtns = this.imgHistorySiteBtns;
                } else if (typeEle.classList.contains("search-jumper-targetAudio")) {
                    historySiteBtns = this.audioHistorySiteBtns;
                } else if (typeEle.classList.contains("search-jumper-targetVideo")) {
                    historySiteBtns = this.videoHistorySiteBtns;
                } else if (typeEle.classList.contains("search-jumper-targetLink") || typeEle.classList.contains("search-jumper-targetPage")) {
                    historySiteBtns = this.linkHistorySiteBtns;
                }
                for (let i = 0; i < historySiteBtns.length; i++) {
                    let btn = historySiteBtns[i];
                    if (btn.style.display == "none") continue;
                    let siteImg = btn.querySelector('img');
                    if (siteImg && siteImg.dataset.src) {
                        siteImg.src = siteImg.dataset.src;
                        delete siteImg.dataset.src;
                    }
                    if (btn.parentNode != typeEle) {
                        let sites = typeEle.querySelectorAll("a.search-jumper-btn");
                        let findSame = false;
                        for (let j = 0; j < sites.length; j++) {
                            let site = sites[j];
                            if ((site.dataset.oriName || site.dataset.name) == (btn.dataset.oriName || btn.dataset.name)) {
                                findSame = true;
                                break;
                            }
                        }
                        if (findSame) continue;
                        if (toFirst) {
                            if (typeEle.children.length > 1) {
                                typeEle.insertBefore(btn, typeEle.children[1]);
                            } else typeEle.appendChild(btn);
                        } else {
                            if (insertBefore) {
                                let siteBtns = typeEle.querySelectorAll("a.search-jumper-btn");
                                if (siteBtns.length > maxSiteNum) {
                                    typeEle.insertBefore(btn, siteBtns[maxSiteNum]);
                                } else typeEle.insertBefore(btn, self.searchJumperExpand);
                            } else typeEle.appendChild(btn);
                        }
                        if (++num >= searchData.prefConfig.historyLength) break;
                    } else if (toFirst) {
                        if (typeEle.children.length > 1) {
                            typeEle.insertBefore(btn, typeEle.children[1]);
                        } else typeEle.appendChild(btn);
                    }
                }
                typeEle.style.width = typeEle.scrollWidth + "px";
                typeEle.style.height = typeEle.scrollHeight + "px";
            }

            recoveHistory() {
                if (!searchData.prefConfig.historyLength) return;
                if (!this.historyInserted) return;
                this.historyInserted = false;
                let self = this;
                let curParent;
                for (let i = 0; i < this.historySiteBtns.length; i++) {
                    let btn = this.historySiteBtns[i];
                    if (!btn.classList.contains("historySite")) continue;
                    curParent = btn.parentNode;
                    this.siteBtnReturnHome(btn);
                }
                if (curParent && curParent.classList.contains("search-jumper-open")) {
                    curParent.style.width = "auto";
                    curParent.style.height = "auto";
                    curParent.style.width = curParent.scrollWidth + "px";
                    curParent.style.height = curParent.scrollHeight + "px";
                }
            }

            bindSite(a, siteEle) {
                if (a.getAttribute("bind")) return;
                a.setAttribute("bind", true);
                let self = this;
                if (siteEle.href) a.href = siteEle.href;
                a.style.display = siteEle.style.display;
                a.addEventListener('mousedown', async e => {
                    if (siteEle.dataset.showTips) {
                        if (self.con.classList.contains("search-jumper-showall")) {
                            targetElement = a.parentNode;
                        } else self.waitForHide(0);
                        siteEle.dispatchEvent(new CustomEvent('showTips', {detail: a}));
                    } else {
                        await self.siteSetUrl(siteEle, {button: e.button, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, metaKey: e.metaKey});
                        if (siteEle.href) a.href = siteEle.href;
                        a.setAttribute("target", siteEle.target);
                    }
                    if (!a.onclick) {
                        a.onclick = e => {
                            if (!siteEle.dataset.showTips) siteEle.click();
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        }
                    }
                }, false);
                a.addEventListener("dragover", e => {
                    e.preventDefault();
                }, true);
                a.addEventListener("dragenter", e => {
                    if (self.dragTarget) {
                        self.dragTarget.classList.remove("dragTarget");
                    }
                    self.dragTarget = a;
                    self.dragTarget.classList.add("dragTarget");
                    clearTimeout(self.dragTimer);
                    self.dragTimer = setTimeout(() => {
                        a.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
                    }, 1000);
                }, true);
                a.addEventListener("dragleave", e => {
                    a.classList.remove("dragTarget");
                }, true);
                a.addEventListener("drop", e => {
                    clearTimeout(self.dragTimer);
                    if (self.dragTarget) {
                        self.dragTarget.classList.remove("dragTarget");
                    }
                    self.searchBySiteName(siteEle.dataset.name, e);
                }, true);
            }

            async createList(sites, type, batchSiteNames) {
                let self = this;
                let list = document.createElement("div");
                list.className = "sitelist";
                list.style.visibility = "hidden";
                let con = document.createElement("div");
                con.className = "sitelistCon";
                list.appendChild(con);
                list.addEventListener('mouseenter', e => {
                    self.listArrow.style.cssText = "";
                });
                let title = document.createElement("p");
                title.innerText = type.dataset.title;
                title.title = i18n('batchOpen');
                title.addEventListener('click', e => {
                    self.batchOpen(batchSiteNames, {ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey, button: (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) ? 0 : 2});
                });
                list.dataset.type = type.dataset.type;
                con.appendChild(title);
                function createItem(siteEle, index) {
                    let li = document.createElement("div");
                    li.id = "list" + index;
                    let icon = siteEle.querySelector("img");
                    let a = document.createElement("a");
                    a.setAttribute("ref", "noopener noreferrer");
                    self.bindSite(a, siteEle);
                    li.appendChild(a);
                    self.allListBtns.push(li);
                    if (icon && !searchData.prefConfig.noIcons) {
                        let iconSrc = icon.src || icon.dataset.src;
                        let img = document.createElement("img");
                        a.appendChild(img);
                        img.onload = e => {
                            img.style.width = "";
                            img.style.height = "";
                            img.style.display = "";
                        };
                        img.onerror = e => {
                            img.src = noImgBase64;
                        };
                        img.style.width = "1px";
                        img.style.height = "1px";
                        img.style.display = "none";
                        if (iconSrc) {
                            if (!/^data:/.test(iconSrc)) {
                                img.οnerrοr = e => {
                                    img.src = noImgBase64;
                                    img.onerror = null;
                                    img.style.width = "";
                                    img.style.height = "";
                                    img.style.display = "";
                                };
                                img.dataset.src = iconSrc;
                            } else {
                                img.dataset.src = iconSrc;
                            }
                        } else {
                            img.dataset.src = noImgBase64;
                        }
                    }
                    let p = document.createElement("p");
                    p.innerText = siteEle.dataset.name;
                    li.title = siteEle.title;
                    li.dataset.name = siteEle.dataset.name;
                    a.appendChild(p);
                    con.appendChild(li);
                }
                try {
                    for (let [index, siteEle] of sites.entries()) {
                        createItem(siteEle, siteEle.dataset.id);
                        if (index%50 === 49) await sleep(1);
                    }
                } catch(e) {
                    for (let index = 0; index < sites.length; index++) {
                        let siteEle = sites[index];
                        createItem(siteEle, siteEle.dataset.id);
                    }
                }
                this.allLists.push(list);
                return list;
            }

            async initList(list) {
                if (!list.dataset.inited) {
                    list.style.display = "none";
                    list.dataset.inited = true;
                    [].forEach.call(list.querySelectorAll("div>a>img"), img => {
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            delete img.dataset.src;
                        }
                    });
                    await sleep(0);
                }
            }

            async listPos(ele, list) {
                //if (this.preList) {
                //this.preList.style.visibility = "hidden";
                //}
                await this.initList(list);
                list.style = "";
                this.preList = list;
                let ew = ele.clientWidth;
                let eh = ele.clientHeight;
                let clientX = ele.offsetLeft + ew / 2 - this.con.scrollLeft;
                let clientY = ele.offsetTop + eh / 2 - this.con.scrollTop;
                let current = ele.offsetParent;

                while (current !== null){
                    clientX += current.offsetLeft;
                    clientY += current.offsetTop;
                    current = current.offsetParent;
                }
                let viewWidth = window.innerWidth || document.documentElement.clientWidth;
                let viewHeight = window.innerHeight || document.documentElement.clientHeight;
                let arrowStyle = this.listArrow.style;
                arrowStyle.visibility = "visible";
                arrowStyle.opacity = 1;
                if (this.funcKeyCall) {
                    list.style.display = "block";
                    arrowStyle.opacity = 0;

                    const clientRect = ele.getBoundingClientRect();
                    clientX = clientRect.x + ew / 2 - this.con.scrollLeft;
                    clientY = clientRect.y + eh / 2 - this.con.scrollTop;

                    clientX -= list.clientWidth / 2;
                    let actualTop = ele.getBoundingClientRect().top;
                    if (actualTop > viewHeight / 2) {
                        if (actualTop < list.clientHeight + 10) {
                            list.style.height = actualTop - 20 + "px";
                        }
                        clientY -= (list.clientHeight + eh / 2 + 5);
                    } else {
                        clientY += (eh / 2 + 5);
                        if (actualTop + list.clientHeight + eh + 10 > viewHeight) {
                            list.style.height = viewHeight - actualTop - eh - 20 + "px";
                        }
                    }
                    if (clientX < 20) clientX = 20;
                    let maxLeft = viewWidth - list.clientWidth - 30;
                    if (clientX > maxLeft) {
                        clientX = maxLeft;
                    }
                    list.style.left = clientX + "px";
                    list.style.top = clientY + "px";
                    list.style.display = "";
                } else if (this.bar.clientWidth > this.bar.clientHeight) {
                    //横
                    let arrowX = clientX;
                    if (clientX < 30) {
                        arrowX = 30;
                    } else if (clientX > viewWidth - 40) {
                        arrowX = viewWidth - 40;
                    }
                    arrowStyle.left = arrowX - 10 + "px";
                    if (clientY - eh / 2 < 100) {
                        list.style.top = this.bar.clientHeight + "px";
                        arrowStyle.top = this.bar.clientHeight - 10 + "px";
                    } else {
                        list.style.bottom = this.bar.clientHeight + "px";
                        arrowStyle.bottom = this.bar.clientHeight - 9 + "px";
                    }
                    clientX -= list.scrollWidth / 2;
                    if (clientX > viewWidth - list.scrollWidth - 10) clientX = viewWidth - list.scrollWidth - 10;
                    if (clientX < 0) clientX = 0;
                    list.style.left = clientX + "px";
                } else {
                    //竖
                    let arrowY = clientY;
                    if (clientY < 30) {
                        arrowY = 30;
                    } else if (clientY > viewHeight - 30) {
                        arrowY = viewHeight - 30;
                    }
                    arrowStyle.top = arrowY - 10 + "px";
                    if (clientX - ew / 2 < 100) {
                        list.style.left = this.bar.clientWidth + "px";
                        arrowStyle.left = this.bar.clientWidth - 9 + "px";
                    } else {
                        list.style.right = this.bar.clientWidth + "px";
                        arrowStyle.right = this.bar.clientWidth - 9 + "px";
                    }
                    clientY -= list.scrollHeight / 2;
                    if (clientY > viewHeight - list.scrollHeight) clientY = viewHeight - list.scrollHeight;
                    if (clientY < 0) clientY = 0;
                    list.style.top = clientY + "px";
                    list.style.maxHeight = "100vh";
                }
            }

            clingPos(clingEle, target, close) {
                //if (this.preList) {
                //this.preList.style.visibility = "hidden";
                //}
                let ew = clingEle.clientWidth || clingEle.offsetWidth;
                let eh = clingEle.clientHeight || clingEle.offsetHeight;
                /*let clientX = clingEle.offsetLeft + ew / 2 - this.con.scrollLeft;
                let clientY = clingEle.offsetTop + eh / 2 - this.con.scrollTop - clingEle.parentNode.scrollTop;
                let current = clingEle.offsetParent;*/

                const clientRect = clingEle.getBoundingClientRect();

                let clientX, clientY;

                let showall = this.con && this.con.classList.contains("search-jumper-showall");

                /*while (current !== null){
                    clientX += current.offsetLeft;
                    clientY += current.offsetTop;
                    current = current.offsetParent;
                }*/
                let viewWidth = window.innerWidth || document.documentElement.clientWidth;
                let viewHeight = window.innerHeight || document.documentElement.clientHeight;
                this.tips.style.position = "";
                target.style.height = "";
                target.style.position = "";
                if (!clingEle || /^(body|html)$/i.test(clingEle.nodeName)) {
                    this.tips.style.transition = "none";
                    this.tips.style.position = "fixed";
                    target.style.right = "";
                    target.style.bottom = "";
                    target.style.left = (viewWidth - target.clientWidth) / 2 + "px";
                    target.style.top = "min(11%,110px)";
                } else if (showall) {
                    clientX = clientRect.x + ew / 2;
                    clientY = clientRect.y + eh / 2;
                    clientX -= target.clientWidth / 2 - this.con.scrollLeft;
                    clientY += this.con.scrollTop;
                    if (clientY > viewHeight / 2) clientY -= (target.clientHeight + eh / 2 + 10);
                    else clientY += (eh / 2 + 10);
                    target.style.right = "";
                    target.style.bottom = "";
                    target.style.left = clientX + "px";
                    target.style.top = clientY + "px";
                } else if (this.funcKeyCall || !clingEle.classList.contains("search-jumper-btn")) {
                    target.style.position = "absolute";
                    let scrollTop = window.pageYOffset || document.documentElement.scrollTop || getBody(document).scrollTop;
                    let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || getBody(document).scrollLeft;

                    clientX = clientRect.x + ew / 2 - (this.funcKeyCall ? this.con.scrollLeft - scrollLeft : 0);
                    clientY = clientRect.y + eh / 2 - (this.funcKeyCall ? this.con.scrollTop - scrollTop : 0);

                    clientX -= target.clientWidth / 2;
                    let actualTop = clingEle.getBoundingClientRect().top;
                    if (actualTop > viewHeight / 2) {
                        if (actualTop < target.clientHeight + 10) {
                            target.style.height = actualTop - 20 + "px";
                        }
                        clientY -= (target.clientHeight + eh / 2 + 5);
                    } else {
                        clientY += (eh / 2 + 5);
                        if (actualTop + target.clientHeight + eh + 10 > viewHeight) {
                            target.style.height = viewHeight - actualTop - eh - 20 + "px";
                        }
                    }
                    if (clientX < 20) clientX = 20;
                    let maxLeft = viewWidth + scrollLeft - target.clientWidth - 30;
                    if (clientX > maxLeft) {
                        clientX = maxLeft;
                    }
                    target.style.right = "";
                    target.style.bottom = "";
                    target.style.left = clientX + "px";
                    target.style.top = clientY + "px";
                } else {
                    clientX = clingEle.offsetLeft + ew / 2 - this.con.scrollLeft - clingEle.parentNode.scrollLeft;
                    clientY = clingEle.offsetTop + eh / 2 - this.con.scrollTop - clingEle.parentNode.scrollTop;
                    let current = clingEle.offsetParent;
                    while (current !== null){
                        clientX += current.offsetLeft;
                        clientY += current.offsetTop;
                        current = current.offsetParent;
                    }
                    if (clientY < eh) {
                        clientX -= target.clientWidth / 2;
                        clientY += target.clientHeight / 2;
                        if (clientX < 5) {
                            clientX = 5;
                            target.style.left = "5px";
                            target.style.right = "";
                            target.style.bottom = "";
                        } else if (clientX > viewWidth - target.clientWidth) {
                            target.style.left = "";
                            target.style.right = "5px";
                            target.style.bottom = "";
                        } else {
                            target.style.left = clientX + "px";
                            target.style.right = "";
                            target.style.bottom = "";
                        }
                        target.style.top = (close ? eh : eh + 20) + "px";
                    } else if (clientY > viewHeight - eh - 10) {
                        clientX -= target.clientWidth / 2;
                        if (clientX < 5) {
                            target.style.left = "5px";
                            target.style.right = "";
                            target.style.top = "";
                        } else if (clientX > viewWidth - target.clientWidth) {
                            target.style.left = "";
                            target.style.right = "5px";
                            target.style.top = "";
                        } else {
                            target.style.left = clientX + "px";
                            target.style.right = "";
                            target.style.top = "";
                        }
                        target.style.bottom = (close ? eh : eh + 20) + "px";
                    } else if (clientX > viewWidth - ew - 10) {
                        target.style.left = "";
                        target.style.bottom = "";
                        clientY -= target.clientHeight / 2;
                        if (clientY < 5) clientY = 5;
                        target.style.right = (close ? ew : ew + 20) + "px";
                        target.style.top = clientY + "px";
                    } else if (clientX < ew) {
                        target.style.right = "";
                        target.style.bottom = "";
                        clientY -= target.clientHeight / 2;
                        if (clientY < 5) clientY = 5;
                        target.style.left = (close ? ew : ew + 20) + "px";
                        target.style.top = clientY + "px";
                    } else {
                        target.style.right = "";
                        target.style.bottom = "";
                        target.style.left = clientX + "px";
                        target.style.top = clientY + "px";
                    }
                }
            }

            tipsPos(ele, type, inputGroup) {
                this.tips.innerHTML = createHTML(type);
                let complexTipsCon = this.tips.querySelector('div');
                if (complexTipsCon && !this.tips.querySelector('[data-close]')) {
                    let closeBtn = document.createElement('span');
                    closeBtn.dataset.close = true;
                    closeBtn.innerText = '×';
                    complexTipsCon.appendChild(closeBtn);
                }
                if (inputGroup) {
                    this.tips.insertBefore(inputGroup, this.tips.firstChild);
                }
                if (location.protocol === 'https:') {
                    [].forEach.call(this.tips.querySelectorAll("[src^='http:']"), ele => {
                        ele.src = ele.src.replace("http:", "https:")
                    });
                }
                this.tips.style.pointerEvents = "";
                this.tips.style.display = "";
                this.tips.style.opacity = 1;
                this.clingPos(ele, this.tips);
                clearTimeout(this.hideTips);
                if (this.tips.style.transition) {
                    setTimeout(() => {
                        this.tips.style.transition = "";
                    }, 1);
                }
                let self = this;
                [].forEach.call(this.tips.querySelectorAll('iframe'), iframe => {
                    let html = iframe.innerHTML;
                    if (html) {
                        iframe.innerHTML = createHTML();
                        if (iframe.src) {
                            iframe.addEventListener('load', e => {
                                try {
                                    if (!iframe || !iframe.parentNode) return;
                                    let doc = iframe.contentDocument || iframe.contentWindow.document;
                                    let div = doc.createElement('div');
                                    doc.body.appendChild(div);
                                    div.outerHTML = createHTML(html);
                                } catch(e) {}
                            });
                        } else {
                            try {
                                let doc = iframe.contentDocument || iframe.contentWindow.document;
                                doc.open();
                                doc.write(html);
                                doc.close();
                            } catch(e) {}
                        }
                    }
                });
                [].forEach.call(this.tips.querySelectorAll('img,video'), media => {
                    media.addEventListener('load', e => {
                        self.clingPos(ele, self.tips);
                    });
                });
                if (window.markdownit) {
                    if (!self.md) {
                        self.md = window.markdownit();
                    }
                    [].forEach.call(this.tips.querySelectorAll('.markdown'), markdown => {
                        markdown.innerHTML = createHTML(self.md.render(markdown.innerHTML));
                    });
                }
            }

            checkKwFilter(kwFilter, checkKw) {
                if (checkKw.length > 600) {
                    checkKw = checkKw.slice(0, 500) + checkKw.slice(checkKw.length - 10);
                }
                let selectorMatch = kwFilter.match(/^@{(.*?)}/);
                if (selectorMatch) {
                    if (!targetElement) return false;
                    let selector = selectorMatch[1];
                    let pass = [].some.call(getAllElements(selector, document), e => e === targetElement);
                    if (!pass) return false;
                    kwFilter = kwFilter.replace(selectorMatch[0], "");
                }
                let kwRe, fullMatch = kwFilter.match(/^\/(.*)\/(\w*)$/);
                if (fullMatch) {
                    kwRe = new RegExp(fullMatch[1], fullMatch[2]);
                } else {
                    kwRe = new RegExp(kwFilter, "i");
                }
                return (kwRe.test(checkKw || ""));
            }

            async createType(data) {
                let self = this;
                let type = data.type;
                let icon = data.icon;
                let inPage = data.selectTxt;
                let selectImg = data.selectImg;
                let selectAudio = data.selectAudio;
                let selectVideo = data.selectVideo;
                let selectLink = data.selectLink;
                let selectPage = data.selectPage;
                let sites = data.sites;
                let match = false;
                let openInNewTab = typeof data.openInNewTab === 'undefined' ? searchData.prefConfig.openInNewTab : data.openInNewTab;
                let siteEles = [];
                let ele = document.createElement("span");
                ele.className = "search-jumper-type";
                if (!searchData.prefConfig.expandType && sites.length > 10) ele.classList.add("not-expand");
                if (data.match === '0') {
                    ele.style.display = 'none';
                    ele.classList.add("notmatch");
                } else if (data.match) {
                    if (new RegExp(data.match).test(href) == false) {
                        ele.style.display = 'none';
                        ele.classList.add("notmatch");
                    } else {
                        match = true;
                    }
                }
                if (typeof data.description !== 'undefined') {
                    ele.dataset.title = type + " - " + data.description;
                } else {
                    ele.dataset.title = type;
                }
                ele.dataset.type = type;
                let typeBtn = document.createElement("span");
                let img = document.createElement("img");
                let iEle = document.createElement("b");
                if (type.length >= 3) {
                    iEle.innerText = type.trim().substr(0, 4);
                    if (!/^[\w \-]+$/.test(iEle.innerText.substr(0, 3))) iEle.innerText = iEle.innerText.substr(0, 2);
                } else iEle.innerText = type;
                typeBtn.appendChild(iEle);
                img.style.display = "none";
                ele.appendChild(typeBtn);
                typeBtn.classList.add("search-jumper-word");
                typeBtn.classList.add("search-jumper-btn");
                typeBtn.classList.add("noIcon");
                let isBookmark = /^BM/.test(type) && data.icon === "bookmark";//書簽就不緩存了
                if (icon) {
                    typeBtn.classList.remove("noIcon");
                    let isFontIcon = /^[a-z\- ]+$/.test(icon);
                    img.onload = e => {
                        img.style.display = "";
                        iEle.innerText = '';
                        iEle.style.display = 'none';
                        if (!isFontIcon) {
                            typeBtn.classList.remove("search-jumper-word");
                        }
                    };
                    if (isFontIcon) {
                        let cache = cacheIcon[icon.trim().replace(/ /g, '_')];
                        if (cache === 'fail' || !cache) {
                            iEle.className = icon.indexOf("fa") === 0 ? icon : "fa fa-" + icon;
                            this.fontPool.push(iEle);
                        } else {
                            img.src = cache;
                            img.style.width = '100%';
                            img.style.height = '100%';
                            typeBtn.appendChild(img);
                        }
                    } else {
                        let isBase64 = /^data:/.test(icon);
                        if (isBase64) {
                            img.src = icon;
                        } else {
                            let cache = searchData.prefConfig.cacheSwitch && cacheIcon[icon];
                            if (cache === 'fail') {
                            } else if (cache) {
                                img.src = cache;
                            } else {
                                img.src = icon;
                                if (!cacheIcon[icon] && !isBookmark) cachePool.push(img);
                            }
                        }
                        typeBtn.appendChild(img);
                    }
                }
                ele.addEventListener('mouseleave', e => {
                    self.listArrow.style.cssText = "";
                    self.dockerScaleBtns.forEach(btn => {
                        btn.style.setProperty("--scale", 1);
                    });
                });
                let batchSiteNames = [];
                let batchOpenConfirm = (e) => {
                    switch (searchData.prefConfig.batchOpenConfirm) {
                        case 1:
                            if (window.confirm(i18n('batchOpenConfirm'))) {
                                self.batchOpen(batchSiteNames, e);
                            }
                            break;
                        case 2:
                            self.batchOpen(batchSiteNames, e);
                            break;
                        default:
                            if (ele.classList.contains("search-jumper-open") || (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) || window.confirm(i18n('batchOpenConfirm'))) {
                                self.batchOpen(batchSiteNames, e);
                            }
                            break;
                    }
                };
                if (searchData.prefConfig.shortcut && data.shortcut && !ele.classList.contains("notmatch")) {
                    let shortcurStr = data.shortcut.replace('Key', '').replace('Digit', '').toUpperCase();
                    if (shortcurStr.length == 1) ele.dataset.title += ` (${shortcurStr})`;
                    document.addEventListener('keydown', e => {
                        if (searchData.prefConfig.shortcut == 2 && !currentSite) return;
                        if (e.target.id === "searchJumperInput") return;
                        if ((!data.ctrl == e.ctrlKey) ||
                            (!data.alt == e.altKey) ||
                            (!data.shift == e.shiftKey) ||
                            (!data.meta == e.metaKey)) {
                            return;
                        }
                        if (!searchData.prefConfig.enableInInput && !data.ctrl && !data.alt && !data.shift && !data.meta) {
                            if (inputActive(document)) return;
                        }
                        var key = (e.key || String.fromCharCode(e.keyCode)).toLowerCase();
                        if (data.shortcut == e.code || data.shortcut == key) {
                            batchOpenConfirm(e);
                            e.stopPropagation();
                        }
                    });
                }
                let shownSitesNum = 0;
                let baseSize = this.scale * 40;
                let taggleHide = (se, show) => {
                    if (show) {
                        se.style.display = '';
                        if (ele.children.length > 2) ele.insertBefore(se, ele.children[2]);
                    } else {
                        se.style.display = 'none';
                        if (self.searchJumperExpand.parentNode == ele) {
                            ele.insertBefore(se, self.searchJumperExpand);
                        } else ele.appendChild(se);
                    }
                }
                let typeCheckSites = (keyWords, e) => {
                    let leftRight = self.con.classList.contains("search-jumper-left") ||
                        self.con.classList.contains("search-jumper-right");
                    let targetInput = false;
                    if (targetElement) {
                        targetInput = isInput(targetElement);
                    }

                    let href = targetElement && (targetElement.href || targetElement.src);
                    shownSitesNum = 0;
                    siteEles.forEach((se, i) => {
                        let data = sites[i];
                        let pass = true;
                        if (data.kwFilter) {
                            let checkKw;
                            if (se.dataset.link) {
                                checkKw = href || keyWords;
                            } else {
                                checkKw = se.dataset.txt ? (keyWords || (targetElement && targetElement.innerText) || "") : (href || keyWords || location.href);
                            }
                            pass = self.checkKwFilter(data.kwFilter, checkKw);
                        }
                        if (pass && se.dataset.paste) {
                            pass = targetInput;
                            taggleHide(se, pass);
                        } else if (data.kwFilter) {
                            taggleHide(se, pass);
                        }
                        let si = se.querySelector("img");
                        if (se.style.display != "none") {
                            shownSitesNum++;
                        }
                        if (si && !si.src && si.dataset.src) {
                            si.src = si.dataset.src;
                            delete si.dataset.src;
                        }
                    });
                    if (shownSitesNum > (searchData.prefConfig.expandTypeLength || 12) && !searchData.prefConfig.expandType) {
                        ele.classList.add("not-expand");
                        ele.appendChild(self.searchJumperExpand);
                    }
                    let scrollSize = Math.max(ele.scrollWidth, ele.scrollHeight) + 5 + "px";
                    if (searchData.prefConfig.disableTypeOpen) {
                        scrollSize = baseSize + "px";
                        if (e) self.listPos(ele.children[0], siteList);
                    }
                    if (leftRight) {
                        ele.style.height = scrollSize;
                        ele.style.width = "";
                    } else {
                        ele.style.width = scrollSize;
                        ele.style.height = "";
                    }
                };
                typeBtn.addEventListener('checkSites', e => {
                    typeCheckSites(e.detail);
                }, false);
                let typeAction = e => {
                    if (e) {
                        if (e.button === 2) {
                            batchOpenConfirm(e);
                            return false;
                        } if (e.button === 0 && (e.shiftKey || e.altKey || e.ctrlKey)) {
                            return false;
                        }
                    }
                    if (self.funcKeyCall) {
                        self.showAllSites();
                        return false;
                    }
                    let leftRight = self.con.classList.contains("search-jumper-left") ||
                        self.con.classList.contains("search-jumper-right");
                    if (self.preList) {
                        self.preList.style.visibility = "hidden";
                        self.listArrow.style.cssText = "";
                    }
                    ele.classList.remove('search-jumper-move');
                    if (!ele.classList.contains("search-jumper-open")) {
                        self.recoveHistory();
                        ele.classList.add("search-jumper-open");
                        if (searchData.prefConfig.minSizeMode) {
                            self.bar.classList.remove("minSizeModeClose");
                        }

                        let keyWords = getKeywords();
                        typeCheckSites(keyWords, e);
                        setTimeout(() => {
                            if (ele.classList.contains("search-jumper-open")) {
                                ele.style.flexWrap = "nowrap";
                                ele.classList.add('search-jumper-move');
                            }
                        }, searchData.prefConfig.typeOpenTime);
                        searchTypes.forEach(type => {
                            if (ele != type) {
                                type.classList.remove("search-jumper-open");
                                type.style.width = baseSize + "px";
                                type.style.height = baseSize + "px";
                                type.style.flexWrap = "";
                            }
                        });
                    } else {
                        if (searchData.prefConfig.minSizeMode) {
                            self.bar.classList.add("minSizeModeClose");
                        }
                        ele.classList.remove("search-jumper-open");
                        if (leftRight) {
                            ele.style.height = baseSize + "px";
                            ele.style.width = "";
                        } else {
                            ele.style.height = "";
                            ele.style.width = baseSize + "px";
                        }
                        ele.style.flexWrap = "";
                        if (searchData.prefConfig.disableTypeOpen) {
                            siteList.style.visibility = "hidden";
                        }
                    }
                    if (!searchData.prefConfig.disableTypeOpen) {
                        setTimeout(() => {
                            self.checkScroll();
                        }, searchData.prefConfig.typeOpenTime);
                    }
                };
                let draged = false, initMousePos, initTilePos;
                let mouseUpHandler = e => {
                    document.removeEventListener('mouseup', mouseUpHandler);
                    document.removeEventListener('mousemove', mouseMoveHandler);
                    if (!draged) {
                        typeAction(e);
                    }
                    draged = false;
                }
                let mouseMoveHandler = e => {
                    if (!draged) {
                        self.tips.style.opacity = 0;
                        self.tips.style.pointerEvents = '';
                        draged = true;
                        initMousePos = {x: e.clientX, y: e.clientY};
                        initTilePos = {x: parseInt(self.bar.style.left), y: parseInt(self.bar.style.top)};
                    } else {
                        self.bar.style.left = initTilePos.x + e.clientX - initMousePos.x + "px";
                        self.bar.style.top = initTilePos.y + e.clientY - initMousePos.y + "px";
                    }
                }
                typeBtn.onmouseup = function (e) {
                    if (e && self.funcKeyCall && e.button === 0 && !(e.shiftKey || e.altKey || e.ctrlKey)) {
                        draged = false;
                        e.preventDefault && e.preventDefault();
                        document.addEventListener('mouseup', mouseUpHandler);
                        document.addEventListener('mousemove', mouseMoveHandler);
                        return;
                    }
                    typeAction(e);
                };
                typeBtn.oncontextmenu = function (e) {
                    e.preventDefault();
                };

                typeBtn.addEventListener('click', e => {
                    self.batchOpen(batchSiteNames, e);
                    return false;
                }, false);
                typeBtn.addEventListener('dblclick', e=>{
                    e.stopPropagation();
                    e.preventDefault();
                }, true);

                let showTimer, siteList;
                let viewWidth = window.screen.availWidth || window.innerWidth || document.documentElement.clientWidth;
                let viewHeight = window.screen.availHeight || window.innerHeight || document.documentElement.clientHeight;
                let availableSize = !isMobile || (viewWidth > 600 && viewHeight > 600);
                ele.addEventListener('sitelist', async e => {
                    ele.appendChild(siteList);
                    await self.listPos(e.detail.bind, siteList);
                    siteList.style.display = "block";
                }, false);
                typeBtn.addEventListener('mouseenter', e => {
                    if (draged) {
                        return;
                    }
                    if (!self.funcKeyCall && searchData.prefConfig.showSiteLists && (searchData.prefConfig.alwaysShowSiteLists || !ele.classList.contains("search-jumper-open"))) {
                        ele.appendChild(siteList);
                        self.listPos(ele.children[0], siteList);
                    } else if (availableSize) {
                        self.tipsPos(typeBtn, ele.dataset.title);
                    }
                    if (searchData.prefConfig.overOpen) {
                        if (ele.classList.contains("search-jumper-open")) return;
                        clearTimeout(showTimer);
                        showTimer = setTimeout(() => {
                            typeAction(e);
                        }, 500);
                    }
                }, false);
                typeBtn.addEventListener('mouseleave', e => {
                    self.tips.style.opacity = 0;
                    self.tips.style.pointerEvents = '';
                    if (searchData.prefConfig.overOpen) {
                        clearTimeout(showTimer);
                    }
                }, false);
                let isCurrent = false;
                let tooLoog = sites && sites.length > 200;
                ele.dataset.id = self.siteIndex;
                self.stopInput = false;
                async function createItem(site, i) {
                    if (!site.name) return;
                    let siteEle = await self.createSiteBtn((tooLoog || searchData.prefConfig.noIcons ? "0" : site.icon), site, openInNewTab, isBookmark, data);
                    if (!siteEle) {
                        return;
                    }
                    if (!siteEle.classList.contains("notmatch")) {
                        shownSitesNum++;
                    }
                    siteEle.dataset.type = type;
                    siteEle.dataset.id = self.siteIndex;
                    self.siteIndex++;
                    self.allSiteBtns.push([siteEle, site]);
                    ele.appendChild(siteEle);
                    siteEles.push(siteEle);
                    if (!site.nobatch && site.match !== "0") batchSiteNames.push(site.name);
                    if (!isCurrent && !currentSite && (siteEle.dataset.current || match) && !ele.classList.contains("notmatch")) {
                        isCurrent = true;
                        if (siteEle.dataset.current) {
                            if (!searchData.prefConfig.showCurrent) {
                                siteEle.style.display = 'none';
                            }
                            self.setCurrentSite(site, siteEle);
                        }
                        self.currentType = ele;
                    }
                }
                try {
                    for (let [i, site] of sites.entries()) {
                        await createItem(site, i);
                        if (i % 100 === 99) await sleep(1);
                    }
                } catch(e) {
                    for (let i = 0; i < sites.length; i++) {
                        createItem(sites[i], i);
                    }
                    await sleep(1);
                }


                if (searchData.prefConfig.sortSite && ele.children.length > 1) {
                    siteEles.sort((a, b) => {
                        let aSiteValue = sortSiteNames[a.dataset.name] || 0;
                        let bSiteValue = sortSiteNames[b.dataset.name] || 0;
                        return bSiteValue - aSiteValue;
                    });
                    let changed = false;
                    for (let i = siteEles.length - 1; i >= 0; i--) {
                        let siteEle = siteEles[i];
                        let curValue = sortSiteNames[siteEle.dataset.name] || 0;
                        if (i == siteEles.length - 1) {
                            if (curValue > 0) {
                                changed = true;
                                sortSiteNames[siteEle.dataset.name] = 0;
                            }
                        } else {
                            let preValue = sortSiteNames[siteEles[i + 1].dataset.name] || 0;
                            if (curValue - preValue > 10) {
                                changed = true;
                                sortSiteNames[siteEle.dataset.name] = preValue + 10;
                            }
                        }
                        ele.insertBefore(siteEle, ele.children[1]);
                    }
                    if (changed) storage.setItem("sortSiteNames", sortSiteNames);
                }

                siteEles.forEach(siteEle => {
                    if (siteEle.classList.contains("notmatch")) {
                        ele.appendChild(siteEle);
                    }
                });
                siteList = await self.createList(siteEles, ele, batchSiteNames);
                if (isCurrent) {
                    if (searchData.prefConfig.currentTypeFirst) {
                        self.bar.insertBefore(ele, self.bar.children[0]);
                    } else {
                        self.bar.insertBefore(ele, self.bar.children[self.bar.children.length - 1]);
                    }
                    if (!searchData.prefConfig.disableAutoOpen && !searchData.prefConfig.disableTypeOpen) {
                        ele.classList.add("search-jumper-open");
                        ele.classList.add('search-jumper-move');
                        if (shownSitesNum > (searchData.prefConfig.expandTypeLength || 12) && !searchData.prefConfig.expandType) {
                            ele.classList.add("not-expand");
                            ele.appendChild(self.searchJumperExpand);
                        }
                        let shownIconNum = -1, waitIconList = [];
                        if (document.readyState !== 'complete') {
                            shownIconNum = 3;
                            let loadHandler = e => {
                                if (document.readyState === "complete") {
                                    document.removeEventListener("readystatechange", loadHandler);
                                    window.removeEventListener('load', loadHandler);
                                    waitIconList.forEach(icon => {
                                        if (icon && !icon.src && icon.dataset.src) {
                                            icon.src = icon.dataset.src;
                                            delete icon.dataset.src;
                                        }
                                    });
                                    waitIconList = [];
                                }
                            };
                            document.addEventListener("readystatechange", loadHandler);
                            window.addEventListener('load', loadHandler);
                        }
                        siteEles.forEach((se, i) => {
                            let si = se.querySelector("img");
                            let data = sites[i];

                            if (data && localKeywords && data.kwFilter) {
                                let pass = self.checkKwFilter(data.kwFilter, localKeywords);
                                if (pass) {
                                    se.style.display = '';
                                } else {
                                    se.style.display = 'none';
                                    if (self.searchJumperExpand.parentNode == ele) {
                                        ele.insertBefore(se, self.searchJumperExpand);
                                    } else ele.appendChild(se);
                                }
                            }
                            if (se.style.display != 'none' && si && !si.src && si.dataset.src) {
                                if (shownIconNum >= 0 && !/^data/.test(si.dataset.src)) {
                                    if (shownIconNum !== 0) {
                                        shownIconNum--;
                                    } else {
                                        waitIconList.push(si);
                                        return;
                                    }
                                }
                                si.src = si.dataset.src;
                                delete si.dataset.src;
                            }
                        });
                    }
                } else {
                    if (!self.historyTypeEle) {
                        if (historyType == type) {
                            self.historyTypeEle = ele;
                        }
                    }
                    self.bar.insertBefore(ele, self.bar.children[self.bar.children.length - 1]);
                }

                ele.style.width = ele.scrollHeight + "px";
                ele.style.height = ele.scrollHeight + "px";
                siteList.style.display = "none";
                ele.appendChild(siteList);
                if (inPage && selectImg && selectAudio && selectVideo && selectLink && selectPage) {
                    ele.classList.add("search-jumper-targetAll");
                } else {
                    if (inPage) {
                        ele.classList.add("search-jumper-needInPage");
                    }
                    if (selectImg) {
                        ele.classList.add("search-jumper-targetImg");
                    }
                    if (selectAudio) {
                        ele.classList.add("search-jumper-targetAudio");
                    }
                    if (selectVideo) {
                        ele.classList.add("search-jumper-targetVideo");
                    }
                    if (selectLink) {
                        ele.classList.add("search-jumper-targetLink");
                    }
                    if (selectPage) {
                        ele.classList.add("search-jumper-targetPage");
                    }
                }
                searchTypes.push(ele);
                return ele;
            }

            async openSiteBtn(siteEle, forceTarget, active = false) {
                this.lastTips = null;
                let mouseDownEvent = new CustomEvent("mouseenter");
                siteEle.dispatchEvent(mouseDownEvent);
                await this.siteSetUrl(siteEle);
                let isPage = siteEle.dataset.isPage;
                if (!forceTarget) forceTarget = "_blank";
                if (isPage) {
                    siteEle.setAttribute("target", forceTarget);
                }
                if (isPage && forceTarget == "_blank" && siteEle.href) {
                    _GM_openInTab(siteEle.href, {active: active, insert: true});
                } else {
                    siteEle.click();
                }
                siteEle.setAttribute("target", siteEle.dataset.target == 1 ? "_blank" : "_self");
            }

            async batchOpen(siteNames, e, newTab) {
                let self = this;
                self.batchOpening = true;
                self.customInput = false;
                if (e.altKey && e.shiftKey) {
                    let targetSites = self.getTargetSitesByName(siteNames);
                    let viewWidth = window.innerWidth || document.documentElement.clientWidth;
                    let html = '<title>SearchJumper Multi</title><style>body{background: black; margin: 0;}iframe{box-sizing: border-box;padding: 5px}</style>';
                    let c = window.open("", "_blank"), i = 1;
                    for (let siteEle of targetSites) {
                        if (siteEle.dataset.isPage) {
                            await self.siteSetUrl(siteEle);
                            if (self.stopInput) return;
                            if (!siteEle.href) continue;
                            let iframe = document.createElement('iframe');
                            iframe.width = targetSites.length <= 2 || viewWidth <= 1280 ? '50%' : '33%';
                            iframe.height = '100%';
                            iframe.frameBorder = '0';
                            iframe.sandbox = "allow-same-origin allow-scripts allow-popups allow-forms";
                            iframe.id = "searchJumper" + i++;
                            iframe.style.display = "none";
                            html += iframe.outerHTML;
                            _GM_xmlhttpRequest({
                                method: 'GET',
                                url: siteEle.href,
                                headers: {
                                    referer: siteEle.href,
                                    origin: siteEle.href,
                                    'User-Agent': navigator.userAgent
                                },
                                onload: function(d) {
                                    let curIframe = c.document.querySelector('iframe#' + iframe.id);
                                    let waitReady = () => {
                                        let doc = curIframe.contentDocument || (curIframe.contentWindow && curIframe.contentWindow.document);
                                        if (doc) {
                                            try {
                                                curIframe.style.display = "";
                                                curIframe.src = siteEle.href;
                                                let base = `<base href="${siteEle.href.replace(/[^\/]*$/, "")}" />`;
                                                let docContent = d.response.indexOf("<head") !== -1 ? d.response.replace(/(\<head.*?\>)/, "$1" + base) : base + d.response;
                                                doc.write(docContent);
                                            } catch(e) {
                                            }
                                        } else {
                                            setTimeout(() => {
                                                waitReady();
                                            }, 500);
                                        }
                                    };
                                    if (curIframe) {
                                        waitReady();
                                    }
                                },
                                onerror: function(e){
                                    debug(e);
                                },
                                ontimeout: function(e){
                                    debug(e);
                                }
                            });
                        }
                    }
                    c.document.write(html);
                    c.document.close();
                } else if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                    let targetSites = self.getTargetSitesByName(siteNames);
                    for (let siteEle of targetSites) {
                        await self.siteSetUrl(siteEle);
                        if (self.stopInput) return;
                        if (siteEle.dataset.isPage && siteEle.href) {
                            let target = {};
                            if (targetElement) {
                                target = {src: targetElement.src || targetElement.href || '', title: targetElement.title || targetElement.alt};
                            }
                            siteNames = siteNames.filter(n => n !== siteEle.dataset.name);
                            storage.setItem("lastSign", {target: target, sites: siteNames});
                            setTimeout(() => {
                                _GM_openInTab(siteEle.href, {incognito: true});
                            }, 300);
                            setTimeout(() => {
                                storage.setItem("lastSign", false);
                            }, 2000);
                            break;
                        }
                    }
                } else if (e.altKey) {
                    let targetSites = self.getTargetSitesByName(siteNames);
                    let urls=[];
                    for (let siteEle of targetSites) {
                        if (siteEle.dataset.isPage) {
                            await self.siteSetUrl(siteEle);
                            if (self.stopInput) return;
                            if (!siteEle.href) continue;
                            urls.push(siteEle.href);
                        }
                    }
                    let viewWidth = window.screen.availWidth || window.innerWidth || document.documentElement.clientWidth;
                    let viewHeight = window.screen.availHeight || window.innerHeight || document.documentElement.clientHeight;
                    let numPerLine = parseInt(viewWidth / 800);
                    if (numPerLine > urls.length) numPerLine = urls.length;
                    let _width = parseInt(viewWidth / numPerLine);
                    let _height = viewHeight / (parseInt((urls.length - 1) / numPerLine) + 1) - 65;
                    for (let i = 0; i < urls.length; i++) {
                        let left = (i % numPerLine) * _width;
                        let top = parseInt(i / numPerLine) * (_height + 70);
                        window.open(urls[i] + "#searchJumperMin", "_blank", `width=${_width-10}, height=${_height}, location=0, resizable=1, status=0, toolbar=0, menubar=0, scrollbars=0, left=${left}, top=${top}`);
                    }
                } else if (e.shiftKey) {
                    let targetSites = self.getTargetSitesByName(siteNames);
                    for (let siteEle of targetSites) {
                        await self.siteSetUrl(siteEle);
                        if (self.stopInput) return;
                        if (siteEle.dataset.isPage && siteEle.href) {
                            let target = {};
                            if (targetElement) {
                                target = {src: targetElement.src || targetElement.href || '', title: targetElement.title || targetElement.alt};
                            }
                            siteNames = siteNames.filter(n => n !== siteEle.dataset.name);
                            storage.setItem("lastSign", {target: target, sites: siteNames});
                            window.open(siteEle.href, '_blank');
                            setTimeout(() => {
                                storage.setItem("lastSign", false);
                            }, 2000);
                            break;
                        }
                    }
                } else if (e.ctrlKey || e.metaKey) {
                    let targetSites = self.getTargetSitesByName(siteNames).reverse();
                    for (let siteEle of targetSites) {
                        await self.siteSetUrl(siteEle);
                        let isPage = siteEle.dataset.isPage;
                        if (isPage && siteEle.href) {
                            _GM_openInTab(siteEle.href, {active: false, insert: true});
                            continue;
                        }
                        if (self.stopInput) return;
                        siteEle.click();
                    }
                } else if (e.button === 2) {
                    let targetSites = self.getTargetSitesByName(siteNames);
                    targetSites.reverse().forEach(siteEle => {
                        if (siteEle.dataset.current) return;
                        self.openSiteBtn(siteEle, "_blank", !!newTab);
                    });
                }
                self.batchOpening = false;
            }

            async siteSetUrl(siteEle, e) {
                return new Promise((resolve) => {
                    let actionOverHandler = e => {
                        siteEle.removeEventListener('actionOver', actionOverHandler);
                        resolve(true);
                    }
                    siteEle.addEventListener('actionOver', actionOverHandler);
                    let mouseDownEvent = new PointerEvent("mousedown", e);
                    siteEle.dispatchEvent(mouseDownEvent);
                });
            }

            getTargetSitesByName(siteNames, noPointer) {
                let self = this;
                let targetSites = [];
                siteNames.forEach(n => {
                    for (let i = 0; i < self.allSiteBtns.length; i++) {
                        let siteBtn = self.allSiteBtns[i][0];
                        if (siteBtn.dataset.name == n) {
                            if (!noPointer && siteBtn.dataset.pointer) {
                                if (siteBtn.dataset.oriName) {
                                    let oriBtn = self.getTargetSitesByName([siteBtn.dataset.oriName], true);
                                    if (oriBtn.length) {
                                        targetSites.push(...oriBtn);
                                        break;
                                    }
                                }
                            } else {
                                targetSites.push(siteBtn);
                            }
                            break;
                        }
                    }
                });
                return targetSites;
            }

            async submitAction(params) {
                params = params.slice();
                if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
                    await sleep(300);
                    this.submitAction(params);
                    return;
                }
                let form, input, clicked = false, self = this, inLoop = false, loopTimes = 0, loopArr = [];
                let opened = false, copyList = [];
                let copyStore = await storage.getItem("copyStore");
                if (copyStore) {
                    copyList = JSON.parse(copyStore);
                }

                let singleAction = async (param, eleIndex) => {
                    let result = true;
                    if (param[0] === "sleep" || param[0] === "@sleep") {
                        await sleep(param[1]);
                        debug(`sleep ${param[1]}`);
                    } else if (param[0] === "@click") {
                        clicked = true;
                        let _r = await emuClick(param[1], eleIndex);
                        if (!_r) result = false;
                    } else if (param[0] === "@dblclick") {
                        clicked = true;
                        let _r = await emuDblClick(param[1], eleIndex);
                        if (!_r) result = false;
                    } else if (param[0] === "@rclick") {
                        clicked = true;
                        let _r = await emuRClick(param[1], eleIndex);
                        if (!_r) result = false;
                    } else if (param[1] === 'click' && param[0].indexOf('@') === 0) {
                        clicked = true;
                        let _r = await emuClick(param[0].substr(1), eleIndex);
                        if (!_r) result = false;
                    } else if (param[0] === '@copy') {
                        let _r = await returnElement(param[1], eleIndex);
                        if (_r && _r !== true) {
                            copyList.push(_r.innerText);
                            if (!reachLast) {
                                result = false;
                            }
                        }
                    } else if (param[0] === '@call') {
                        let engine = self.getTargetSitesByName([param[1]])[0];
                        if (engine) {
                            extSelectionText = extSelectionText || getKeywords() || cacheKeywords;
                            await self.siteSetUrl(engine);
                            engine.click();
                        } else {
                            let func = window[param[1]] || new AsyncFunction('"use strict";' + param[1]);
                            if (func) await func();
                        }
                    } else if (param[0] === '@open') {
                        let btn = await waitForElement(param[1]);
                        if (opened) {
                            _GM_openInTab(btn.href);
                        } else {
                            opened = true;
                            setTimeout(() => {
                                location.href = btn.href;
                            }, 50);
                        }
                    } else if (param[0] === '@reload') {
                    } else if (param[0] === '@wait') {
                        if (param[1].indexOf("!") === 0) {
                            await waitForElementHide(param[1].slice(1));
                        } else {
                            await waitForElement(param[1]);
                        }
                    } else {
                        let inputStr = param[1];
                        if (!localKeywords) localKeywords = inputStr;
                        if (inputStr.indexOf('%input{') !== -1) {
                            let customInputStr = await self.showCustomInputWindow(inputStr);
                            if (customInputStr) {
                                inputStr = customInputStr;
                            } else {
                                storage.setListItem("inPagePostParams", location.hostname, "");
                                return true;
                            }
                        }
                        let _r = await emuInput(param[0], inputStr, eleIndex);
                        if (!_r) result = false;
                        if (param[0] !== "@") {
                            input = getElement(param[0]);
                        }
                    }
                    return result;
                };

                for (let param of params) {
                    if (param[0] === "@loopStart") {
                        inLoop = true;
                        loopArr = [];
                        loopTimes = parseInt(param[1]) || 1;
                    } else if (param[0] === "@loopEnd") {
                        inLoop = false;
                        while (loopTimes-- > 0) {
                            let allReady = false, eleIndex = 0;
                            while (!allReady) {
                                allReady = true;
                                for (let param of loopArr) {
                                    let ready = await singleAction(param, eleIndex);
                                    if (!ready) allReady = false;
                                }
                                eleIndex++;
                            }
                        }
                    } else if (inLoop) {
                        loopArr.push(param);
                    } else {
                        await singleAction(param);
                    }
                    if (inPagePostParams) {
                        inPagePostParams.shift();
                        if (inPagePostParams && inPagePostParams.length) {
                            storage.setListItem("inPagePostParams", location.hostname, inPagePostParams);
                            if (copyList && copyList.length) {
                                storage.setItem("copyStore", JSON.stringify(copyList));
                            }
                        } else {
                            storage.setListItem("inPagePostParams", location.hostname, "");
                            storage.setItem("copyStore", "");
                            if (copyList && copyList.length) {
                                _GM_setClipboard(copyList.join("\n"));
                            }
                        }
                        if (param[0] === '@reload') {
                            location.reload(!!param[1]);
                            return;
                        }
                    }
                }
                if (inLoop) {
                    inLoop = false;
                    while (loopTimes-- > 0) {
                        let allReady = false, eleIndex = 0;
                        while (!allReady) {
                            allReady = true;
                            for (let param of loopArr) {
                                let ready = await singleAction(param, eleIndex);
                                if (!ready) allReady = false;
                            }
                            eleIndex++;
                        }
                    }
                }

                if (!clicked && input) {
                    form = input.parentNode;
                    while (form.nodeName.toUpperCase() != 'FORM') {
                        form = form.parentNode;
                        if (!form) break;
                    }
                    if (form) {
                        let submitBtn = form.querySelector("[type=submit]");
                        if (submitBtn) submitBtn.click();
                        else form.submit();
                    } else {
                        emuPress();
                    }
                }
            }

            getCloneData(siteName) {
                for (let i = 0; i < searchData.sitesConfig.length; i++) {
                    let typeConfig = searchData.sitesConfig[i];
                    for (let j = 0; j < typeConfig.sites.length; j++) {
                        let siteData = typeConfig.sites[j];
                        if (/^\[/.test(siteData.url)) continue;
                        if (siteData.name == siteName) {
                            return siteData;
                        }
                    }
                }
                return null;
            }

            async createSiteBtn(icon, data, openInNewTab, isBookmark, typeData, isHistoryBtn) {
                let self = this;
                let ele = document.createElement("a");
                ele.setAttribute("ref", "noopener noreferrer");
                ele.setAttribute("referrerPolicy", "no-referrer");
                let name = data.name;
                let urlMatch = data.match;
                let showTips = false;
                let tipsData;
                let pointer = !isBookmark && /^\[/.test(data.url);
                let description = data.description;
                let shortcut = data.shortcut;
                if (typeof data.openInNewTab !== 'undefined') {
                    openInNewTab = data.openInNewTab;
                }
                if (pointer) {
                    ele.dataset.pointer = true;
                    let siteNames = JSON.parse(data.url);
                    if (siteNames.length === 1) {
                        ele.dataset.clone = true;
                        let cloneSite = this.getCloneData(siteNames[0]);
                        if (cloneSite) {
                            ele.dataset.oriName = cloneSite.name;
                            data = cloneSite;
                            if (data.icon && icon !== "0") icon = data.icon;
                            if (data.description) description = data.description;
                        }
                    }
                }
                if (/^d:/.test(data.url)) {
                    ele.setAttribute('download', '');
                    data.url = data.url.replace(/^d:/, '');
                } else if (/^showTips:/.test(data.url)) {
                    showTips = true;
                    ele.dataset.showTips = true;
                }
                if (/^paste:/.test(data.url)) {
                    ele.dataset.paste = true;
                }
                let isPage = /^(https?|ftp):/.test(data.url);
                if (isPage) ele.dataset.isPage = isPage;
                ele.className = "search-jumper-btn";
                if (typeof description !== 'undefined') ele.title = description;
                ele.dataset.name = name;
                ele.classList.add("search-jumper-word");
                ele.dataset.inPagePost = (data.url.indexOf("#p{") != -1) ? 't' : 'f';
                let inPagePost = ele.dataset.inPagePost === 't';
                if (urlMatch === '0') {
                    ele.style.display = 'none';
                    ele.classList.add("notmatch");
                } else if (!isBookmark && (!currentSite || data.hideNotMatch) && window.top == window.self) {
                    if (urlMatch) {
                        let urlRe, fullMatch = urlMatch.match(/^\/(.*)\/(\w*)$/);
                        if (fullMatch) {
                            urlRe = new RegExp(fullMatch[1], fullMatch[2]);
                        } else {
                            urlRe = new RegExp(urlMatch, "i");
                        }
                        if (urlRe.test(href)) {
                            ele.dataset.current = true;
                        }
                    } else if (!pointer && location.hostname && data.url.indexOf(location.hostname) != -1) {
                        if (!this.inSiteMatch) this.inSiteMatch = /site(%3A|:)(.+?)[\s%]/;
                        let match = data.url.match(this.inSiteMatch);
                        if (match) {
                            if (href.indexOf(match[2]) != -1 && data.url.replace(match[0], "").indexOf(location.hostname) != -1) {
                                ele.dataset.current = true;
                            }
                        } else {
                            if (!this.pathMatch) this.pathMatch = new RegExp("^https?://" + location.host + location.pathname + "?([\\?#].*|[%:#]p{|$)");
                            if (this.pathMatch.test(data.url)) {
                                if (!this.postMatch) this.postMatch = /[#:%]p{/;
                                if (this.postMatch.test(data.url)) {
                                    ele.dataset.current = true;
                                } else {
                                    if (!this.paramMatch) this.paramMatch = /[^\/\?&]+(?=%[stb])/g;
                                    let urlReg = data.url.match(this.paramMatch);
                                    if (urlReg) {
                                        urlReg = urlReg.join('.*');
                                        if (new RegExp(urlReg).test(href)) {
                                            ele.dataset.current = true;
                                        }
                                    } else {
                                        ele.dataset.current = true;
                                    }
                                }
                            } else if (data.url.indexOf("http") === 0 && data.url.indexOf("?") === -1) {
                                if (!this.keywordMatch) this.keywordMatch = /%[stb][a-z]?\b/g;
                                if (new RegExp(data.url.replace(/^https?/, "").replace(/[#%]\w+{.*/, "").replace(/\./g, "\\.").replace(this.keywordMatch, ".*")).test(href)) {
                                    ele.dataset.current = true;
                                }
                            }
                        }
                    }
                    if (ele.dataset.current) {
                    } else if (data.hideNotMatch) {
                        ele.style.display = 'none';
                        ele.classList.add("notmatch");
                    }
                }

                let word = document.createElement("span");
                if (!isBookmark && name.length >= 3) {
                    word.innerText = name.substr(0, 4);
                    if (!/^[\w \-]+$/.test(word.innerText.substr(0, 3))) word.innerText = word.innerText.substr(0, 2);
                } else word.innerText = name;
                ele.appendChild(word);
                let img = document.createElement("img");
                img.style.display = "none";
                ele.appendChild(img);

                if (!isHistoryBtn && searchData.prefConfig.shortcut && shortcut && !ele.dataset.clone && !ele.classList.contains("notmatch")) {
                    let shortcutCover = document.createElement("div");
                    let shortcurStr = shortcut.replace('Key', '').replace('Digit', '').toUpperCase();
                    if (shortcurStr.length == 1) {
                        shortcutCover.innerText = shortcurStr;
                        ele.appendChild(shortcutCover);
                    }
                    document.addEventListener('keydown', async e => {
                        if (searchData.prefConfig.shortcut == 2 && !currentSite) return;
                        if (e.target.id === "searchJumperInput") return;
                        if (!self.hideTimeout) {
                            if ((!data.ctrl == e.ctrlKey) ||
                                (!data.alt == e.altKey) ||
                                (!data.shift == e.shiftKey) ||
                                (!data.meta == e.metaKey)) {
                                return;
                            }
                        }
                        if (!self.bar.contains(ele)) return;
                        if (!searchData.prefConfig.enableInInput && !data.ctrl && !data.alt && !data.shift && !data.meta) {
                            if (inputActive(document)) return;
                        }
                        var key = (e.key || String.fromCharCode(e.keyCode)).toLowerCase();
                        if (shortcut == e.code || shortcut == key) {
                            e.stopPropagation();
                            if (hoverElement) {
                                targetElement = hoverElement;
                            }
                            if (showTips) {
                                ele.dispatchEvent(new CustomEvent('showTips'));
                            } else if (await action() !== false && !self.customInput) {
                                ele.click();
                            }
                        }
                    });
                }
                let imgSrc;
                if (icon == "0") {
                } else if (icon) {
                    imgSrc = icon;
                } else if (!isBookmark && isPage) {
                    imgSrc = data.url.replace(/\?.*/, "").replace(/^(https?:\/\/[^\/]*\/)[\s\S]*$/, "$1favicon.ico");
                } else if (/^showTips:https?:\/\//.test(data.url)) {
                    imgSrc = data.url.replace(/\?.*/, "").replace(/^showTips:(https?:\/\/[^\/]*\/)[\s\S]*$/, "$1favicon.ico");
                }
                if (imgSrc) {
                    img.onload = e => {
                        ele.classList.remove("search-jumper-word");
                        if (word.parentNode && !searchData.prefConfig.showEngineWords) {
                            word.parentNode.removeChild(word);
                        }
                        img.style.display = "";
                    };
                    let isBase64 = /^data:/.test(imgSrc);
                    if (isBase64) {
                        img.dataset.src = imgSrc;
                    } else {
                        let cache = searchData.prefConfig.cacheSwitch && cacheIcon[imgSrc];
                        if (cache === 'fail') {
                            if (ele.dataset.current && imgSrc.indexOf(location.host) != -1) {
                                img.dataset.src = imgSrc;
                                cacheIcon[imgSrc] = '';
                                if (!isBookmark) {
                                    setTimeout(() => {
                                        cacheAction(img);
                                    }, 0);
                                }
                            }
                        } else if (cache) {
                            img.dataset.src = cache;
                        } else {
                            img.dataset.src = imgSrc;
                            if (!isBookmark && !cacheIcon[imgSrc]) cachePool.push(img);
                        }
                    }
                }
                if (isPage) {
                    if (openInNewTab) {
                        ele.setAttribute("target", "_blank");
                        ele.dataset.target = 1;
                    } else ele.setAttribute("target", "_self");
                }
                let dataUrl = data.url;
                let hasWordParam = wordParamReg.test(dataUrl);
                if (hasWordParam) ele.dataset.txt = true;
                if (/%[tb]\b/i.test(dataUrl)) {
                    ele.dataset.link = true;
                }
                let inputString;
                let getUrl = async (_keyWords) => {
                    self.customInput = false;
                    dataUrl = data.url;
                    inputString = "";
                    let keywords = _keyWords || self.searchJumperInputKeyWords.value || getSelectStr() || self.tileInput.value;
                    if (!keywords && !draging && !self.bar.classList.contains("search-jumper-isTargetLink")) {
                        keywords = getKeywords();
                    }
                    if (keywords && !_keyWords) {
                        if (keywords != cacheKeywords) {
                            self.keywordIndex = 0;
                            if (isPage) {
                                cacheKeywords = keywords;
                                storage.setItem("cacheKeywords", keywords);
                            }
                        }
                        inputString = keywords;
                    }
                    let postMatch;
                    if (inPagePost || /^c(opy)?:|^paste:/.test(dataUrl)) {
                        if (dataUrl.indexOf('%input{') !== -1) {
                            dataUrl = await new Promise(resolve => {
                                self.showCustomInputWindow(dataUrl, _url => {
                                    resolve(_url);
                                });
                            });
                            ele.dataset.url = "";
                        }
                        postMatch = dataUrl.match(/#p{([\s\S]*[^\\])}/);
                    }
                    let host = location.host;
                    let href = location.href;
                    let targetName;
                    let customReplaceSingle = (str, key, value, after) => {
                        if (str.indexOf(key + "[") !== -1) {
                            let multiMatch = str.match(keyToReg(key, "", "\\[(.*?)(\\|(.+))?\\]")), valueArr;
                            if (multiMatch) {
                                if (multiMatch[3]) {
                                    valueArr = value.split(multiMatch[3]);
                                } else {
                                    valueArr = value.split(/[\n\r]/);
                                    if (valueArr.length === 1) {
                                        valueArr = value.split(" ");
                                    }
                                }
                                if (!self.keywordIndex) self.keywordIndex = 0;
                                switch(multiMatch[1]) {
                                    case "all":
                                        inputString = valueArr.join('\n');
                                        break;
                                    case ""://next
                                        value = valueArr[self.keywordIndex];
                                        if (++self.keywordIndex >= valueArr.length) {
                                            self.keywordIndex = 0;
                                        }
                                        break;
                                    case "-1"://prev
                                        if (--self.keywordIndex < 0) {
                                            self.keywordIndex = valueArr.length - 1;
                                        }
                                        value = valueArr[self.keywordIndex];
                                        break;
                                    default://number
                                        value = valueArr[parseInt(multiMatch[1]) || 0];
                                        break;
                                }
                                str = str.replace(multiMatch[0], key);
                            }
                        }
                        return replaceSingle(str, key, value, after);
                    };
                    let needDecode = (!/^showTips:h/i.test(dataUrl) && /^c(opy)?:|[#:%]P{|^javascript:|^showTips:/i.test(dataUrl));
                    let keywordsU = "", keywordsL = "", keywordsR = "", keywordsSC = "", keywordsTC = "";
                    let customReplaceKeywords = str => {
                        let _str = str;
                        _str = customReplaceSingle(_str, "%n", targetName);
                        _str = customReplaceSingle(_str, "%su", keywordsU);
                        _str = customReplaceSingle(_str, "%sl", keywordsL);
                        _str = customReplaceSingle(_str, "%sr", showTips ? keywordsR.replace(/\n/g, "【SearchJumperBreak】") : keywordsR);
                        _str = customReplaceSingle(_str, "%S", cacheKeywords || keywordsR);
                        _str = customReplaceSingle(_str, "%ss", keywordsSC);
                        _str = customReplaceSingle(_str, "%st", keywordsTC);
                        _str = customReplaceSingle(_str, "%se", escape ? escape(keywordsR) : keywordsR);
                        _str = customReplaceSingle(_str, "%s", keywordsR, v => {
                            return (needDecode ? v : encodeURIComponent(v));
                        });
                        if (/%bd\b/.test(_str)) {
                            try {
                                let debase64 = atob(keywordsR);
                                _str = customReplaceSingle(_str, "%bd", debase64);
                            } catch(e) {
                                console.log("No standard base64");
                            }
                        }
                        if (/%be\b/.test(_str)) {
                            try {
                                let enbase64 = btoa(keywordsR);
                                _str = customReplaceSingle(_str, "%be", enbase64);
                            } catch(e) {
                                console.log(e);
                            }
                        }
                        return _str;
                    };
                    let customVariable = str => {
                        let customMatch = str.match(/%element{(.*?)}(\.prop\((.*?)\))?/);
                        let runTimes = 0;
                        while (customMatch) {
                            if (runTimes++ > 100) break;
                            let selector = customMatch[1];
                            let prop = customMatch[3];
                            let value = "";
                            if (!selector) {
                                try {
                                    let selectEles = window.getSelection();
                                    let container = document.createElement('div');
                                    for (let i = 0, len = selectEles.rangeCount; i < len; ++i) {
                                        container.appendChild(selectEles.getRangeAt(i).cloneContents());
                                    }
                                    [].forEach.call(container.querySelectorAll("style,script,svg,canvas"), ele => {
                                        let textNode = document.createTextNode('');
                                        ele.parentNode.replaceChild(textNode, ele);
                                    });
                                    document.body.appendChild(container);
                                    if (prop) {
                                        for (let i = 0; i < container.childNodes.length; i++) {
                                            let childNode = container.childNodes[i];
                                            if (childNode.nodeType == 3) {
                                                value += childNode.nodeValue;
                                                value += "\n";
                                            } else if (childNode.nodeType == 1) {
                                                value += childNode.getAttribute(prop) || childNode[prop] || "";
                                                value += "\n";
                                            }
                                        }
                                    } else {
                                        [].forEach.call(container.querySelectorAll("img"), img => {
                                            if (!img.src) return;
                                            let textNode = document.createTextNode(` ![${(img.alt || "").replace(/[\n\r]/g, " ").trim()}](${img.src || ""}) `);
                                            img.parentNode.replaceChild(textNode, img);
                                        });
                                        [].forEach.call(container.querySelectorAll("a"), a => {
                                            if (!a.href) return;
                                            let innerText = (a.innerText || "").replace(/[\n\r]+/g, "\n").trim();
                                            if (!innerText) return;
                                            innerText = ` [${innerText}](${a.href || ""}) `;
                                            let newNode;
                                            if (innerText.indexOf("\n") == -1) {
                                                newNode = document.createTextNode(innerText);
                                            } else {
                                                newNode = document.createElement("pre");
                                                newNode.innerHTML = createHTML(innerText);
                                            }
                                            a.parentNode.replaceChild(newNode, a);
                                        });
                                        value = container.innerText;
                                    }
                                    if (value) {
                                        value = value.replace(/[\n\r]\s*/g, "\n");
                                    }
                                    document.body.removeChild(container);
                                } catch(e) {
                                    console.error(e);
                                }
                            } else {
                                let ele = getElement(selector);
                                if (ele) {
                                    if (prop) {
                                        value = ele.getAttribute(prop) || ele[prop];
                                    } else {
                                        value = ele.innerText;
                                    }
                                }
                            }
                            str = customReplaceSingle(str, customMatch[0], needDecode ? value : encodeURIComponent(value));
                            customMatch = str.match(/%element{(.*?)}(\.prop\((.*?)\))?/);
                        }
                        customMatch = str.match(/%date({(.*?)})?/);
                        runTimes = 0;
                        let curTime = new Date().getTime();
                        while (customMatch) {
                            if (runTimes++ > 100) break;
                            let timeEval = customMatch[2];
                            let value = curTime;
                            if (timeEval) {
                                timeEval = timeEval.replace(/\s/g, '');
                                let mathEval = timeEval.match(/(\D*)?(\d+)/);
                                while (mathEval) {
                                    switch (mathEval[1]) {
                                        case "-":
                                            value -= parseInt(mathEval[2]);
                                            break;
                                        case "*":
                                            value *= parseInt(mathEval[2]);
                                            break;
                                        case "/":
                                            if (mathEval[2] && mathEval[2] != '0') {
                                                value = parseInt(value / parseInt(mathEval[2]));
                                            }
                                            break;
                                        default:
                                            value += parseInt(mathEval[2]);
                                            break;
                                    }
                                    timeEval = timeEval.replace(mathEval[0], "");
                                    mathEval = timeEval.match(/(\D*)?(\d+)/);
                                }
                            } else {
                                value = curTime;
                            }
                            str = str.replace(customMatch[0], value);
                            customMatch = str.match(/%date({(.*?)})?/);
                        }
                        return str;
                    }
                    if (!ele.dataset.url) {
                        let tempUrl = dataUrl;
                        if (inPagePost) {
                            tempUrl = tempUrl.replace(postMatch[0], "");
                        }
                        ele.dataset.url = tempUrl.replace(/%e\b/g, document.characterSet).replace(/%c\b/g, (isMobile?"mobile":"pc"));
                    }
                    let targetUrl = '', targetLink = '';
                    targetName = inputString || document.title;
                    let imgBase64 = '', resultUrl = customVariable(ele.dataset.url);
                    if (targetElement && targetElement.nodeName) {
                        targetUrl = targetElement.href || (targetElement.parentNode && targetElement.parentNode.href) || '';
                        targetLink = targetUrl || (targetElement.parentNode && targetElement.parentNode.parentNode && targetElement.parentNode.parentNode.href) || '';
                        if ((typeData.selectImg || typeData.selectAudio || typeData.selectVideo) && targetElement.src) {
                            targetUrl = targetElement.src;
                        }
                        if (targetElement.nodeName.toUpperCase() == "VIDEO" || targetElement.nodeName.toUpperCase() == "AUDIO") {
                            if (!targetUrl) {
                                let source = targetElement.querySelector("source");
                                if (source) targetUrl = source.src;
                            }
                            if (targetUrl) targetUrl = targetUrl.replace(/^blob:/, "");
                        }
                        targetName = targetElement.title || targetElement.alt || document.title;
                        if (targetElement.nodeName.toUpperCase() == 'IMG' && /%i\b/.test(dataUrl)) {
                            if (targetElement.src) {
                                if (/^data/.test(targetElement.src)) {
                                    imgBase64 = targetElement.src;
                                } else {
                                    self.tipsPos(ele, "<span class='loader'></span><font>Loading...</font>");
                                    imgBase64 = await image2Base64(targetElement);
                                }
                                resultUrl = resultUrl.replace(/%i\b/g, imgBase64);
                            }
                        } else if ((targetElement.nodeName.toUpperCase() == 'A' || (targetElement.parentNode && targetElement.parentNode.nodeName.toUpperCase() == 'A')) && hasWordParam && !keywords) {
                            if (targetElement.textContent.trim()) keywords = targetElement.textContent.trim();
                        }
                    }
                    while (resultUrl.indexOf('%template{') !== -1) {
                        let inputMatch = resultUrl.match(/%template{(.*?[^\\])}/);
                        if (!inputMatch) return false;
                        let templateName = inputMatch[1];
                        if (!searchData.prefConfig.templateData) searchData.prefConfig.templateData = {};
                        let templateResult = searchData.prefConfig.templateData[templateName];
                        if (!templateResult) {
                            if (self.stopInput) return false;
                            templateResult = window.prompt(i18n("template", templateName)) || "";
                            if (templateResult) {
                                searchData.prefConfig.templateData[templateName] = templateResult;
                                storage.setItem("searchData", searchData);
                            } else return false;
                        }
                        resultUrl = resultUrl.replace(inputMatch[0], templateResult);
                    }
                    while (resultUrl.indexOf('%input{') !== -1) {
                        let inputMatch = resultUrl.match(/%input{(.*?[^\\])}/);
                        if (!inputMatch) return false;
                        self.customInput = true;
                        if (self.stopInput) return false;
                        if (self.batchOpening) {
                            let promptStr;
                            if (inputMatch[1].indexOf("\"") === 0 && inputMatch[1].indexOf("\",\"") !== -1) {
                                promptStr = inputMatch[1].substr(1, inputMatch[1].length - 2).split("\",\"");
                            } else {
                                promptStr = inputMatch[1].split(",");
                            }
                            if (promptStr.length === 2) {
                                promptStr = window.prompt(promptStr[0], promptStr[1]);
                            } else {
                                promptStr = window.prompt(inputMatch[1]);
                            }
                            if (promptStr === null) return false;
                            resultUrl = resultUrl.replace(inputMatch[0], promptStr);
                        } else break;
                    }
                    if (targetUrl) {
                        targetUrl = targetUrl.replace(/%(\w{2})/g, (match, letter) => `%${letter.toUpperCase()}`);
                    }
                    if (targetLink) {
                        targetLink = targetLink.replace(/%(\w{2})/g, (match, letter) => `%${letter.toUpperCase()}`);
                    }
                    let targetBaseUrl = targetUrl.replace(/^https?:\/\//i, "");
                    if (!keywords) keywords = (currentSite && cacheKeywords);
                    try {
                        if (typeof navigator.clipboard.readText !== "undefined") {
                            if (!keywords && hasWordParam) {
                                keywords = await navigator.clipboard.readText();
                                if (keywords && !_keyWords) {
                                    inputString = keywords;
                                }
                            }
                            if (!imgBase64 && /%i\b/.test(dataUrl)) {
                                const permission = await navigator.permissions.query({
                                    name: "clipboard-read",
                                });
                                if (permission.state !== "denied") {
                                    const clipboardContents = await navigator.clipboard.read();
                                    for (const item of clipboardContents) {
                                        if (item.types.includes("image/png")) {
                                            const blob = await item.getType("image/png");
                                            imgBase64 = await new Promise(resolve => {
                                                const reader = new FileReader();
                                                reader.onload = function (e) {
                                                    resolve(e.target && e.target.result);
                                                };
                                                reader.readAsDataURL(blob);
                                            });
                                            if (imgBase64) resultUrl = resultUrl.replace(/%i\b/g, imgBase64);
                                        }
                                    }
                                }
                                if (!imgBase64) {
                                    self.customInput = true;
                                    let src = window.prompt(i18n("targetUrl"), "https://www.google.com/favicon.ico");
                                    if (src) {
                                        self.tipsPos(ele, "<span class='loader'></span><font>Loading...</font>");
                                        imgBase64 = await imageSrc2Base64(src);
                                    } else return false;
                                }
                            }
                        }
                    } catch(e) {
                        console.error(e.message);
                    }
                    if (!keywords && hasWordParam) {
                        self.customInput = true;
                        if (self.con.classList.contains("search-jumper-showall")) return false;
                        if (self.inInput || showTips) return false;
                        if (self.stopInput) return false;
                        let promptStr = window.prompt(i18n("keywords"));
                        if (promptStr === null) return false;
                        localKeywords = promptStr;
                        setTimeout(() => {localKeywords = ''}, 1);
                        keywords = promptStr;
                        keywordsR = keywords;
                        keywordsU = keywordsR.toUpperCase();
                        keywordsL = keywordsR.toLowerCase();
                        keywordsSC = _unsafeWindow.tc2sc ? _unsafeWindow.tc2sc(keywordsR) : keywordsR;
                        keywordsTC = _unsafeWindow.sc2tc ? _unsafeWindow.sc2tc(keywordsR) : keywordsR;
                        if (!needDecode) keywords = encodeURIComponent(keywords);
                        resultUrl = customReplaceKeywords(resultUrl);
                    } else if (keywords && (!keywordsU && !keywordsL && !keywordsR)) {
                        keywordsR = keywords;
                        keywordsU = keywordsR.toUpperCase();
                        keywordsL = keywordsR.toLowerCase();
                        keywordsSC = _unsafeWindow.tc2sc ? _unsafeWindow.tc2sc(keywordsR) : keywordsR;
                        keywordsTC = _unsafeWindow.sc2tc ? _unsafeWindow.sc2tc(keywordsR) : keywordsR;
                        if (!needDecode) keywords = encodeURIComponent(keywords);
                    }
                    if (targetUrl === '') {
                        let canBeUrl = getSelectStr() || self.searchJumperInputKeyWords.value || self.tileInput.value;
                        if (!hasWordParam && canBeUrl && /^(http|ftp)/i.test(canBeUrl)) {
                            targetUrl = canBeUrl;
                            targetUrl = targetUrl.replace(/%(\w{2})/g, (match, letter) => `%${letter.toUpperCase()}`);
                        } else {
                            let promptStr = false;
                            let getTargetUrl = () => {
                                if (self.stopInput || showTips) return false;
                                if (promptStr === false) {
                                    promptStr = window.prompt(i18n("targetUrl"), "https://www.google.com/favicon.ico");
                                    if (promptStr) {
                                        promptStr = promptStr.replace(/%(\w{2})/g, (match, letter) => `%${letter.toUpperCase()}`);
                                        targetElement = {src: promptStr};
                                    }
                                }
                                if (promptStr === null) return false;
                                return true;
                            };
                            if (/%t\b/.test(resultUrl)) {
                                self.customInput = true;
                                if (getTargetUrl() === false) return false;
                                resultUrl = customReplaceSingle(resultUrl, "%t", promptStr);
                            }
                            if (/%T\b/.test(resultUrl)) {
                                self.customInput = true;
                                if (getTargetUrl() === false) return false;
                                resultUrl = resultUrl.replace(/%T\b/g, encodeURIComponent(promptStr));
                            }
                            if (/%τ\b/.test(resultUrl)) {
                                self.customInput = true;
                                if (getTargetUrl() === false) return false;
                                resultUrl = resultUrl.replace(/%τ\b/g, encodeURIComponent(encodeURIComponent(promptStr)));
                            }
                            if (/%b\b/.test(resultUrl)) {
                                self.customInput = true;
                                if (getTargetUrl() === false) return false;
                                resultUrl = resultUrl.replace(/%b\b/g, promptStr.replace(/^https?:\/\//i, ""));
                            }
                            if (/%B\b/.test(resultUrl)) {
                                self.customInput = true;
                                if (getTargetUrl() === false) return false;
                                resultUrl = resultUrl.replace(/%B\b/g, encodeURIComponent(promptStr.replace(/^https?:\/\//i, "")));
                            }
                            if (/%β\b/.test(resultUrl)) {
                                self.customInput = true;
                                if (getTargetUrl() === false) return false;
                                resultUrl = resultUrl.replace(/%β\b/g, encodeURIComponent(encodeURIComponent(promptStr.replace(/^https?:\/\//i, ""))));
                            }
                        }
                    }
                    let _host = host;
                    if ((targetLink || targetUrl) && !ele.dataset.link) {
                        href = targetLink || targetUrl;
                        _host = href.replace(/^\w+:\/\/([^\/]+).*/, "$1");
                    }
                    if (inPagePost) {
                        let postParams = [], hasCall = false;
                        postMatch[1].replace(/([^\\])&/g, "$1SJ^PARAM").split("SJ^PARAM").forEach(pair => {//ios不支持零宽断言，哭唧唧
                            pair = pair.trim();
                            if (/^loopStart\(\d+\)$/.test(pair)) {
                                let loopStart = pair.match(/loopStart\((.*)\)/);
                                postParams.push(['@loopStart', loopStart[1]]);
                            } else if (pair == "loopEnd") {
                                postParams.push(['@loopEnd', '']);
                            } else if (pair.startsWith("click(") && pair.endsWith(')')) {
                                let click = pair.slice(6, pair.length - 1);
                                if (click) {
                                    postParams.push(['@click', click.replace(/\\([\=&])/g, "$1").trim()]);
                                }
                            } else if (pair.startsWith("dblclick(") && pair.endsWith(')')) {
                                let click = pair.slice(9, pair.length - 1);
                                if (click) {
                                    postParams.push(['@dblclick', click.replace(/\\([\=&])/g, "$1").trim()]);
                                }
                            } else if (pair.startsWith("rclick(") && pair.endsWith(')')) {
                                let click = pair.slice(7, pair.length - 1);
                                if (click) {
                                    postParams.push(['@rclick', click.replace(/\\([\=&])/g, "$1").trim()]);
                                }
                            } else if (pair.startsWith("copy(") && pair.endsWith(')')) {
                                let copy = pair.slice(5, pair.length - 1);
                                if (copy) {
                                    postParams.push(['@copy', copy.replace(/\\([\=&])/g, "$1").trim()]);
                                }
                            } else if (pair.startsWith("call(") && pair.endsWith(')')) {
                                let func = pair.slice(5, pair.length - 1);
                                if (func) {
                                    postParams.push(['@call', func.replace(/\\([\=&])/g, "$1").trim()]);
                                    hasCall = true;
                                }
                            } else if (pair.startsWith("reload(") && pair.endsWith(')')) {
                                let func = pair.slice(7, pair.length - 1);
                                postParams.push(['@reload', func.trim()]);
                            } else if (pair.startsWith("wait(") && pair.endsWith(')')) {
                                let wait = pair.slice(5, pair.length - 1);
                                postParams.push(['@wait', wait.replace(/\\([\=&])/g, "$1").trim()]);
                            } else if (pair.startsWith("open(") && pair.endsWith(')')) {
                                let open = pair.slice(5, pair.length - 1);
                                if (open) {
                                    postParams.push(['@open', open.replace(/\\([\=&])/g, "$1").trim()]);
                                }
                            } else if (/^sleep\(\d+\)$/.test(pair)) {
                                let sleep = pair.match(/sleep\((.*)\)/);
                                if (sleep) {
                                    postParams.push(['@sleep', sleep[1]]);
                                }
                            } else {
                                pair = pair.replace(/([^\\])\=/g, "$1SJ^PARAM").replace(/\\([\=&])/g, "$1");
                                let pairArr = pair.split("SJ^PARAM");
                                if (pairArr.length === 2) {
                                    let k = pairArr[0];
                                    let v = customReplaceKeywords(pairArr[1].replace(/\\([\=&])/g, "$1").replace(/%e\b/g, document.characterSet).replace(/%i\b/g, imgBase64).replace(/%c\b/g, (isMobile?"mobile":"pc")).replace(/%U\b/g, encodeURIComponent(href)).replace(/%υ\b/g, encodeURIComponent(encodeURIComponent(href))).replace(/%h\b/g, _host).replace(/%T\b/g, encodeURIComponent(targetUrl)).replace(/%τ\b/g, encodeURIComponent(encodeURIComponent(targetUrl))).replace(/%b\b/g, targetBaseUrl).replace(/%B\b/g, encodeURIComponent(targetBaseUrl)).replace(/%β\b/g, encodeURIComponent(encodeURIComponent(targetBaseUrl))));
                                    v = customReplaceSingle(v, "%t", targetUrl);
                                    v = customReplaceSingle(v, "%u", href);
                                    postParams.push([k, v]);
                                } else if (pair.endsWith('.click()') || pair.endsWith('.click')) {
                                    postParams.push(['@' + pair.replace(/\.click(\(\))?$/, ''), 'click']);
                                }
                            }
                        });
                        if (hasCall) {
                            self.updateCacheKeywords();
                        }
                        if (resultUrl === "" || resultUrl === location.href) {
                            inPagePostParams = postParams;
                            this.submitAction(postParams);
                            return false;
                        } else {
                            storage.setListItem("inPagePostParams", resultUrl.replace(/^https?:\/\/([^\/:]+).*/, "$1"), postParams);
                        }
                    }
                    resultUrl = customReplaceSingle(resultUrl, "%h", _host);
                    resultUrl = customReplaceSingle(resultUrl, "%t", targetUrl);
                    resultUrl = customReplaceSingle(resultUrl, "%u", href);
                    resultUrl = customReplaceKeywords(resultUrl.replace(/%U\b/g, encodeURIComponent(href)).replace(/%υ\b/g, encodeURIComponent(encodeURIComponent(href))).replace(/%T\b/g, encodeURIComponent(targetUrl)).replace(/%τ\b/g, encodeURIComponent(encodeURIComponent(targetUrl))).replace(/%b\b/g, targetBaseUrl).replace(/%B\b/g, encodeURIComponent(targetBaseUrl)).replace(/%β\b/g, encodeURIComponent(encodeURIComponent(targetBaseUrl))));
                    if (openInNewTab && /^(https?|ftp):/.test(resultUrl)) {
                        ele.setAttribute("target", "_blank");
                        ele.dataset.target = 1;
                    } else {
                        ele.dataset.target = 0;
                    }
                    return resultUrl;
                };
                let targetUrlData;
                let clicked = false;
                let alt, ctrl, meta, shift;
                let action = async e => {
                    delete ele.href;
                    if (!e) e = {};
                    alt = e.altKey;
                    ctrl = e.ctrlKey;
                    meta = e.metaKey;
                    shift = e.shiftKey;
                    if (!alt && !ctrl && !meta && !shift) {
                        if (e.button == 1 || e.button == 2) {
                            alt = false;
                            ctrl = true;
                            meta = false;
                            shift = false;
                        } else if (openInNewTab === 2) {//隱身窗口
                            alt = false;
                            ctrl = true;
                            meta = false;
                            shift = true;
                        } else if (openInNewTab === 3) {//小窗口
                            alt = true;
                            ctrl = false;
                            meta = false;
                            shift = false;
                        } else if (openInNewTab === 4) {//后台标签页
                            alt = false;
                            ctrl = true;
                            meta = false;
                            shift = false;
                        }
                    }
                    if (showTips) {
                        ele.removeAttribute("target");
                        if (tipsData) {
                            if (/^(https?|ftp):/.test(tipsData)) {
                                targetUrlData = tipsData;
                                ele.href = targetUrlData;
                                if (openInNewTab) {
                                    ele.setAttribute("target", "_blank");
                                } else {
                                    ele.setAttribute("target", "_self");
                                }
                            } else {
                                if (/^copy:/.test(tipsData)) {
                                    tipsData = tipsData.replace(/^copy:/, "");
                                }
                                _GM_setClipboard(tipsData);
                            }
                        }
                        ele.dispatchEvent(new Event("actionOver"));
                        return;
                    }
                    clicked = false;
                    targetUrlData = "";
                    targetUrlData = await getUrl();
                    if (/^(https?|ftp):/.test(targetUrlData)) {
                        e.stopPropagation && e.stopPropagation();
                    }
                    if (/^c(opy)?:|^paste:/.test(data.url) || /^javascript:/.test(data.url) || /^\[/.test(data.url) || /[:%]P{/.test(data.url) || (data.charset && data.charset != 'utf-8') || /[:%]p{/.test(data.url)) {
                        if (e.button == 1 || e.button == 2) {
                            clicked = true;
                        }
                    } else {
                        if (!targetUrlData) {
                            //wait for all input stoped
                            if (!self.stopInput) {
                                self.stopInput = true;
                                setTimeout(() => {
                                    self.stopInput = false;
                                }, 1);
                            }
                            return;
                        }
                        ele.href = targetUrlData;
                    }
                    if (self.customInput && targetUrlData) {
                        clicked = true;
                    }
                    ele.dispatchEvent(new Event("actionOver"));
                    if (clicked) {
                        if (e.preventDefault) e.preventDefault();
                        ele.click();
                    }
                };
                let addHistory = () => {
                    let historyLength = Math.max(searchData.prefConfig.historyLength, 20);
                    let isCurrent = ele.dataset.current;
                    if (!data.hideNotMatch && !data.kwFilter && !ele.dataset.clone && !ele.dataset.paste && urlMatch !== '0' && historyLength && !isCurrent) {
                        storage.getItem("historySites", data => {
                            historySites = (data || []);
                            historySites = historySites.filter(site => {return site && site != name});
                            historySites.unshift(name);
                            if (historySites.length > historyLength) {
                                historySites = historySites.slice(0, historyLength);
                            }
                            storage.setItem("historySites", historySites);
                            //self.initHistorySites();
                        });
                    }
                    if (searchData.prefConfig.shiftLastUsedType && !isCurrent) {
                        let parent = ele.parentNode;
                        let dismissHistory = parent && (parent.classList.contains("search-jumper-targetAll") ||
                                                        parent.classList.contains("search-jumper-targetImg") ||
                                                        parent.classList.contains("search-jumper-targetAudio") ||
                                                        parent.classList.contains("search-jumper-targetVideo") ||
                                                        parent.classList.contains("search-jumper-targetLink") ||
                                                        parent.classList.contains("search-jumper-targetPage") ||
                                                        parent.classList.contains("search-jumper-needInPage"));
                        if (!dismissHistory && historyType != ele.dataset.type) {
                            historyType = ele.dataset.type;
                            storage.setItem("historyType", historyType);
                        }
                    }
                    if (searchData.prefConfig.sortType) {
                        storage.getItem("sortTypeNames", data => {
                            sortTypeNames = (data || {});
                            if (!sortTypeNames[ele.dataset.type]) {
                                sortTypeNames[ele.dataset.type] = 1;
                            } else {
                                sortTypeNames[ele.dataset.type] = sortTypeNames[ele.dataset.type] + 1;
                            }
                            storage.setItem("sortTypeNames", sortTypeNames);
                        });
                    }
                    if (searchData.prefConfig.sortSite) {
                        storage.getItem("sortSiteNames", data => {
                            sortSiteNames = (data || {});
                            if (!sortSiteNames[ele.dataset.name]) {
                                sortSiteNames[ele.dataset.name] = 1;
                            } else {
                                sortSiteNames[ele.dataset.name] = sortSiteNames[ele.dataset.name] + 1;
                            }
                            storage.setItem("sortSiteNames", sortSiteNames);
                        });
                    }
                };
                let copyHandler = (inner, str) => {
                    _GM_setClipboard(str);
                    let target = ele;
                    if (!inner) {
                        self.appendBar();
                        self.closeOpenType();
                        self.con.style.display = "";
                        self.setFuncKeyCall(true);
                        if (window.getSelection().toString()) {
                            target = targetElement || ele;
                        } else target = getBody(document);
                        self.tileInput.parentNode && self.tileInput.parentNode.removeChild(self.tileInput);
                    }
                    self.tipsPos(target, i18n('copyOver'));
                    clearTimeout(self.hideTips);
                    self.hideTips = setTimeout(() => {
                        if (self.tips.style.opacity == "1") {
                            self.tips.style.opacity = 0;
                            self.tips.style.pointerEvents = '';
                        }
                    }, 1500);
                };
                let clickHandler = e => {
                    e && e.stopPropagation && e.stopPropagation();
                    if (targetElement) {
                        targetElement.focus && targetElement.focus();
                    }
                    if (showTips && self.waitForShowTips) {
                        showTipsHandler(ele, 0);
                        e && e.preventDefault && e.preventDefault();
                        return false;
                    }
                    clicked = true;
                    if (!targetUrlData) {
                        e && e.preventDefault && e.preventDefault();
                        return false;
                    }
                    if (!e) e = {};
                    let isPage = /^(https?|ftp):/.test(targetUrlData);
                    if (!self.batchOpening && !isBookmark) {
                        addHistory();
                    }
                    if (searchData.prefConfig.multiline == 1 || searchData.prefConfig.multiline == 2) {
                        if (inputString &&
                            wordParamReg.test(ele.dataset.url) &&
                            inputString.indexOf("\n") !== -1 &&
                            !/^(c|show)/.test(ele.dataset.url)) {
                            if (searchData.prefConfig.multiline == 1 ||
                                confirm(i18n("multiline"))) {
                                let selStrArr = inputString.split("\n");
                                if (selStrArr.length > 10 && !confirm(i18n("multilineTooMuch"))) return;
                                let searchIndex = 0;
                                let defaultTarget = ele.target;
                                ele.target = "_blank";
                                let searchByLine = async () => {
                                    targetUrlData = await getUrl(selStrArr[searchIndex++]);
                                    ele.href = targetUrlData;
                                    ele.click();
                                    if (searchIndex < selStrArr.length) {
                                        setTimeout(() => {
                                            searchByLine();
                                        }, searchData.prefConfig.multilineGap || 1000);
                                    } else ele.target = defaultTarget;
                                };
                                searchByLine();
                                ele.href = "";
                                if (e.preventDefault) e.preventDefault();
                                if (e.stopPropagation) e.stopPropagation();
                                return false;
                            }
                        }
                    }
                    if (targetUrlData.indexOf('%input{') !== -1) {
                        self.showCustomInputWindow(targetUrlData, _url => {
                            targetUrlData = _url;
                            ele.href = _url;
                            ele.click();
                        });
                        if (e.preventDefault) e.preventDefault();
                        if (e.stopPropagation) e.stopPropagation();
                        return;
                    }
                    let findWordsMatch = targetUrlData.match(/^find(\.addto\((.*?)\))?:(.*)/);
                    if (findWordsMatch) {
                        if (e.preventDefault) e.preventDefault();
                        if (e.stopPropagation) e.stopPropagation();
                        let addToGroup = findWordsMatch[2];
                        let findWords = findWordsMatch[3];
                        if (!findWords) {
                            return false;
                        } else {
                            if (addToGroup && searchData.prefConfig.inPageRule) {
                                if (addToGroup.indexOf("@") !== 0) addToGroup = "@" + addToGroup;
                            }
                            if (findWords.indexOf('%input{') !== -1) {
                                self.showCustomInputWindow(findWords, _url => {
                                    if (addToGroup) {
                                        self.addToHighlightGroup(_url, addToGroup);
                                    } else {
                                        self.searchJumperInPageInput.value = _url;
                                        self.submitInPageWords();
                                        self.waitForHide(0);
                                    }
                                });
                            } else {
                                if (addToGroup) {
                                    self.addToHighlightGroup(findWords, addToGroup);
                                } else {
                                    self.searchJumperInPageInput.value = findWords;
                                    self.submitInPageWords();
                                    self.waitForHide(0);
                                }
                            }
                        }
                        return false;
                    } else if (/^javascript:/.test(data.url)) {
                        if (ext) {
                            _unsafeWindow.targetElement = targetElement;
                            _unsafeWindow.keywords = getKeywords();
                            let func = (/^javascript:[_a-zA-Z0-9]+$/.test(targetUrlData) && _unsafeWindow[targetUrlData.replace("javascript:", "")]);
                            if (func) {
                                if (e.preventDefault) e.preventDefault();
                                if (e.stopPropagation) e.stopPropagation();
                                func();
                                return false;
                            }
                            ele.href = targetUrlData;
                            return;
                        }
                        if (e.preventDefault) e.preventDefault();
                        if (e.stopPropagation) e.stopPropagation();
                        _unsafeWindow.targetElement = targetElement;
                        _unsafeWindow.keywords = getKeywords();
                        targetUrlData = targetUrlData.replace(/^javascript:/, '');
                        try {
                            targetUrlData = decodeURIComponent(targetUrlData);
                        } catch(e) {}
                        let func = (/^[_a-zA-Z0-9]+$/.test(targetUrlData) && _unsafeWindow[targetUrlData]) || new AsyncFunction(targetUrlData);
                        if (func) func();
                        return false;
                    } else if (/^c(opy)?:/.test(data.url)) {
                        if (e.preventDefault) e.preventDefault();
                        if (e.stopPropagation) e.stopPropagation();
                        if (!targetUrlData) {
                            return false;
                        } else if (targetUrlData.indexOf('%input{') !== -1) {
                            self.showCustomInputWindow(targetUrlData, _url => {
                                copyHandler(true, _url.replace(/^c(opy)?:/, ""));
                            });
                        } else {
                            copyHandler(e.isTrusted, targetUrlData.replace(/^c(opy)?:/, ""));
                        }
                        return false;
                    } else if (/^paste:/.test(data.url)) {
                        let targetInput = false;
                        if (targetElement &&
                            (/INPUT|TEXTAREA/i.test(targetElement.nodeName) &&
                             targetElement.getAttribute("aria-readonly") != "true")
                           ) {
                            targetInput = true;
                        } else {
                            let parent = targetElement;
                            while (parent) {
                                targetInput = parent.contentEditable == 'true';
                                if (targetInput || parent.nodeName.toUpperCase() == 'BODY') {
                                    break;
                                }
                                parent = parent.parentNode;
                            }
                        }
                        if (targetInput) {
                            if (!targetUrlData) {
                                return false;
                            }
                            targetUrlData = targetUrlData.replace(/^paste:/, "");
                            if (targetUrlData.indexOf('%input{') !== -1) {
                                self.showCustomInputWindow(targetUrlData, _url => {
                                    triggerPaste(targetElement, _url);
                                });
                            } else if (targetUrlData) {
                                triggerPaste(targetElement, targetUrlData);
                            } else if (typeof navigator.clipboard.readText !== "undefined") {
                                navigator.clipboard.readText().then((clipboardValue) => {
                                    triggerPaste(targetElement, clipboardValue);
                                });
                            }
                        }
                    } else if (/^\[/.test(data.url)) {
                        if (e.preventDefault) e.preventDefault();
                        if (e.stopPropagation) e.stopPropagation();
                        let siteNames = JSON.parse(data.url);
                        self.batchOpen(siteNames, {button: 2, altKey: alt || e.altKey, ctrlKey: ctrl || e.ctrlKey, shiftKey: shift || e.shiftKey, metaKey: meta || e.metaKey}, openInNewTab === 1);
                        return false;
                    } else if (/[:%]P{/.test(data.url)) {
                        if (e.preventDefault) e.preventDefault();
                        if (e.stopPropagation) e.stopPropagation();
                        if (targetUrlData === false) return false;
                        let postHandler = _url => {
                            let postBody = _url.match(/[:%]P{(.*)}/), postParam = "";
                            if (postBody) {
                                _url = _url.replace(postBody[0], '');
                                postBody = postBody[1];
                                if (postBody.charAt(0) === '"' && postBody.charAt(postBody.length - 1) === '"') {
                                    postParam = postBody.substring(1, postBody.length - 1);
                                } else {
                                    postBody = new URLSearchParams(postBody);
                                    let postDict = {};
                                    postBody.forEach((v, k) => {
                                        postDict[k] = v;
                                    });
                                    postParam = JSON.stringify(postDict);
                                }
                            }
                            _GM_xmlhttpRequest({
                                method: "POST", url: _url, data: postParam,
                                onload: (d) => {
                                    debug(d);
                                    //_GM_notification(i18n("postOver") + d.statusText);
                                },
                                onerror: (e) => {
                                    _GM_notification(i18n("postError") + (e.statusText || e.error));
                                },
                                ontimeout: (e) => {
                                    _GM_notification(i18n("postError") + (e.statusText || e.error));
                                }
                            });
                        }
                        if (targetUrlData.indexOf('%input{') !== -1) {
                            self.showCustomInputWindow(targetUrlData, _url => {
                                postHandler(_url);
                            });
                        } else {
                            postHandler(targetUrlData);
                        }
                        return false;
                    } else if ((data.charset && data.charset != 'utf-8') || /[:%]p{/.test(data.url)) {
                        if (targetUrlData === false) return false;
                        let jumpFrom = data.url.match(/#(j(umpFrom|f)?|from){(.*?)}/);
                        let processPostUrl = _url => {
                            if (jumpFrom) {
                                jumpFrom = jumpFrom[3];
                                if (jumpFrom === '') {
                                    submitByForm(data.charset, _url, '_self');
                                    return '';
                                } else {
                                    storage.setItem("postUrl", [_url, data.charset]);
                                    if (jumpFrom.indexOf("http") !== 0) {
                                        jumpFrom = _url.replace(/(:\/\/.*?\/)[\s\S]*/, "$1" + jumpFrom);
                                    }
                                    _url = jumpFrom;
                                }
                            } else {
                                if (ext) {
                                    _url = `${jumpHtml}#jump{url=${encodeURIComponent(_url.replace(/[:%]p{[\s\S]*/, ''))}&charset=${data.charset}}`;

                                    //storage.setItem("postUrl", [_url + "#from{" + jumpHtml + "}", data.charset]);
                                    //_url = jumpHtml;
                                } else {
                                    storage.setItem("postUrl", [_url, data.charset]);
                                    _url = _url.replace(/(:\/\/.*?)\/[\s\S]*/, "$1").replace(/[:%]p{[\s\S]*/, '');
                                }
                            }
                            return _url;
                        };
                        if (targetUrlData.indexOf('%input{') !== -1) {
                            self.showCustomInputWindow(targetUrlData, _url => {
                                _url = processPostUrl(_url);
                                if (!_url) return;
                                ele.href = _url;
                                if (ele.target === '_blank') {
                                    _GM_openInTab(ele.href, {active: true, insert: true});
                                } else {
                                    location.href = ele.href;
                                }
                            });
                            if (e.preventDefault) e.preventDefault();
                            if (e.stopPropagation) e.stopPropagation();
                            return;
                        } else {
                            targetUrlData = processPostUrl(targetUrlData);
                            if (!targetUrlData) return;
                            ele.href = targetUrlData;
                        }
                    }
                    if (shift && !ctrl && !meta && !alt && e.isTrusted) return;
                    if (/^(chrome|edge|about|extension|moz-extension)/.test(targetUrlData)) {
                        if (e.preventDefault) e.preventDefault();
                        if (e.stopPropagation) e.stopPropagation();
                        if (ctrl) {
                            _GM_openInTab(targetUrlData, {active: false, insert: true});
                        } else {
                            _GM_openInTab(targetUrlData, {active: true, insert: true, close: ele.getAttribute("target") !== "_blank"});
                        }
                        return false;
                    } else if ((alt || ctrl || meta || shift) && isPage) {
                        if ((ctrl || meta) && shift) {
                            _GM_openInTab(targetUrlData, {incognito: true});
                        } else if (ctrl || meta) {
                            _GM_openInTab(targetUrlData, {active: false, insert: true});
                        } else if (alt) {
                            if (data.match) {
                                let match = data.match.replace(/\\/g, "");
                                let mobileMatch = match.match(/\((www)\|([^\)\|]+)/);
                                while (mobileMatch) {
                                    targetUrlData = targetUrlData.replace(mobileMatch[1], mobileMatch[2]);
                                    match = match.replace(mobileMatch[0], "");
                                    mobileMatch = match.match(/\(([^\)\|]+)\|([^\)\|]+)/);
                                }
                            }
                            let viewWidth = window.screen.availWidth || window.innerWidth || document.documentElement.clientWidth;
                            let viewHeight = window.screen.availHeight || window.innerHeight || document.documentElement.clientHeight;
                            let showWidth = searchData.prefConfig.popupWidth, showHeight = searchData.prefConfig.popupHeight, left = searchData.prefConfig.popupLeft, top = searchData.prefConfig.popupTop;
                            if (showHeight) {
                                showHeight = parseFloat(showHeight);
                                showHeight = viewHeight / 100 * showHeight;
                            } else {
                                showHeight = Math.max(viewHeight / 3 * 2, viewHeight - 250);
                            }
                            if (showWidth) {
                                showWidth = parseFloat(showWidth);
                                showWidth = viewWidth / 100 * showWidth;
                            } else {
                                showWidth = Math.min(viewWidth, 650);
                            }
                            if (left) {
                                left = parseFloat(left);
                                left = viewWidth / 100 * left - showWidth / 2;
                            } else {
                                left = viewWidth - showWidth - 30;
                            }
                            if (top) {
                                top = parseFloat(top);
                                top = viewHeight / 100 * top - showHeight / 2;
                            } else {
                                top = (viewHeight - showHeight) / 2;
                            }
                            self.closePopupWindow();
                            self.popupWindow = window.open(targetUrlData + "#searchJumperMin" + (/#p{/.test(data.url) ? 'Post' : ''), "_blank", `width=${showWidth}, height=${showHeight}, location=0, resizable=1, status=0, toolbar=0, menubar=0, scrollbars=0, left=${left}, top=${top}`);
                        } else if (shift) {
                            _GM_openInTab(targetUrlData, {active: true, insert: true});
                        }
                        if (e.preventDefault) e.preventDefault();
                        if (e.stopPropagation) e.stopPropagation();
                        return false;
                    } else if (isPage && ele.getAttribute("target") === "_blank" && !(alt || ctrl || meta || shift) && e.button === 0) {
                        _GM_openInTab(targetUrlData, {active: true, insert: true});
                        if (e.preventDefault) e.preventDefault();
                        if (e.stopPropagation) e.stopPropagation();
                        return false;
                    }
                };
                //ele.href = data.url;
                ele.addEventListener('mousedown', action, true);
                ele.addEventListener('mouseup', e => {
                    if (e.stopPropagation) e.stopPropagation();
                }, true);
                ele.addEventListener('click', clickHandler, true);

                ele.addEventListener('auxclick', e => {
                    if (clicked && e.preventDefault) {
                        e.preventDefault();
                        return false;
                    }
                }, true);

                ele.addEventListener('contextmenu', e => {
                    if (clicked && e.preventDefault) {
                        e.preventDefault();
                        return false;
                    }
                }, true);

                let tipsStr = ele.dataset.name;
                if (shortcut) {
                    tipsStr += ` (${data.ctrl ? "Ctrl + " : ""}${data.shift ? "Shift + " : ""}${data.alt ? "Alt + " : ""}${data.meta ? "Meta + " : ""}${shortcut.replace("Key", "")})`;
                }
                let anylizing = false, tipsShowing = false;
                let setTips = async (target, url, again) => {
                    self.tipsPos(target, '<span class="loader"></span><font>Loading...</font>');
                    tipsShowing = false;
                    if (url) {
                        try {
                            url = url.replace(/^showTips:/, '');
                            anylizing = true;
                            let inputGroup;
                            let setTipsUrl = async (url, force) => {
                                let tipsResult = await self.anylizeShowTips(url, ele.dataset.name, target, inputGroup);
                                anylizing = false;
                                if (!force) {
                                    if (self.tips.style.opacity == 0 || self.tips.innerHTML.indexOf('<span class="loader">') !== 0) {
                                        tipsShowing = true;
                                        return;
                                    }
                                }
                                if (Array && Array.isArray && Array.isArray(tipsResult)) {
                                    tipsData = tipsResult[1];
                                    tipsResult = tipsResult[0];
                                }
                                if (tipsResult) {
                                    if (tipsResult != "null" && tipsResult != "No result") {
                                        tipsResult = `<div>${tipsResult}</div>`;
                                        tipsShowing = true;
                                    }
                                    //self.tips.style.transition = "none";
                                    self.tipsPos(target, tipsResult, inputGroup);
                                    addHistory();
                                    setTimeout(() => {
                                        self.tips.style.pointerEvents = "all";
                                    }, 100);
                                }
                            }

                            if (/%input{/.test(url)) {
                                inputGroup = this.createShowTipsInput(url, async newUrl => {
                                    self.tipsPos(target, '<span class="loader"></span><font>Loading...</font>');
                                    await setTipsUrl(newUrl, true);
                                });
                                if (/%input{[^},]*}/.test(url)) {
                                    url = await this.showCustomInputWindow(url);
                                    if (!url) return;
                                } else {
                                    let inputMatch;
                                    while(inputMatch = url.match(/%input{([^},]+),\s*([^}/]*).*?}/)) {
                                        let inputName = inputMatch[1];
                                        let defaultValue = inputMatch[2];
                                        url = url.replace(inputMatch[0], defaultValue).replaceAll(`input{${inputName}}`, defaultValue);
                                        inputMatch = url.match(/%input{([^},]+),\s*([^}/]*).*?}/);
                                    }
                                }
                            }
                            await setTipsUrl(url);

                        } catch(e) {debug(e)}
                    }
                };
                let showTipsHandler = async (target, time = 1000) => {
                    if (!target || target.nodeType !== 1) return;
                    if (self.preList) {
                        self.preList.style.visibility = "hidden";
                        self.listArrow.style.cssText = "";
                    }
                    tipsData = null;
                    clearTimeout(self.requestShowTipsTimer);
                    self.waitForShowTips = false;
                    self.tipsPos(target, tipsStr);
                    if (showTips) {
                        self.stopInput = true;
                        let url = await getUrl();
                        self.stopInput = false;
                        if (url && self.lastUrl === url) {
                            if (anylizing) {
                                self.tipsPos(target, "<span class='loader'></span><font>Loading...</font>");
                            } else {
                                setTips(target, url);
                            }
                        } else {
                            self.waitForShowTips = true;
                            self.requestShowTipsTimer = setTimeout(async () => {
                                url = url || await getUrl();
                                if (!url) return;
                                self.lastUrl = url;
                                setTips(target, url);
                                self.waitForShowTips = false;
                            }, time);
                        }
                    }
                }
                let touchend = false;
                ele.addEventListener('touchend', e => {
                    if (e.stopPropagation) e.stopPropagation();
                    if (showTips) {
                        touchend = true;
                        self.waitForShowTips = true;
                    }
                }, false);
                let scaleMove = e => {
                    if (self.funcKeyCall || searchData.prefConfig.noAni) return;
                    let leftRight = self.con.classList.contains("search-jumper-left") ||
                            self.con.classList.contains("search-jumper-right");
                    let newDockerScaleBtns = [];
                    let curRect = ele.getBoundingClientRect();
                    let offset = leftRight ? Math.abs(e.clientY - curRect.top) / curRect.height : Math.abs(e.clientX - curRect.left) / curRect.width;
                    let scale1st = 0.1;
                    let scale2nd = 0.1;
                    ele.style.setProperty("--scale", 1 + scale1st + scale2nd);
                    newDockerScaleBtns.push(ele);
                    let pre = ele.previousElementSibling;
                    if (pre && /^A$/i.test(pre.nodeName)) {
                        pre.style.setProperty("--scale", 1 + scale2nd + scale1st * (1 - offset));
                        newDockerScaleBtns.push(pre);
                        let prepre = pre.previousElementSibling;
                        if (prepre && /^A$/i.test(prepre.nodeName)) {
                            prepre.style.setProperty("--scale", 1 + scale2nd * (1 - offset));
                            newDockerScaleBtns.push(prepre);
                        }
                    }
                    let next = ele.nextElementSibling;
                    if (next && /^A$/i.test(next.nodeName)) {
                        next.style.setProperty("--scale", 1 + scale2nd + scale1st * offset);
                        newDockerScaleBtns.push(next);
                        let nextnext = next.nextElementSibling;
                        if (nextnext && /^A$/i.test(nextnext.nodeName)) {
                            nextnext.style.setProperty("--scale", 1 + scale2nd * offset);
                            newDockerScaleBtns.push(nextnext);
                        }
                    }
                    self.dockerScaleBtns.forEach(btn => {
                        if (newDockerScaleBtns.indexOf(btn) === -1) {
                            btn.style.setProperty("--scale", 1);
                        }
                    });
                    self.dockerScaleBtns = newDockerScaleBtns;
                };
                ele.addEventListener('mouseenter', e => {
                    if (e.stopPropagation) e.stopPropagation();
                    if (tipsShowing && self.lastTips === ele && self.tips.style.opacity == 1) {
                        return;
                    }
                    self.lastTips = ele;
                    if (showTips) {
                        if (touchend) {
                            touchend = false;
                            return;
                        }
                        if (hasWordParam) {
                            let keywords = self.searchJumperInputKeyWords.value || self.tileInput.value || getKeywords();
                            if (!keywords) {
                                self.waitForShowTips = true;
                                self.tipsPos(ele, tipsStr);
                                return;
                            }
                        }
                    }
                    showTipsHandler(ele);
                }, true);
                ele.addEventListener('mousemove', e => {
                    scaleMove(e);
                    self.clingPos(ele, self.tips);
                }, false);
                ele.addEventListener('showTips', e => {
                    self.waitForHide(0);
                    self.appendBar();
                    self.closeOpenType();
                    self.con.style.display = "";
                    //self.setFuncKeyCall(true);
                    showTipsHandler(e.detail || targetElement, 0);
                }, false);
                ele.addEventListener('mouseleave', e => {
                    if (!tipsShowing) {
                        self.tips.style.opacity = 0;
                        self.tips.style.pointerEvents = '';
                        clearTimeout(self.requestShowTipsTimer);
                    }
                }, false);
                ele.addEventListener('drop', e => {
                    self.searchBySiteName(name, e);
                }, false);
                ele.addEventListener('dragover', e => {
                    e.preventDefault();
                }, false);
                return ele;
            }

            closePopupWindow() {
                if (!searchData.prefConfig.closePopupWhenClick) return;
                if (this.popupWindow) {
                    this.popupWindow.close();
                    this.popupWindow = null;
                }
            }

            closeOpenType() {
                let openType = this.bar.querySelector('.search-jumper-type.search-jumper-open>span');
                if (openType) {
                    this.funcKeyCall = false;
                    if (openType.onmouseup) {
                        openType.onmouseup();
                    } else {
                        let mouseEvent = new PointerEvent("mouseup");
                        openType.dispatchEvent(mouseEvent);
                    }
                }
            }

            addToHighlightGroup(findWords, addToGroup) {
                let group = searchData.prefConfig.inPageRule[addToGroup];
                if (group) {
                    let groupMatch = group.match(/^\/(.*)\/([il]*)$/);
                    if (groupMatch) {
                        group = `/${groupMatch[1]}|${findWords}/${groupMatch[2] || ''}`;
                    } else group = `/${group}|${findWords}/`;
                } else {
                    group = `/${findWords}/`;
                }
                searchData.prefConfig.inPageRule[addToGroup] = group;
                storage.setItem("searchData", searchData);
                this.refreshPageWords(this.lockWords);
            }

            streamUpdate(data) {
                this.streamUpdateCallBack && this.streamUpdateCallBack(data);
            }

            createShowTipsInput(content, cb) {
                let group = document.createElement('div');
                group.className = 'showTips-inputGroup';
                let tempUrl = content;
                let inputChildren = [];

                let geneFinalUrl = () => {
                    let finalValue = tempUrl;
                    let index = 0;
                    [].forEach.call(inputChildren, ele => {
                        let value;
                        if (ele.className == "select") {
                            value = ele.children[0].value;
                        } else value = ele.value;
                        finalValue = finalValue.replaceAll('◎' + index, value || '');
                        index++;
                    });
                    cb(finalValue);
                };

                let inputMatch = tempUrl.match(/%input{(.*?[^\\])}/);
                let index = 0;
                while (inputMatch) {
                    let param = inputMatch[1];
                    let inputTitle = document.createElement('div');
                    inputTitle.className = 'showTips-input-title';
                    if (/^".*","/.test(param)) {
                        param = param.substr(1, param.length - 2).split('","');
                    } else {
                        param = param.replace(/\\,/g, "◎SJ").split(",").map(str => str.replace(/◎SJ/g, ","));
                    }
                    if (param.length === 1) {//input
                        param = param[0].replace(/\\\|/g, "◎SJ").split("|").map(str => str.replace(/◎SJ/g, "|"));
                        let pa = document.createElement('div');
                        inputTitle.innerText = param[0];
                        pa.appendChild(inputTitle);
                        let paramInput = document.createElement('input');
                        paramInput.type = 'text';
                        if (param.length > 1) paramInput.title = param[1];
                        pa.appendChild(paramInput);
                        group.appendChild(pa);
                        inputChildren.push(paramInput);
                    } else if (param.length >= 2) {//select
                        let titleSplit = param[0].replace(/\\}/g, "}");
                        if (/^'.*'\/'/.test(titleSplit)) {
                            titleSplit = titleSplit.substr(1, titleSplit.length - 2).split("'/'");
                        } else {
                            titleSplit = titleSplit.replace(/\\\//g, "◎SJ").split("/").map(str => str.replace(/◎SJ/g, "/"));
                        }
                        let optionSplit = param.slice(1).join(",");
                        if (/^'.*'\/'/.test(optionSplit)) {
                            optionSplit = optionSplit.substr(1, optionSplit.length - 2).split("'/'");
                        } else {
                            optionSplit = optionSplit.replace(/\\\//g, "◎SJ").split("/").map(str => str.replace(/◎SJ/g, "/"));
                        }
                        let singleTitle = titleSplit.length === optionSplit.length + 1;
                        let pa = document.createElement('div');
                        inputTitle.innerText = titleSplit[0];
                        pa.appendChild(inputTitle);
                        let paramSelectInput = document.createElement('input');
                        paramSelectInput.type = "text";
                        paramSelectInput.value = optionSplit[0];
                        let paramSelect = document.createElement('div');
                        paramSelect.className = "select";
                        paramSelect.appendChild(paramSelectInput);

                        let selectTips = document.createElement('p');
                        selectTips.innerText = '';
                        paramSelect.appendChild(selectTips);

                        let options = document.createElement('div');
                        options.className = "options";
                        paramSelect.appendChild(options);

                        let option = document.createElement("p");
                        option.setAttribute("value", "");
                        option.innerHTML = createHTML('<b>Select option</b>');
                        options.appendChild(option);
                        option.addEventListener("click", e => {
                            options.style.visibility = "hidden";
                            setTimeout(() => {
                                options.style.visibility = "";
                            }, 0);
                            paramSelectInput.value = "";
                            selectTips.innerText = 'Select option';
                        });

                        for (let i = 0; i < optionSplit.length; i++) {
                            let value = optionSplit[i];
                            let option = document.createElement("p");
                            option.setAttribute("value", value);
                            if (singleTitle) {
                                let title = titleSplit[i + 1];
                                title = title.replace(/\\\|/g, "◎SJ").split("|").map(str => str.replace(/◎SJ/g, "|"));
                                option.innerText = title[0];
                                if (title.length > 1) {
                                    option.title = title[1];
                                }
                            } else {
                                option.innerText = value;
                            }
                            option.addEventListener("click", e => {
                                options.style.visibility = "hidden";
                                setTimeout(() => {
                                    options.style.visibility = "";
                                }, 0);
                                paramSelectInput.value = option.getAttribute("value");
                                selectTips.innerText = '';
                            });
                            options.appendChild(option);
                        }
                        paramSelectInput.addEventListener("change", e => {
                            selectTips.innerText = '';
                        });
                        paramSelect.addEventListener("mouseenter", e => {
                            paramSelect.focus();
                            const rect = paramSelect.getBoundingClientRect();
                            options.style.top = `${rect.bottom}px`;
                            options.style.left = `${rect.left}px`;
                            options.style.width = `${rect.width}px`;
                        });
                        pa.appendChild(paramSelect);
                        group.appendChild(pa);
                        inputChildren.push(paramSelect);
                    }
                    tempUrl = tempUrl.replace(inputMatch[0], '◎' + index).replaceAll(`input{${inputTitle.innerText}}`, '◎' + index);
                    index++;
                    inputMatch = tempUrl.match(/%input{(.*?[^\\])}/);
                }
                if (group.children.length) {
                    let searchBtn = document.createElement('div');
                    searchBtn.className = 'searchBtn';
                    searchBtn.innerHTML = createHTML(searchSvg);
                    searchBtn.addEventListener("click", e => {
                        geneFinalUrl();
                    });
                    group.appendChild(searchBtn);
                }
                return group;
            }

            async anylizeShowTips(data, name, target, inputGroup) {
                let tipsResult, self = this;
                try {
                    const calcReg = /([^\\]|^)([\+\-*/])([\d\.]+)$/;
                    const cacheReg = /\|cache\=(\d+)$/;
                    const postReg = /%p(\{+)/;
                    const headersReg = /#headers({.*?})/;
                    const streamReg = /#stream({(.*?)})?/;
                    const thenReg = /.then{(.*?)}/;
                    data = data.replace(/^showTips:/, '').replace(/{name}/g, name).trim();
                    if (/^https?:/.test(data)) {
                        let url = data.split("\n");
                        if (url.length == 1) url = data.split(" ");
                        url = url[0].replace(/【SearchJumperBreak】/g, "\n");
                        data = data.replace(/【SearchJumperBreak】/g, "\n").replace(url, "").trim().replace(/\\{/g, "showTipsLeftBrace").replace(/\\}/g, "showTipsRightBrace").replace(/{url}/g, '【SEARCHJUMPERURL】');
                        let cache = url.match(cacheReg);
                        if (cache) {
                            cache = parseInt(cache[1]);
                            url = url.replace(cacheReg, "");
                        } else cache = 7200;
                        let now = Date.now() / 1000;
                        let newTipsStorage = tipsStorage.filter(t => {
                            if (now < t.time) {
                                if (!tipsResult && t.url == url) {
                                    tipsResult = t.data;
                                }
                                return true;
                            }
                            return false;
                        });
                        if (newTipsStorage.length != tipsStorage.length) {
                            tipsStorage = newTipsStorage;
                            storage.setItem("tipsStorage", tipsStorage);
                        }

                        let allValue = [];
                        let calcJson = (json, template) => {
                            let finalData = data, allFailed = true;
                            while (template) {
                                let templateArr = template[1].replace(/\\\|/g, "【searchJumperJsonSplit】").split("|");
                                let props = templateArr[0].replace(/【searchJumperJsonSplit】/g, "|").replace(/\[(\d+)\]/g, ".$1").replace(/\[all\]/g, ".all").split("."), value = json, arrayValue = null;
                                props.shift();
                                props.forEach(prop => {
                                    if (arrayValue) {
                                        let tempArray = [];
                                        for (let i = 0; i < arrayValue.length; i++) {
                                            let curValue = arrayValue[i];
                                            if (curValue) {
                                                if (Array.isArray(curValue)) {
                                                    curValue = curValue.at ? curValue.at(prop) : curValue[prop];
                                                } else curValue = curValue[prop];
                                            }
                                            tempArray.push(curValue);
                                        }
                                        arrayValue = tempArray;
                                    } else {
                                        if (value) {
                                            if (Array.isArray(value)) {
                                                if (prop === 'all') {
                                                    arrayValue = value;
                                                } else {
                                                    value = value.at ? value.at(prop) : value[prop];
                                                }
                                            } else value = value[prop];
                                        }
                                        if (!value) return null;
                                    }
                                });
                                if (arrayValue) {
                                    value = arrayValue.join("");
                                }
                                if (templateArr.length != 1) {
                                    let calcStr = templateArr[1];
                                    let needCalc = calcStr.match(calcReg);
                                    if (needCalc) {
                                        let calcArr = [];
                                        while (needCalc) {
                                            calcStr = calcStr.replace(calcReg, "$1");
                                            calcArr.unshift([needCalc[2], needCalc[3]]);
                                            needCalc = calcStr.match(calcReg);
                                        }
                                        calcArr.forEach(calc => {
                                            let param = parseFloat(calc[1]);
                                            switch (calc[0]) {
                                                case "+":
                                                    value += param;
                                                    break;
                                                case "-":
                                                    value -= param;
                                                    break;
                                                case "*":
                                                    value *= param;
                                                    break;
                                                case "/":
                                                    value /= param;
                                                    break;
                                            }
                                        });
                                        value = value.toFixed(2);
                                    } else {
                                        let fullReg = calcStr.match(/^\/(.*)\/(\w?)$/);
                                        let regGroup = fullReg ? new RegExp(fullReg[1], fullReg[2]) : new RegExp(calcStr);
                                        let valueMatch = value.match(regGroup);
                                        if (valueMatch) {
                                            value = valueMatch[1];
                                        }
                                    }
                                }
                                if (!value) value = "";
                                else allFailed = false;
                                allValue.push(value);
                                finalData = finalData.replace(template[0], value);
                                template = finalData.match(/{(.*?)}/);
                            }
                            if (allFailed) {
                                console.log("Error:", json);
                            }
                            finalData = finalData.replace(/showTipsLeftBrace/g, "{").replace(/showTipsRightBrace/g, "}");
                            return finalData;
                        }

                        let template = data.match(/{(.*?)}/);
                        if (tipsResult) {
                            if (template && template[1].indexOf("json") === 0) {
                                data = data.replace(/【SEARCHJUMPERURL】/g, url);
                                tipsResult = calcJson(tipsResult, template);
                                tipsResult = [tipsResult, "\n" + allValue.join(",")];
                            }
                        } else {
                            let storeData;
                            let postMatch = url.match(postReg), fetchOption = {}, _url = url;
                            if (postMatch) {
                                let braceNum = postMatch[1].length;
                                postMatch = url.match(new RegExp(`%p\\{+([\\s\\S]*?)\\}{${braceNum}}`));
                                if (postMatch) {
                                    let body = postMatch[1].replace(/\n/g, "\\n");
                                    if (body.indexOf("%") === 0) {
                                        try {
                                            body = decodeURIComponent(body);
                                        } catch(e) {}
                                    }
                                    fetchOption.body = body;
                                    fetchOption.method = "POST";
                                    _url = _url.replace(postMatch[0], "");
                                }
                            }
                            let headersMatch = url.match(headersReg);
                            if (headersMatch) {
                                let headers = headersMatch[1];
                                if (headers.indexOf("%") === 0 || headers.indexOf("%") === 1) {
                                    try {
                                        headers = decodeURIComponent(headers);
                                    } catch(e) {}
                                }
                                fetchOption.headers = JSON.parse(headers);
                                _url = _url.replace(headersMatch[0], "");
                            }

                            let failed = false, fetchData;
                            let isJson = (template && template[1].indexOf("json") === 0);
                            let streamMatch = url.match(streamReg);
                            if (streamMatch) {
                                fetchOption.responseType = "stream";
                                fetchOption.streamMode = streamMatch[2] || "concat";
                                _url = _url.replace(streamMatch[0], "");
                                tipsResult = await new Promise(resolve => {
                                    fetchOption.onstream = data => {
                                        let result;
                                        if (isJson) {
                                            result = data.json();
                                            if (!result) return;
                                            result = calcJson(result, template);
                                        } else result = data.text;
                                        self.tipsPos(target, result, inputGroup);
                                        self.tips.style.pointerEvents = "all";
                                        resolve && resolve(result);
                                    };
                                    if (ext) {
                                        self.streamUpdateCallBack = data => {
                                            let result;
                                            if (isJson) {
                                                if (!data.json) return;
                                                result = calcJson(data.json, template);
                                            } else result = data.text;
                                            self.tipsPos(target, result, inputGroup);
                                            self.tips.style.pointerEvents = "all";
                                            resolve && resolve(result);
                                        };
                                        fetchData = new Promise((resolve) => {
                                            chrome.runtime.sendMessage({action: "showTips", detail: {from: url + `\n{${template[1]}}`}}, function(r) {
                                                data = data.replace(/【SEARCHJUMPERURL】/g, (r && r.finalUrl) || "");
                                                resolve(isJson ? r.json : r.text);
                                            });
                                        });
                                    } else {
                                        fetchData = GM_fetch(_url, fetchOption).then(r => {
                                            data = data.replace(/【SEARCHJUMPERURL】/g, r.finalUrl);
                                            return isJson ? r.json() : r.text;
                                        });
                                    }
                                    fetchData.then(r => {
                                        let finalData = isJson ? (r && calcJson(r, template)) : r;
                                        if (!finalData) return;
                                        self.tipsPos(target, finalData, inputGroup);
                                        resolve && resolve(finalData);
                                    });
                                });
                                if (!tipsResult) {
                                    tipsResult = "No result";
                                    failed = true;
                                }
                            } else if (isJson) {
                                let allValue = [];
                                if (ext) {
                                    fetchData = new Promise((resolve) => {
                                        chrome.runtime.sendMessage({action: "showTips", detail: {from: url + `\n{${template[1]}}`}}, function(r) {
                                            data = data.replace(/【SEARCHJUMPERURL】/g, (r && r.finalUrl) || "");
                                            resolve((r && r.data) || "");
                                        });
                                    });
                                } else {
                                    fetchData = GM_fetch(_url, fetchOption).then(r => {
                                        data = data.replace(/【SEARCHJUMPERURL】/g, r.finalUrl);
                                        return r.json();
                                    });
                                }
                                tipsResult = await fetchData.then(r => {
                                    if (!r) return null;
                                    storeData = r;
                                    let finalData = calcJson(r, template);
                                    return finalData;
                                });
                                if (!tipsResult) {
                                    tipsResult = "No result";
                                    failed = true;
                                }
                                tipsResult = [tipsResult, "\n" + allValue.join(",")];
                            } else {
                                let hasData = false;
                                let thenMatch = _url.match(thenReg), thenEleSelArr = [];
                                while (thenMatch) {
                                    let thenEleSel = thenMatch[1];
                                    thenEleSelArr.push(thenEleSel);
                                    _url = _url.replace(thenMatch[0], "");
                                    thenMatch = _url.match(thenReg);
                                }
                                if (ext) {
                                    fetchData = new Promise((resolve) => {
                                        chrome.runtime.sendMessage({action: "showTips", detail: {from: url + `\n `}}, function(r) {
                                            if (data.indexOf('【SEARCHJUMPERURL】') != -1) {
                                                data = data.replace(/【SEARCHJUMPERURL】/g, (r && r.finalUrl) || "");
                                                hasData = true;
                                            }
                                            resolve((r && r.data) || "");
                                        });
                                    });
                                    while (thenEleSelArr.length) {
                                        let thenEleSel = thenEleSelArr.shift();
                                        let thenUrl = await fetchData.then(r => {
                                            let doc = document.implementation.createHTMLDocument('');
                                            doc.documentElement.innerHTML = createHTML(r);
                                            let ele = getElement(thenEleSel, doc);
                                            if (!ele) return null;
                                            let basepath = doc.querySelector("base");
                                            return canonicalUri(ele.getAttribute("href"), (basepath ? basepath.href : _url));
                                        });

                                        if (thenUrl) {
                                            fetchData = new Promise((resolve) => {
                                                chrome.runtime.sendMessage({action: "showTips", detail: {from: thenUrl + `\n `}}, function(r) {
                                                    resolve((r && r.data) || "");
                                                });
                                            });
                                        } else return "No result";
                                    }
                                } else {
                                    fetchData = GM_fetch(_url, fetchOption).then(r => {
                                        if (data.indexOf('【SEARCHJUMPERURL】') != -1) {
                                            data = data.replace(/【SEARCHJUMPERURL】/g, r.finalUrl);
                                            hasData = true;
                                        }
                                        return r.text();
                                    });
                                    while (thenEleSelArr.length) {
                                        let thenEleSel = thenEleSelArr.shift();
                                        let thenUrl = await fetchData.then(r => {
                                            let doc = document.implementation.createHTMLDocument('');
                                            doc.documentElement.innerHTML = createHTML(r);
                                            let ele = getElement(thenEleSel, doc);
                                            if (!ele) return null;
                                            let basepath = doc.querySelector("base");
                                            return canonicalUri(ele.getAttribute("href"), (basepath ? basepath.href : _url));
                                        });

                                        if (thenUrl) {
                                            fetchData = GM_fetch(thenUrl).then(r => {
                                                return r.text();
                                            });
                                        } else return "No result";
                                    }
                                }
                                let title;
                                tipsResult = await fetchData.then(r => {
                                    if (!data) {
                                        return r;
                                    }
                                    let doc = document.implementation.createHTMLDocument('');
                                    doc.documentElement.innerHTML = createHTML(r);
                                    title = doc.title;
                                    let finalData = data;
                                    while (template) {
                                        let value = "";
                                        if (template[1] == "title") {
                                            value = doc.title;
                                        } else {
                                            let selArr = template[1].split("|");
                                            let eles = getAllElements(selArr[0], doc);
                                            if (eles && eles.length) {
                                                hasData = true;
                                                if (selArr.length == 1) {
                                                    value = eles[0].innerText;
                                                } else {
                                                    let key = selArr[1];
                                                    let forEachMatch = key.match(/\(.*?\)/g);
                                                    if (forEachMatch) {
                                                        [].forEach.call(eles, ele => {
                                                            let _v = selArr[1];
                                                            forEachMatch.forEach(p => {
                                                                if (p === "()") {
                                                                    _v = _v.replace(p, ele.innerText);
                                                                } else {
                                                                    key = p.match(/\((.*)\)/)[1];
                                                                    _v = _v.replace(p, ele.getAttribute(key) || ele[key]);
                                                                }
                                                            });
                                                            value += _v;
                                                        });
                                                    } else {
                                                        value = eles[0].getAttribute(key) || eles[0][key];
                                                    }
                                                }
                                            }
                                        }
                                        finalData = finalData.replace(template[0], value);
                                        template = finalData.match(/{(.*?)}/);
                                    }
                                    if (!hasData) return null;
                                    finalData = finalData.replace(/showTipsLeftBrace/g, "{").replace(/showTipsRightBrace/g, "}");
                                    return finalData;
                                });
                                if (!tipsResult) {
                                    tipsResult = "No result";
                                    failed = true;
                                } else {
                                    this.insertHistoryUrl(url, title);
                                }
                                tipsResult = [tipsResult, url];
                                storeData = tipsResult;
                            }
                            if (!failed) {
                                tipsResult = this.calcResult(tipsResult);
                                tipsStorage.push({url: url, data: storeData, time: Date.now() / 1000 + cache});
                                if (tipsStorage.length > 50) tipsStorage.shift();
                                storage.setItem("tipsStorage", tipsStorage);
                            }
                        }
                    } else {
                        data = data.replace(/【SearchJumperBreak】/g, "\n")
                        tipsResult = /\breturn\b/.test(data) ? await new AsyncFunction('fetch', 'storage', 'name', '"use strict";' + data)(GM_fetch, storage, name) : data;
                        tipsResult = this.calcResult(tipsResult);
                        if (targetElement && targetElement.href) {
                            let newTitle = targetElement.title || targetElement.alt || targetElement.innerText;
                            this.insertHistoryUrl(targetElement.href, newTitle);
                        }
                    }
                } catch(e) {debug(e)}
                return tipsResult;
            }

            calcResult(result) {
                let isString = typeof result === 'string';
                let str = isString ? result : result[0];
                const calcRegFull = /{([\d\.]+)(([\+\-*/][\d\.]+)+)}/;
                const calcRegOperate = /([\+\-*/])([\d\.]+)/;
                let needCalc = str.match(calcRegFull);
                if (needCalc) {
                    let calcArr = [];
                    let fullMatch = needCalc[0];
                    let value = parseFloat(needCalc[1]);
                    let calcStr = needCalc[2];
                    needCalc = calcStr.match(calcRegOperate);
                    while (needCalc) {
                        calcStr = calcStr.replace(needCalc[0], "");
                        calcArr.push([needCalc[1], needCalc[2]]);
                        needCalc = calcStr.match(calcRegOperate);
                    }
                    calcArr.forEach(calc => {
                        let param = parseFloat(calc[1]);
                        switch (calc[0]) {
                            case "+":
                                value += param;
                                break;
                            case "-":
                                value -= param;
                                break;
                            case "*":
                                value *= param;
                                break;
                            case "/":
                                value /= param;
                                break;
                        }
                    });
                    value = value.toFixed(2);
                    str = str.replace(fullMatch, value);
                }
                if (isString) {
                    result = str;
                } else {
                    result[0] = str;
                }
                return result;
            }

            insertHistoryUrl(url, title) {
                if (url.indexOf(location.host) === -1) return;
                let curUrl = location.href;
                let oldTitle = document.title;
                _unsafeWindow.history.pushState('', title, url);
                document.title = title;
                _unsafeWindow.history.replaceState('', oldTitle, curUrl);
                document.title = oldTitle;
            }

            checkScroll(noIntoView, noSmooth) {
                if (this.funcKeyCall || this.bar.style.display == "none") return;
                let viewWidth = window.innerWidth || document.documentElement.clientWidth;
                let viewHeight = window.innerHeight || document.documentElement.clientHeight;
                if (this.bar.scrollWidth > viewWidth || this.bar.scrollHeight > viewHeight) {
                    if (!this.con.classList.contains("search-jumper-scroll")) {
                        this.bar.style.cssText = "";
                        this.con.classList.add("search-jumper-scroll");
                        this.con.style.display = "";
                    }
                } else {
                    if (this.con.classList.contains("search-jumper-scroll")) {
                        this.bar.style.cssText = "";
                        this.con.classList.remove("search-jumper-scroll");
                    }
                }
                if (noIntoView) return;
                let firstType = this.bar.querySelector(".search-jumper-type.search-jumper-open");
                if (firstType) {
                    if (firstType.style.width === "0px") {
                        firstType.style.width = "auto";
                    }
                    if (firstType.style.height === "0px") {
                        firstType.style.height = "auto";
                    }
                    if (firstType != this.bar.firstElementChild) {
                        setTimeout(() => {
                            firstType.scrollIntoView(noSmooth ? {} : {behavior: "smooth"});
                        }, 0);
                    }
                }
            }

            reopenType(type) {
                let mouseEvent = new PointerEvent("mouseup");
                if (type.parentNode.classList.contains('search-jumper-open')) {
                    if (type.onmouseup) type.onmouseup();
                    else {
                        type.dispatchEvent(mouseEvent);
                    }
                }
                if (type.onmouseup) type.onmouseup();
                else {
                    type.dispatchEvent(mouseEvent);
                }
            }

            showInPage(_funcKeyCall, e) {
                if (this.contains(targetElement) || (this.inInput && mainStyleEle) || (!_funcKeyCall && this.funcKeyCall)) {
                    return;
                }
                if (!mainStyleEle || !mainStyleEle.parentNode) {
                    mainStyleEle = _GM_addStyle(cssText);
                    if (!disabled) this.addToShadow(mainStyleEle);
                }
                let selectStr = getSelectStr();
                if (_funcKeyCall && selectStr && selectStr.length < (searchData.prefConfig.limitPopupLen || 1)) return;
                if (this.con && this.con.classList.contains("search-jumper-showall")) return;
                if (searchData.prefConfig.hidePopup) _funcKeyCall = false;
                if (!targetElement) targetElement = getBody(document);
                else if (!selectStr && targetElement != getBody(document) && (targetElement.className != "searchJumper" || !/^MARK$/i.test(targetElement.nodeName))) {
                    let _targetElement = targetElement, children;
                    while (_targetElement && _targetElement.nodeName) {
                        if (/^(img|audio|video|a)$/i.test(_targetElement.nodeName)) break;
                        if (_targetElement.parentNode) {
                            if (/^(img|audio|video|a)$/i.test(_targetElement.parentNode.nodeName)) {
                                _targetElement = _targetElement.parentNode;
                                break;
                            }
                            children = _targetElement.parentNode.querySelectorAll("audio,video");
                            if (children && children.length !== 1) {
                                children = _targetElement.parentNode.querySelectorAll("img");
                            }
                            if (children && children.length !== 1) {
                                children = _targetElement.parentNode.querySelectorAll("a");
                            }
                            if (children && children.length === 1) {
                                if (children[0].scrollHeight && _targetElement.scrollHeight / children[0].scrollHeight < 2) {
                                    _targetElement = children[0];
                                }
                                break;
                            }
                        }
                        _targetElement = _targetElement.parentNode;
                    }
                    if (_targetElement) targetElement = _targetElement;
                }
                this.appendBar();
                let self = this;
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                }
                var delay = searchData.prefConfig.autoDelay || 1000;
                var hideHandler = () => {
                    self.bar.classList.remove("search-jumper-isInPage");
                    self.bar.classList.remove("search-jumper-isTargetImg");
                    self.bar.classList.remove("search-jumper-isTargetAudio");
                    self.bar.classList.remove("search-jumper-isTargetVideo");
                    self.bar.classList.remove("search-jumper-isTargetLink");
                    self.bar.classList.remove("search-jumper-isTargetPage");
                    self.bar.classList.remove("initShow");
                    self.hideTimeout = null;
                };
                if (searchData.prefConfig.autoHide) this.hideTimeout = setTimeout(hideHandler, delay);
                this.bar.classList.remove("search-jumper-isInPage");
                this.bar.classList.remove("search-jumper-isTargetImg");
                this.bar.classList.remove("search-jumper-isTargetAudio");
                this.bar.classList.remove("search-jumper-isTargetVideo");
                this.bar.classList.remove("search-jumper-isTargetLink");
                this.bar.classList.remove("search-jumper-isTargetPage");
                this.bar.classList.remove("initShow");
                this.tips.style.opacity = 0;
                this.tips.style.display = "none";
                this.tips.style.transition = "none";
                this.tips.innerHTML = createHTML("");
                setTimeout(() => {this.bar.classList.add("initShow");}, 10);
                let typeSel = "", secondType = "";
                if (selectStr) {
                    this.bar.classList.add("search-jumper-isInPage");
                    if (this.bar.style.display == "none" || _funcKeyCall) {
                        typeSel = "needInPage";
                    } else {
                        let openType = this.bar.querySelector(".search-jumper-type.search-jumper-open");
                        if (!openType || openType.classList.contains('notmatch') ||
                            openType.classList.contains('search-jumper-targetPage') ||
                            openType.classList.contains('search-jumper-targetImg') ||
                            openType.classList.contains('search-jumper-targetAudio') ||
                            openType.classList.contains('search-jumper-targetVideo') ||
                            openType.classList.contains('search-jumper-targetLink')) {
                            typeSel = "needInPage";
                        }
                    }
                } else {
                    if (targetElement.children.length == 1 && targetElement.children[0].nodeName.toUpperCase() === 'A') {
                        targetElement = targetElement.children[0];
                    }
                    switch (targetElement.nodeName.toUpperCase()) {
                        case 'IMG':
                            this.bar.classList.add("search-jumper-isTargetImg");
                            typeSel = "targetImg";
                            break;
                        case 'AUDIO':
                            this.bar.classList.add("search-jumper-isTargetAudio");
                            typeSel = "targetAudio";
                            break;
                        case 'VIDEO':
                            this.bar.classList.add("search-jumper-isTargetVideo");
                            typeSel = "targetVideo";
                            break;
                        case 'A':
                            this.bar.classList.add("search-jumper-isTargetLink");
                            typeSel = "targetLink";
                            break;
                        default:
                            break;
                    }
                    let parentNode = targetElement.parentNode;
                    if (parentNode && parentNode.nodeName.toUpperCase() === 'A') {
                        this.bar.classList.add("search-jumper-isTargetLink");
                        if (!typeSel) {
                            typeSel = "targetLink";
                        } else secondType = "targetLink";
                    }
                    if (!typeSel) {
                        this.bar.classList.add("search-jumper-isTargetPage");
                        typeSel = "targetPage";
                    }
                    if (!typeSel) {
                        typeSel = "targetAll";
                    }
                }
                if (this.bar.style.display == "none") {
                    this.bar.style.display = "";
                }
                let firstType, targetSiteImgs;
                if (typeSel) {
                    firstType = this.bar.querySelector(`.search-jumper-${typeSel}:not(.notmatch)>span`);
                    targetSiteImgs = this.bar.querySelectorAll(`.search-jumper-${typeSel}:not(.notmatch)>a>img`);
                }
                self.setFuncKeyCall(false);
                if (firstType) {
                    if ((!searchData.prefConfig.disableAutoOpen && !searchData.prefConfig.disableTypeOpen) || _funcKeyCall) {
                        let targetTypes = this.bar.querySelectorAll(`.search-jumper-${typeSel}:not(.notmatch)>span:first-child`);
                        [].forEach.call(targetTypes, type => {
                            if (type !== firstType) {
                                self.reopenType(type);
                            }
                        });
                        self.reopenType(firstType);
                        self.insertHistory(firstType.parentNode);
                        if (secondType) {
                            targetTypes = this.bar.querySelectorAll(`.search-jumper-${secondType}:not(.notmatch)>span:first-child`);
                            [].forEach.call(targetTypes, type => {
                                if (type !== firstType) {
                                    self.reopenType(type);
                                }
                            });
                            self.reopenType(firstType);
                        }
                    }
                }
                if (!_funcKeyCall && (searchData.prefConfig.disableAutoOpen || searchData.prefConfig.disableTypeOpen)) {
                    this.closeOpenType();
                }
                self.setFuncKeyCall(_funcKeyCall);
                if (_funcKeyCall) {
                    if (targetSiteImgs) {
                        [].forEach.call(targetSiteImgs, siteImg => {
                            if (siteImg.parentNode.style.display != "none" && siteImg.dataset.src) {
                                siteImg.src = siteImg.dataset.src;
                                delete siteImg.dataset.src;
                            }
                        });
                    }
                    self.con.classList.remove("search-jumper-scroll");
                    self.bar.style.cssText = "";
                    self.con.style.cssText = "";
                    let viewWidth = window.innerWidth || document.documentElement.clientWidth;
                    let scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
                    let viewHeight = window.innerHeight || document.documentElement.clientHeight;
                    let tileOffset = searchData.prefConfig.tileOffset || 0;
                    let _clientX = pageX(e) - self.bar.clientWidth / 2 - (getComputedStyle(document.documentElement).position !== 'static' ? document.documentElement.offsetLeft : 0);
                    if (_clientX < 0) _clientX = 5;
                    else if (_clientX + self.bar.clientWidth > viewWidth + scrollLeft) _clientX = viewWidth + scrollLeft - self.bar.clientWidth - 20;
                    let _clientY = pageY(e);
                    if (clientY(e) > viewHeight / 5) _clientY -= (self.bar.clientHeight + 20 + tileOffset);
                    else _clientY += (20 + tileOffset);
                    if (clientX(e) < viewWidth / 2) {
                        self.bar.style.left = _clientX + scrollLeft + "px";
                        self.bar.style.transformOrigin = '0 0';
                    } else {
                        self.bar.style.right = viewWidth - _clientX - self.bar.clientWidth - 15 + "px";
                        self.bar.style.transformOrigin = '100% 0';
                    }
                    self.bar.style.top = _clientY + "px";
                    self.removeBar();
                    self.bar.style.opacity = 0;
                    setTimeout(() => {
                        self.appendBar();
                        setTimeout(() => {
                            self.bar.style.opacity = 1;
                            setTimeout(() => {
                                let saladict = document.querySelector('#saladict-saladbowl-root>.saladict-external');
                                if (saladict) {
                                    let saladbowl = saladict.shadowRoot.querySelector('.saladbowl');
                                    saladbowl.style.transform = saladbowl.style.transform.replace(/\d+px\)/, `${e.clientY - 15}px)`);
                                }
                            }, 100);
                        }, 1);
                    }, 1);
                } else {
                    self.bar.style.display = "";
                    self.initPos();
                }
            }

            setFuncKeyCall(value) {
                this.funcKeyCall = value;
                if (!this.con.classList.contains("search-jumper-showall")) {
                    if (value) {
                        this.tileInput.value = getKeywords();
                        this.con.classList.add("funcKeyCall");
                        this.bar.insertBefore(this.tileInput, this.bar.firstChild);
                    } else {
                        this.tileInput.value = "";
                        this.con.classList.remove("funcKeyCall");
                        this.tileInput.parentNode && this.tileInput.parentNode.removeChild(this.tileInput);
                    }
                }
            }

            initPos(relX, relY, posX, posY) {
                if (this.preList) {
                    this.preList.style.visibility = "hidden";
                    this.preList.style.opacity = 0;
                    this.listArrow.style.cssText = "";
                }
                if (typeof relX === 'undefined') {
                    relX = searchData.prefConfig.position.x;
                }
                if (typeof relY === 'undefined') {
                    relY = searchData.prefConfig.position.y;
                }
                if (typeof posX === 'undefined') {
                    posX = searchData.prefConfig.offset.x;
                }
                if (typeof posY === 'undefined') {
                    posY = searchData.prefConfig.offset.y;
                }
                let self = this;
                let setClass = className => {
                    self.bar.style.cssText = "";
                    self.con.style.cssText = "";
                    self.con.className = "search-jumper-searchBarCon " + className;
                    if (searchData.prefConfig.resizePage) {
                        if (typeof self.initBodyStyle == 'undefined') self.initBodyStyle = getBody(document).style.cssText;
                        else getBody(document).style.cssText = self.initBodyStyle;
                        self.con.classList.add("resizePage");
                        getBody(document).style.position = "absolute";
                        switch (className) {
                            case "search-jumper-left":
                                getBody(document).style.width = `calc(100vw - ${self.scale * 42}px)`;
                                getBody(document).style.right = "0px";
                                break;
                            case "search-jumper-right":
                                getBody(document).style.width = `calc(100vw - ${self.scale * 42}px)`;
                                getBody(document).style.left = "0px";
                                break;
                            case "search-jumper-bottom":
                                getBody(document).style.width = "100%";
                                getBody(document).style.height = `calc(100vh - ${self.scale * 42}px)`;
                                getBody(document).style.top = "0px";
                                getBody(document).style.overflow = "auto";
                                break;
                            default:
                                getBody(document).style.width = "100%";
                                getBody(document).style.height = `calc(100vh - ${self.scale * 42}px)`;
                                getBody(document).style.bottom = "0px";
                                getBody(document).style.overflow = "auto";
                                break;
                        }
                    } else if (searchData.prefConfig.autoHideAll) {
                        self.con.classList.add("hideAll");
                    }
                    let baseSize = self.scale * 40;
                    setTimeout(() => {
                        let leftRight = self.con.classList.contains("search-jumper-left") ||
                            self.con.classList.contains("search-jumper-right");
                        searchTypes.forEach(ele => {
                            if (!ele.classList.contains("search-jumper-open")) {
                                if (leftRight) {
                                    ele.style.width = "";
                                    ele.style.height = baseSize + "px";
                                } else {
                                    ele.style.width = baseSize + "px";
                                    ele.style.height = "";
                                }
                            } else {
                                let scrollSize = Math.max(ele.scrollWidth, ele.scrollHeight);
                                if (scrollSize) {
                                    scrollSize += "px";
                                    if (leftRight) {
                                        ele.style.width = "";
                                        ele.style.height = scrollSize;
                                    } else {
                                        ele.style.width = scrollSize;
                                        ele.style.height = "";
                                    }
                                }
                            }
                        });
                    }, 1);
                };

                if (posX < 0) {
                    posX = 0;
                }
                if (posY < 0) {
                    posY = 0;
                }
                if (relX == "center" && relY == "top") {
                    //上中
                    setClass("");
                    self.bar.style.position = "relative";
                } else if (relX == "left" && relY == "top") {
                    if (posX > posY) {
                        //上左
                        setClass("");
                        self.bar.style.position = "fixed";
                        self.bar.style.left = posX + "px";
                    } else {
                        //左上
                        setClass("search-jumper-left");
                        self.bar.style.position = "fixed";
                        self.bar.style.top = posY + "px";
                    }
                } else if (relX == "right" && relY == "top") {
                    if (posX > posY) {
                        //上右
                        setClass("");
                        self.bar.style.position = "fixed";
                        self.bar.style.right = posX + "px";
                    } else {
                        //右上
                        setClass("search-jumper-right");
                        self.bar.style.position = "fixed";
                        self.bar.style.top = posY + "px";
                    }
                } else if (relX == "center" && relY == "bottom") {
                    //下中
                    setClass("search-jumper-bottom");
                    self.bar.style.position = "relative";
                } else if (relX == "left" && relY == "bottom") {
                    if (posX > posY) {
                        //下左
                        setClass("search-jumper-bottom");
                        self.bar.style.position = "fixed";
                        self.bar.style.left = posX + "px";
                        self.bar.style.bottom = "0px";
                        self.bar.style.top = "unset";
                    } else {
                        //左下
                        setClass("search-jumper-left");
                        self.bar.style.position = "fixed";
                        self.bar.style.bottom = posY + "px";
                    }
                } else if (relX == "right" && relY == "bottom") {
                    if (posX > posY) {
                        //下右
                        setClass("search-jumper-bottom");
                        self.bar.style.position = "fixed";
                        self.bar.style.right = posX + "px";
                        self.bar.style.bottom = "0px";
                        self.bar.style.top = "unset";
                    } else {
                        //右下
                        setClass("search-jumper-right");
                        self.bar.style.position = "fixed";
                        self.bar.style.bottom = posY + "px";
                    }
                } else if (relX == "left" && relY == "center") {
                    //左中
                    setClass("search-jumper-left");
                    self.bar.style.position = "relative";
                    self.bar.style.marginTop = posY + "px";
                    self.con.style.display = "flex";
                    self.con.style.justifyContent = "center";
                } else if (relX == "right" && relY == "center") {
                    //右中
                    setClass("search-jumper-right");
                    self.bar.style.position = "absolute";
                    self.bar.style.marginTop = posY + "px";
                    self.con.style.display = "flex";
                    self.con.style.justifyContent = "center";
                    self.con.style.alignItems = "flex-end";
                }
                searchData.prefConfig.position.x = relX;
                searchData.prefConfig.position.y = relY;
                searchData.prefConfig.offset.x = posX;
                searchData.prefConfig.offset.y = posY;
                if (searchData.prefConfig.disableAutoOpen || searchData.prefConfig.disableTypeOpen) {
                    self.checkScroll(false, true);
                } else {
                    setTimeout(() => {
                        let openType = self.bar.querySelector('.search-jumper-type.search-jumper-open');
                        if (openType) {
                            openType.style.transition = "none";
                            openType.style.width = "auto";
                            openType.style.height = "auto";
                            setTimeout(() => {
                                openType.style.width = openType.scrollWidth + "px";
                                openType.style.height = openType.scrollHeight + "px";
                                setTimeout(() => {
                                    openType.style.transition = "";
                                }, 1);
                                self.checkScroll(false, true);
                            }, 0);
                        }
                    }, 251);
                }
            }
        }

        class Picker {
            //static picker;
            constructor() {
                this.clickedIndex = 0;
                this.signList = [];//所有标记
                this.clickedEles = {};//点击的元素
                this.exact = true;
                this.accu = 0;
                this.wheelScrolling = false;
            }

            /*static getInstance() {
                if (!Picker.picker) {
                    Picker.picker = new Picker();
                }
                return Picker.picker;
            }*/

            getSelector(callback, exact = true) {
                this.exact = exact;
                this.close();
                this.toggle();
                this.callback = callback;
            }

            init() {
                if (this.inited) return;
                this.inited = true;
                let self = this;
                let cssText = `
                 body.searchJumper-picker,
                 body.searchJumper-picker *:hover,
                 body.searchJumper-picker a:hover {
                   cursor: crosshair !important;
                 }
                 .select-rect {
                   position: fixed;
                   z-index: 2147483647;
                   background: none;
                   border: 1px dashed rgba(120, 170, 210, 0.8);
                 }
                 .select-rect>.dot {
                   width: 10px;
                   height: 10px;
                   border: 2px solid #000;
                   border-radius: 50%;
                   background-color: white;
                   position: absolute;
                 }
                 .select-rect>.top-left {
                   top: -5px;
                   left: -5px;
                 }
                 .select-rect>.top-right {
                   top: -5px;
                   right: -5px;
                 }
                 .select-rect>.bottom-left {
                   bottom: -5px;
                   left: -5px;
                 }
                 .select-rect>.bottom-right {
                   bottom: -5px;
                   right: -5px;
                 }
                 .select-rect>.top {
                   top: -5px;
                   left: calc(50% - 5px);
                 }
                 .select-rect>.right {
                   top: calc(50% - 5px);
                   right: -5px;
                 }
                 .select-rect>.left {
                   top: calc(50% - 5px);
                   left: -5px;
                 }
                 .select-rect>.bottom {
                   bottom: -5px;
                   left: calc(50% - 5px);
                 }
                `;
                _GM_addStyle(cssText);
                let clickTarget = target => {
                    if (!target) return;
                    if (self.callback) {
                        if (target) {
                            let sel = self.geneSelector(target, self.exact);
                            self.callback(sel);
                            self.close();
                        }
                        return;
                    }
                    let sign = self.createSignDiv();
                    self.clickedEles[self.clickedIndex] = target;
                    self.appendSign(sign, target, self.clickedIndex);
                    self.clickedIndex++;
                    searchBar.con.classList.add("selectedEle");
                }
                let cleanTimer;
                this.initSelectRect();

                this.mainSignDiv = this.createSignDiv();
                this.setImportant(this.mainSignDiv, "pointer-events", "none");
                this.setImportant(this.mainSignDiv, "background", "rgba(120, 170, 210, 0.3)");
                this.moveHandler = e => {
                    if (e.target === document) return;
                    if (self.inPicker) {
                        e.preventDefault();
                    }
                    if (self.rectSelecting) {
                        if (self.mainSignDiv.parentNode) self.mainSignDiv.parentNode.removeChild(self.mainSignDiv);
                        if (!self.selectRect.parentNode) getBody(document).appendChild(self.selectRect);
                        self.createSelectRect({x: e.clientX, y: e.clientY});
                    } else if (self.creatingRect) {
                        return;
                    } else {
                        let target = self.getTarget(e.target);
                        if (self.mainSignDiv.parentNode !== target.parentNode) target.parentNode.appendChild(self.mainSignDiv);
                        self.adjustSignDiv(self.mainSignDiv, target);
                        if (e.ctrlKey || e.metaKey) {
                            clearTimeout(cleanTimer);
                            cleanTimer = setTimeout(() => {
                                let target = self.cleanTarget(e.target);
                                clickTarget(target);
                            }, 5);
                        }
                    }
                };
                this.leaveHandler = e => {
                    if (self.mainSignDiv.parentNode) self.mainSignDiv.parentNode.removeChild(self.mainSignDiv);
                };
                this.clickHandler = e => {
                    if (self.inPicker) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    if (self.creatingRect) return;
                    if (self.rectSelecting) {
                        if (self.selectRect.parentNode) {
                            self.selectRect.parentNode.removeChild(self.selectRect);
                        }
                        self.rectSelecting = false;
                        searchBar.bar.classList.remove("rectSelecting");
                        return;
                    }
                    let target = self.getTarget(e.target);
                    clickTarget(target);
                };
                this.mouseDownHandler = e => {
                    self.rectSelecting = true;
                    searchBar.bar.classList.add("rectSelecting");
                    self.rectInitPos = {x: e.clientX, y: e.clientY};
                    e.stopPropagation();
                    e.preventDefault();
                };
                this.mouseUpHandler = e => {
                    self.rectSelecting = false;
                    searchBar.bar.classList.remove("rectSelecting");
                    if (self.creatingRect) return;
                    if (self.selectRect.parentNode) {
                        self.selectRect.parentNode.removeChild(self.selectRect);
                        self.finishSelectRect();
                        e && e.stopPropagation && e.stopPropagation();
                        e && e.preventDefault && e.preventDefault();
                    }
                };
                this.wheelHandler = e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (self.wheelScrolling) return;
                    self.wheelScrolling = true;
                    setTimeout(() => {
                        self.wheelScrolling = false;
                    }, 100);
                    let deltaY;
                    if(e.type !== 'wheel'){
                        let y = 0;
                        if (typeof e.axis == 'number') {
                            if (e.axis == 2) {
                                y = e.detail;
                            }
                        } else {
                            if (typeof e.wheelDeltaY == 'undefined' || e.wheelDeltaY != 0) {
                                y = -e.wheelDelta / 40;
                            }
                        };
                        deltaY = y;

                    } else {
                        deltaY = e.deltaY;
                    }
                    if (deltaY > 0) self.accu--;
                    else self.accu++;
                    if (self.accu < 0) self.accu = 0;
                    else if (self.accu > 8) self.accu = 8;
                    let target = self.getTarget(e.target);
                    if (self.mainSignDiv.parentNode !== target.parentNode) target.parentNode.appendChild(self.mainSignDiv);
                    self.adjustSignDiv(self.mainSignDiv, target);
                };
            }

            initSelectRect() {
                this.waitToRemoveSigns = [];
                this.waitToAddSigns = [];
                let selectRect = document.createElement("div");
                selectRect.innerHTML = createHTML(`
                  <div class="dot top-left"></div>
                  <div class="dot top-right"></div>
                  <div class="dot bottom-left"></div>
                  <div class="dot bottom-right"></div>
                  <div class="dot top"></div>
                  <div class="dot right"></div>
                  <div class="dot left"></div>
                  <div class="dot bottom"></div>
                `);
                selectRect.className = "select-rect";
                this.selectRect = selectRect;
            }

            createSelectRect(pos) {
                this.rectToPos = pos;
                if (this.creatingRect) return;
                this.creatingRect = true;
                setTimeout(() => {
                    this.creatingRect = false;
                    this.selectRect.style.left = Math.min(this.rectToPos.x, this.rectInitPos.x) + "px";
                    this.selectRect.style.top = Math.min(this.rectToPos.y, this.rectInitPos.y) + "px";
                    this.selectRect.style.width = Math.abs(this.rectToPos.x - this.rectInitPos.x) + "px";
                    this.selectRect.style.height = Math.abs(this.rectToPos.y - this.rectInitPos.y) + "px";
                    this.checkRectAndSign();
                    if (!this.rectSelecting) this.mouseUpHandler();
                }, 100);
            }

            finishSelectRect() {
                let self = this;
                this.waitToRemoveSigns.forEach(sign => {
                    self.removeSign(sign);
                });
                this.waitToAddSigns.forEach(sign => {
                    delete sign.dataset.recttemp;
                });
                this.waitToRemoveSigns = [];
                this.waitToAddSigns = [];
                if (this.signList.length) {
                    searchBar.con.classList.add("selectedEle");
                } else {
                    searchBar.con.classList.remove("selectedEle");
                }
            }

            checkRectAndSign() {
                if (!this.domInfo) return;
                let self = this;
                this.waitToRemoveSigns.forEach(sign => {
                    sign.style.opacity = "";
                });
                this.waitToRemoveSigns = [];
                this.signList.forEach(signArr => {
                    let sign = signArr[0];
                    if (sign.dataset.recttemp) return;
                    let signRect = sign.getBoundingClientRect();
                    let curRect = self.selectRect.getBoundingClientRect();
                    if (self.compareRect(signRect, curRect)) {
                        sign.style.opacity = "0";
                        self.waitToRemoveSigns.push(sign);
                    } else {
                        sign.style.opacity = "";
                    }
                });
                this.waitToAddSigns.forEach(sign => {
                    self.removeSign(sign);
                });
                this.waitToAddSigns = [];
                if (this.waitToRemoveSigns.length === 0) {
                    this.curRectInfo = {};
                    if (this.rectInitPos.x < this.rectToPos.x) {
                        this.curRectInfo.left = this.rectInitPos.x;
                        this.curRectInfo.right = this.rectToPos.x;
                    } else {
                        this.curRectInfo.left = this.rectToPos.x;
                        this.curRectInfo.right = this.rectInitPos.x;
                    }
                    if (this.rectInitPos.y < this.rectToPos.y) {
                        this.curRectInfo.top = this.rectInitPos.y;
                        this.curRectInfo.bottom = this.rectToPos.y;
                    } else {
                        this.curRectInfo.top = this.rectToPos.y;
                        this.curRectInfo.bottom = this.rectInitPos.y;
                    }
                    this.compareDomWithRect(this.domInfo);
                    this.signDomWithRect(this.domInfo);
                }
            }

            compareDomWithRect(dom) {
                if (dom.children && dom.children.length > 0) {
                    let matched = 0;
                    for (let i = 0; i < dom.children.length; i++) {
                        let child = dom.children[i];
                        if (this.compareDomWithRect(child)) {
                            matched++;
                        }
                    }
                    if (matched === dom.children.length) {
                        let rect = dom.target.getBoundingClientRect();
                        if (rect.width && rect.height) {
                            dom.sign = true;
                            return true;
                        }
                    }
                } else {
                    if (this.compareRect(this.curRectInfo, dom.target.getBoundingClientRect())) {
                        dom.sign = true;
                        return true;
                    }
                }
                dom.sign = false;
                return false;
            }

            signDomWithRect(dom) {
                if (dom.sign) {
                    let sign = this.createSignDiv();
                    sign.dataset.recttemp = 1;
                    dom.target.parentNode.appendChild(sign);
                    this.adjustSignDiv(sign, dom.target);
                    this.signList.push([sign, dom.target]);
                    this.waitToAddSigns.push(sign);
                } else if (dom.children && dom.children.length > 0) {
                    for (let i = 0; i < dom.children.length; i++) {
                        let child = dom.children[i];
                        this.signDomWithRect(child);
                    }
                }
            }

            compareRect(rect1, rect2) {
                return (
                    rect2.width &&
                    rect2.height &&
                    rect1.left <= rect2.right &&
                    rect1.right >= rect2.left &&
                    rect1.top <= rect2.bottom &&
                    rect1.bottom >= rect2.top
                );
            }

            cleanTarget(target) {
                if (!target || target.className == "searchJumperSign") return null;
                target = this.getTarget(target);
                if (!target) return null;
                for (let i in this.clickedEles) {
                    let clickedEle = this.clickedEles[i];
                    try {
                        if (clickedEle == target || clickedEle.contains(target) || target.contains(clickedEle)) return null;
                    } catch (e) {
                        return null;
                    }
                }
                return target;
            }

            appendSign(sign, target, index) {
                if (target.dataset) {
                    target.dataset.signNum = parseInt(target.dataset.signNum || 0) + 1;
                }
                sign.dataset.target = index;
                target.parentNode.appendChild(sign);
                this.adjustSignDiv(sign, target);
                this.signList.push([sign, target]);
            }

            removeSign(sign) {
                if (sign.parentNode) sign.parentNode.removeChild(sign);
                for (let i = 0; i < this.signList.length; i++) {
                    let signArr = this.signList[i];
                    if (signArr[0] === sign) {
                        this.signList.splice(i, 1);
                        break;
                    }
                }
                let targetIndex = sign.dataset.target;
                let target = this.clickedEles[targetIndex];
                if (!target) return;
                let signNum = parseInt(target.dataset.signNum || 0) - 1;
                target.dataset.signNum = signNum;
                if (signNum <= 0) {
                    delete this.clickedEles[targetIndex];
                }
            }

            getTarget(ele) {
                let accu = this.accu;
                while (ele && accu) {
                    let parentNode = ele.parentNode;
                    if (!parentNode) break;
                    ele = parentNode;
                    accu--;
                }
                while (ele.parentNode && (ele.offsetWidth === 0 || ele.offsetHeight === 0)) {
                    ele = ele.parentNode;
                }
                return ele;
            }

            close() {
                if (!this.mainSignDiv) return;
                if (this.rectSelecting) {
                    if (this.selectRect.parentNode) {
                        this.selectRect.parentNode.removeChild(this.selectRect);
                    }
                    this.finishSelectRect();
                    this.rectSelecting = false;
                }
                this.callback = null;
                this.domInfo = null;
                this.clearSigns();
                this.clickedEles = {};
                if (this.mainSignDiv.parentNode) this.mainSignDiv.parentNode.removeChild(this.mainSignDiv);
                getBody(document).classList.remove("searchJumper-picker");
                searchBar.con.classList.remove("selectedEle");
                searchBar.con.removeEventListener("mouseenter", this.leaveHandler, true);
                getBody(document).removeEventListener("mousemove", this.moveHandler, true);
                getBody(document).removeEventListener("click", this.clickHandler, true);
                getBody(document).removeEventListener("mousedown", this.mouseDownHandler, true);
                getBody(document).removeEventListener("mouseup", this.mouseUpHandler, true);
                getBody(document).removeEventListener(getSupportWheelEventName(), this.wheelHandler, { passive: false, capture: true });
                this.inPicker = false;
            }

            setImportant(ele, prop, value) {
                ele.style.setProperty(prop, value, "important");
            }

            createSignDiv() {
                let signDiv = document.createElement("div");
                this.setImportant(signDiv, "position", "absolute");
                this.setImportant(signDiv, "z-index", "2147483647");
                this.setImportant(signDiv, "background", "rgba(120, 170, 210, 0.6)");
                this.setImportant(signDiv, "transition", "all 0.15s ease-out");
                this.setImportant(signDiv, "box-shadow", "rgb(0 0 0) 0px 0px 3px 0px");
                this.setImportant(signDiv, "cursor", "pointer");
                signDiv.className = "searchJumperSign";
                signDiv.addEventListener("mouseenter", e => {
                    if (this.mainSignDiv.parentNode) this.mainSignDiv.parentNode.removeChild(this.mainSignDiv);
                }, true);
                signDiv.addEventListener("mousedown", e => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.removeSign(signDiv);
                }, true);
                return signDiv;
            }

            adjustSignDiv(div, target) {
                this.setImportant(div, "width", target.offsetWidth + "px");
                this.setImportant(div, "height", target.offsetHeight + "px");
                let left = target.offsetLeft;
                let top = target.offsetTop;
                if (target.offsetParent && div.offsetParent && target.offsetParent !== div.offsetParent) {
                    let rect1 = div.offsetParent.getBoundingClientRect();
                    let rect2 = target.offsetParent.getBoundingClientRect();
                    left += rect2.left - rect1.left;
                    top += rect2.top - rect1.top;
                }
                this.setImportant(div, "left", left + "px");
                this.setImportant(div, "top", top + "px");
            }

            geneSelector(ele, id) {
                let selector = ele.nodeName.toLowerCase();
                if (selector !== "html" && selector !== "body") {
                    if (id && ele.id && /^[a-z\-_][\w\-_]+$/i.test(ele.id)) selector = '#' + ele.id;
                    else {
                        if (ele.className) {
                            let classLen = ele.classList.length;
                            selector += [].map.call(ele.classList, d => /^[a-z][\w]+$/i.test(d) || (classLen < 3 && /^[a-z\-_][\w\-_]+$/i.test(d)) ? ('.' + d) : "").join('');
                        }
                        let parent = ele.parentElement;
                        if (parent) {
                            selector = this.geneSelector(parent, !!id) + ' > ' + selector;
                            if (id && parent.children.length > 1 && !/^HTML$/i.test(parent.nodeName)) {
                                let i, nth = 0, all = 0;
                                for (i = 0; i < parent.children.length; i++) {
                                    if (parent.children[i].nodeName == ele.nodeName) {
                                        all++;
                                        if (parent.children[i] == ele) {
                                            nth = all;
                                        }
                                        if (nth > 0 && all > 1) break;
                                    }
                                }
                                selector += (all == 1 ? "" : `:nth-of-type(${nth})`);
                            }
                        }
                    }
                }
                return selector;
            }

            copy() {
                let self = this;
                let html = "", text = "";
                this.signList.forEach(sign => {
                    text += "\n" + sign[1].innerText;
                    html += sign[1].outerHTML;
                });
                text = text.trim();
                const htmlData = new Blob([html], {type: 'text/html'})
                const textData = new Blob([text], {type: 'text/plain'})
                try {
                    const item = new ClipboardItem({'text/html': htmlData, 'text/plain': textData});
                    navigator.clipboard.write([item]).then(
                        () => {
                            _GM_notification('Copied successfully!');
                        },
                        (e) => {
                            _GM_setClipboard(text);
                            console.log(e);
                        }
                    );
                } catch(e) {
                    _GM_setClipboard(text);
                }
            }

            openLinks() {
                if (!window.confirm(i18n('batchOpenConfirm'))) return;
                let links = [];
                this.signList.forEach(sign => {
                    let ele = sign[1];
                    if (ele.href) {
                        if (/^(http|ftp)/i.test(ele.href) && links.indexOf(ele.href) === -1) {
                            links.push(ele.href);
                        }
                    } else if (ele.parentNode && ele.parentNode.href) {
                        if (/^(http|ftp)/i.test(ele.parentNode.href) && links.indexOf(ele.parentNode.href) === -1) {
                            links.push(ele.parentNode.href);
                        }
                    } else if (ele.querySelectorAll) {
                        [].forEach.call(ele.querySelectorAll('a[href]'), a => {
                            if (/^(http|ftp)/i.test(a.href) && links.indexOf(a.href) === -1) {
                                links.push(a.href);
                            }
                        });
                    }
                });
                links.forEach(link => {
                    _GM_openInTab(link, {active: false, insert: true});
                });
            }

            getPickerStr() {
                if (!this.inPicker) return "";
                let resultStr = "";
                this.signList.forEach(sign => {
                    resultStr += "\n" + sign[1].innerText;
                });
                return resultStr.trim();
            }

            expand() {
                let self = this;
                this.clearSigns();
                Object.keys(this.clickedEles).forEach(index => {
                    let target = self.clickedEles[index];
                    let sel = self.geneSelector(target);
                    target.dataset.signNum = 0;
                    [].forEach.call(document.querySelectorAll(sel), ele => {
                        let sign = self.createSignDiv();
                        getBody(document).appendChild(sign);
                        self.appendSign(sign, ele, index);
                    });
                });
            }

            collapse() {
                let self = this;
                this.clearSigns();
                Object.keys(this.clickedEles).forEach(index => {
                    let target = self.clickedEles[index];
                    target.dataset.signNum = 0;
                    let sign = self.createSignDiv();
                    getBody(document).appendChild(sign);
                    self.appendSign(sign, target, index);
                });
            }

            clearSigns() {
                this.signList.forEach(sign => {
                    sign = sign[0];
                    if (sign.parentNode) sign.parentNode.removeChild(sign);
                });
                this.signList = [];
            }

            processNode(node, parent) {
                const nodeInfo = {};
                nodeInfo.target = node;
                nodeInfo.children = [];

                if (node.nodeType === Node.ELEMENT_NODE) {
                    const style = window.getComputedStyle(node);
                    if (style.display === 'none' && style.visibility === 'hidden') return null;
                    if (node.innerHTML.trim() === "") return null;
                } else if (node.nodeType !== Node.TEXT_NODE || node.textContent.trim() === "") {
                    return null;
                }

                const childNodes = node.childNodes;
                if (childNodes.length > 0) {
                    nodeInfo.target = node;
                    parent.children.push(nodeInfo);
                    for (const childNode of childNodes) {
                        if (childNode.nodeType === Node.ELEMENT_NODE || childNode.nodeType === Node.TEXT_NODE) {
                            this.processNode(childNode, nodeInfo);
                        }
                    }
                } else {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const lines = node.textContent.split("\n");

                        const range = document.createRange();
                        range.selectNodeContents(node);

                        let offset = 0;
                        let parentNode = node.parentNode;
                        let paRect = parentNode.getBoundingClientRect();
                        for (const line of lines) {
                            if (line.trim() === '') {
                                offset += (line.length + 1);
                                continue;
                            }
                            range.setStart(node, offset);
                            offset += line.length;
                            range.setEnd(node, offset);
                            offset++;

                            const lineRect = range.getBoundingClientRect();
                            let offsetLeft = lineRect.left - paRect.left;
                            let offsetTop = lineRect.top - paRect.top;
                            let offsetWidth = lineRect.width;
                            let offsetHeight = lineRect.height;

                            let textNodeInfo = {
                                target: {innerText: line,
                                         outerHTML: line,
                                         parentNode: parentNode,
                                         offsetLeft: offsetLeft + parentNode.offsetLeft,
                                         offsetTop: offsetTop + parentNode.offsetTop,
                                         offsetWidth: offsetWidth,
                                         offsetHeight: offsetHeight,
                                         getBoundingClientRect: () => {
                                             let paRect = parentNode.getBoundingClientRect();
                                             return {
                                                 left: paRect.left + offsetLeft,
                                                 top: paRect.top + offsetTop,
                                                 right: paRect.left + offsetLeft + offsetWidth,
                                                 bottom: paRect.top + offsetTop + offsetHeight,
                                                 width: offsetWidth,
                                                 height: offsetHeight,
                                             };
                                         }}
                            };
                            parent.children.push(textNodeInfo);
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        nodeInfo.target = node;
                        parent.children.push(nodeInfo);
                    }
                }

                return nodeInfo;
            }

            toggle(rectSel) {
                this.init();
                if (this.inPicker) {
                    this.close();
                    return;
                }
                this.rectSel = !!rectSel;
                if (rectSel) {
                    this.domInfo = this.processNode(getBody(document), {children: []});
                    getBody(document).addEventListener("mousedown", this.mouseDownHandler, true);
                    getBody(document).addEventListener("mouseup", this.mouseUpHandler, true);
                } else {
                    getBody(document).addEventListener(getSupportWheelEventName(), this.wheelHandler, { passive: false, capture: true });
                }
                this.accu = 0;
                this.inPicker = true;
                getBody(document).classList.add("searchJumper-picker");

                searchBar.con.addEventListener("mouseenter", this.leaveHandler, true);
                getBody(document).addEventListener("mousemove", this.moveHandler, true);
                getBody(document).addEventListener("click", this.clickHandler, true);
            }
        }
        const picker = new Picker();

        function emuPress(v) {
            if (!targetElement) return;
            let eventParam = v || { key: "Enter", keyCode: 13, bubbles: true };
            let event = new KeyboardEvent('keydown', eventParam);
            targetElement.dispatchEvent(event);
            event = new KeyboardEvent('keyup', eventParam);
            targetElement.dispatchEvent(event);
            event = new KeyboardEvent('keypress', eventParam);
            targetElement.dispatchEvent(event);
            debug(targetElement, `press ${v || 'Enter'}`);
        }

        async function waitForElement(sel) {
            return new Promise((resolve) => {
                let checkInv = setInterval(() => {
                    let result = null;
                    if (!sel) {
                        result = document.readyState === "complete";
                    } else if (sel === "@") {
                        result = targetElement;
                    } else result = getElement(sel);
                    if (result === false) return null;
                    if (result) {
                        clearInterval(checkInv);
                        resolve(result);
                    }
                }, 100);
            });
        }

        async function waitForElementHide(sel) {
            if (!sel) return null;
            return new Promise((resolve) => {
                let checkInv = setInterval(() => {
                    let result = getElement(sel);
                    if (!result) {
                        clearInterval(checkInv);
                        resolve(null);
                    }
                }, 100);
            });
        }

        let reachLast = false;
        async function startInput(input, v) {
            if (!input) return true;
            targetElement = input;
            let event = new FocusEvent('focusin', { bubbles: true });
            input.dispatchEvent(event);
            event = new Event('focus', { bubbles: true });
            input.dispatchEvent(event);
            const selection = window.getSelection();
            const range = selection.rangeCount ? selection.getRangeAt(0) : new Range();
            range.selectNode(input);
            selection.removeAllRanges();
            selection.addRange(range);
            await sleep(1);
            input.type !== 'file' && input.click && input.click();
            let lastValue = input.value;
            if (input.type == 'file') {
                let file = v;
                if (file.indexOf('data:') == 0) {
                    file = dataURLtoFile(file);
                } else {
                    let blob = new Blob([file], {
                        type: 'text/plain'
                    });
                    file = new File([blob], 'noname.txt', { type: blob.type })
                }
                let dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
                v = "c:/fakepath/fakefile";
            } else if (/INPUT/i.test(input.nodeName)) {
                var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(input, v);
            } else if (/SELECT/i.test(input.nodeName)) {
                var nativeSelectValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
                nativeSelectValueSetter.call(input, v);
            } else if (input.nodeName.toUpperCase() == "TEXTAREA") {
                var nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                nativeTextareaValueSetter.call(input, v);
            } else {
                let contentEditableParent = input;
                while (contentEditableParent && contentEditableParent.contentEditable !== 'true') {
                    contentEditableParent = contentEditableParent.parentNode;
                }
                if (contentEditableParent) {
                    contentEditableParent.dispatchEvent(new InputEvent('beforeinput', {inputType: "insertText", data: v}));
                    await sleep(1);
                    if (input.innerText !== v) {
                        input.innerHTML = createHTML(v);
                    }
                } else {
                    let file = v;
                    if (file.indexOf('data:') == 0) {
                        file = dataURLtoFile(file);
                    } else {
                        let blob = new Blob([file], {
                            type: 'text/plain'
                        });
                        file = new File([blob], 'noname.txt', { type: blob.type })
                    }
                    var pasteEvent = new ClipboardEvent('paste', {
                        target: document.body,
                        clipboardData: new DataTransfer()
                    });
                    pasteEvent.clipboardData.items.add(file);
                    input.dispatchEvent(pasteEvent);
                }
            }
            event = new Event('input', { bubbles: true });
            let tracker = input._valueTracker;
            if (tracker) {
                tracker.setValue(lastValue);
            }
            input.dispatchEvent(event);
            event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
            debug(input, `input`);
        }

        async function returnElement(sel, eleIndex = -1) {
            reachLast = false;
            let ele;
            if (eleIndex >= 0) {
                if (eleIndex === 0) await waitForElement(sel);
                let eles = getAllElements(sel);
                if (eles.length === 0) {
                    return true;
                }
                if (eles.length === 1) {
                    ele = eles[0];
                    reachLast = true;
                } else if (eles.length <= eleIndex) {
                    return true;
                } else {
                    ele = eles[eleIndex];
                    if (eles.length === eleIndex + 1) {
                        reachLast = true;
                    }
                }
            } else {
                ele = await waitForElement(sel);
                if (!ele) return true;
            }
            return ele;
        }

        async function emuInput(sel, v, eleIndex = -1) {
            let input = await returnElement(sel, eleIndex);
            if (input === true) return true;
            await startInput(input, v);
            return reachLast;
        }

        async function emuClick(sel, eleIndex = -1) {
            let btn = await returnElement(sel, eleIndex);
            if (btn === true) return true;
            targetElement = btn;
            if(!PointerEvent) return btn.click();
            let eventParam = {
                isTrusted: true,
                altKey: false,
                azimuthAngle: 0,
                bubbles: true,
                button: 0,
                buttons: 0,
                clientX: 1,
                clientY: 1,
                cancelBubble: false,
                cancelable: true,
                composed: true,
                ctrlKey: false,
                defaultPrevented: false,
                detail: 1,
                eventPhase: 2,
                fromElement: null,
                height: 1,
                isPrimary: false,
                metaKey: false,
                pointerId: 1,
                pointerType: "mouse",
                pressure: 0,
                relatedTarget: null,
                returnValue: true,
                shiftKey: false,
                toElement: null,
                twist: 0,
                which: 1
            };
            btn.focus();
            var mouseEvent = new PointerEvent("mouseover",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("pointerover",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("mousedown",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("pointerdown",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("mouseup",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("pointerup",eventParam);
            btn.dispatchEvent(mouseEvent);
            let dispatchTouchEvent = (ele, type) => {
                let touchEvent;
                try {
                    touchEvent = document.createEvent('TouchEvent')
                    touchEvent.initTouchEvent(type, true, true)
                } catch (err) {
                    try {
                        touchEvent = document.createEvent('UIEvent')
                        touchEvent.initUIEvent(type, true, true)
                    } catch (err) {
                        touchEvent = document.createEvent('Event')
                        touchEvent.initEvent(type, true, true)
                    }
                }
                try {
                    touchEvent.targetTouches = [{
                        pageX: 1,
                        pageY: 1,
                        clientX: 1,
                        clientY: 1,
                        target: btn
                    }];
                    touchEvent.touches = [{
                        pageX: 1,
                        pageY: 1,
                        clientX: 1,
                        clientY: 1,
                        target: btn
                    }];
                    touchEvent.changedTouches = [{
                        pageX: 1,
                        pageY: 1,
                        clientX: 1,
                        clientY: 1,
                        target: btn
                    }];
                } catch (err) {}
                ele.dispatchEvent(touchEvent);
            }
            dispatchTouchEvent(btn, "touchstart");
            dispatchTouchEvent(btn, "touchend");
            btn.click();
            debug(btn, `click ${sel}`);
            return reachLast;
        }

        async function emuDblClick(sel, eleIndex = -1) {
            let btn = await returnElement(sel, eleIndex);
            if (btn === true) return true;
            targetElement = btn;
            let eventParam = {
                isTrusted: true,
                altKey: false,
                azimuthAngle: 0,
                bubbles: true,
                button: 0,
                buttons: 0,
                clientX: 1,
                clientY: 1,
                cancelBubble: false,
                cancelable: true,
                composed: true,
                ctrlKey: false,
                defaultPrevented: false,
                detail: 2,
                eventPhase: 2,
                fromElement: null,
                height: 1,
                isPrimary: false,
                metaKey: false,
                pointerId: 1,
                pointerType: "mouse",
                pressure: 0,
                relatedTarget: null,
                returnValue: true,
                shiftKey: false,
                toElement: null,
                twist: 0,
                which: 1
            };
            btn.focus();
            var mouseEvent = new PointerEvent("mouseover",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("pointerover",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("mousedown",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("pointerdown",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("mouseup",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("pointerup",eventParam);
            btn.dispatchEvent(mouseEvent);
            btn.click();
            btn.click();
            mouseEvent = new MouseEvent("dblclick", {
                ...eventParam,
                view: _unsafeWindow
            });
            btn.dispatchEvent(mouseEvent);
            debug(btn, `dblclick ${sel}`);
            return reachLast;
        }

        async function emuRClick(sel, eleIndex = -1) {
            let btn = await returnElement(sel, eleIndex);
            if (btn === true) return true;
            targetElement = btn;
            let eventParam = {
                isTrusted: true,
                altKey: false,
                azimuthAngle: 0,
                bubbles: true,
                button: 2,
                buttons: 0,
                clientX: 1,
                clientY: 1,
                cancelBubble: false,
                cancelable: true,
                composed: true,
                ctrlKey: false,
                defaultPrevented: false,
                detail: 0,
                eventPhase: 2,
                fromElement: null,
                height: 1,
                isPrimary: false,
                metaKey: false,
                pointerId: 1,
                pointerType: "mouse",
                pressure: 0,
                relatedTarget: null,
                returnValue: true,
                shiftKey: false,
                toElement: null,
                twist: 0,
                which: 3
            };
            btn.focus();
            var mouseEvent = new PointerEvent("mouseover",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("pointerover",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("mousedown",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("pointerdown",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("mouseup",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("pointerup",eventParam);
            btn.dispatchEvent(mouseEvent);
            mouseEvent = new PointerEvent("contextmenu",eventParam);
            btn.dispatchEvent(mouseEvent);
            debug(btn, `rclick ${sel}`);
            return reachLast;
        }

        async function triggerPaste(element, value) {
            if (!targetElement) return;
            targetElement.focus();
            if (typeof element.value !== "undefined") {
                const startPos = element.selectionStart;
                const endPos = element.selectionEnd;
                let newValue = element.value.substring(0, startPos) + value + element.value.substring(endPos, element.value.length);
                await startInput(element, newValue);
                element.selectionStart = startPos + value.length;
                element.selectionEnd = startPos + value.length;
            } else {
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                if (!selection.toString()) {
                    range.selectNode(element.childNodes.length === 1 ? element.firstChild : element);
                }
                range.deleteContents();
                range.insertNode(document.createTextNode(value));
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        function submitByForm(charset, url, target) {
            url = url.replace(/#(j(umpFrom|f)?|from){(.*?)}/, "");
            currentFormParams = {charset: charset, url: url, target: target};
            if (url.indexOf("#submitBySearchJumper") !== -1) {
                currentFormParams = {charset: charset, url: url.replace("#submitBySearchJumper", ""), target: target};
                jumpBySearchJumper();
                return;
            }
            const formId ="searchJumper_form";
            var form = document.getElementById(formId);
            if (!form) {
                form = document.createElement("form");
                form.id = formId;
                form.style.display = "none";
                document.documentElement.appendChild(form);
            }
            var params;
            let postBody = url.match(/[:%]p{(.*?)}/);
            let targetUrl = url;
            if (postBody) {
                targetUrl = url.replace(postBody[0], '');
                postBody = postBody[1];
                form.method = 'post';
                params = new URLSearchParams(postBody);
            } else {
                form.method = 'get';
                params = new URLSearchParams(new URL(targetUrl).search);
            }
            if (charset) {
                form.acceptCharset = charset;
            }
            form.innerHTML = createHTML();
            form.target = target;
            form.action = targetUrl;
            params.forEach((v, k) => {
                let input = document.createElement("input");
                input.name = k;
                input.value = v;
                form.appendChild(input);
            });
            return form.submit();
        }

        function dataURLtoFile(dataurl) {
            try {
                var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                while(n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
            } catch(e) { debug(e); }
            let ext = mime.split("/");
            ext = ext.length > 1 ? ext[1] : ext[0];
            return new File([u8arr], "image." + ext, {type: mime});
        }

        async function image2Base64(img) {
            if (!img) return null;
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            if (!img.src) return null;
            let urlSplit = img.src.split("/");
            if (urlSplit[2] == document.domain) {
                let imgStyle = getComputedStyle(img);
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                if (img.complete) {
                    canvas.width = img.naturalWidth || img.width || parseInt(imgStyle.width);
                    canvas.height = img.naturalHeight || img.height || parseInt(imgStyle.height);
                    ctx.drawImage(img, 0, 0);
                    try {
                        return (canvas.toDataURL("image/png"));
                    } catch (e) {
                        return await imageSrc2Base64(img.src);
                    }
                } else {
                    return await new Promise((resolve) => {
                        img.addEventListener("load", async e => {
                            canvas.width = img.naturalWidth || img.width || parseInt(imgStyle.width);
                            canvas.height = img.naturalHeight || img.height || parseInt(imgStyle.height);
                            ctx.drawImage(img, 0, 0);
                            try {
                                resolve(canvas.toDataURL("image/png"));
                            } catch (e) {
                                resolve(await imageSrc2Base64(img.src));
                            }
                        });
                    });
                }
            } else {
                return await imageSrc2Base64(img.src);
            }
        }

        async function imageSrc2Base64(src) {
            let urlSplit = src.split("/");
            return new Promise((resolve) => {
                if (ext) {
                    chrome.runtime.sendMessage({action: "getImgBase64", detail: {img: src}}, function(r) {
                        resolve(r);
                    });
                } else {
                    _GM_xmlhttpRequest({
                        method: 'GET',
                        url: src,
                        responseType:'blob',
                        headers: {
                            origin: urlSplit[0] + "//" + urlSplit[2],
                            referer: location.href,
                            accept: "*/*"
                        },
                        onload: function(d) {
                            try {
                                var blob = d.response;
                                var fr = new FileReader();
                                fr.readAsDataURL(blob);
                                fr.onload = function (e) {
                                    resolve(e.target.result);
                                };
                            } catch(e) {
                                resolve(null);
                            }
                        },
                        onerror: function(){
                            resolve(null);
                        },
                        ontimeout: function(){
                            resolve(null);
                        }
                    });
                }
            });
        }

        function icon2Base64(icon) {
            let iconStyle = getComputedStyle(icon);
            let content = getComputedStyle(icon,':before').content.replace(/"/g, '');
            if (!content) return false;
            var canvas = document.createElement("canvas");
            canvas.width = icon.clientWidth || parseInt(iconStyle.lineHeight);
            canvas.height = icon.clientHeight || parseInt(iconStyle.lineHeight);
            var ctx = canvas.getContext("2d");
            ctx.font = iconStyle.font;
            ctx.strokeStyle = iconStyle.color || "black";
            ctx.fillStyle = iconStyle.color || "black";
            ctx.textBaseline = "top";
            let metrics = ctx.measureText(content);
            ctx.fillText(content, (canvas.width - metrics.width) / 2, (canvas.height - parseInt(iconStyle.fontSize)) / 2);
            return canvas.toDataURL("image/png");
        }

        function cacheFontIcon(icon) {
            let iconName = icon.className.trim().replace('fa fa-', '').replace(/ /g, '_');
            if (cacheIcon[iconName]) return;
            let cache = icon2Base64(icon);
            if (cache == 'data:,' || !cache) return;
            cacheIcon[iconName] = cache;
            storage.setItem("cacheIcon", cacheIcon);
        }

        async function cacheAction(target) {
            if (target.nodeName.toUpperCase() == 'IMG') {
                let src = target.src || target.dataset.src;
                if (src) {
                    if (cacheIcon[src]) return;
                    let cache = await image2Base64(target);
                    if (cache == 'data:,' || !cache) cache = 'fail';
                    cacheIcon[src] = cache;
                    storage.setItem("cacheIcon", cacheIcon);
                    debug(src + " cached, left " + cachePool.length + " icons");
                }
            } else {
                cacheFontIcon(target);
            }
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true);
                }, 1);
            });
        }

        async function cachePoolAction() {
            while (cachePool.length > 0) {
                await cacheAction(cachePool.shift());
            }
        }

        async function cacheImgManager(noti) {
            if (searchData.prefConfig.cacheSwitch) {
                let needCache = cachePool.length > 0;
                await Promise.all([cachePoolAction(), cachePoolAction(), cachePoolAction(), cachePoolAction(), cachePoolAction()]);
                if (needCache) {
                    if (noti) _GM_notification(i18n("cacheOver"));
                    debug(i18n("cacheOver"));
                }
            }
        }

        async function cacheFontManager(noti) {
            if (!isAllPage) {
                searchBar.con.classList.add("in-input");
                searchBar.con.style.visibility = "hidden";
                searchBar.con.style.display = "";
                searchBar.appendBar();
                await sleep(2000);
                let needCache = cacheFontPool.length > 0;
                while (cacheFontPool.length > 0) {
                    await cacheAction(cacheFontPool.shift());
                }
                if (needCache) {
                    let str = 'All font icons cached!';
                    debug(str);
                }
            }
        }

        function getSelectStr() {
            let selStr = extSelectionText || picker.getPickerStr() || window.getSelection().toString();
            setTimeout(() => {
                extSelectionText = "";
            }, 1);
            if (!selStr) {
                let temp = window.getSelection();
                if (temp && temp.rangeCount) {
                    temp = temp.getRangeAt(0);
                    if (temp) {
                        temp = temp.cloneContents();
                        if (temp) {
                            selStr = temp.textContent;
                        }
                    }
                }
            }
            if (!selStr) {
                let tar = getActiveElement(document);
                if (tar && /^(TEXTAREA|INPUT)$/i.test(tar.nodeName)) {
                    let start = tar.selectionStart;
                    let finish = tar.selectionEnd;
                    if (start || finish) selStr = tar.value.substring(start, finish);
                }
            }
            if (selStr) {
                selStr = selStr.trim();
                if (selStr) {
                    return selStr;
                }
            } else {
                if (targetElement && targetElement.className === "searchJumper" && /^MARK$/i.test(targetElement.nodeName)) {
                    return targetElement.dataset.matched || targetElement.innerText;
                }
            }
            return "";
        }

        function keyToReg(key, sign, more) {
            if (!more) {
                if (/\w$/.test(key)) {
                    more = '(\\b|$)';
                } else more = '';
            }
            return new RegExp(key.replace(/([\*\.\?\+\$\^\[\]\(\)\{\}\|\\\/])/g, "\\$1") + more, sign);
        }

        function replaceSingle(str, key, value, after) {
            if (str.indexOf(key + ".replace(/") !== -1) {
                let replaceMatch = str.match(keyToReg(key, "", "\\.replace\\(/(.*?[^\\\\])/([gimsuyx]*),\\s*[\"'](.*?[^\\\\])??[\"']\\)"));
                if (!replaceMatch) return str.replace(keyToReg(key, "g"), (after ? after(value) : value));
                value = value.replace(new RegExp(replaceMatch[1], replaceMatch[2]), replaceMatch[3] || '');
                str = str.replace(replaceMatch[0], key);
                return replaceSingle(str, key, value, after);
            } else {
                return str.replace(keyToReg(key, "g"), (after ? after(value.replace(/\$/g, "$$$$")) : value.replace(/\$/g, "$$$$")));
            }
        }

        function getKeywords() {
            let selStr = getSelectStr();
            if (selStr) {
                return selStr;
            }
            if (!currentSite) return localKeywords || '';
            //if (localKeywords === '' && cacheKeywords) return cacheKeywords;

            let keywordsMatch, keywords = '', isUtf8 = !currentSite.charset || currentSite.charset == 'UTF-8';
            try {
                if (currentSite.keywords) {
                    let rules = currentSite.keywords.split("\n");
                    for (let i = 0; i < rules.length; i++) {
                        let rule = rules[i];
                        if (!rule || !rule.trim()) continue;
                        let ruleMatch = rules[i].match(/^(.*?)\.replace\(\//);
                        if (ruleMatch) rule = ruleMatch[1];
                        if (isUtf8) {
                            if (/^\w[\w\|]*$/.test(rule)) {
                                let keywordsList = rule.split("|");
                                let urlParams = new URLSearchParams(location.search);
                                for (let i = 0; i < keywordsList.length; i++) {
                                    keywords = urlParams.get(keywordsList[i]);
                                    if (keywords) break;
                                }
                            } else if (/\(.+\)/.test(rule) && rule.indexOf("@") !== 0) {
                                try {
                                    keywordsMatch = href.match(new RegExp(rule));
                                    if (keywordsMatch) {
                                        keywords = keywordsMatch[1];
                                    }
                                    if (keywords) {
                                        keywords = decodeURIComponent(keywords);
                                    }
                                } catch (e) {
                                    keywords = '';
                                }
                            }
                        }
                        if (!keywords && getBody(document)) {
                            try {
                                let targetEle = getElement(rule);
                                if (targetEle) {
                                    keywords = targetEle.value || targetEle.innerText;
                                }
                            } catch (e) {
                                keywords = '';
                            }
                        }
                        if (keywords && ruleMatch) {
                            keywords = replaceSingle(rules[i], rule, keywords);
                        }
                        if (keywords) break;
                    }
                } else if (isUtf8 && wordParamReg.test(currentSite.url) && !/[#:%]p{/.test(currentSite.url)) {
                    if (href.indexOf("?") != -1) {
                        keywordsMatch = currentSite.url.match(new RegExp(`[\\?&]([^&]*?)=${wordParam}.*`));
                        if (keywordsMatch) {
                            keywords = new URLSearchParams(location.search).get(keywordsMatch[1]);
                        }
                    }
                    if (!keywords) {
                        keywordsMatch = currentSite.url.match(new RegExp(`https?://[^/]*/(.*)${wordParam}`));
                        if (keywordsMatch) {
                            keywordsMatch = href.match(new RegExp((keywordsMatch[1].replace(/\?/g, "\\?") || (location.host.replace(/\./g, "\\.") + "/")) + "(.*?)(\/|$)"));
                            if (keywordsMatch) {
                                keywords = keywordsMatch[1];
                            }
                            if (keywords) {
                                try {
                                    keywords = decodeURIComponent(keywords);
                                } catch (e) {
                                    keywords = '';
                                }
                            }
                        }
                    }
                }
                if (keywords == '' && getBody(document)) {
                    let firstInput = getBody(document).querySelector('input[type=text]:not([readonly]),input:not([type])');
                    if (firstInput) keywords = firstInput.value;
                }
                if (keywords) localKeywords = keywords;
            } catch(e) {
                debug(e);
            }
            return localKeywords || "";//!localKeywords ? cacheKeywords : localKeywords;
        }

        function eventSupported(eventName, elem) {
            elem = elem || document.createElement("div");
            eventName = "on" + eventName;
            var isSupported = (eventName in elem);
            if (!isSupported) {
                if (!elem.setAttribute) {
                    elem = document.createElement("div");
                };
                var setAttr;
                if (!elem.hasAttribute(eventName)) {
                    setAttr = true;
                    elem.setAttribute(eventName, "return;");
                };
                isSupported = typeof elem[eventName] == "function";
                if (setAttr) elem.removeAttribute(eventName);
            }
            return isSupported;
        }

        function getSupportWheelEventName() {
            var ret = 'DOMMouseScroll';
            if (eventSupported('wheel')) {
                ret = 'wheel';
            } else if (eventSupported('mousewheel')) {
                ret = 'mousewheel';
            }
            return ret;
        }

        let draging = false;
        let extSelectionText = "";
        function initListener() {
            _GM_registerMenuCommand(i18n('settings'), () => {
                _GM_openInTab(configPage, {active: true, insert: true});
            });
            _GM_registerMenuCommand(i18n('searchInPage'), () => {
                searchBar.showInPage();
                searchBar.showInPageSearch();
            });
            _GM_registerMenuCommand(i18n('search'), () => {
                searchBar.searchAuto(0, {});
            });
            _GM_registerMenuCommand(i18n('addSearchEngine'), () => {
                let openSearch = document.head.querySelector('[rel="search"]');
                if (openSearch) {
                    showSiteAddFromOpenSearch(openSearch.href, (type, e) => {
                        if (type != 'load') {
                            if (e) debug(e.statusText || e.error || e.response || e);
                            let firstInput = getBody(document).querySelector('input[type=text]:not([readonly]),input[type=search]:not([readonly]),input:not([type])') ||
                                getBody(document).querySelector('textarea');
                            quickAddByInput(firstInput);
                        }
                    });
                } else {
                    let firstInput = getBody(document).querySelector('input[type=text]:not([readonly]),input[type=search]:not([readonly]),input:not([type])') ||
                        getBody(document).querySelector('textarea');
                    quickAddByInput(firstInput);
                }
            });
            if (ext) {
                chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                    if (request.selectionText) extSelectionText = request.selectionText;
                    let validCommand = false;
                    switch (request.command) {
                        case "settings":
                            validCommand = true;
                            _GM_openInTab(configPage, {active: true, insert: true});
                            break;
                        case "searchInPage":
                            validCommand = true;
                            searchBar.showInPage();
                            searchBar.showInPageSearch();
                            break;
                        case "filterSearch":
                            validCommand = true;
                            searchBar.showInPage();
                            searchBar.showFilterSearch();
                            break;
                        case "search":
                            validCommand = true;
                            if (request.name) {
                                searchBar.searchBySiteName(request.name, request.key || {});
                            } else {
                                searchBar.searchAuto(request.index || 0, request.key || {});
                            }
                            break;
                        case "searchAll":
                            validCommand = true;
                            if (request.name) {
                                searchBar.searcAllhByTypeName(request.name);
                            }
                            break;
                        case "toggle":
                            validCommand = true;
                            location.reload();
                            break;
                        case "streamUpdate":
                            validCommand = true;
                            searchBar.streamUpdate(request.detail);
                            break;
                        case "showAll":
                            validCommand = true;
                            searchBar.toggleShowAll();
                            break;
                        case "addSearchEngine":
                            {
                                validCommand = true;
                                if (shareEngines) return;
                                let openSearch = document.head.querySelector('[rel="search"]');
                                if (openSearch) {
                                    showSiteAddFromOpenSearch(openSearch.href, (type, e) => {
                                        if (type != 'load') {
                                            if (e) debug(e.statusText || e.error || e.response || e);
                                            let firstInput = getBody(document).querySelector('input[type=text]:not([readonly]),input[type=search]:not([readonly]),input:not([type])') ||
                                                getBody(document).querySelector('textarea');
                                            quickAddByInput(firstInput);
                                        }
                                    });
                                } else {
                                    let firstInput = getBody(document).querySelector('input[type=text]:not([readonly]),input[type=search]:not([readonly]),input:not([type])') ||
                                        getBody(document).querySelector('textarea');
                                    quickAddByInput(firstInput);
                                }
                            }
                            break;
                        default:
                            break;
                    }
                    if (validCommand) {
                        sendResponse({ msg: "ok" });
                    }
                });
            }
            document.addEventListener('searchJumper', e => {
                switch (e.detail.action) {
                    case "search":
                        if (e.detail.query) {
                            extSelectionText = e.detail.query;
                        }
                        if (e.detail.name) {
                            searchBar.searchBySiteName(e.detail.name, e.detail.key || {});
                        } else {
                            searchBar.searchAuto(e.detail.index, e.detail.key || {});
                        }
                        break;
                    case "show":
                        searchBar.setFuncKeyCall(false);
                        searchBar.showInPage();
                        if (!searchData.prefConfig.disableInputOnWords || searchBar.inInput || !getSelectStr()) {
                            searchBar.showSearchInput();
                        }
                        break;
                    case "showAll":
                        searchBar.appendBar();
                        searchBar.showAllSites();
                        break;
                }
            });
            targetElement = getBody(document);
            let logoSvg = logoBtn.children[0];
            let grabState = 0;//0 未按下 1 已按下 2 已拖动
            let hideTimer;
            let touchStart = false;

            let mouseUpHandler = e => {
                clearTimeout(hideTimer);
                searchBar.bar.classList.remove("grabbing");
                document.removeEventListener('mouseup', mouseUpHandler, false);
                document.removeEventListener('mousemove', mouseMoveHandler, false);
                document.removeEventListener('touchend', mouseUpHandler, false);
                document.removeEventListener('touchmove', mouseMoveHandler, false);
                searchBar.bar.style.marginLeft = "";
                searchBar.bar.style.marginTop = "";
                searchBar.bar.style.transform = "";
                if (grabState === 1) {
                    grabState = 0;
                    searchBar.showAllSites();
                    //_GM_openInTab(configPage, {active: true});
                    return;
                }
                grabState = 0;
                let viewWidth = window.innerWidth || document.documentElement.clientWidth;
                let viewHeight = window.innerHeight || document.documentElement.clientHeight;
                let baseWidth = viewWidth / 3;
                let baseHeight = viewHeight / 3;
                let relX, relY, posX, posY;
                let curX = clientX(e);
                let curY = clientY(e);
                if (curX < baseWidth) {
                    relX = "left";
                    posX = parseInt(searchBar.bar.style.left) > 0 ? parseInt(searchBar.bar.style.left) : 0;
                } else if (curX < baseWidth * 2) {
                    relX = "center";
                    posX = parseInt(searchBar.bar.style.left) - viewWidth / 2;
                } else {
                    relX = "right";
                    posX = viewWidth - parseInt(searchBar.bar.style.left) - searchBar.bar.scrollWidth;
                }
                if (curY < viewHeight / 2) {
                    relY = "top";
                    posY = parseInt(searchBar.bar.style.top);
                } else {
                    relY = "bottom";
                    posY = viewHeight - parseInt(searchBar.bar.style.top) - searchBar.bar.scrollHeight;
                    if (posY < 0) {
                        posY = 0;
                    }
                }
                logoSvg.style.cursor = "";
                searchBar.closeOpenType();
                searchBar.initPos(relX, relY, posX, posY);
                storage.setItem("searchData", searchData);
            };

            let startPos = {x: 0, y: 0};
            let mouseMoveHandler = e => {
                let curX = clientX(e);
                let curY = clientY(e);
                if (Math.abs(startPos.x - curX) + Math.abs(startPos.y - curY) < 50) return;
                if (grabState === 1) {
                    clearTimeout(hideTimer);
                    logoSvg.style.cursor = "grabbing";
                    searchBar.bar.style.position = "fixed";
                    searchBar.bar.style.marginLeft = "0";
                    searchBar.bar.style.marginTop = "0";
                    searchBar.bar.style.right = "";
                    searchBar.bar.style.bottom = "";
                    searchBar.bar.style.transform = "unset";
                    searchBar.con.classList.remove("search-jumper-scroll");
                    searchBar.bar.className = "search-jumper-searchBar grabbing";
                }
                grabState = 2;
                searchBar.bar.style.left = curX - searchBar.bar.scrollWidth + 20 + "px";
                searchBar.bar.style.top = curY - searchBar.bar.scrollHeight + 20 + "px";
            };

            logoBtn.oncontextmenu = function (event) {
                searchBar.bar.style.display = 'none';
                event.preventDefault();
            };

            logoBtn.addEventListener('mousedown', e => {
                if (touchStart) {
                    touchStart = false;
                    return;
                }
                if (e.button === 2) {
                    if (searchData.prefConfig.resizePage) {
                        if (typeof searchBar.initBodyStyle != "undefined") getBody(document).style.cssText = searchBar.initBodyStyle;
                        searchBar.con.classList.remove("resizePage");
                    }
                    document.removeEventListener('mouseup', mouseUpHandler, false);
                    document.removeEventListener('mousemove', mouseMoveHandler, false);
                    document.removeEventListener('touchend', mouseUpHandler, false);
                    document.removeEventListener('touchmove', mouseMoveHandler, false);
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                if (searchBar.inInput || e.button === 1 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
                    _GM_openInTab(configPage, {active: true, insert: true});
                    return;
                }
                grabState = 1;
                startPos = {x: clientX(e), y: clientY(e)};
                document.addEventListener('mouseup', mouseUpHandler, false);
                setTimeout(() => {
                    if (grabState === 1) {
                        document.addEventListener('mousemove', mouseMoveHandler, false);
                    }
                }, 100);
                hideTimer = setTimeout(() => {
                    searchBar.bar.style.display = 'none';
                    document.removeEventListener('mouseup', mouseUpHandler, false);
                    document.removeEventListener('mousemove', mouseMoveHandler, false);
                }, 2000);
            }, false);

            logoBtn.addEventListener('touchstart', e => {
                e.preventDefault();
                e.stopPropagation();
                touchStart = true;
                grabState = 1;
                startPos = {x: clientX(e), y: clientY(e)};
                document.addEventListener('touchend', mouseUpHandler, false);
                setTimeout(() => {
                    if (grabState === 1) {
                        document.addEventListener('touchmove', mouseMoveHandler, false);
                    }
                }, 100);
                hideTimer = setTimeout(() => {
                    searchBar.bar.style.display = 'none';
                    if (searchData.prefConfig.resizePage) {
                        if (typeof searchBar.initBodyStyle != "undefined") getBody(document).style.cssText = searchBar.initBodyStyle;
                        searchBar.con.classList.remove("resizePage");
                    }
                    document.removeEventListener('touchend', mouseUpHandler, false);
                    document.removeEventListener('touchmove', mouseMoveHandler, false);
                }, 1500);
            }, { passive: false, capture: false });

            searchBar.bar.addEventListener(getSupportWheelEventName(), e => {
                if (e.target.parentNode && (e.target.parentNode.className == "sitelistCon" ||
                                            (e.target.parentNode.parentNode && e.target.parentNode.parentNode.className == "sitelistCon"))) return;
                let targetClassList = searchBar.con.classList;
                if (!targetClassList.contains('search-jumper-scroll')) return;
                if (targetClassList.contains('search-jumper-left') ||
                    targetClassList.contains('search-jumper-right')) return;
                var deltaX, deltaY;
                if(e.type !== 'wheel'){
                    var x = 0, y = 0;
                    if (typeof e.axis == 'number') {
                        if (e.axis == 2) {
                            y = e.detail;
                        } else {
                            x = e.detail;
                        }
                    } else {
                        if (typeof e.wheelDeltaY == 'undefined' || e.wheelDeltaY != 0) {
                            y = -e.wheelDelta / 40;
                        } else {
                            x = -e.wheelDelta / 40;
                        };
                    };
                    deltaY = y;
                    deltaX = x;

                } else {
                    deltaX = e.deltaX;
                    deltaY = e.deltaY;
                }
                e.preventDefault();
                e.stopPropagation();

                searchBar.con.scrollLeft += deltaY;
            }, { passive: false, capture: false });

            if (searchData.prefConfig.shortcut &&
                (searchData.prefConfig.switchSitesPreKey ||
                 searchData.prefConfig.switchSitesNextKey ||
                 searchData.prefConfig.shortcutKey ||
                 searchData.prefConfig.showAllShortcutKey)) {
                let inputing = -1, key = false;
                let checkShortcutEnable = (e, _alt, _ctrl, _shift, _meta, _key) => {
                    if ((_alt && !e.altKey) ||
                        (_ctrl && !e.ctrlKey) ||
                        (_shift && !e.shiftKey) ||
                        (_meta && !e.metaKey)) {
                        return false;
                    }
                    if (!key) key = (e.key || String.fromCharCode(e.keyCode)).toLowerCase();
                    if (_key != key && _key != e.code) {
                        return false;
                    }
                    if (!searchData.prefConfig.enableInInput && inputing == -1) {
                        inputing = 1;
                        if (!_ctrl && !_alt && !_shift && !_meta && inputActive(document)) return false;
                    }
                    inputing = 0;
                    e.preventDefault();
                    e.stopPropagation();
                    return true;
                };
                document.addEventListener('mouseenter', e => {
                    if (e.target && !searchBar.contains(e.target)) {
                        hoverElement = e.target;
                    }
                }, true);
                document.addEventListener('keydown', e => {
                    if (e.target.id === "searchJumperInput") return;
                    inputing = -1;
                    key = false;
                    if (searchData.prefConfig.shortcutKey) {
                        if (checkShortcutEnable(e, searchData.prefConfig.callBarAlt, searchData.prefConfig.callBarCtrl, searchData.prefConfig.callBarShift, searchData.prefConfig.callBarMeta, searchData.prefConfig.shortcutKey)) {
                            searchBar.setFuncKeyCall(false);
                            searchBar.showInPage();
                            if (!searchData.prefConfig.disableInputOnWords || searchBar.inInput || !getSelectStr()) {
                                searchBar.showSearchInput();
                            }
                        }
                    }
                    if (inputing == 1) return;
                    if (searchData.prefConfig.showAllShortcutKey) {
                        if (checkShortcutEnable(e, searchData.prefConfig.showAllAlt, searchData.prefConfig.showAllCtrl, searchData.prefConfig.showAllShift, searchData.prefConfig.showAllMeta, searchData.prefConfig.showAllShortcutKey)) {
                            searchBar.appendBar();
                            searchBar.showAllSites();
                        }
                    }
                    if (currentSite && searchBar.bar.style.display !== "none") {
                        if (searchData.prefConfig.switchSitesPreKey) {
                            if (checkShortcutEnable(e, searchData.prefConfig.switchSitesAlt, searchData.prefConfig.switchSitesCtrl, searchData.prefConfig.switchSitesShift, searchData.prefConfig.switchSitesMeta, searchData.prefConfig.switchSitesPreKey)) {
                                searchBar.switchSite();
                                return;
                            }
                        }
                        if (searchData.prefConfig.switchSitesNextKey) {
                            if (checkShortcutEnable(e, searchData.prefConfig.switchSitesAlt, searchData.prefConfig.switchSitesCtrl, searchData.prefConfig.switchSitesShift, searchData.prefConfig.switchSitesMeta, searchData.prefConfig.switchSitesNextKey)) {
                                searchBar.switchSite(true);
                            }
                        }
                    }
                }, true);
            }
            let clickHandler;
            if (searchData.prefConfig.enableInPage) {
                let shown = false;
                let showToolbarTimer;
                let tripleClick = false;

                let clientRect;
                document.addEventListener('selectionchange', (e) => {
                    if (searchData.prefConfig.leftMouse || searchData.prefConfig.middleMouse) {
                        if (window.getSelection().toString()) {
                            const selection = window.getSelection();
                            const range = selection.getRangeAt(0);
                            clientRect = range.getBoundingClientRect();
                        } else {
                            clientRect = null;
                        }
                    }
                });
                let waitForMouse = false;
                clickHandler = e => {
                    if (shown) {
                        e.preventDefault();
                    }
                    shown = false;
                    document.removeEventListener('click', clickHandler, true);
                };
                function isTargetInput(target) {
                    let targetInput = false;
                    if (inputActive(document)) {
                        targetInput = true;
                    } else {
                        let contentEditable = false;
                        let parent = target;
                        while (parent) {
                            contentEditable = parent.contentEditable == 'true';
                            if (contentEditable || parent.nodeName.toUpperCase() == 'BODY') {
                                break;
                            }
                            parent = parent.parentNode;
                        }
                        if (contentEditable) {
                            targetInput = true;
                        }
                    }
                    return targetInput;
                }
                let mouseDownHandler = e => {
                    if ((waitForMouse && e.type === 'mousedown' && e.button === 0) ||
                        (e.target.classList && e.target.classList.contains('search-jumper-btn')) ||
                        searchBar.contains(e.target)) {
                        return;
                    }
                    if (searchBar.bar.classList.contains("grabbing")) return;
                    let targetInput = isTargetInput(e.target);
                    let inputSign = !searchData.prefConfig.enableInInput && targetInput;
                    if (inputSign && e.type === 'dblclick') return;
                    if (searchData.prefConfig.minPopup == 2) {
                        if (targetInput) {
                            searchBar.con.classList.add("targetInput");
                        } else searchBar.con.classList.remove("targetInput");
                    }
                    if (e.type === "touchstart") {
                        if (searchData.prefConfig.selectToShow) {
                            setTimeout(() => {
                                if (getSelectStr()) {
                                    searchBar.showInPage(true, e);
                                } else searchBar.waitForHide(0);
                            }, 0);
                        }
                        return;
                    }
                    waitForMouse = true;
                    setTimeout(() => {
                        waitForMouse = false;
                    }, 500);
                    shown = false;
                    targetElement = e.target;
                    searchBar.closePopupWindow();
                    let matchKey = false;
                    if ((searchData.prefConfig.altKey ||
                         searchData.prefConfig.ctrlKey ||
                         searchData.prefConfig.shiftKey ||
                         searchData.prefConfig.metaKey) &&
                        !((searchData.prefConfig.altKey && !e.altKey) ||
                          (searchData.prefConfig.ctrlKey && !e.ctrlKey) ||
                          (searchData.prefConfig.shiftKey && !e.shiftKey) ||
                          (searchData.prefConfig.metaKey && !e.metaKey))) {
                        matchKey = true;
                    }
                    if (!searchData.prefConfig.selectToShow) {
                        if ((e.button === 0 && !searchData.prefConfig.leftMouse) || (e.button === 1 && !searchData.prefConfig.middleMouse)) {
                            searchBar.waitForHide(0);
                            return;
                        }
                    }
                    let startX = e.clientX;
                    let startY = e.clientY;
                    let moved = false;
                    let inpageMouseMoveHandler = e => {
                        if (Math.abs(startX - e.clientX) + Math.abs(startY - e.clientY) > 2) {
                            clearTimeout(showToolbarTimer);
                            document.removeEventListener('mousemove', inpageMouseMoveHandler, true);
                            e.target.removeEventListener('scroll', scrollHandler);
                            moved = true;
                        }
                    };
                    let scrollHandler = e => {
                        clearTimeout(showToolbarTimer);
                        document.removeEventListener('mousemove', inpageMouseMoveHandler, true);
                        e.target.removeEventListener('scroll', scrollHandler);
                    };
                    let inpageMouseUpHandler = e => {
                        draging = false;
                        if (searchBar.contains(e.target) || shown) {
                            e.preventDefault();
                        } else {
                            setTimeout(() => {
                                if (shown) return;
                                if (/^pv-/.test(e.target.className)) return;
                                targetInput = isTargetInput(e.target);
                                inputSign = !searchData.prefConfig.enableInInput && targetInput;
                                if (!inputSign && (
                                    (matchKey && e.button === 2) ||
                                    ((moved || tripleClick) && e.button === 0 && searchData.prefConfig.selectToShow && getSelectStr())
                                )) {
                                    searchBar.showInPage(true, e);
                                } else {
                                    waitForMouse = false;
                                    searchBar.waitForHide(0);
                                }
                            }, 0);
                        }
                        clearTimeout(showToolbarTimer);
                        document.removeEventListener('mouseup', inpageMouseUpHandler, true);
                        document.removeEventListener('mousemove', inpageMouseMoveHandler, true);
                        e.target.removeEventListener('scroll', scrollHandler);
                    };
                    if (e.type === 'dblclick') {
                        if (getSelectStr() !== '') {
                            shown = true;
                            draging = false;
                            document.removeEventListener('mouseup', inpageMouseUpHandler, true);
                            document.removeEventListener('mousemove', inpageMouseMoveHandler, true);
                            e.target.removeEventListener('scroll', scrollHandler);
                            clearTimeout(showToolbarTimer);
                            setTimeout(() => {//wait for triple click
                                searchBar.showInPage(true, e);
                            }, 200);
                        } else {
                            tripleClick = true;
                            setTimeout(() => {
                                tripleClick = false;
                            }, 200);
                        }
                        return;
                    }
                    if (showToolbarTimer) clearTimeout(showToolbarTimer);
                    showToolbarTimer = setTimeout(() => {
                        if (draging) return;
                        if (targetElement != e.target) return;
                        if (e.button === 1 && !searchData.prefConfig.middleMouse) return;
                        if (e.button === 2 && !searchData.prefConfig.rightMouse) return;
                        if (e.button === 0 && !searchData.prefConfig.leftMouse) return;
                        //if (e.button === 0 && getSelectStr() !== '') return;
                        if (searchData.prefConfig.longPressTile) {
                            searchBar.showInPage(true, e);
                        } else {
                            searchBar.setFuncKeyCall(false);
                            searchBar.showInPage();
                        }
                        shown = true;
                    }, parseInt(searchData.prefConfig.longPressTime));
                    let canShow = false;
                    if (e.button === 2) {
                        if (matchKey) {
                            canShow = true;
                        }
                    } else {
                        if (e.button === 0) {
                            if (searchData.prefConfig.leftMouse) {
                                canShow = true;
                            }
                        } else if (e.button === 1) {
                            if (searchData.prefConfig.middleMouse) {
                                canShow = true;
                            }
                        }
                        if (canShow) {
                            if (inputSign) {
                                canShow = false;
                            } else if (!clientRect) {
                                canShow = false;
                            } else if (e.clientX < clientRect.left) {
                                canShow = false;
                            } else if (e.clientX > clientRect.left + clientRect.width) {
                                canShow = false;
                            } else if (e.clientY < clientRect.top) {
                                canShow = false;
                            } else if (e.clientY > clientRect.top + clientRect.height) {
                                canShow = false;
                            }
                        }
                    }
                    if (canShow) {
                        setTimeout(() => {
                            if (!draging) {
                                searchBar.showInPage(true, e);
                            }
                            document.removeEventListener('mousemove', inpageMouseMoveHandler, true);
                            e.target.removeEventListener('scroll', scrollHandler);
                        }, 200);
                        shown = true;
                        document.addEventListener('mouseup', inpageMouseUpHandler, true);
                        document.addEventListener('click', clickHandler, true);
                        return false;
                    }
                    document.addEventListener('mousemove', inpageMouseMoveHandler, true);
                    document.addEventListener('mouseup', inpageMouseUpHandler, true);
                    e.target.addEventListener('scroll', scrollHandler);
                };
                document.addEventListener('mousedown', mouseDownHandler, true);
                document.addEventListener('dblclick', mouseDownHandler, true);
                if (searchData.prefConfig.selectToShow) {
                    let touchTimer, touchstartEvent;
                    let selectionchange = e => {
                        clearTimeout(touchTimer);
                        touchTimer = setTimeout(() => {
                            if (window.getSelection().toString()) {
                                mouseDownHandler(touchstartEvent);
                                document.removeEventListener('selectionchange', selectionchange);
                            }
                        }, 300);
                    };
                    document.addEventListener('touchstart', e => {
                        if (e.isTrusted === false) return;
                        touchstartEvent = e;
                        document.addEventListener('selectionchange', selectionchange);
                    });
                }
                document.addEventListener('contextmenu', e => {
                    if (shown) e.preventDefault();
                    shown = false;
                });
            }
            if (searchData.prefConfig.dragToSearch && !isInConfigPage) {
                getBody(document).addEventListener('dragstart', e => {
                    if (!e.isTrusted ||
                        (searchData.prefConfig.dragAlt && !e.altKey) ||
                        (searchData.prefConfig.dragCtrl && !e.ctrlKey) ||
                        (searchData.prefConfig.dragShift && !e.shiftKey) ||
                        (searchData.prefConfig.dragMeta && !e.metaKey)) {
                        return;
                    }
                    if (!searchData.prefConfig.enableInInput && !e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey && inputActive(document)) {
                        return;
                    }
                    targetElement = e.target;
                    if (targetElement.nodeType !== 1) targetElement = targetElement.parentNode;
                    if (targetElement.shadowRoot) {
                        targetElement = targetElement.shadowRoot.activeElement || targetElement;
                    }
                    if (targetElement.getAttribute && targetElement.getAttribute("draggable") == "true") return;
                    if (targetElement.parentNode && targetElement.parentNode.getAttribute && targetElement.parentNode.getAttribute("draggable") == "true") return;
                    searchBar.funcKeyCall = true;
                    searchBar.waitForHide(0);
                    setTimeout(() => {
                        showDragSearch(e.clientX, e.clientY);
                    }, 2);
                    if (clickHandler) document.removeEventListener('click', clickHandler, true);
                    draging = true;
                });
            }
            if (searchData.prefConfig.quickAddRule) {
                document.addEventListener('click', e => {
                    if (!(((e.ctrlKey || e.metaKey) && e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.altKey) || (e.altKey && e.shiftKey))) return;
                    if (!/^(INPUT|TEXTAREA)$/i.test(e.target.nodeName)) return;
                    if (/^INPUT$/i.test(e.target.nodeName) && e.target.type && e.target.type != 'text' && e.target.type != 'search') return;
                    quickAddByInput(e.target);
                }, true);
            }
            let changeTimer, changeHandler = e => {
                clearTimeout(changeTimer);
                changeTimer = setTimeout(() => {
                    searchBar.refresh();
                }, 100);
            }
            document.addEventListener("fullscreenchange", e => {
                if (document.fullscreenElement) {
                    searchBar.bar.style.display = 'none';
                }
            });
            let waitForClick = false;
            let clickAHandler = e => {
                if (waitForClick) return;
                waitForClick = true;
                setTimeout(() => {
                    waitForClick = false;
                }, 300);
                let _t = e.target;
                if (currentSite && _t) {
                    if (_t.nodeName && _t.nodeName.toLowerCase && _t.nodeName.toLowerCase() == 'a') {
                        searchBar.updateCacheKeywords();
                        storage.setItem("clickLink", _t.href);
                    } else {
                        let _tp = _t.parentNode;
                        if (_tp && _tp.nodeName && _tp.nodeName.toLowerCase && _tp.nodeName.toLowerCase() == 'a') {
                            searchBar.updateCacheKeywords();
                            storage.setItem("clickLink", _t.href);
                        }
                    }
                }
            };
            getBody(document).addEventListener("auxclick", clickAHandler, true);
            getBody(document).addEventListener("click", clickAHandler, true);
            let _wr = function(type) {
                var orig = history[type];
                return function() {
                    var rv = orig.apply(this, arguments);
                    let _href = location.href.slice(0, 500);
                    if (href != _href) {
                        href = _href;
                        var e = new Event('sj_' + type);
                        e.arguments = arguments;
                        window.dispatchEvent(e);
                    }
                    return rv;
                };
            };
            //history.pushState = _wr('pushState');
            //history.replaceState = _wr('replaceState');
            window.addEventListener('sj_pushState', changeHandler);
            window.addEventListener('sj_replaceState', changeHandler);

            window.addEventListener('yt-navigate-finish', changeHandler);
            window.addEventListener("securitypolicyviolation", (e) => {
                if (e.violatedDirective === 'form-action') {
                    jumpBySearchJumper();
                }
            });

            /*let headObserverOptions = {
                childList: true
            };
            let checkCssEle = ele => {
                if (ele === mainStyleEle) {
                    mainStyleEle = _GM_addStyle(cssText);
                }
            };
            let headObserver = new MutationObserver((mutationsList, observer) => {
                for (let mutation of mutationsList) {
                    if (mutation.type === 'childList' && mutation.removedNodes.length) {
                        [].forEach.call(mutation.removedNodes, removedNode => {
                            checkCssEle(removedNode);
                        });
                    }
                }
            });
            headObserver.observe(document.head, headObserverOptions);*/

            let lastUrl = window.location.href;
            let removeMark = node => searchBar.removeMark(node);
            let highlight = (words, node) => searchBar.highlight(words, node);
            let appendBar = () => searchBar.appendBar();
            let bodyObserverOptions = {
                childList: true,
                characterData: true,
                subtree: true
            };
            let highlightTimes = 0;
            let bodyObserver = new MutationObserver((mutationsList, observer) => {
                const hasRelevantMutation = mutationsList.some(mutation => mutation.type === 'childList' || mutation.type === 'attributes');
                if (hasRelevantMutation) {
                    const currentUrl = window.location.href;
                    if (currentUrl !== lastUrl) {
                        lastUrl = currentUrl;
                        changeHandler();
                        searchBar.checkDiscussions();
                    }
                }
                let lockWords = searchBar.lockWords;
                if (lockWords) {
                    if (searchBar.initHighlight && highlightTimes > 100) return;
                    for (let mutation of mutationsList) {
                        if (mutation.type === "characterData") {
                            let parentNode = mutation.target.parentNode;
                            if (!parentNode) {
                                return;
                            }
                            let sibling = mutation.target.previousElementSibling;
                            if (sibling && !sibling.dataset.inited && sibling.className === "searchJumper") {
                                sibling.dataset.inited = true;
                                return;
                            }
                            sibling = mutation.target.nextElementSibling;
                            if (sibling && !sibling.dataset.inited && sibling.className === "searchJumper") {
                                sibling.dataset.inited = true;
                                return;
                            }
                            searchBar.checkCharacterData(parentNode);
                            searchBar.initHighlight && highlightTimes++;
                        }
                        if (mutation.removedNodes.length) {
                            [].forEach.call(mutation.removedNodes, removedNode => {
                                if (removedNode.nodeType !== 1) return;
                                if (removedNode.classList && removedNode.classList.contains("searchJumper")) {
                                    removeMark(removedNode);
                                } else if (removedNode.children.length) {
                                    [].forEach.call(removedNode.querySelectorAll("mark.searchJumper,a.searchJumper,input.searchJumper,textarea.searchJumper"), node => {
                                        removeMark(node);
                                    });
                                }
                            });
                        }
                        if (mutation.addedNodes.length) {
                            for (let i = 0; i < mutation.addedNodes.length; i++) {
                                let addedNode = mutation.addedNodes[i], target;
                                if (addedNode.nodeType === 1) {
                                    if (/^searchJumper$/.test(addedNode.className)) {
                                        continue;
                                    }
                                    target = addedNode;
                                } else {
                                    if (addedNode.previousElementSibling && /^searchJumper$/.test(addedNode.previousElementSibling.className)) {
                                        continue;
                                    } else if (addedNode.nextElementSibling && /^searchJumper$/.test(addedNode.nextElementSibling.className)) {
                                        continue;
                                    }
                                    target = addedNode.parentNode;
                                }
                                if (target) {
                                    setTimeout(() => {
                                        highlight("insert", target);
                                    }, 0);
                                    searchBar.initHighlight && highlightTimes++;
                                }
                            }
                        }
                    }
                    appendBar();
                }
            });
            bodyObserver.observe(getBody(document), bodyObserverOptions);
        }

        function canonicalUri(src, href) {
            if (!src) {
                return "";
            }
            let origin, basePath;
            if (!href) {
                if (src.charAt(0) == "#") return location.href + src;
                if (src.charAt(0) == "?") return location.href.replace(/^([^\?#]+).*/, "$1" + src);
                origin = location.protocol + '//' + location.host;
                let base = document.querySelector("base");
                basePath = base ? base.href : location.href;
            } else {
                origin = href.replace(/(^https?:\/\/.+)\/[^\/]*$/, "$1");
                basePath = href;
            }
            let url = basePath || origin;
            url = url.replace(/(\?|#).*/, "");
            if (/https?:\/\/[^\/]+$/.test(url)) url = url + '/';
            if (url.indexOf("http") !== 0) url = origin + url;
            var root_page = /^[^\?#]*\//.exec(url)[0],
                root_domain = /^\w+\:\/\/\/?[^\/]+/.exec(root_page)[0],
                absolute_regex = /^\w+\:\/\//;
            src = src.replace(/^\/(\.\.\/)+/, "/");
            while (src.indexOf("../") === 0) {
                src = src.substr(3);
                root_page = root_page.replace(/\/[^\/]+\/$/, "/");
            }
            src = src.replace(/\.\//, "");
            if (/^\/\/\/?/.test(src)) {
                src = location.protocol + src;
            }
            return (absolute_regex.test(src) ? src : ((src.charAt(0) == "/" ? root_domain : root_page) + src));
        }

        function quickAddByInput(input) {
            if (shareEngines) return;
            let parentForm, url = location.href;
            if (input && input.name) {
                parentForm = input.parentNode;
                while (parentForm) {
                    if (parentForm.nodeName.toUpperCase() === "FORM") {
                        let target = parentForm.target;
                        if (target && typeof target == "string" && target != '_blank' && target != '_self' && target != '_parent' && target != '_top') {
                            let targetIframe = getBody(document).querySelector(target);
                            if (!targetIframe) {
                                parentForm = null;
                                break;
                            }
                        }
                        break;
                    }
                    parentForm = parentForm.parentNode;
                }
            }
            let fail = () => {
                if (window.confirm(i18n("noValidItemAsk"))) {
                    return false;
                }
                return true;
            }
            if (parentForm) {
                url = canonicalUri(parentForm.getAttribute("action") || url);
                let params = [];
                let formData = new FormData(parentForm);
                for (let [key, value] of formData) {
                    if (input.name === key) {
                        value = "%s";
                    } else value = encodeURIComponent(value);
                    params.push(key + "=" + value);
                }
                if (parentForm.method.toLowerCase() == "post") {
                    url += "%p{" + params.join("&") + "}";
                    if (parentForm.action.indexOf(location.origin) == 0 && location.pathname && location.pathname !== "/") url += `#from{${location.pathname.slice(1)}}`;
                } else {
                    let existParams = url.match(/\?(.*)/);
                    if (existParams) {
                        url = url.replace(existParams[0], "");
                        existParams[1].split("&").forEach(existParam => {
                            let existSplit = existParam.split("=");
                            let key = existSplit[0];
                            if (params.findIndex(p => p.indexOf(key + "=") === 0) !== -1) return;
                            let value = existSplit[1];
                            if (value == input.value) value = "%s";
                            params.push(key + "=" + value);
                        });
                    }
                    url += "?" + params.join("&");
                }
            } else if (input && input.value) {
                if (location.href.indexOf(input.value) !== -1) {
                    url = location.href.replace(input.value, "%s");
                } else {
                    let encodeValue = encodeURIComponent(input.value);
                    if (location.pathname.indexOf(encodeValue) !== -1 || location.search.indexOf(encodeValue) !== -1) {
                        url = location.origin + location.pathname.replace(encodeValue, "%s") + location.search.replace(encodeValue, "%s");
                    } else {
                        encodeValue = escape && escape(input.value);
                        if (encodeValue && location.pathname.indexOf(encodeValue) !== -1 || location.search.indexOf(encodeValue) !== -1) {
                            url = location.origin + location.pathname.replace(encodeValue, "%se") + location.search.replace(encodeValue, "%se");
                        } else {
                            if (fail()) return;
                        }
                    }
                }
            } else {
                if (fail()) return;
            }
            let icons = [];
            [].forEach.call(document.querySelectorAll("link[rel='shortcut icon'],link[rel='icon'],link[rel='fluid-icon'],link[rel='apple-touch-icon']"), link => {
                if (icons.indexOf && icons.indexOf(link.href) !== -1) return;
                icons.push(link.href);
            });
            showSiteAdd(document.title.replace(input ? input.value : "", "").replace(/^\s*[-_]\s*/, ""), "", url, icons, document.characterSet);
        }

        const jumpHtml = ext ? chrome.runtime.getURL('config/jump.html') : "https://hoothin.github.io/SearchJumper/jump.html";
        function jumpBySearchJumper() {
            let jumpTo = `${jumpHtml}#jump{url=${encodeURIComponent(currentFormParams.url)}&charset=${currentFormParams.charset}}`;
            if (currentFormParams.target == '_self') {
                if (ext) {
                    _GM_openInTab(jumpTo, {active: true, insert: true, close: true});
                } else {
                    location.href = jumpTo;
                }
            } else {
                _GM_openInTab(jumpTo, {active: true, insert: true});
            }
        }

        function preAction() {
            if (href.indexOf(jumpHtml) != -1) {
                let submitParams = href.match(/#jump{url=(.*)&charset=(.*)}/);
                if (submitParams) {
                    submitByForm(submitParams[2], decodeURIComponent(submitParams[1]), '_self');
                }
            }
        }

        var shareEngines;
        async function checkConfigPage() {
            if (href.indexOf(configPage) === 0 || ((document.title === "SearchJumper" || document.querySelector('[name="from"][content="SearchJumper"]')) && document.querySelector('[name="author"][content="Hoothin"]'))) {
                shareEngines = document.querySelector('[name="engines"]');
                let spotlight = document.getElementById("spotlight");
                if (shareEngines) {
                    try {
                        shareEngines = shareEngines.getAttribute("content");
                        if (shareEngines.indexOf("http") === 0) {
                            if (spotlight) {
                                const loadingCollection = i18n("loadingCollection");
                                spotlight.innerText = loadingCollection;
                                spotlight.setAttribute("spotlight", loadingCollection);
                            }
                            let config = await new Promise((resolve) => {
                                if (ext) {
                                    chrome.runtime.sendMessage({action: "getShareEngines", detail: {engineUrl: shareEngines}}, function(r) {
                                        resolve(r);
                                    });
                                } else {
                                    _GM_xmlhttpRequest({
                                        method: 'GET',
                                        url: shareEngines,
                                        onload: function(result) {
                                            var jsonData = null;
                                            try {
                                                jsonData = JSON.parse(result.responseText);
                                                resolve(jsonData);
                                            } catch (e) {
                                                console.log(e);
                                                resolve(false);
                                            }
                                        },
                                        onerror: function(e) {
                                            console.log(e);
                                            resolve(false);
                                        },
                                        ontimeout: function(e) {
                                            console.log(e);
                                            resolve(false);
                                        }
                                    });
                                }
                            });
                            if (config) {
                                searchData.sitesConfig = config;
                                shareEngines = true;
                            } else {
                                shareEngines = false;
                            }
                        } else {
                            searchData.sitesConfig = JSON.parse(decodeURI(shareEngines));
                            shareEngines = true;
                        }
                    } catch (e) {
                        shareEngines = false;
                    }
                }
                let trustSite = href.indexOf(configPage.replace(/\/config.*/, "")) === 0 || href.indexOf(homePage) === 0 || href.indexOf(githubPage) === 0 || location.hostname === "localhost";
                if (trustSite) {
                    isAllPage = !!shareEngines || /all(\.html)?$/.test(location.pathname);
                }
                if (spotlight) {
                    spotlight.style.display = "none";
                } else {
                    setTimeout(() => {
                        spotlight = document.getElementById("spotlight");
                        if (spotlight) {
                            spotlight.style.display = "none";
                        }
                    }, 500);
                }
                return trustSite;
            }
            return false;
        }

        async function initConfig() {
            isInConfigPage = await checkConfigPage();
            if (!isInConfigPage && searchData.webdavConfig) {
                webDAV = new WebDAV(searchData.webdavConfig.host + "/SearchJumper" + (searchData.webdavConfig.path || "").replace(/^\/*/, "/").replace(/\/*$/, "/"), searchData.webdavConfig.username, searchData.webdavConfig.password);
            }
            if (isInConfigPage && !isAllPage) {
                let sendMessageTimer, received = false;
                let loadConfig = () => {
                    sendMessageTimer = setTimeout(() => {
                        if (!received) {
                            loadConfig();
                        }
                    }, 50);
                    window.postMessage({
                        searchData: searchData,
                        cacheIcon: cacheIcon,
                        version: _GM_info.script.version || 0,
                        command: 'loadConfig'
                    }, '*');
                }
                let delayTimeout = setTimeout(() => {
                    if (received) return;
                    location.reload();
                }, 3000);

                document.addEventListener('received', e => {
                    received = true;
                    clearTimeout(sendMessageTimer);
                    clearTimeout(delayTimeout);
                    if (cachePool.length > 0 && searchData.prefConfig.cacheSwitch) {
                        debug(`Start cache ${cachePool.length} icons!`);
                        cacheImgManager();
                    }
                });

                document.addEventListener('downloadCache', e => {
                    downloadCache();
                });

                document.addEventListener('importCache', e => {
                    let cacheData = e.detail ? e.detail.cacheData : e.cacheData;
                    importCache(cacheData);
                    _GM_notification('Cache imported successfully!');
                });

                document.addEventListener('showSiteAdd', e => {
                    let siteData = e.detail ? e.detail.site : e.site;
                    if (!siteData) return;
                    if (siteData.url) {
                        showSiteAdd(siteData.name, siteData.description, siteData.url, (siteData.icon ? [siteData.icon] : []), siteData.charset, siteData.kwFilter, siteData.match, siteData.hideNotMatch);
                    } else {
                        importFilter.open(siteData);
                    }
                });

                loadConfig();
                document.addEventListener('dataChanged', e => {
                    loadConfig();
                });

                let sendVerifyResult = (url, name, status, finalUrl) => {
                    window.postMessage({
                        url: url,
                        name: name,
                        status: status,
                        finalUrl: finalUrl,
                        command: 'verifyResult'
                    }, '*');
                };
                document.addEventListener('verifyUrl', e => {
                    let targetUrl = (e.detail ? e.detail.url : e.url);
                    let name = (e.detail ? e.detail.name : e.name);
                    _GM_xmlhttpRequest({
                        method: 'GET',
                        url: targetUrl,
                        headers: {
                            referer: targetUrl,
                            'User-Agent': navigator.userAgent
                        },
                        onload: function(e) {
                            sendVerifyResult(targetUrl, name, e && e.status, e && e.finalUrl);
                        },
                        onerror: function(e){
                            sendVerifyResult(targetUrl, name, 'error', '');
                        },
                        ontimeout: function(e){
                            sendVerifyResult(targetUrl, name, 'timeout', '');
                        }
                    });
                });

                let preSwitch = searchData.prefConfig.cacheSwitch;
                document.addEventListener('saveConfig', e => {
                    searchData = (e.detail ? e.detail.searchData : e.searchData) || _unsafeWindow.searchData;
                    storage.setItem("searchData", searchData);
                    let newCache = {}, oldCacheLength = cacheIcon ? Object.keys(cacheIcon).length : 0;
                    if (preSwitch == searchData.prefConfig.cacheSwitch) {
                        searchData.sitesConfig.forEach(type => {
                            if (/^[a-z\- ]+$/.test(type.icon || "") || /^http/.test(type.icon)) {
                                let icon = type.icon.trim().replace(/ /g, '_');
                                let typeCache = cacheIcon[icon];
                                if (typeCache) {
                                    newCache[icon] = typeCache;
                                }
                            }
                            type.sites.forEach(site => {
                                let icon = site.icon;
                                if (!icon) icon = site.url.replace(/^showTips:/, "").replace(/\?.*/, "").replace(/^(https?:\/\/[^\/]*\/)[\s\S]*$/, "$1favicon.ico");
                                if (/^http/.test(icon)) {
                                    let siteCache = cacheIcon[icon];
                                    if (siteCache) {
                                        newCache[icon] = siteCache;
                                    }
                                }
                            });
                        });
                        if (oldCacheLength !== Object.keys(newCache).length) {
                            cacheIcon = newCache;
                            storage.setItem("cacheIcon", newCache);
                        }
                    } else {
                        searchData.sitesConfig.forEach(type => {
                            if (/^http/.test(type.icon)) {
                                let typeCache = cacheIcon[type.icon];
                                if (typeCache) {
                                    if (typeCache === 'fail') {
                                        let img = document.createElement("img");
                                        img.src = type.icon;
                                        cachePool.push(img);
                                    } else {
                                        newCache[type.icon] = typeCache;
                                    }
                                }
                            }
                            type.sites.forEach(site => {
                                let icon = site.icon;
                                if (!icon) icon = site.url.replace(/^showTips:/, "").replace(/\?.*/, "").replace(/^(https?:\/\/[^\/]*\/)[\s\S]*$/, "$1favicon.ico");
                                if (/^http/.test(icon)) {
                                    let siteCache = cacheIcon[icon];
                                    if (siteCache) {
                                        if (siteCache === 'fail') {
                                            let img = document.createElement("img");
                                            img.src = icon;
                                            cachePool.push(img);
                                        } else {
                                            newCache[icon] = siteCache;
                                        }
                                    }
                                }
                            });
                        });
                        storage.setItem("cacheIcon", newCache);
                        if (searchData.prefConfig.cacheSwitch) {
                            if (cachePool.length > 0) {
                                _GM_notification(i18n('startCache'));
                                cacheImgManager(true);
                            }
                            cacheFontManager();
                        }
                    }
                    preSwitch = searchData.prefConfig.cacheSwitch;
                    if (e.notification || (e.detail && e.detail.notification)) {
                        _GM_notification('Configuration imported successfully!');
                    }
                });
                document.addEventListener('copyConfig', e => {
                    let copyTarget = searchData.sitesConfig.filter(type => {return type && !(/^BM/.test(type.type) && type.icon === "bookmark")});
                    _GM_setClipboard(JSON.stringify(copyTarget, null, 2));
                    _GM_notification('Configuration copied successfully!');
                });
            } else if (importPageReg.test(href)) {
                let importCss = _GM_addStyle(`
                    #import-btns-con {
                        position: absolute;
                        display: block;
                        font-size: 20px;
                        left: 0px;
                        top: 0px;
                        width: 100%;
                        height: 100%;
                    }
                    #import-btns-con.hide {
                        pointer-events: none;
                    }
                    #import-btns-con>button {
                        opacity: 0.5;
                    }
                    #import-btns-con>button:hover {
                        opacity: 0.9;
                    }
                    #import-btn {
                        position: absolute;
                        display: block;
                        font-size: 20px;
                        right: 45px;
                        top: 45px;
                        pointer-events: all;
                    }
                    #filter-btn {
                        position: absolute;
                        display: none;
                        font-size: 20px;
                        left: 45px;
                        top: 45px;
                        pointer-events: all;
                    }
                    .filter>#filter-btn {
                        display: block;
                    }
                    #import-btns-con>h3 {
                        float: left;
                        margin-left: 20px;
                    }
                    #import-btns-con.hide>h3 {
                        display: none;
                    }
                `);
                let targetPre, ruleType = 0;
                let importBtn = document.createElement("button");
                importBtn.id = "import-btn";
                importBtn.className = "btn Button--secondary Button";
                let filterBtn = document.createElement("button");
                filterBtn.id = "filter-btn";
                filterBtn.className = "btn Button--secondary Button";
                let ruleTitle = document.createElement("h3");
                let btnsCon = document.createElement("div");
                btnsCon.id = "import-btns-con";
                btnsCon.appendChild(importCss);
                btnsCon.appendChild(importBtn);
                btnsCon.appendChild(filterBtn);
                btnsCon.appendChild(ruleTitle);
                btnsCon.addEventListener("click", e => {
                    if (targetPre) targetPre.style.filter = "";
                    btnsCon.classList.add("hide");
                });
                importBtn.innerText = i18n("import");
                importBtn.addEventListener("click", e => {
                    if (shareEngines) return;
                    if (!targetPre) return;
                    let configTxt = targetPre.innerText.trim(), configData;
                    if (!configTxt) return;
                    try {
                        configData = JSON.parse(configTxt);
                    } catch (e) {
                        _GM_notification(e.toString());
                        return;
                    }
                    switch (ruleType) {
                        case 0:
                            if (window.confirm(i18n("importOrNot"))) {
                                if (btnsCon.parentNode) {
                                    btnsCon.parentNode.removeChild(btnsCon);
                                }
                                dataChanged(() => {
                                    searchData.sitesConfig = configData;
                                    searchData.lastModified = new Date().getTime();
                                    storage.setItem("searchData", searchData);
                                    _GM_notification(i18n("siteAddOver"));
                                    searchBar.refreshEngines();
                                }, true);
                            }
                            break;
                        case 1:
                            showSiteAdd(configData.name, "", configData.url, (configData.icon ? [configData.icon] : []), configData.charset, configData.kwFilter, configData.match, configData.hideNotMatch);
                            break;
                        case 2:
                            if (!searchData.prefConfig.inPageRule) searchData.prefConfig.inPageRule = {};
                            Object.keys(configData).forEach(key => {
                                let value = configData[key];
                                if (!value) return;
                                if (key.indexOf("@") === 0) {
                                    searchData.prefConfig.inPageRule[key] = value;
                                    return;
                                }
                                if (!value.words || value.words.length === 0) return;
                                let pre = "", sep = value.sep || "";
                                if (sep) {
                                    pre = "$c" + sep;
                                } else {
                                    sep = " ";
                                    if (value.words.length === 1) {
                                        let onlyWord = value.words[0];
                                        if (onlyWord.indexOf(" ") !== -1) {
                                            sep = "";
                                            pre = "$o";
                                        }
                                    }
                                }
                                searchData.prefConfig.inPageRule[key] = pre + value.words.join(sep);
                            });
                            storage.setItem("searchData", searchData);
                            _GM_notification('Over!');
                            break;
                    }
                });

                filterBtn.innerText = i18n("filter");
                filterBtn.addEventListener("click", e => {
                    if (targetPre) {
                        if (btnsCon.parentNode) {
                            btnsCon.parentNode.removeChild(btnsCon);
                        }
                        let configTxt = targetPre.innerText.trim(), configData;
                        if (!configTxt || configTxt.indexOf('[') !== 0) return;
                        try {
                            configData = JSON.parse(configTxt);
                            importFilter.open(configData);
                        } catch (e) {
                            _GM_notification(e.toString());
                        }
                    }
                });
                let bindPre = target => {
                    if (target == targetPre && btnsCon.parentNode) return;
                    let top = target.offsetTop + 'px';
                    let innerText = target.innerText.trim();
                    if (!innerText) return;
                    ruleTitle.innerText = "";
                    if (/^\[/.test(innerText)) {
                        ruleType = 0;
                        btnsCon.style.top = top;
                        btnsCon.classList.add("filter");
                    } else if (/^\{\s*"name"/.test(innerText)) {
                        ruleType = 1;
                        btnsCon.style.top = top;
                        btnsCon.classList.remove("filter");
                        ruleTitle.innerText = innerText.match(/"name":\s*"(.*)"/)[1];
                    } else if (/^\{/.test(innerText)) {
                        ruleType = 2;
                        btnsCon.style.top = top;
                        btnsCon.classList.remove("filter");
                    } else return;
                    if (targetPre) targetPre.style.filter = "";
                    target.parentNode.appendChild(btnsCon);
                    target.style.filter = "blur(5px)";
                    targetPre = target;
                    btnsCon.classList.remove("hide");
                };
                window.addEventListener("load", e => {
                    if (!targetPre) {
                        let _targetPre = document.querySelector('.highlight>pre');
                        if (_targetPre) {
                            bindPre(_targetPre);
                        }
                    }
                });

                document.addEventListener("mouseover", e => {
                    if (importPageReg.test(href)) {
                        if (e.target.nodeName === "PRE") {
                            bindPre(e.target);
                        } else {
                            let target = e.target.children[0];
                            if (target && target.nodeName === "PRE") {
                                bindPre(target);
                            }
                        }
                    }
                });
            }
        }

        class ImportFilter {
            //static importFilter;
            constructor() {
                this.inited = false;
            }

            /*static getInstance() {
                if (!ImportFilter.importFilter) {
                    ImportFilter.importFilter = new ImportFilter();
                }
                return ImportFilter.importFilter;
            }*/

            init() {
                if (this.inited) return;
                this.inited = true;
                let self = this;
                this.openList = [];
                this.filterCss = `
                    #searchJumperFilter {
                        width: 100%;
                        height: 100%;
                        position: fixed;
                        top: 0;
                        left: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 100000;
                        background-color: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        -webkit-backdrop-filter: blur(5px);
                        transform: translateZ(0);
                    }
                    .searchJumperFrame-body {
                        width: 350px;
                        text-align: left;
                        background-color: #ffffff;
                        border: 1px solid #afb3b6;
                        border-radius: 10px;
                        opacity: 0.95;
                        filter: alpha(opacity=95);
                        box-shadow: 5px 5px 20px 0px #000;
                        color: #6e7070;
                        transition: all 0.25s ease;
                        border: 0;
                        font-size: initial;
                    }
                    .searchJumperFrame-title {
                        background: #458bd1!important;
                        display: flex!important;
                        align-items: center!important;
                        justify-content: center!important;
                        color: white!important;
                        font-weight: bold;
                        font-size: 18px!important;
                        border-radius: 10px 10px 0 0!important;
                    }
                    .searchJumperFrame-title>img {
                        margin: 5px;
                        height: 32px;
                        width: 32px;
                    }
                    .searchJumperFrame-buttons {
                        text-align: center;
                        margin: 5px;
                        display: flex;
                        justify-content: space-evenly;
                    }
                    .searchJumperFrame-buttons>button {
                        width: 32%;
                        font-size: 16px;
                        cursor: pointer;
                        border: 1px solid #1976d2;
                        border-radius: 4px;
                        transition: all .3s;
                        color: #fff;
                        background-color: #458bd1;
                        line-height: 25px;
                        padding: 3px;
                    }
                    .searchJumperFrame-buttons>button:hover {
                        color: #e3f2fd;
                    }
                    .searchJumperFrame-body>.sitesCon {
                        max-height: 70vh;
                        overflow: auto;
                        width: 100%;
                        border-top: 1px solid rgba(0, 0, 0, 0.23);
                        border-bottom: 1px solid rgba(0, 0, 0, 0.23);
                        padding: 5px;
                        user-select: none;
                        white-space: nowrap;
                    }
                    .searchJumperFrame-body>.sitesCon>details>summary>span,
                    .searchJumperFrame-body>.sitesCon>details>div>span {
                        line-height: 25px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 180px;
                        display: inline-block;
                        vertical-align: middle;
                    }
                    .searchJumperFrame-body>.sitesCon>details>summary>button {
                        display: none;
                        position: absolute;
                    }
                    .searchJumperFrame-body>.sitesCon>details>summary:hover>button {
                        display: inline-block;
                    }
                    .searchJumperFrame-body>.sitesCon input {
                        margin: 2px 5px;
                        width: 20px;
                        height: 20px;
                        vertical-align: sub;
                    }
                    .searchJumperFrame-body>.sitesCon div {
                        margin-left: 32px;
                    }
                    .searchJumperFrame-body>.sitesCon div.exist {
                        text-decoration:line-through;
                    }
                    @media (prefers-color-scheme: dark) {
                      .searchJumperFrame-body,
                      .searchJumperFrame-input-title,
                      .searchJumperFrame-inputs>input,
                      .searchJumperFrame-inputs>textarea,
                      .searchJumperFrame-inputs>select,
                      .searchJumperFrame-body select {
                        background-color: black;
                        color: #d5d5d5;
                      }
                      .searchJumperFrame-title,
                      .searchJumperFrame-buttons>button {
                        background: #245d8f!important;
                      }
                    }
                `;
                this.filterCssEle = _GM_addStyle(this.filterCss);
                this.filterFrame = document.createElement("div");
                this.filterFrame.id = "searchJumperFilter";
                this.filterFrame.innerHTML = createHTML(`
                <div class="searchJumperFrame-body">
                    <a href="${homePage}" class="searchJumperFrame-title" target="_blank">
                        <img onerror="this.style.display='none'" width="32px" height="32px" src="${logoBase64}" />${i18n("addSearchEngine")}
                    </a>
                    <div class="searchJumperFrame-buttons">
                        <button id="expandAll" type="button">${i18n("expandAll")}</button>
                        <button id="collapseAll" type="button">${i18n("collapseAll")}</button>
                    </div>
                    <div class="sitesCon"></div>
                    <div class="searchJumperFrame-buttons">
                        <button id="cancel" type="button">${i18n("siteCancel")}</button>
                        <button id="selectAll" type="button">${i18n("selectAll")}</button>
                        <button id="add" type="button">${i18n("import")}</button>
                    </div>
                </div>
                `);
                this.sitesCon = this.filterFrame.querySelector(".sitesCon");
                let add = this.filterFrame.querySelector("#add");
                let selectAll = this.filterFrame.querySelector("#selectAll");
                let expandAll = this.filterFrame.querySelector("#expandAll");
                let collapseAll = this.filterFrame.querySelector("#collapseAll");
                let checkMark = false;
                expandAll.addEventListener("click", e => {
                    [].forEach.call(this.filterFrame.querySelectorAll("details"), details => {
                        details.setAttribute("open", "open");
                    });
                });
                collapseAll.addEventListener("click", e => {
                    [].forEach.call(this.filterFrame.querySelectorAll("details"), details => {
                        details.removeAttribute("open");
                    });
                });
                selectAll.addEventListener("click", e => {
                    checkMark = !checkMark;
                    [].forEach.call(this.filterFrame.querySelectorAll("input[type=checkbox]"), checkbox => {
                        checkbox.checked = checkMark;
                    });
                });
                add.addEventListener("click", e => {
                    if (shareEngines) return;
                    dataChanged(() => {
                        let canImport = false;
                        [].forEach.call(this.filterFrame.querySelectorAll("details"), details => {
                            let typeName = details.children[0].children[0];
                            let typeData = self.typeDict[typeName.title];
                            typeData.type = typeName.innerText.trim();
                            typeData.sites = [];
                            [].forEach.call(details.querySelectorAll('div>[type="checkbox"]'), checkSite => {
                                if (checkSite.checked) {
                                    canImport = true;
                                    let curData = self.siteDict[checkSite.parentNode.title];
                                    let otherType = checkSite.nextElementSibling;
                                    if (!curData || !otherType) return;
                                    if (otherType.value === "0") {
                                        typeData.sites.push(curData);
                                    } else {
                                        let typeIndex = self.searchType(otherType.value);
                                        searchData.sitesConfig[typeIndex].sites.push(curData);
                                    }
                                }
                            });
                            if (typeData.sites.length) {
                                let typeIndex = self.searchType(typeData.type);
                                if (typeIndex === false) {
                                    searchData.sitesConfig.push(typeData);
                                } else {
                                    searchData.sitesConfig[typeIndex].sites = searchData.sitesConfig[typeIndex].sites.concat(typeData.sites);
                                }
                            }
                        });
                        if (canImport) {
                            searchData.lastModified = new Date().getTime();
                            storage.setItem("searchData", searchData);
                            _GM_notification(i18n("siteAddOver"));
                            searchBar.refreshEngines();
                            this.close();
                        }
                    });
                });
                this.filterFrame.addEventListener("click", e => {
                    if (e.target.id == "searchJumperFilter" || e.target.id == "cancel") {
                        this.close();
                    }
                });
            }

            searchType(type) {
                for (let i = 0; i < searchData.sitesConfig.length; i++) {
                    let typeData = searchData.sitesConfig[i];
                    if (typeData.type == type) return i;
                }
                return false;
            }

            searchUrl(url) {
                for (let i = 0; i < searchData.sitesConfig.length; i++) {
                    let sites = searchData.sitesConfig[i].sites;
                    for (let j = 0; j < sites.length; j++) {
                        if (sites[j].url.replace(/^https?/, "") == url.replace(/^https?/, "")) return true;
                    }
                }
                return false;
            }

            searchName(name) {
                for (let i = 0; i < searchData.sitesConfig.length; i++) {
                    let sites = searchData.sitesConfig[i].sites;
                    for (let j = 0; j < sites.length; j++) {
                        if (sites[j].name == name) {
                            let newName = name + "_1";
                            return this.searchName(newName);
                        }
                    }
                }
                return name;
            }

            anylizeType(typeData) {
                let self = this;
                let details = document.createElement("details");
                let summary = document.createElement("summary");
                let typeName = document.createElement("span");
                typeName.title = typeData.type;
                typeName.innerText = typeData.type;
                summary.appendChild(typeName);
                let checkType = document.createElement("input");
                checkType.type = 'checkbox';
                summary.appendChild(checkType);
                let renameBtn = document.createElement("button");
                renameBtn.innerText = i18n("rename");
                renameBtn.addEventListener("click", e => {
                    let newName = window.prompt(i18n('rename'), typeName.innerText);
                    if (newName) typeName.innerText = newName;
                });
                summary.appendChild(renameBtn);
                details.appendChild(summary);
                for (let i = 0; i < this.openList.length; i++) {
                    if (this.openList[i] == typeData.type) {
                        details.setAttribute("open", "open");
                        break;
                    }
                }
                let sites = [];
                this.typeDict[typeData.type] = typeData;
                if (typeData.sites) {
                    typeData.sites.forEach(siteData => {
                        let siteCon = document.createElement("div");
                        let siteName = document.createElement("span");
                        siteName.innerText = siteData.name;
                        siteData.name = self.searchName(siteData.name);
                        siteCon.appendChild(siteName);
                        siteCon.title = siteData.url;
                        details.appendChild(siteCon);
                        if (self.searchUrl(siteData.url)) {
                            siteCon.classList.add("exist");
                            return;
                        }
                        let checkSite = document.createElement("input");
                        checkSite.type = 'checkbox';
                        checkSite.onclick = e => {
                            if (!checkSite.checked) {
                                checkType.checked = false;
                            } else {
                                let allchecked = true;
                                for (let i = 0; i < sites.length; i++) {
                                    if (!sites[i].checked) {
                                        allchecked = false;
                                        break;
                                    }
                                }
                                if (allchecked) checkType.checked = true;
                            }
                        };
                        siteCon.appendChild(checkSite);
                        siteCon.addEventListener("click", e => {
                            if (e.target.nodeName.toUpperCase() == 'SPAN') {
                                checkSite.click();
                            }
                        });
                        let typeSelect = document.createElement("select");
                        let option = document.createElement("option");
                        option.value = 0;
                        option.innerText = i18n("currentType");
                        typeSelect.appendChild(option);
                        for (let i = 0; i < searchData.sitesConfig.length; i++) {
                            let _type = searchData.sitesConfig[i];
                            if (_type.type != typeData.type) {
                                let option = document.createElement("option");
                                option.value = _type.type;
                                option.innerText = _type.type;
                                typeSelect.appendChild(option);
                            }
                        }
                        siteCon.appendChild(typeSelect);
                        self.siteDict[siteData.url] = siteData;
                        sites.push(checkSite);
                    });
                }
                if (sites.length == 0) {
                    checkType.style.display = "none";
                    renameBtn.style.display = "none";
                }
                checkType.addEventListener("click", e => {
                    sites.forEach(checkSite => {
                        checkSite.checked = checkType.checked;
                    });
                });
                this.sitesCon.appendChild(details);
            }

            close() {
                this.openList = [];
                [].forEach.call(this.sitesCon.querySelectorAll("details"), details => {
                    if (details.hasAttribute("open")) {
                        this.openList.push(details.querySelector("summary").innerText);
                    }
                });
                if (this.filterFrame.parentNode) {
                    this.filterFrame.parentNode.removeChild(this.filterFrame);
                }
            }

            open(configData) {
                this.init();
                let self = this;
                this.siteDict = {};
                this.typeDict = {};
                if (!this.filterCssEle || !this.filterCssEle.parentNode) this.filterCssEle = _GM_addStyle(this.filterCss);
                document.documentElement.appendChild(this.filterFrame);
                this.sitesCon.innerHTML = createHTML('');
                configData.forEach(type => {
                    self.anylizeType(type);
                });
                //storage.setItem("searchData", searchData);
                //_GM_notification('Over!');
            }
        }
        const importFilter = new ImportFilter();

        var dragRoundFrame, dragCon, dragSiteCurSpans, dragSiteHistorySpans, dragEndHandler, dragenterHandler, openAllTimer, dragScaleWidth, dragScaleHeight, zoomDrag;
        function showDragSearch(left, top) {
            if (!searchBar || !searchBar.bar) return;
            let preOpenType = searchBar.bar.querySelector('.search-jumper-type.search-jumper-open');
            let removeFrame = () => {
                document.removeEventListener('dragend', dragEndHandler, true);
                document.removeEventListener('dragenter', dragenterHandler, true);
                if (dragCon.parentNode) {
                    dragCon.parentNode.removeChild(dragCon);
                    dragRoundFrame.style.opacity = "";
                    dragRoundFrame.style.transform = '';
                }
                draging = false;
                clearTimeout(openAllTimer);
                if ((currentSite && !currentSite.hideNotMatch && !searchData.prefConfig.hideOnSearchEngine) || searchBar.con.classList.contains("resizePage")) {
                    if (preOpenType && !preOpenType.classList.contains('search-jumper-open')) {
                        if (preOpenType.children[0].onmouseup) preOpenType.children[0].onmouseup();
                        else {
                            let mouseEvent = new PointerEvent("mouseup");
                            preOpenType.children[0].dispatchEvent(mouseEvent);
                        }
                    }
                } else {
                    searchBar.bar.style.display = 'none';
                }
            };
            if (!dragScaleWidth && !dragScaleHeight) {
                zoomDrag = (searchData.prefConfig.zoomDrag || 100) / 100;
                dragScaleWidth = zoomDrag * 190;
                dragScaleHeight = zoomDrag * 190;
            }
            if (!dragRoundFrame) {
                let dragCssText = `
                    #dragCon {
                      position: fixed;
                      top: 0;
                      left: 0;
                      transform: scale(${zoomDrag});
                      z-index: 2147483647;
                      -moz-transition:left 0.3s ease, top 0.3s;
                      -webkit-transition:left 0.3s ease, top 0.3s;
                      transition:left 0.3s ease, top 0.3s;
                    }
                    #searchJumperWrapper * {
                      margin: 0;
                      padding: 0;
                      border: none;
                      outline: none;
                      user-select: none;
                      box-sizing: content-box;
                      font-size: 12px;
                      line-height: normal;
                      overflow: visible;
                      background-image: initial;
                      float: initial;
                    }
                    #searchJumperWrapper {
                      position: fixed;
                      height: 300px;
                      width: 300px;
                      padding: 20px;
                      margin: 20px;
                      background-color: #000000${searchData.prefConfig.hideDragHistory ? "10" : "9e"};
                      box-shadow: #000000 0px 0px 10px;
                      border-radius: 50%;
                      z-index: 2147483647;
                      box-sizing: content-box;
                      opacity: 0;
                      transform: scale(.5);
                      -moz-transition:opacity 0.3s ease, transform 0.15s;
                      -webkit-transition:opacity 0.3s ease, transform 0.15s;
                      transition:opacity 0.3s ease, transform 0.15s;
                    }
                    #searchJumperWrapper>.panel {
                      position: relative;
                    }
                    #searchJumperWrapper .sector:nth-child(2n+1) .sector-inner {
                      background: #454545;
                      color: white;
                    }
                    #searchJumperWrapper .sector:nth-child(2n) .sector-inner {
                      background: #ffffff;
                      color: black;
                    }
                    #searchJumperWrapper .sector.out:nth-child(2n+1) .sector-inner {
                      background: #353535;
                    }
                    #searchJumperWrapper .sector.out:nth-child(2n) .sector-inner {
                      background: #eeeeee;
                    }
                    #searchJumperWrapper .sector {
                      position: absolute;
                      left: 150px;
                      top: 50px;
                      width: 100px;
                      height: 200px;
                      font-size: 14px;
                      border-radius: 0px 100px 100px 0;
                      overflow: hidden;
                      transform-origin: left center;
                      z-index: 1;
                      -moz-transition:transform 0.3s ease;
                      -webkit-transition:transform 0.3s ease;
                      transition:transform 0.3s ease;
                      pointer-events: none;
                    }
                    #searchJumperWrapper .sector.out {
                      left: 150px;
                      top: 0px;
                      width: 150px;
                      height: 300px;
                      font-size: 14px;
                      border-radius: 0px 150px 150px 0;
                      overflow: hidden;
                      transform-origin: left center;
                      z-index: 0;
                      ${searchData.prefConfig.hideDragHistory ? "display: none;" : ""}
                    }
                    #searchJumperWrapper .sector-inner {
                      text-align: center;
                      display: block;
                      width: 40px;
                      padding: 5px 3px 0 57px;
                      height: 195px;
                      transform: translateX(-100px) rotate(60deg);
                      transform-origin: right center;
                      border-radius: 100px 0 0 100px;
                    }
                    #searchJumperWrapper .sector.out>.sector-inner {
                      text-align: center;
                      display: block;
                      width: 90px;
                      height: 295px;
                      transform: translateX(-150px) rotate(36deg);
                      transform-origin: right center;
                      border-radius: 150px 0 0 150px;
                    }
                    #searchJumperWrapper .sector-inner span {
                      transform-origin: center;
                      padding: 20px 0;
                      pointer-events: all;
                      opacity: 0.8;
                      word-break: break-word;
                      height: 55px;
                      font-size: 12px;
                      font-weight: bold;
                      font-family: Arial, sans-serif,微软雅黑,"Noto Sans SC";
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: space-evenly;
                    }
                    #searchJumperWrapper .sector-inner span {
                      width: 70px;
                      margin-left: -15px;
                    }
                    #searchJumperWrapper .sector-inner span>p {
                      max-width: 58px;
                    }
                    #searchJumperWrapper .sector.out>.sector-inner span {
                      width: unset;
                      margin-left: unset;
                    }
                    #searchJumperWrapper .over>.sector-inner span {
                      opacity: 1;
                    }
                    #searchJumperWrapper .sector-inner span>img {
                      width: 25px;
                      height: 25px;
                    }
                    #searchJumperWrapper .sector-inner span:hover {
                      opacity: 1;
                    }
                    #searchJumperWrapper .dragLogo {
                      position: absolute;
                      left: 150px;
                      top: 150px;
                      border-radius: 50%;
                      box-shadow: #000000 0px 0px 10px;
                      z-index: 10;
                      font-size: 0;
                      -moz-transition:transform 0.3s ease;
                      -webkit-transition:transform 0.3s ease;
                      transition:transform 0.3s ease;
                    }
                    .dragLogo>svg {
                      width: 40px;
                      height: 40px;
                      pointer-events: none;
                    }
                `;
                let dragCssEle = _GM_addStyle(dragCssText);
                dragSiteCurSpans = [];
                dragSiteHistorySpans = [];
                dragRoundFrame = document.createElement("div");
                dragRoundFrame.id = "searchJumperWrapper";
                dragRoundFrame.innerHTML = createHTML(`
                <div class="panel"></div>
                <div class="dragLogo">${logoBtnSvg}</div>
                `);
                if (!disabled) dragRoundFrame.appendChild(dragCssEle);
                const sector1Num = 6;
                const sector2Num = 10;
                let sectorCon = dragRoundFrame.querySelector(".panel");
                let sector1Gap = 360 / sector1Num;
                let sector2Gap = 360 / sector2Num;
                let sector1Start = -sector1Gap / 2;
                let sector2Start = -sector2Gap / 2;
                let dragSector;
                let dragLogo = dragRoundFrame.querySelector(".dragLogo");
                let removeTimer;
                dragLogo.addEventListener("dragover", e => {
                    e.preventDefault();
                }, true);
                dragLogo.addEventListener("dragenter", e => {
                    clearTimeout(removeTimer);
                    if (dragSector) {
                        dragSector.style.transform = `rotate(${dragSector.dataset.deg}deg) ${searchData.prefConfig.hideDragHistory ? 'scale(1.2)' : ''}`;
                        dragSector.classList.remove("over");
                    }
                    dragSector = null;
                    dragLogo.style.transform = `scale(1.35)`;
                    e.preventDefault();
                    clearTimeout(openAllTimer);
                    openAllTimer = setTimeout(() => {
                        removeFrame();
                        searchBar.appendBar();
                        searchBar.showAllSites();
                    }, 1000);
                }, true);
                let geneSector = (className, deg, spanTransform) => {
                    let sector = document.createElement("div");
                    sector.className = className;
                    let sectorInner = document.createElement("div");
                    sectorInner.className = "sector-inner";
                    let sectorSpan = document.createElement("span");
                    sectorInner.appendChild(sectorSpan);
                    sector.appendChild(sectorInner);
                    let transform = `rotate(${deg}deg)`;
                    sectorSpan.style.transform = spanTransform;
                    sector.style.transform = transform + (searchData.prefConfig.hideDragHistory ? 'scale(1.2)' : '');
                    sector.dataset.deg = deg;
                    sectorCon.appendChild(sector);
                    sectorSpan.addEventListener("dragover", e => {
                        if (e.clientX < 50) {
                            dragCon.style.left = "0px";
                        } else if (e.clientX > document.documentElement.clientWidth - 50) {
                            dragCon.style.left = document.documentElement.clientWidth - (dragScaleWidth<<1) + "px";
                        }
                        if (e.clientY < 50) {
                            dragCon.style.top = "0px";
                        } else if (e.clientY > document.documentElement.clientHeight - 50) {
                            dragCon.style.top = document.documentElement.clientHeight - (dragScaleHeight<<1) + "px";
                        }
                        e.preventDefault();
                    }, true);
                    sectorSpan.addEventListener("dragenter", e => {
                        clearTimeout(removeTimer);
                        if (!sectorSpan.innerText) return;
                        if (dragSector) {
                            dragSector.style.transform = `rotate(${dragSector.dataset.deg}deg) ${searchData.prefConfig.hideDragHistory ? 'scale(1.2)' : ''}`;
                            dragSector.classList.remove("over");
                        }
                        dragLogo.style.transform = "";
                        sector.style.transform = `scale(${searchData.prefConfig.hideDragHistory ? '1.6' : '1.25'}) ${transform}`;
                        sector.classList.add("over");
                        dragSector = sector;
                        clearTimeout(openAllTimer);
                    }, true);
                    return sectorSpan;
                };
                for (let i = 0; i < sector1Num; i++) {
                    let sectorSpan = geneSector("sector", sector1Start + sector1Gap * i, `translateX(-10px) translateY(-10px) rotate(${sector1Start - sector1Gap * i}deg)`);
                    dragSiteCurSpans.push(sectorSpan);
                }
                for (let i = 0; i < sector2Num; i++) {
                    let sectorSpan = geneSector("sector out", sector2Start + sector2Gap * i, `translateX(12px) translateY(-15px) rotate(${sector2Start - sector2Gap * i}deg)`);
                    dragSiteHistorySpans.push(sectorSpan);
                }
                dragEndHandler = e => {
                    removeFrame();
                }
                dragRoundFrame.addEventListener('click', e => {
                    removeFrame();
                });
                dragRoundFrame.addEventListener('drop', e => {
                    if (e.target === dragLogo) {
                        searchBar.setFuncKeyCall(false);
                        searchBar.showInPage();
                    } else if (dragSector) {
                        removeFrame();
                        searchBar.searchBySiteName(dragSector.children[0].dataset.name, e);
                        dragSector.style.transform = `rotate(${dragSector.dataset.deg}deg)`;
                        dragSector.classList.remove("over");
                        dragSector = null;
                    }
                    e.preventDefault();
                });
                let minClientX, maxClientX, minClientY, maxClientY;
                dragenterHandler = e => {
                    clearTimeout(removeTimer);
                    if (!dragRoundFrame.contains(e.target)) {
                        removeTimer = setTimeout(() => {
                            removeFrame();
                        }, 300);
                    }
                };
                dragCon = document.createElement("div");
                dragCon.id = "dragCon";
                dragCon.appendChild(dragRoundFrame);
            }
            searchBar.recoveHistory();
            let firstType = searchBar.autoGetFirstType();
            let siteBtns = firstType.querySelectorAll("a.search-jumper-btn:not(.notmatch)");
            let targetIndex = 0;
            let getTargetSiteBtn = () => {
                let result = null;
                for (let i = targetIndex; i < siteBtns.length; i++) {
                    let btn = siteBtns[i];
                    if (btn.style.display !== 'none') {
                        result = btn;
                        targetIndex = i + 1;
                        break;
                    }
                }
                return result;
            };
            const filldragSpan = (span, targetSite) => {
                span.parentNode.dataset.name = targetSite.dataset.name;
                let word = document.createElement("p");
                word.innerText = targetSite.dataset.name.substr(0, 10).trim();
                if (!/^\w+$/.test(word.innerText)) {
                    let text = "", len = 0;
                    for (let char of word.innerText) {
                        text += char;
                        if (/^\w+$/.test(char)) {
                            len++;
                        } else len += 2;
                        if (len > 10) {
                            text += "...";
                            break;
                        }
                    }
                    word.innerText = text;
                }
                let img = document.createElement("img");
                img.style.display = "none";
                span.appendChild(img);
                span.appendChild(word);
                img.onload = e => {
                    img.style.display = "";
                };
                let targetIcon = targetSite.querySelector("img");
                if (targetIcon) {
                    let src = targetIcon.src || targetIcon.dataset.src;
                    if (src) img.src = src;
                }
            };
            dragSiteCurSpans.forEach((span, i) => {
                span.innerHTML = createHTML();
                let targetSite = getTargetSiteBtn();
                if (!targetSite) {
                    span.parentNode.parentNode.style.filter = 'contrast(0.5)';
                    return;
                }
                span.parentNode.parentNode.style.filter = '';
                filldragSpan(span, targetSite);
            });
            let findIndex = 0;

            let historySiteBtns;
            if (firstType.classList.contains("search-jumper-needInPage")) {
                historySiteBtns = searchBar.txtHistorySiteBtns;
            } else if (firstType.classList.contains("search-jumper-targetImg")) {
                historySiteBtns = searchBar.imgHistorySiteBtns;
            } else if (firstType.classList.contains("search-jumper-targetAudio")) {
                historySiteBtns = searchBar.audioHistorySiteBtns;
            } else if (firstType.classList.contains("search-jumper-targetVideo")) {
                historySiteBtns = searchBar.videoHistorySiteBtns;
            } else if (firstType.classList.contains("search-jumper-targetLink") || firstType.classList.contains("search-jumper-targetPage")) {
                historySiteBtns = searchBar.linkHistorySiteBtns;
            }
            if (historySiteBtns) {
                historySiteBtns = historySiteBtns.concat(searchBar.historySiteBtns);
                historySiteBtns = historySiteBtns.filter((value, index, self) => self.indexOf(value) === index);
            } else {
                historySiteBtns = searchBar.historySiteBtns;
            }
            let getHistorySiteBtn = () => {
                if (searchData.prefConfig.reuseDragHistory) {
                    return getTargetSiteBtn();
                } else if (searchData.prefConfig.hideDragHistory) {
                    return false;
                }
                let result = null;
                for (let i = findIndex; i < historySiteBtns.length; i++) {
                    let btn = historySiteBtns[i];
                    if (btn.style.display !== 'none') {
                        result = btn;
                        findIndex = i + 1;
                        break;
                    }
                }
                return result;
            };
            dragSiteHistorySpans.forEach((span, i) => {
                let dragleaveEvent = new DragEvent("dragleave");
                span.dispatchEvent(dragleaveEvent);
                span.innerHTML = createHTML();
                span.parentNode.parentNode.style.opacity = 0.6;
                let targetSite = getHistorySiteBtn();
                if (!targetSite) return;
                let siteImg = targetSite.querySelector('img');
                if (siteImg && siteImg.dataset.src) {
                    siteImg.src = siteImg.dataset.src;
                    delete siteImg.dataset.src;
                }
                span.parentNode.parentNode.style.opacity = 1;
                filldragSpan(span, targetSite);
            });

            dragCon.style.left = left - dragScaleWidth + "px";
            dragCon.style.top = top - dragScaleHeight + "px";
            dragRoundFrame.style.opacity = "";
            dragRoundFrame.style.transform = '';
            setTimeout(() => {
                document.addEventListener('dragend', dragEndHandler, true);
                searchBar.addToShadow(dragCon);
                setTimeout(() => {
                    dragRoundFrame.style.opacity = 1;
                    dragRoundFrame.style.transform = 'scale(1)';
                }, 10);
                setTimeout(() => {
                    if (getComputedStyle(dragRoundFrame).zIndex != "2147483647") {
                        removeFrame();
                    } else {
                        document.addEventListener('dragenter', dragenterHandler, true);
                    }
                }, 100);
            }, 0);
        }

        var addFrame, nameInput, descInput, urlInput, iconInput, iconShow, iconsCon, typeSelect, testBtn, cancelBtn, addBtn, siteKeywords, siteMatch, openSelect, crawlBtn;
        function showSiteAdd(name, description, url, icons, charset, kwFilter, match, hideNotMatch) {
            self.kwFilter = kwFilter;
            self.charset = charset;
            self.hideNotMatch = hideNotMatch;
            self.match = match;
            if (!addFrame) {
                let addFrameCssText = `
                    .searchJumperFrame-body,
                    .searchJumperFrame-crawlBody {
                        width: 300px;
                        min-height: 300px;
                        position: fixed;
                        text-align: left;
                        left: 50%;
                        top: 45%;
                        margin-top: -250px;
                        margin-left: -150px;
                        z-index: 100000;
                        background-color: #ffffff;
                        border: 1px solid #afb3b6;
                        border-radius: 10px;
                        opacity: 0.95;
                        filter: alpha(opacity=95);
                        box-shadow: 5px 5px 20px 0px #000;
                        color: #6e7070;
                        transition: all 0.25s ease;
                        border: 0;
                        font-size: initial;
                    }
                    .searchJumperFrame-title {
                        background: #458bd1!important;
                        display: flex!important;
                        align-items: center!important;
                        justify-content: center!important;
                        color: white!important;
                        font-weight: bold;
                        font-size: 18px!important;
                        border-radius: 10px 10px 0 0!important;
                    }
                    .draging .searchJumperFrame-body,
                    .draging .searchJumperFrame-crawlBody {
                        transition: none;
                        pointer-events: none;
                    }
                    .searchJumperFrame-title>img {
                        margin: 5px;
                        height: 32px;
                        width: 32px;
                    }
                    .searchJumperFrame-input-title {
                        font-size: 9pt;
                        font-family: Arial, sans-serif,微软雅黑,"Noto Sans SC";
                        display: inline-block;
                        background-color: white;
                        position: relative;
                        left: 20px;
                        padding: 0px 4px;
                        text-align: left;
                        color: #646464;
                    }
                    .searchJumperFrame-inputs>input,
                    .searchJumperFrame-inputs>textarea,
                    .searchJumperFrame-inputs>select,
                    .searchJumperFrame-body select {
                        resize: both;
                        font-size: 11pt;
                        font-weight: normal;
                        border-radius: 4px;
                        border: 1px solid rgba(0, 0, 0, 0.23);
                        margin: 4px;
                        font-family: inherit;
                        background-color: #FFF;
                        width: calc(100% - 8px);
                        min-width: calc(100% - 8px);
                        max-width: calc(100% - 8px);
                        color: #4A4A4A;
                        margin-top: -8px;
                        padding: 4px;
                        padding-top: 8px;
                        box-sizing: border-box;
                        height: 36px;
                        word-break: break-all;
                    }
                    .searchJumperFrame-inputs>input:focus,
                    .searchJumperFrame-inputs>textarea:focus,
                    .searchJumperFrame-inputs>select:focus,
                    .searchJumperFrame-body select:focus {
                        background-color: #FFF;
                    }
                    .searchJumperFrame-buttons {
                        text-align: center;
                        margin-bottom: 5px;
                        display: flex;
                        justify-content: space-evenly;
                    }
                    .searchJumperFrame-buttons>button {
                        width: 32%;
                        font-size: 16px;
                        cursor: pointer;
                        border: 1px solid #1976d2;
                        border-radius: 4px;
                        transition: all .3s;
                        color: #fff;
                        background-color: #458bd1;
                        line-height: 25px;
                        padding: 3px;
                    }
                    .searchJumperFrame-buttons>button:hover {
                        color: #e3f2fd;
                    }
                    .searchJumperFrame-inputs>.sideIcon {
                        float: right;
                        margin-top: -38px;
                        position: relative;
                        right: 20px;
                        opacity: 0.8;
                        background: rgb(0 0 0 / 50%);
                        border-radius: 5px;
                        pointer-events: none;
                        width: 27px;
                        height: 27px;
                    }
                    .searchJumperFrame-inputs>svg.sideIcon {
                        fill: white;
                        pointer-events: all;
                        cursor: pointer;
                        transition: transform 0.25s ease;
                    }
                    .searchJumperFrame-inputs>svg.sideIcon:hover {
                        transform: scale(1.2);
                        opacity: 1;
                        background: rgb(0 0 0);
                    }
                    .searchJumperFrame-body>.iconsCon {
                        max-height: 150px;
                        overflow: auto;
                        width: 100%;
                        border-top: 1px solid rgba(0, 0, 0, 0.23);
                        border-bottom: 1px solid rgba(0, 0, 0, 0.23);
                    }
                    .searchJumperFrame-body>.iconsCon>img {
                        margin: 5px;
                        cursor: pointer;
                        max-width: 120px;
                        border: 2px solid #ffffff;
                        box-sizing: border-box;
                        background: #80808030;
                        transition: background 0.25s ease;
                    }
                    .searchJumperFrame-body>.iconsCon>img:hover {
                        border: 2px solid #4e91d3;
                        background: gray;
                    }
                    .maxContent .searchJumperFrame-inputs {
                        width: 50%;
                        float: left;
                    }
                    .searchJumperFrame-body>.moreItem {
                        display: none;
                    }
                    .maxContent>.searchJumperFrame-body>.moreItem {
                        display: block;
                    }
                    .maxContent>.searchJumperFrame-body {
                        width: 600px;
                        margin-left: -300px;
                    }
                    .searchJumperFrame-maxBtn,
                    .searchJumperFrame-closeBtn {
                        position: absolute;
                        right: 5px;
                        top: 5px;
                        color: white;
                        width: 25px;
                        cursor: pointer;
                        transition:transform 0.25s ease;
                    }
                    .searchJumperFrame-maxBtn:hover,
                    .searchJumperFrame-closeBtn:hover {
                        transform: scale(1.2);
                    }
                    .searchJumperFrame-maxBtn>#maxBtn {
                        display: block;
                    }
                    .searchJumperFrame-maxBtn>#minBtn {
                        display: none;
                    }
                    .maxContent .searchJumperFrame-maxBtn>#maxBtn {
                        display: none;
                    }
                    .maxContent .searchJumperFrame-maxBtn>#minBtn {
                        display: block;
                    }
                    .crawling>.searchJumperFrame-body {
                        display: none;
                    }
                    .searchJumperFrame-crawlBody {
                        display: none;
                    }
                    .crawling>.searchJumperFrame-crawlBody {
                        display: block;
                    }
                    .searchJumperFrame-buttons>button#submitCrawl,
                    .searchJumperFrame-buttons>button#record,
                    .searchJumperFrame-buttons>button#copy,
                    .searchJumperFrame-buttons>button#loop {
                        width: 100%;
                        margin: 0 3px;
                    }
                    .searchJumperFrame-crawlBody>.actionCon {
                        height: 200px;
                        background: gray;
                        border-radius: 10px;
                        margin: 10px;
                        padding: 0 10px 10px 10px;
                        resize: auto;
                        box-sizing: border-box;
                        overflow: auto;
                    }
                    .searchJumperFrame-crawlBody>.actionCon>div {
                        width: 100%;
                        font-size: 16px;
                        background: #000000cc;
                        border-radius: 8px;
                        color: white;
                        margin: 3px 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        cursor: pointer;
                        white-space: nowrap;
                    }
                    .searchJumperFrame-crawlBody>.actionCon>div>span {
                        background: #275f90;
                        border-radius: 5px;
                        max-width: 40px;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        display: inline-block;
                        margin: 0 3px;
                        white-space: nowrap;
                    }
                    @media (prefers-color-scheme: dark) {
                      .searchJumperFrame-body,
                      .searchJumperFrame-crawlBody,
                      .searchJumperFrame-input-title,
                      .searchJumperFrame-inputs>input,
                      .searchJumperFrame-inputs>textarea,
                      .searchJumperFrame-inputs>select,
                      .searchJumperFrame-body select {
                        background-color: black!important;
                        color: #d5d5d5!important;
                      }
                      .searchJumperFrame-inputs>input:focus,
                      .searchJumperFrame-inputs>textarea:focus,
                      .searchJumperFrame-inputs>select:focus,
                      .searchJumperFrame-body select:focus {
                        background-color: #1e1e1e!important;
                      }
                      .searchJumperFrame-inputs>input,
                      .searchJumperFrame-inputs>textarea,
                      .searchJumperFrame-inputs>select,
                      .searchJumperFrame-body select {
                        border: 1px solid rgb(255 255 255 / 36%);
                      }
                      .searchJumperFrame-title,
                      .searchJumperFrame-buttons>button {
                        background: #245d8f!important;
                      }
                      .searchJumperFrame-body>.iconsCon>img {
                        border: 2px solid #000000;
                      }
                    }
                    @media screen and (max-height: 600px) {
                      .searchJumperFrame-body,
                      .searchJumperFrame-crawlBody {
                        top: 10px;
                        margin-top: 0px;
                      }
                    }
                `;
                let addFrameCssEle = _GM_addStyle(addFrameCssText);
                addFrame = document.createElement("div");
                addFrame.innerHTML = createHTML(`
                <div class="searchJumperFrame-body">
                    <a href="${homePage}" class="searchJumperFrame-title" target="_blank" draggable="false">
                        <img width="32px" height="32px" src="${logoBase64}" />${i18n("addSearchEngine")}
                    </a>
                    <div class="searchJumperFrame-maxBtn">
                        <svg id="maxBtn" fill="white" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("maxAddSiteBtn")}</title><path d="M192 832h160a32 32 0 0 1 0 64H160a32 32 0 0 1-32-32V672a32 32 0 0 1 64 0zM182.72 886.72a32 32 0 0 1-45.44-45.44l224-224a32 32 0 0 1 45.44 45.44zM832 832V672a32 32 0 0 1 64 0v192a32 32 0 0 1-32 32H672a32 32 0 0 1 0-64zM886.72 841.28a32 32 0 0 1-45.44 45.44l-224-224a32 32 0 0 1 45.44-45.44zM192 192v160a32 32 0 0 1-64 0V160a32 32 0 0 1 32-32h192a32 32 0 0 1 0 64zM137.28 182.72a32 32 0 0 1 45.44-45.44l224 224a32 32 0 0 1-45.44 45.44zM832 192H672a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0zM841.28 137.28a32 32 0 1 1 45.44 45.44l-224 224a32 32 0 0 1-45.44-45.44z"></path></svg>
                        <svg id="minBtn" fill="white" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("minAddSiteBtn")}</title><path d="M672 352h160a32 32 0 0 1 0 64H640a32 32 0 0 1-32-32V192a32 32 0 0 1 64 0zM662.72 406.72a32 32 0 0 1-45.44-45.44l224-224a32 32 0 1 1 45.44 45.44zM352 352V192a32 32 0 0 1 64 0v192a32 32 0 0 1-32 32H192a32 32 0 0 1 0-64zM406.72 361.28a32 32 0 0 1-45.44 45.44l-224-224a32 32 0 0 1 45.44-45.44zM672 672v160a32 32 0 0 1-64 0V640a32 32 0 0 1 32-32h192a32 32 0 0 1 0 64zM617.28 662.72a32 32 0 0 1 45.44-45.44l224 224a32 32 0 0 1-45.44 45.44zM192 672a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V672zM361.28 617.28a32 32 0 0 1 45.44 45.44l-224 224a32 32 0 0 1-45.44-45.44z"></path></svg>
                    </div>
                    <div class="searchJumperFrame-inputs">
                        <div class="searchJumperFrame-input-title">${i18n("siteName")}</div>
                        <input name="siteName" type="text" />
                        <div class="searchJumperFrame-input-title">${i18n("siteUrl")}</div>
                        <textarea name="url" type="text"></textarea>
                        <svg id="crawlBtn" class="sideIcon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>${i18n("crawlInfo")}</title><path d="M385 926.3c-11 0-21.4-4.3-29.2-12l-0.6-0.6c-0.7-0.7-65.6-70.4-108.4-112.7-42.8-42.3-118.6-111.4-119.3-112.1l-0.6-0.5c-15.9-15.7-24.6-36.6-24.5-58.8s9-43.1 25-58.6c28.6-27.7 72.2-31 104.6-8.2l90.5 44-83.1-290.1c-4.9-17.1-4.2-34.9 2.1-51.6 6.3-16.6 17.5-30.5 32.5-40.1 22-14.1 47.7-17.7 70.3-10 22.6 7.7 40.7 26.3 49.5 50.9L431 369.8V176.9c0-43.4 35.3-78.7 78.7-78.7 20.7 0 40.2 7.9 55 22.4 14.8 14.4 23.2 33.8 23.7 54.4v0.2l2.4 165.5L625 229.1l0.1-0.4c8.2-23.2 26.2-41.1 49.4-49.3 23.2-8.2 48.5-5.5 69.4 7.3 15.6 9.6 27.7 24.3 33.9 41.6s6.4 36.3 0.6 53.7L736 409.5l42.9-48.6 0.3-0.3c15.7-16.2 34.4-25.7 54.1-27.3 19.8-1.6 39.1 4.7 56 18.1 33 26.4 40.8 60.1 22.7 97.5l-0.5 1.1-0.6 1c-41.8 65.2-107.1 171.9-115.8 199-12.4 38.6-41 140.7-41.3 141.7l-0.2 0.7-34.5 107.2-0.6 1.2c-6.8 14.3-21.5 23.7-37.4 23.8l-295.9 1.6c0 0.1-0.1 0.1-0.2 0.1z"></path></svg>
                        <div class="searchJumperFrame-input-title">${i18n("siteDesc")}</div>
                        <textarea name="description" type="text"></textarea>
                        <div class="searchJumperFrame-input-title">${i18n("siteIcon")}</div>
                        <textarea name="icon" type="text"></textarea>
                        <img class="sideIcon" width="27px" height="27px" />
                    </div>
                    <div class="searchJumperFrame-inputs moreItem">
                        <div class="searchJumperFrame-input-title">${i18n("siteKeywords")}</div>
                        <input name="siteKeywords" placeholder="kw|key" type="text" />
                        <div class="searchJumperFrame-input-title">${i18n("siteMatch")}</div>
                        <input name="siteMatch" placeholder="(www|m)\\.google\\.com" type="text" />
                        <div class="searchJumperFrame-input-title">${i18n("openSelect")}</div>
                        <select name="openSelect">
                            <option value="-1">${i18n("openInDefault")}</option>
                            <option value="true">${i18n("openInNewTab")}</option>
                            <option value="false">${i18n("openInCurrent")}</option>
                        </select>
                    </div>
                    <div class="iconsCon"></div>
                    <div class="searchJumperFrame-input-title">${i18n("siteType")}</div>
                    <select name="typeSelect">
                    </select>
                    <div class="searchJumperFrame-buttons">
                        <button id="test" type="button">${i18n("siteTest")}</button>
                        <button id="cancel" type="button">${i18n("siteCancel")}</button>
                        <button id="add" type="button">${i18n("siteAdd")}</button>
                    </div>
                </div>
                <div class="searchJumperFrame-crawlBody searchJumperFrame-hide">
                    <a href="${homePage}" class="searchJumperFrame-title" target="_blank">
                        <img width="32px" height="32px" src="${logoBase64}" />${i18n("addAction")}
                    </a>
                    <svg class="searchJumperFrame-closeBtn" fill="white" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>Close crawl</title>${closePath}</svg>
                    <div class="actionCon"></div>
                    <div class="searchJumperFrame-buttons">
                        <button id="input" type="button" title="${i18n("emuInputTips")}">${i18n("inputAction")}</button>
                        <button id="click" type="button" title="${i18n("emuClickTips")}">${i18n("clickAction")}</button>
                        <button id="sleep" type="button" title="${i18n("emuWaitTips")}">${i18n("sleepAction")}</button>
                    </div>
                    <div class="searchJumperFrame-buttons">
                        <button id="copy" type="button" title="${i18n("emuCopyTips")}">${i18n("copyAction")}</button>
                    </div>
                    <div class="searchJumperFrame-buttons">
                        <button id="record" type="button" title="${i18n("emuRecordTips")}">${i18n("recordAction")}</button>
                    </div>
                    <div class="searchJumperFrame-buttons">
                        <button id="loop" type="button" title="${i18n("emuLoopTips")}">${i18n("loopAction")}</button>
                    </div>
                    <div class="searchJumperFrame-buttons">
                        <button id="submitCrawl" type="button" title="${i18n("emuStopTips")}">${i18n("submitCrawl")}</button>
                    </div>
                </div>
                `);
                if (!disabled) addFrame.appendChild(addFrameCssEle);
                let addBody = addFrame.children[0];
                nameInput = addFrame.querySelector("[name='siteName']");
                descInput = addFrame.querySelector("[name='description']");
                urlInput = addFrame.querySelector("[name='url']");
                iconInput = addFrame.querySelector("[name='icon']");
                iconShow = addFrame.querySelector(".searchJumperFrame-inputs>img");
                iconsCon = addFrame.querySelector(".iconsCon");
                testBtn = addFrame.querySelector("#test");
                cancelBtn = addFrame.querySelector("#cancel");
                addBtn = addFrame.querySelector("#add");
                typeSelect = addFrame.querySelector("select[name='typeSelect']");
                siteKeywords = addFrame.querySelector("[name='siteKeywords']");
                siteMatch = addFrame.querySelector("[name='siteMatch']");
                openSelect = addFrame.querySelector("select[name='openSelect']");
                let title = addFrame.querySelector(".searchJumperFrame-title");
                let initMousePos, initFramePos, moving = false;
                let dragTitleMove = e => {
                    if (!moving) {
                        addFrame.classList.add("draging");
                        moving = true;
                    }
                    let x = e.clientX - initMousePos.x + initFramePos.x;
                    let y = e.clientY - initMousePos.y + initFramePos.y;
                    addBody.style.marginLeft = x + "px";
                    addBody.style.marginTop = y + "px";
                };
                let dragTitleUp = e => {
                    e.preventDefault();
                    e.stopPropagation();
                    addFrame.classList.remove("draging");
                    document.removeEventListener("mousemove", dragTitleMove);
                    document.removeEventListener("mouseup", dragTitleUp);
                };
                title.addEventListener("mousedown", e => {
                    e.preventDefault();
                    e.stopPropagation();
                    moving = false;
                    initMousePos = {x: e.clientX, y: e.clientY};
                    let addBodyStyle = getComputedStyle(addBody);
                    initFramePos = {x: parseInt(addBodyStyle.marginLeft || 0), y: parseInt(addBodyStyle.marginTop || 0)};
                    document.addEventListener("mousemove", dragTitleMove);
                    document.addEventListener("mouseup", dragTitleUp);
                });
                iconShow.onload = e => {
                    iconShow.style.display = "";
                }
                let maxBtn = addFrame.querySelector("#maxBtn");
                maxBtn.addEventListener("click", e => {
                    addFrame.classList.add("maxContent");
                });
                let minBtn = addFrame.querySelector("#minBtn");
                minBtn.addEventListener("click", e => {
                    addFrame.classList.remove("maxContent");
                });
                for (let i = 0; i < searchData.sitesConfig.length; i++) {
                    let typeConfig = searchData.sitesConfig[i];
                    let option = document.createElement("option");
                    option.value = i;
                    if (lastAddType !== "" && lastAddType == i) {
                        option.selected = "selected";
                    }
                    option.innerText = typeConfig.type;
                    typeSelect.appendChild(option);
                }
                testBtn.addEventListener("click", e => {
                    if (/#p{/.test(urlInput.value)) {
                        let actionParams = urlInput.value.match(/#p{(.*)}/);
                        if (!actionParams) return;
                        let postParams = [];
                        actionParams[1].replace(/([^\\])&/g, "$1SJ^PARAM").split("SJ^PARAM").forEach(pair => {//ios不支持零宽断言，哭唧唧
                            pair = pair.trim();
                            if (/^loopStart\(\d+\)$/.test(pair)) {
                                let loopStart = pair.match(/loopStart\((.*)\)/);
                                postParams.push(['@loopStart', loopStart[1]]);
                            } else if (pair == "loopEnd") {
                                postParams.push(['@loopEnd', '']);
                            } else if (pair.startsWith("click(") && pair.endsWith(')')) {
                                let click = pair.slice(6, pair.length - 1);
                                if (click) {
                                    postParams.push(['@click', click.replace(/\\([\=&])/g, "$1").trim()]);
                                }
                            } else if (pair.startsWith("dblclick(") && pair.endsWith(')')) {
                                let click = pair.slice(9, pair.length - 1);
                                if (click) {
                                    postParams.push(['@dblclick', click.replace(/\\([\=&])/g, "$1").trim()]);
                                }
                            } else if (pair.startsWith("rclick(") && pair.endsWith(')')) {
                                let click = pair.slice(7, pair.length - 1);
                                if (click) {
                                    postParams.push(['@rclick', click.replace(/\\([\=&])/g, "$1").trim()]);
                                }
                            } else if (pair.startsWith("copy(") && pair.endsWith(')')) {
                                let copy = pair.slice(5, pair.length - 1);
                                if (copy) {
                                    postParams.push(['@copy', copy.replace(/\\([\=&])/g, "$1").trim()]);
                                }
                            } else if (pair.startsWith("call(") && pair.endsWith(')')) {
                                let func = pair.slice(5, pair.length - 1);
                                if (func) {
                                    postParams.push(['@call', func.replace(/\\([\=&])/g, "$1").trim()]);
                                }
                            } else if (pair.startsWith("wait(") && pair.endsWith(')')) {
                                let wait = pair.slice(5, pair.length - 1);
                                postParams.push(['@wait', wait.replace(/\\([\=&])/g, "$1").trim()]);
                            } else if (/^sleep\(\d+\)$/.test(pair)) {
                                let sleep = pair.match(/sleep\((.*)\)/);
                                if (sleep) {
                                    postParams.push(['@sleep', sleep[1]]);
                                }
                            } else if (/^reload\(\d?\)$/.test(pair)) {
                                let reload = pair.match(/reload\((.*)\)/);
                                postParams.push(['@reload', reload[1]]);
                            } else {
                                pair = pair.replace(/([^\\])\=/g, "$1SJ^PARAM").replace(/\\([\=&])/g, "$1");
                                let pairArr = pair.split("SJ^PARAM");
                                if (pairArr.length === 2) {
                                    let k = pairArr[0];
                                    let v = pairArr[1].replace(/\\([\=&])/g, "$1");
                                    postParams.push([k, v]);
                                } else if (pair.endsWith('.click()') || pair.endsWith('.click')) {
                                    postParams.push(['@' + pair.replace(/\.click(\(\))?$/, ''), 'click']);
                                }
                            }
                        });
                        inPagePostParams = postParams;
                        searchBar.submitAction(postParams);
                    } else if (/[:%]p{/.test(urlInput.value) || (charset && charset.toLowerCase() != 'utf-8')) {
                        submitByForm(charset, urlInput.value.replace(/%se?\b/g, "searchJumper"), "_blank");
                    } else {
                        _GM_openInTab(urlInput.value.replace(/%se?\b/g, "searchJumper"), {active: true, insert: true});
                    }
                });
                cancelBtn.addEventListener("click", e => {
                    if (addFrame.parentNode) {
                        addFrame.parentNode.removeChild(addFrame);
                    }
                });
                addBtn.addEventListener("click", e => {
                    if (shareEngines) return;
                    dataChanged(() => {
                        let siteObj = null;
                        for (let i = 0; i < searchData.sitesConfig.length; i++) {
                            let typeConfig = searchData.sitesConfig[i];
                            for (let j = 0; j < typeConfig.sites.length; j++) {
                                let curSite = typeConfig.sites[j];
                                if (curSite.url == urlInput.value) {
                                    if (i == parseInt(typeSelect.value)) {
                                        alert('Already added!');
                                        return;
                                    }
                                    if (window.confirm(i18n("siteExist"))) {
                                        siteObj = {
                                            name: curSite.name + " - " + typeConfig.type,
                                            url: `["${curSite.name}"]`
                                        };
                                    } else return;
                                }
                            }
                        }
                        if (siteObj == null) {
                            siteObj = {
                                name: nameInput.value,
                                url: urlInput.value
                            };
                            if (iconInput.value && iconInput.value != urlInput.value.replace(/\?.*/, "").replace(/^(https?:\/\/[^\/]*\/)[\s\S]*$/, "$1favicon.ico")) {
                                siteObj.icon = iconInput.value;
                            }
                            if (descInput.value && descInput.value != nameInput.value) {
                                siteObj.description = descInput.value;
                            }
                            if (siteKeywords.value) {
                                siteObj.keywords = siteKeywords.value;
                            }
                            if (siteMatch.value) {
                                siteObj.match = siteMatch.value;
                            }
                            if (openSelect.value && openSelect.value != '-1') {
                                siteObj.openInNewTab = openSelect.value === 'true';
                            }
                            if (self.charset && charset.toLowerCase() != 'utf-8') {
                                siteObj.charset = self.charset;
                            }
                            if (self.kwFilter) {
                                siteObj.kwFilter = self.kwFilter;
                            }
                            if (self.match) {
                                siteObj.match = self.match;
                            }
                            if (self.hideNotMatch) {
                                siteObj.hideNotMatch = self.hideNotMatch;
                            }
                        }
                        searchData.sitesConfig[typeSelect.value].sites.push(siteObj);
                        searchData.lastModified = new Date().getTime();
                        storage.setItem("lastAddType", typeSelect.value);
                        storage.setItem("searchData", searchData);
                        _GM_notification(i18n("siteAddOver"));
                        if (addFrame.parentNode) {
                            addFrame.parentNode.removeChild(addFrame);
                        }
                        window.postMessage({
                            searchData: searchData,
                            version: _GM_info.script.version || 0,
                            command: 'loadConfig'
                        }, '*');
                        searchBar.refreshEngines();
                    });
                });

                crawlBtn = addFrame.querySelector("#crawlBtn");
                let closeCrawlBtn = addFrame.querySelector(".searchJumperFrame-closeBtn");
                let actionCon = addFrame.querySelector(".actionCon");
                let inputAction = addFrame.querySelector("#input");
                let clickAction = addFrame.querySelector("#click");
                let sleepAction = addFrame.querySelector("#sleep");
                let copyAction = addFrame.querySelector("#copy");
                let submitCrawl = addFrame.querySelector("#submitCrawl");
                let recordBtn = addFrame.querySelector("#record");
                let loopBtn = addFrame.querySelector("#loop");
                let dragDiv;
                let addAction = (type, sel = '', val = '') => {
                    let div = document.createElement("div");
                    let words = type;
                    switch(type) {
                        case "input":
                            words = i18n('inputOutput', [sel, val]);
                            break;
                        case "click":
                            words = i18n('clickOutput', sel);
                            break;
                        case "dblclick":
                            words = i18n('dblclickOutput', sel);
                            break;
                        case "rclick":
                            words = i18n('rclickOutput', sel);
                            break;
                        case "copy":
                            words = i18n('copyOutput', sel);
                            break;
                        case "loopStart":
                            words = i18n('loopStart', val);
                            break;
                        case "loopEnd":
                            words = i18n('loopEnd');
                            break;
                        case "sleep":
                            words = i18n('sleepOutput', val);
                            break;
                        default:
                            break;
                    }
                    if (words) {
                        div.innerHTML = createHTML(words);
                        div.dataset.type = type;
                        div.dataset.sel = sel;
                        div.dataset.val = val;
                        div.draggable = "true";
                        div.ondragover = e => {
                            e.preventDefault();
                        };
                        div.ondragstart = e => {
                            dragDiv = div;
                        }
                        div.ondrop = e => {
                            actionCon.insertBefore(dragDiv, div);
                        }
                        div.onclick = e => {
                            let target = e.target;
                            if (target.nodeName.toUpperCase() == 'SPAN') {
                                if (target.className == 'element') {
                                    picker.getSelector(selector => {
                                        target.innerText = selector;
                                        target.title = selector;
                                        addFrame.style.display = '';
                                        div.dataset.sel = selector;
                                    });
                                    addFrame.style.display = 'none';
                                } else {
                                    let newValue = prompt(i18n('inputNewValue'), target.innerText);
                                    if (newValue) {
                                        target.innerText = newValue;
                                        target.title = newValue;
                                        div.dataset.val = newValue;
                                    }
                                }
                            } else if (confirm(i18n('deleteConfirm'))) {
                                actionCon.removeChild(div);
                            }
                        }
                        div.oncontextmenu = e => {
                            let target = e.target;
                            if (target.nodeName.toUpperCase() == 'SPAN') {
                                e.preventDefault();
                                if (target.className == 'element') {
                                    let newValue = prompt('Selector', target.innerText);
                                    if (newValue) {
                                        target.innerText = newValue;
                                        target.title = newValue;
                                        div.dataset.sel = newValue;
                                    }
                                } else {
                                    let newValue = prompt(i18n('inputNewValue'), target.innerText);
                                    if (newValue) {
                                        target.innerText = newValue;
                                        target.title = newValue;
                                        div.dataset.val = newValue;
                                    }
                                }
                            }
                        }
                        actionCon.appendChild(div);
                    }
                };
                let anylizeEmuUrl = () => {
                    actionCon.innerHTML = createHTML();
                    let actionParams = urlInput.value.match(/#p{(.*)}/);
                    if (!actionParams) return;
                    actionParams[1].replace(/([^\\])&/g, "$1SJ^PARAM").split("SJ^PARAM").forEach(pair => {
                        pair = pair.trim();
                        if (/^loopStart\(\d+\)$/.test(pair)) {
                            let loopStart = pair.match(/loopStart\((.*)\)/);
                            addAction('loopStart', '', loopStart[1]);
                        } else if (pair == "loopEnd") {
                            addAction('loopEnd');
                        } else if (pair.startsWith("click(") && pair.endsWith(')')) {
                            let click = pair.slice(6, pair.length - 1);
                            if (click) {
                                addAction('click', click.replace(/\\([\=&])/g, "$1").trim());
                            }
                        } else if (pair.startsWith("dblclick(") && pair.endsWith(')')) {
                            let click = pair.slice(9, pair.length - 1);
                            if (click) {
                                addAction('dblclick', click.replace(/\\([\=&])/g, "$1").trim());
                            }
                        } else if (pair.startsWith("rclick(") && pair.endsWith(')')) {
                            let click = pair.slice(7, pair.length - 1);
                            if (click) {
                                addAction('rclick', click.replace(/\\([\=&])/g, "$1").trim());
                            }
                        } else if (pair.startsWith("copy(") && pair.endsWith(')')) {
                            let copy = pair.slice(5, pair.length - 1);
                            if (copy) {
                                addAction('copy', copy.replace(/\\([\=&])/g, "$1").trim());
                            }
                        } else if (pair.startsWith("call(") && pair.endsWith(')')) {
                            let func = pair.slice(5, pair.length - 1);
                            if (func) {
                                addAction('call', '', func.replace(/\\([\=&])/g, "$1").trim());
                            }
                        } else if (pair.startsWith("wait(") && pair.endsWith(')')) {
                            let func = pair.slice(5, pair.length - 1);
                            if (func) {
                                addAction('wait', '', func.replace(/\\([\=&])/g, "$1").trim());
                            }
                        } else if (pair.startsWith("open(") && pair.endsWith(')')) {
                            let func = pair.slice(5, pair.length - 1);
                            if (func) {
                                addAction('open', '', func.replace(/\\([\=&])/g, "$1").trim());
                            }
                        } else if (/^sleep\(\d+\)$/.test(pair)) {
                            let sleep = pair.match(/sleep\((.*)\)/);
                            if (sleep) {
                                addAction('sleep', '', sleep[1]);
                            }
                        } else if (/^reload\(\d?\)$/.test(pair)) {
                            let reload = pair.match(/reload\((.*)\)/);
                            addAction('reload', '', reload[1]);
                        } else {
                            pair = pair.replace(/([^\\])\=/g, "$1SJ^PARAM").replace(/\\([\=&])/g, "$1");
                            let pairArr = pair.split("SJ^PARAM");
                            if (pairArr.length === 2) {
                                addAction('input', pairArr[0], pairArr[1].replace(/\\([\=&])/g, "$1"));
                            } else if (pair.endsWith('.click()') || pair.endsWith('.click')) {
                                addAction('click', pair.replace(/\.click(\(\))?$/, ''));
                            }
                        }
                    });
                };
                let geneUrl = () => {
                    let actions = [];
                    [].forEach.call(actionCon.children, action => {
                        if (!action) return;
                        let sel = action.dataset.sel;
                        let val = action.dataset.val || '';
                        switch(action.dataset.type) {
                            case "click":
                                actions.push(`click(${sel.replace(/([=&])/g, '\\$1')})`);
                                break;
                            case "dblclick":
                                actions.push(`dblclick(${sel.replace(/([=&])/g, '\\$1')})`);
                                break;
                            case "rclick":
                                actions.push(`rclick(${sel.replace(/([=&])/g, '\\$1')})`);
                                break;
                            case "copy":
                                actions.push(`copy(${sel.replace(/([=&])/g, '\\$1')})`);
                                break;
                            case "input":
                                actions.push(`${sel.replace(/([=&])/g, '\\$1')}=${val}`);
                                break;
                            case "sleep":
                                actions.push(`sleep(${val})`);
                                break;
                            case "loopEnd":
                                actions.push('loopEnd');
                                break;
                            default:
                                actions.push(`${action.dataset.type}(${val.replace(/([=&])/g, '\\$1')})`);
                                break;
                        }
                    });
                    return actions.join('&');
                };
                crawlBtn.addEventListener("click", e => {
                    anylizeEmuUrl();
                    addFrame.classList.add("crawling");
                });
                closeCrawlBtn.addEventListener("click", e => {
                    addFrame.classList.remove("crawling");
                });
                let targetInput;
                let clickTimer;
                let clickSthHandler = e => {
                    if (addFrame.style.display === '') return;
                    if (/INPUT|TEXTAREA|SELECT|OPTION/i.test(e.target.nodeName)) {
                        return;
                    }
                    clearTimeout(clickTimer);
                    clickTimer = setTimeout(() => {
                        addAction('click', picker.geneSelector(e.target, true));
                    }, 300);
                };
                let dblclickSthHandler = e => {
                    if (addFrame.style.display === '') return;
                    if (/INPUT|TEXTAREA|SELECT|OPTION/i.test(e.target.nodeName)) {
                        return;
                    }
                    clearTimeout(clickTimer);
                    addAction('dblclick', picker.geneSelector(e.target, true));
                };
                let rclickSthHandler = e => {
                    if (addFrame.style.display === '') return;
                    if (/INPUT|TEXTAREA|SELECT|OPTION/i.test(e.target.nodeName)) {
                        return;
                    }
                    e.preventDefault();
                    clearTimeout(clickTimer);
                    addAction('rclick', picker.geneSelector(e.target, true));
                };
                let changeHandler = e => {
                    if (addFrame.style.display === '') return;
                    addAction('input', picker.geneSelector(e.target, true), e.target.value);
                };
                let keydownHandler = e => {
                    if (addFrame.style.display === '') return;
                    let quit = false;
                    if (e.keyCode == 27) {
                        quit = true;
                    } else if (e.keyCode == 13) {
                        //enter
                        e.preventDefault();
                        e.stopPropagation();
                        e.target && e.target.blur && e.target.blur();
                        quit = true;
                    }
                    if (quit) {
                        addFrame.style.display = '';
                        document.removeEventListener('keydown', keydownHandler, true);
                        document.removeEventListener('click', clickSthHandler);
                        document.removeEventListener('dblclick', dblclickSthHandler);
                        document.removeEventListener('contextmenu', rclickSthHandler);
                        document.removeEventListener('change', changeHandler);
                    }
                };
                recordBtn.addEventListener("click", e => {
                    alert(i18n("startRecord"));
                    addFrame.style.display = 'none';
                    setTimeout(() => {
                        document.addEventListener('keydown', keydownHandler, true);
                        document.addEventListener('click', clickSthHandler);
                        document.addEventListener('dblclick', dblclickSthHandler);
                        document.addEventListener('contextmenu', rclickSthHandler);
                        document.addEventListener('change', changeHandler);
                    }, 100);
                });
                let inLoop = false;
                loopBtn.addEventListener("click", e => {
                    if (inLoop) {
                        addAction('loopEnd');
                        loopBtn.innerText = i18n("loopAction");
                    } else {
                        let loopTimes = prompt(i18n('loopTimes'), 1);
                        if (!loopTimes) return;
                        addAction('loopStart', '', loopTimes || '1');
                        loopBtn.innerText = i18n("loopActionEnd");
                    }
                    inLoop = !inLoop;
                });
                inputAction.addEventListener("click", e => {
                    picker.getSelector(selector => {
                        addAction('input', selector, '%s');
                        addFrame.style.display = '';
                    }, !inLoop);
                    addFrame.style.display = 'none';
                });
                copyAction.addEventListener("click", e => {
                    picker.getSelector(selector => {
                        addAction('copy', selector, '%s');
                        addFrame.style.display = '';
                    }, !inLoop);
                    addFrame.style.display = 'none';
                });
                clickAction.addEventListener("dblclick", e => {
                    clearTimeout(clickTimer);
                    e.preventDefault();
                    e.stopPropagation();
                    picker.getSelector(selector => {
                        addAction('dblclick', selector);
                        addFrame.style.display = '';
                    }, !inLoop);
                    addFrame.style.display = 'none';
                });
                clickAction.addEventListener("contextmenu", e => {
                    clearTimeout(clickTimer);
                    e.preventDefault();
                    e.stopPropagation();
                    picker.getSelector(selector => {
                        addAction('rclick', selector);
                        addFrame.style.display = '';
                    }, !inLoop);
                    addFrame.style.display = 'none';
                });
                clickAction.addEventListener("click", e => {
                    clearTimeout(clickTimer);
                    clickTimer = setTimeout(() => {
                        picker.getSelector(selector => {
                            addAction('click', selector);
                            addFrame.style.display = '';
                        }, !inLoop);
                        addFrame.style.display = 'none';
                    }, 250);
                });
                sleepAction.addEventListener("click", e => {
                    let sleepTime = prompt(i18n('sleepPrompt'), 1000);
                    sleepTime = sleepTime && parseInt(sleepTime);
                    if (sleepTime) addAction('sleep', '', sleepTime);
                });
                submitCrawl.addEventListener("click", e => {
                    let actionUrl = geneUrl();
                    if (actionUrl) {
                        urlInput.value = location.href + '#p{' + actionUrl + '}';
                    }
                    addFrame.classList.remove("crawling");
                });
                addFrame.addEventListener("keydown", e => {
                    if (e.keyCode == 13 && e.target && e.target.nodeName == 'INPUT') {
                        addBtn.click();
                    }
                });
            }
            searchBar.addToShadow(addFrame);
            siteKeywords.value = "";
            siteMatch.value = "";
            nameInput.value = name || "";
            descInput.value = description || "";
            urlInput.value = url || "";
            if (icons && icons[0]) {
                iconShow.style.display = "";
                if (url.indexOf(location.origin) === 0) {
                    iconShow.onerror = e => {
                        iconShow.onerror = null;
                        iconInput.value = icons[0];
                        iconShow.src = icons[0];
                    }
                    iconShow.src = location.origin + "/favicon.ico";
                } else {
                    iconInput.value = icons[0];
                    iconShow.src = icons[0];
                }
            } else {
                iconShow.style.display = "none";
                iconShow.src = (/^(showTips:)?https?:/.test(url) ? url.split('\n')[0].replace(/\?.*/, "").replace(/^(showTips:)?(https?:\/\/[^\/]+).*/, '$2') : location.origin) + "/favicon.ico";
            }
            iconsCon.innerHTML = createHTML();
            if (icons && icons.length > 1) {
                iconsCon.style.opacity = "";
                icons.forEach(iconSrc => {
                    let curIcon = document.createElement("img");
                    curIcon.src = iconSrc;
                    curIcon.addEventListener("click", e => {
                        iconInput.value = iconSrc;
                        iconShow.src = iconSrc;
                    });
                    curIcon.onload = e => {
                        curIcon.title = curIcon.naturalWidth + " x " + curIcon.naturalHeight + "\n" + iconSrc.replace(/.*\/([^\/]+)/, "$1");
                    };
                    iconsCon.appendChild(curIcon);
                });
            } else {
                iconsCon.style.opacity = 0;
            }
        }

        function downloadCache() {
            let downloadEle = document.createElement('a');
            downloadEle.download = "searchJumperCache.json";
            downloadEle.target = "_blank";
            let blobStr = [JSON.stringify({sortTypeNames: sortTypeNames, cacheIcon: cacheIcon, sortSiteNames: sortSiteNames}, null , 4)];
            let myBlob = new Blob(blobStr, { type: "application/json" });
            downloadEle.href = window.URL.createObjectURL(myBlob);
            downloadEle.click();
        }

        function importCache(cacheData) {
            if (cacheData.cacheIcon) {
                cacheIcon = cacheData.cacheIcon;
                storage.setItem("cacheIcon", cacheIcon);
                cachePool = [];
                searchData.prefConfig.cacheSwitch = true;
                storage.setItem("searchData", searchData);
            }
            if (cacheData.sortTypeNames) {
                sortTypeNames = cacheData.sortTypeNames;
                storage.setItem("sortTypeNames", sortTypeNames);
            }
            if (cacheData.sortSiteNames) {
                sortSiteNames = cacheData.sortSiteNames;
                storage.setItem("sortSiteNames", sortSiteNames);
            }
        }

        function showSiteAddFromOpenSearch(url, callback) {
            _GM_xmlhttpRequest({
                method: "GET",
                url: url,
                headers: {
                    referer: url,
                    origin: url
                },
                onload: (d) => {
                    let urlparam = d && d.responseXML && d.responseXML.querySelector('Url[type="text/html"]');
                    if (!urlparam) {
                        callback('error', d);
                        return;
                    }
                    let shortName = d.responseXML.querySelector("ShortName");
                    let description = d.responseXML.querySelector("Description");
                    let image = d.responseXML.querySelector("Image");
                    let inputEncoding = d.responseXML.querySelector("InputEncoding");
                    let postParams = urlparam.querySelectorAll("Param");
                    let name = shortName && shortName.textContent;
                    let desc = description && description.textContent;
                    let url = urlparam.getAttribute("template");
                    let ico = image && image.textContent;
                    let charset = inputEncoding && inputEncoding.textContent;
                    if (postParams.length > 0) {
                        let params = [];
                        [].forEach.call(postParams, postParam => {
                            params.push(`${postParam.getAttribute("name")}=${postParam.getAttribute("value")}`);
                        });
                        url += `%p{${params.join("&")}}`;
                    }
                    showSiteAdd(name, desc, url.replace(/{searchTerms\??}/g, "%s").replace(/{startPage\??}/g, '1').replace(/{count\??}/g, '10').replace(/{startIndex\??}/g, '1').replace(/{startPage\??}/g, '1').replace(/{language\??}/g, '*').replace(/{inputEncoding\??}/g, 'UTF-8').replace(/{outputEncoding\??}/g, 'UTF-8'), [ico], charset);
                    callback('load', d);
                },
                onerror: (e) => {
                    callback('error', e);
                },
                ontimeout: (e) => {
                    callback('error', e);
                }
            });
        }

        function initMycroft() {
            if (location.hostname !== "mycroftproject.com") return;
            _GM_addStyle(`
                 .searchJumper-loading {
                     animation-name: changeScale;
                     animation-duration: 2.5s;
                     animation-iteration-count: infinite;
                 }
                 @keyframes changeScale {
                     0% {
                         -webkit-transform:rotate(0deg) scale(1);
                         -moz-transform:rotate(0deg) scale(1);
                         transform:rotate(0deg) scale(1);
                     }
                     50% {
                         -webkit-transform:rotate(180deg) scale(1.5);
                         -moz-transform:rotate(180deg) scale(1.5);
                         transform:rotate(180deg) scale(1.5);
                     }
                     100% {
                         -webkit-transform:rotate(360deg) scale(1);
                         -moz-transform:rotate(360deg) scale(1);
                         transform:rotate(360deg) scale(1);
                     }
                 }
            `);
            let checkLinks = () => {
                let installLinks = document.querySelectorAll("img.icon~a[href^='/install']");
                if (installLinks.length <= 0) return;
                let isLoading = false;
                [].forEach.call(installLinks, installLink => {
                    if (installLink.previousElementSibling && installLink.previousElementSibling.classList.contains("searchJumperIcon")) return;
                    if (installLink.previousElementSibling && installLink.previousElementSibling.previousElementSibling && installLink.previousElementSibling.previousElementSibling.classList.contains("searchJumperIcon")) return;
                    let urlMatch = installLink.href.match(/\?id=(\d+)&basename=(.+?)&/);
                    if (urlMatch === null) {
                        return;
                    }
                    let icon = document.createElement("img");
                    icon.className = "icon searchJumperIcon";
                    icon.style.cssText = "border: 1px solid #4c4c4c; border-radius: 9px; box-sizing: border-box; margin-right: 4px; cursor: pointer;";
                    icon.title = "Add to SearchJumper";
                    icon.src = logoBase64;
                    installLink.parentNode.insertBefore(icon, installLink);
                    icon.onclick = e => {
                        if (isLoading) return;
                        isLoading = true;
                        icon.classList.add("searchJumper-loading");
                        showSiteAddFromOpenSearch(`https://mycroftproject.com/installos.php/${urlMatch[1]}/${urlMatch[2]}.xml`, (type, e) => {
                            isLoading = false;
                            icon.classList.remove("searchJumper-loading");
                            if (type != 'load') {
                                _GM_notification(e.statusText || e.error);
                            }
                        });
                    };
                });
            };
            checkLinks();
            let checkInterval = setInterval(() => {
                checkLinks();
            }, 1000);
            window.addEventListener("load", e => {
                clearInterval(checkInterval);
                checkLinks();
            });
        }

        function initView() {
            searchBar = new SearchBar();
        }

        function initAllPage() {
            if (!isAllPage) return;
            searchBar.appendBar();
            searchBar.showAllSites();
            setTimeout(() => {
                searchBar.con.style.zIndex = 0;
            }, 5);
            if (location.hash) {
                let hash = location.hash.slice(1);
                try {
                    hash = decodeURIComponent(hash);
                } catch (e) {}
                searchBar.searchJumperInputKeyWords.value = hash;
            } else if (location.search) {
                let search = location.search.slice(1).split("&");
                let _keyWords, _engine, _self;
                search.forEach(s => {
                    let sArr = s.split("=");
                    let k = sArr[0], v = sArr[1];
                    try {
                        v = decodeURIComponent(v);
                    } catch (e) {}
                    switch(k) {
                        case "kw":
                            _keyWords = v;
                            break;
                        case "engine":
                            _engine = v;
                            break;
                        case "self":
                            _self = v;
                            break;
                    }
                });
                if (_keyWords) {
                    searchBar.searchJumperInputKeyWords.value = _keyWords || "";
                }
                if (_engine) {
                    searchBar.searchBySiteName(_engine, {}, !!_self);
                }
            }
            getBody(document).style.cssText = `
                    zoom: 1;
                    margin: 0;
                    padding: 0;
                    width: 100vw;
                    height: 100vh;
                    background-position: center 0;
                    background-repeat: no-repeat;
                    background-size: cover;
                    -webkit-background-size: cover;
                    -o-background-size: cover;
                    overflow: hidden;
                `;
            if (searchData.prefConfig.bgUrl) {
                allPageBgUrl = searchData.prefConfig.bgUrl;
                if (allPageBgUrl.length) {
                    getBody(document).style.backgroundImage = `url("${allPageBgUrl}")`;
                    return;
                }
            }
            storage.getItem("allPageBg", allPageBg => {
                if (allPageBg) {
                    allPageBgUrl = allPageBg.url;
                    getBody(document).style.backgroundImage = `url("${allPageBg.base64 || allPageBgUrl}")`;
                } else allPageBg = {url: ""};
                if (ext) {
                    chrome.runtime.sendMessage({action: "getBingBG", detail: {curBgUrl: allPageBg.url}}, function(r) {
                        if (r) {
                            allPageBg = r;
                            storage.setItem("allPageBg", allPageBg);
                            allPageBgUrl = allPageBg.url;
                            getBody(document).style.backgroundImage = `url("${allPageBg.base64 || allPageBgUrl}")`;
                        }
                    });
                    return;
                }
                _GM_xmlhttpRequest({
                    method: 'GET',
                    url: "https://global.bing.com/HPImageArchive.aspx?format=js&idx=0&pid=hp&video=1&n=1",
                    onload: function(result) {
                        var jsonData = null;
                        try {
                            jsonData = JSON.parse(result.responseText);
                            var bgUrl = jsonData.images[0].url;
                            if (!/^https?:\/\//.test(bgUrl)) {
                                bgUrl = "https://global.bing.com" + bgUrl;
                            }
                            allPageBgUrl = bgUrl;
                            if (bgUrl == allPageBg.url) return;
                            _GM_xmlhttpRequest({
                                method: 'GET',
                                url: bgUrl,
                                responseType: "blob",
                                onload: function(r) {
                                    var blob = r.response;
                                    var fr = new FileReader();
                                    fr.readAsDataURL(blob);
                                    fr.onload = function (e) {
                                        var base64ImgData = e.target.result;
                                        allPageBg = {url: bgUrl, base64: base64ImgData};
                                        storage.setItem("allPageBg", allPageBg);
                                    };
                                }
                            });
                            if (!allPageBg.base64) getBody(document).style.backgroundImage = `url("${bgUrl}")`;
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });
            });
        }

        async function initRun() {
            await searchBar.initRun();
            initListener();
            initAllPage();
        }

        async function sleep(time) {
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, time);
            })
        }

        async function initData() {
            let _searchData = await new Promise((resolve) => {
                storage.getItem("searchData", data => {
                    resolve(data);
                });
            });
            cacheKeywords = await new Promise((resolve) => {
                storage.getItem("cacheKeywords", data => {
                    resolve(data || '');
                });
            });
            cacheFilter = await new Promise((resolve) => {
                storage.getItem("cacheFilter", data => {
                    resolve(data || '');
                });
            });
            disableState = await new Promise((resolve) => {
                storage.getItem("disableState", data => {
                    resolve(data || false);
                });
            });
            tipsStorage = await new Promise((resolve) => {
                storage.getItem("tipsStorage", data => {
                    resolve(data || []);
                });
            });
            lastSign = await new Promise((resolve) => {
                storage.getItem("lastSign", data => {
                    resolve(data || false);
                });
            });
            storage.setItem("lastSign", false);
            inPagePostParams = await storage.getListItem("inPagePostParams", location.hostname);
            cacheIcon = await new Promise((resolve) => {
                storage.getItem("cacheIcon", data => {
                    resolve(data || {});
                });
            });
            historySites = await new Promise((resolve) => {
                storage.getItem("historySites", data => {
                    resolve(data || []);
                });
            });
            historyType = await new Promise((resolve) => {
                storage.getItem("historyType", data => {
                    resolve(data || '');
                });
            });
            sortTypeNames = await new Promise((resolve) => {
                storage.getItem("sortTypeNames", data => {
                    resolve(data || {});
                });
            });
            sortSiteNames = await new Promise((resolve) => {
                storage.getItem("sortSiteNames", data => {
                    resolve(data || {});
                });
            });
            globalInPageWords = await new Promise((resolve) => {
                storage.getItem("globalInPageWords", data => {
                    resolve(data || '');
                });
            });
            navEnable = await new Promise((resolve) => {
                storage.getItem("navEnable", data => {
                    resolve(typeof data === "undefined" ? true : data);
                });
            });
            referrer = await new Promise((resolve) => {
                storage.getItem("referrer", data => {
                    resolve(data || "");
                });
            });
            clickLink = await new Promise((resolve) => {
                storage.getItem("clickLink", data => {
                    resolve(data || "");
                });
            });
            disableHighlight = await new Promise((resolve) => {
                storage.getItem("disableHighlight", data => {
                    resolve(data || "");
                });
            });
            lastHighlight = await new Promise((resolve) => {
                storage.getItem("lastHighlight", data => {
                    resolve(data || "");
                });
            });
            allPageNewMode = await new Promise((resolve) => {
                storage.getItem("allPageNewMode", data => {
                    resolve(data || false);
                });
            });
            lastAddType = await new Promise((resolve) => {
                storage.getItem("lastAddType", data => {
                    resolve(data || "");
                });
            });
            if (_searchData) {
                searchData = _searchData;
                lastModified = searchData.lastModified;
            }
            if (!searchData.lastModified) {
                searchData.sitesConfig = sitesConfig;
            }
            if (searchData.prefConfig.lang && searchData.prefConfig.lang != '0') {
                lang = searchData.prefConfig.lang;
            }
            setLang();
            if (searchData.prefConfig.firstRun && (ext || storage.supportCrossSave())) {
                searchData.prefConfig.firstRun = false;
                storage.setItem("searchData", searchData);
                setTimeout(() => {
                    storage.getItem("searchData", data => {
                        if (data.prefConfig.firstRun === false && !ext) {
                            _GM_openInTab(firstRunPage, {active: true, insert: true});
                        }
                    });
                }, 100);
            }
            //旧版兼容
            if (typeof searchData.prefConfig.customSize === "undefined") {
                searchData.prefConfig.customSize = 100;
            }
            if (typeof searchData.prefConfig.tilesZoom === "undefined") {
                searchData.prefConfig.tilesZoom = 100;
            }
            if (typeof searchData.prefConfig.tipsZoom === "undefined") {
                searchData.prefConfig.tipsZoom = 100;
            }
            if (typeof searchData.prefConfig.typeOpenTime === "undefined") {
                searchData.prefConfig.typeOpenTime = 250;
            }
            if (typeof searchData.prefConfig.longPressTime === "undefined") {
                searchData.prefConfig.longPressTime = 500;
            }
            if (typeof searchData.prefConfig.cacheSwitch === "undefined") {
                searchData.prefConfig.cacheSwitch = false;
            }
            if (typeof searchData.prefConfig.noIcons === "undefined") {
                searchData.prefConfig.noIcons = false;
            }
            if (typeof searchData.prefConfig.noAni === "undefined") {
                searchData.prefConfig.noAni = false;
            }
            if (typeof searchData.prefConfig.quickAddRule === "undefined") {
                searchData.prefConfig.quickAddRule = true;
            }
            if (typeof searchData.prefConfig.multiline === "undefined") {
                searchData.prefConfig.multiline = 2;
            }
            if (typeof searchData.prefConfig.multilineGap === "undefined") {
                searchData.prefConfig.multilineGap = 1000;
            }
            if (typeof searchData.prefConfig.historyLength === "undefined") {
                searchData.prefConfig.historyLength = 0;
            }
            if (typeof searchData.prefConfig.dragToSearch === "undefined") {
                searchData.prefConfig.dragToSearch = true;
            }
            if (typeof searchData.prefConfig.firstFiveWordsColor === "undefined") {
                searchData.prefConfig.firstFiveWordsColor = [];
            }
            if (typeof searchData.prefConfig.inPageWordsStyles === "undefined") {
                searchData.prefConfig.inPageWordsStyles = [];
            }
            if (typeof searchData.prefConfig.rightMouse === "undefined") {
                searchData.prefConfig.rightMouse = true;
            }
            if (typeof searchData.prefConfig.mouseLeaveToHide === "undefined") {
                searchData.prefConfig.mouseLeaveToHide = true;
            }
            if (typeof searchData.prefConfig.currentTypeFirst === "undefined") {
                searchData.prefConfig.currentTypeFirst = true;
            }
            if (typeof searchData.prefConfig.disableAddon === "undefined") {
                searchData.prefConfig.disableAddon = {};
            }
            if (typeof searchData.prefConfig.suggestType === "undefined") {
                if (lang === "zh-CN") {
                    searchData.prefConfig.suggestType = "baidu";
                } else searchData.prefConfig.suggestType = "google";
            }
            if (typeof searchData.prefConfig.syncBuild === "undefined") {
                searchData.prefConfig.syncBuild = true;
            }
            if (searchData.prefConfig.minSizeMode) {
                searchData.prefConfig.disableAutoOpen = false;
                searchData.prefConfig.disableTypeOpen = false;
            }
            if (ext) {
                configPage = chrome.runtime.getURL('config/index.html');
                if (!searchData.prefConfig.configPage) {
                    searchData.prefConfig.configPage = configPage;
                }
            } else if (searchData.prefConfig.configPage) {
                configPage = searchData.prefConfig.configPage;
            } else {
                searchData.prefConfig.configPage = configPage;
            }
        }

        function globMatch(first, second) {
            if (first === '*') {
                return true;
            }
            if (first.length == 0 && second.length == 0){
                return true;
            }

            if (first.length > 1 && first[0] == '*' &&
                second.length == 0){
                return false;
            }

            if ((first.length > 1 && first[0] == '?') ||
                (first.length != 0 && second.length != 0 &&
                 first[0] == second[0])){
                return globMatch(first.substring(1),
                                 second.substring(1));
            }

            if (first.length > 0 && first[0] == '*'){
                return globMatch(first.substring(1), second) ||
                    globMatch(first, second.substring(1));
            }

            return false;
        }

        if (href.indexOf("#searchJumperMin") != -1) {
            inMinMode = true;
            if (href.indexOf("#searchJumperMinPost") != -1) {
                window.history.replaceState(null, '', href.replace(/#searchJumperMin(Post)?/, ""));
            } else {
                if (href.indexOf("#searchJumperMinMobile") != -1) {
                    Object.defineProperty(Object.getPrototypeOf(navigator), 'userAgent', { get:function() { return mobileUa }});
                    _GM_xmlhttpRequest({
                        method: 'GET',
                        url: location.href,
                        headers: {
                            referer: location.href,
                            "User-Agent": mobileUa
                        },
                        onload: function(d) {
                            document.open();
                            document.write(d.response);
                            document.close();
                        },
                        onerror: function(){
                        },
                        ontimeout: function(){
                        }
                    });
                    return;
                }
                window.history.replaceState(null, '', location.href.replace(/#searchJumperMin(Mobile)?/, ""));
            }
        }
        if (document.title == 'SearchJumper Multi') return;

        var inited = false;
        var checkGlobalIntv, flashTitleIntv, defaultTitle;
        async function init(cb) {
            await createPolicy();
            if (inited) {
                if (cb) cb();
                return;
            }
            inited = true;
            preAction();
            await initData();
            if (disableState) return;
            if (searchData.prefConfig.blacklist && searchData.prefConfig.blacklist.length > 0) {
                let commentStart = false;
                for (let i = 0; i < searchData.prefConfig.blacklist.length; i++) {
                    let curGlob = searchData.prefConfig.blacklist[i];
                    if (!curGlob) continue;
                    if (curGlob.indexOf("//") == 0) continue;
                    if (commentStart) {
                        if (/\*\/$/.test(curGlob)) {
                            commentStart = false;
                        }
                        continue;
                    }
                    if (curGlob.indexOf("/*") == 0) {
                        commentStart = true;
                        continue;
                    }
                    if (curGlob.indexOf("/") == 0) {
                        let regMatch = curGlob.match(/^\/(.*)\/(\w*)$/);
                        if (regMatch && new RegExp(regMatch[1], regMatch[2]).test(href)) {
                            return;
                        }
                    } else if (globMatch(curGlob, href)) {
                        return;
                    }
                }
            }
            initView();
            await initConfig();
            initMycroft();
            initRun();
            if (cb) cb();
            defaultTitle = document.title;
        }

        function checkVisibility() {
            if (document.hidden) {
                if (searchBar) searchBar.closeShowAll();
                else return;
                if (!searchData.prefConfig.globalSearchNow) return;
                checkGlobalIntv = setInterval(async () => {
                    let oldGlobalInPageWords = globalInPageWords;
                    globalInPageWords = await storage.getItem("globalInPageWords");
                    if ((oldGlobalInPageWords || '') == (globalInPageWords || '')) return;
                    searchBar.refreshPageWords();
                    if (searchBar.navMarks.innerHTML) {
                        clearInterval(checkGlobalIntv);
                        clearInterval(flashTitleIntv);
                        defaultTitle = document.title;
                        flashTitleIntv = setInterval(() => {
                            document.title = document.title == defaultTitle ? '🚩' : defaultTitle;
                        }, 500);
                    }
                }, parseInt(500 + Math.random() * 500));
                return;
            }
            init(async () => {
                if (isInConfigPage || searchData.prefConfig.syncBuild) {
                    searchData = await storage.getItem("searchData");
                    if (searchBar && searchData.lastModified && lastModified != searchData.lastModified) {
                        searchBar.refreshEngines();
                        document.dispatchEvent(new Event('dataChanged'));
                    }
                }
                let oldGlobalInPageWords = globalInPageWords || '';
                storage.getItem("globalInPageWords", data => {
                    globalInPageWords = (data || '');
                    if (oldGlobalInPageWords != globalInPageWords) {
                        if (searchBar) searchBar.refreshPageWords();
                    }
                });
                let oldNavEnable = navEnable || false;
                storage.getItem("navEnable", data => {
                    navEnable = (typeof data === "undefined" ? true : data);
                    if (oldNavEnable != navEnable) {
                        if (searchBar) searchBar.refreshNav();
                    }
                });
            });
        }

        var waiting = false;
        function visibilitychangeHandler() {
            if (!document.head || !getBody(document) || inIframe || disableState) return;
            if (searchData.prefConfig.globalSearchNow) {
                clearInterval(checkGlobalIntv);
                clearInterval(flashTitleIntv);
                if (document.hidden) {
                    defaultTitle = document.title;
                } else if (defaultTitle) document.title = defaultTitle;
            }
            if (waiting) return;
            waiting = true;
            setTimeout(() => {
                checkVisibility();
                waiting = false;
            }, 500);
        }

        storage.getItem("postUrl", postUrl => {
            if (postUrl && postUrl[0].indexOf(location.hostname.replace(/.*\.(\w+\.\w+)/, "$1")) != -1) {
                storage.setItem("postUrl", '');
                submitByForm(postUrl[1], postUrl[0], '_self');
            } else {
                if (document.head && getBody(document)) {
                    init();
                } else {
                    let checkReady = () => {
                        if (document.head && getBody(document)) {
                            init();
                        } else {
                            setTimeout(() => {
                                checkReady();
                            }, 10);
                        }
                    };
                    checkReady();
                }
                document.addEventListener('visibilitychange', visibilitychangeHandler);
            }
        });
    }

    if (document && document.documentElement) {
        run();
    } else {
        let checkReady = () => {
            if (document && document.documentElement) {
                run();
            } else {
                setTimeout(() => {
                    checkReady();
                }, 10);
            }
        };
        checkReady();
    }
})();
