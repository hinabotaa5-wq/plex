# Frontend（Next.js）

インターンマッチの Web UI です。Next.js 16（App Router）/ React 19 / TypeScript / Tailwind CSS 4 で構成しています。

設計の説明はリポジトリ直下の [README.md](../README.md) を見てください。API の起動は [backend/README.md](../backend/README.md) です。

## セットアップ

別ターミナルで実行します。先に API（`http://localhost:3000`）を起動してください。

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

`.env.example` の内容は次のとおりです。

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

ブラウザで `http://localhost:3001` を開きます。`npm run dev` はポート **3001** で起動します（Next.js 既定の 3000 ではありません。API とポートがぶつからないようにしています）。

`NEXT_PUBLIC_API_URL` 未設定時のフォールバックも `http://localhost:3000` です。

## 画面

| パス | 説明 |
| --- | --- |
| `/` | トップ。未ログインならログイン / 新規登録、ログイン済みならダッシュボードへの導線 |
| `/signup` | 学生または企業として新規登録 |
| `/login` | ログイン |
| `/dashboard` | 学生: 受信スカウト / 募集検索。企業: 学生検索 / 募集管理 / 応募一覧 |
| `/profile` | 自分のプロフィール編集 |

通知からの復帰はクエリでダッシュボードのモーダルを開きます。`scoutId` / `chatScoutId` / `applicationId` / `chatApplicationId` です。

API 呼び出しは `lib/api.ts`、型は `lib/types.ts`、認証状態は `components/AuthProvider.tsx` にあります。

## 確認手順

シードアカウントは [backend/README.md](../backend/README.md) を見てください。パスワードはいずれも `password` です。

1. `http://localhost:3001` を開く。
2. 企業 `company1@example.com` でログインする。学生検索、山田太郎への送信済みスカウト、自社募集と応募が見られます。
3. 別ブラウザ（またはログアウト後）で学生 `student1@example.com` でログインする。受信スカウトを開いて承諾するとチャットできます。募集への応募も確認できます。
4. 新規登録やプロフィール編集は `/signup` と `/profile` で確認できます。

## よく使うコマンド

```bash
cp .env.example .env.local
npm install
npm run dev     # http://localhost:3001
npm run lint
npm run build
```
