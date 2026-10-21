賽事覆盤工作台 PWA v2.0.0

部署：解壓後，把 index.html、mobile.css、sw.js、manifest.webmanifest 和 icons 資料夾一起上載到同一個 GitHub Pages 目錄，啟用 HTTPS。無需建置、無外部套件或 CDN。
不應只上載 index.html；iPhone「檔案」直接打開 HTML 不支援 PWA 離線安裝。

iPhone：Safari 開啟網站 → 分享 → 加入主畫面 →（如有）開啟「作為網頁 App 開啟」。首次保持連線，設定頁顯示「離線已準備」後，關閉 App、開飛航模式並關閉 Wi-Fi，再由主畫面啟動測試。

舊資料：先在原系統下載 JSON 備份；新網址／主畫面 App 若沒有資料，於設定頁還原 JSON。沿用 matchledger.v1 儲存鍵及 schemaVersion 1，兼容舊備份。示範資料不計入備份。記錄儲存於本機，不會跨裝置同步。清除網站資料或系統回收空間可能遺失記錄，請定期備份至「檔案」或 iCloud Drive。CSV 用於閱讀分析，還原請使用 JSON。

升級：將整套新版覆蓋原部署目錄，保持網址不變。每次發布須更改 sw.js 的 CACHE 版本名稱。新版完成快取後提示更新，先儲存並關閉編輯視窗再套用。不會刪除 localStorage 投注資料。自訂系統名稱不會自動更改 iPhone 已建立的主畫面名稱，可於新增主畫面時自行命名。

本次變更：修正樣式開頭殘留字串；iPhone safe-area、16px 輸入欄及 44px 點按區；手機卡片／表格切換；預設運動、金額及每頁筆數；iOS 分享 JSON；持續儲存申請；離線狀態及新版提示。保留原結算／分析及匯入驗證。
