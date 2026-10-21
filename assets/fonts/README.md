# OGP 画像用フォント

`NotoSerifJP-Bold-og-subset.ttf` は `app/opengraph-image.tsx` が OGP 画像に文字を描くためだけに使う。

- 元フォント: Noto Serif JP Bold(Google Fonts)
- ライセンス: SIL Open Font License 1.1 — https://openfontlicense.org
- OGP に出す文字だけを Google Fonts の `text=` パラメータで切り出したサブセット(約 15KB)

OGP の文言を変えたら、新しい文字が入っていないと豆腐(□)になる。その場合は同じ方法でサブセットを取り直す:

```sh
TEXT='(OGP に出す全文字)'
ENC=$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$TEXT")
URL=$(curl -s -A "Mozilla/4.0" "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700&text=$ENC" | grep -o "https://fonts.gstatic.com[^)]*")
curl -s -o assets/fonts/NotoSerifJP-Bold-og-subset.ttf "$URL"
```

(`-A "Mozilla/4.0"` を付けないと woff2 が返り、OGP 生成で読めない)
