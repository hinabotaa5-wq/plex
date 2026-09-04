# Frontend（Next.js）

インターンマッチの Web UI です。Next.js 16（App Router）/ React 19 / TypeScript / Tailwind CSS 4 で構成しています。

セットアップ、確認手順、画面一覧はリポジトリ直下の [README.md](../README.md) を見てください。

## このディレクトリでよく使うコマンド

```bash
cp .env.example .env.local
npm install
npm run dev     # http://localhost:3001
npm run lint
npm run build
```

## 補足

- 開発サーバーはポート **3001** です（API の 3000 と分けています）。
- API のベース URL は `NEXT_PUBLIC_API_URL`（未設定時は `http://localhost:3000`）です。
- 主なページは `/` `/login` `/signup` `/dashboard` `/profile` です。
- API 呼び出しは `lib/api.ts`、型は `lib/types.ts` にあります。
