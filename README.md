# README

必須先登入取得 Bearer Token 後才能使用  
在 `.env` 控制參數  
取得後匯出到 `output/order_{ts}.csv` 以供後續利用，如拆帳

## TODO

+ [ ] Login integrated
    + [ ] refresh token
+ [ ] Order Filter
    + fetch by date
    + by status
+ [ ] Export to Google Sheet Directly
    - if .env `G_SHEET_URL` is set
