# プレックス（インターンマッチングサービス）

モノレポ構成です。

- `backend/` … Ruby on Rails（API モード）
- `frontend/` … Next.js（App Router / TypeScript / Tailwind CSS）

## 必要環境

- Ruby 3.4 / Rails 8
- Node.js 24 / npm
- PostgreSQL 16（ローカル）

## 起動方法

API は `http://localhost:3000`、フロントは `http://localhost:3001` で起動します。

### Backend

```bash
cd backend
bin/rails db:create
bin/rails server
```

ヘルスチェック: `GET http://localhost:3000/up`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

ブラウザ: `http://localhost:3001`

フロントから API を呼ぶ場合のベース URL は `http://localhost:3000` です（開発用 CORS で `http://localhost:3001` を許可しています）。
