# インターンマッチ

学生と企業をつなぐスカウト型のインターンマッチングサービスです。

企業は学生プロフィールを検索し、条件に合う学生へスカウトを送れます。学生は受け取ったスカウトを承諾または辞退でき、承諾後はチャットでやり取りできます。

このリポジトリはモノレポです。

- `backend/` … Ruby on Rails（API モード）
- `frontend/` … Next.js（App Router / TypeScript / Tailwind CSS）

## 主な機能

- **学生 / 企業の新規登録・ログイン**  
  JWT による認証。ロールは `student` と `company` の 2 種類です。
- **プロフィール**  
  学生は学歴、希望職種・勤務地、稼働可能時間、自己 PR、ガクチカ、スキル、資格、インターン経験、GitHub URL などを登録できます。  
  企業は会社名・部署、業界、従業員数、給与、所在地、募集職種、事業内容、Web サイト URL などを登録できます。
- **学生検索（企業向け）**  
  キーワード（氏名・大学・自己 PR）、学年、希望勤務地、GitHub / スキル / 資格 / インターン経験の有無で絞り込めます。
- **スカウト**  
  企業から学生へ件名・本文付きで送信します。同一企業・同一学生の組み合わせは 1 件までです。ステータスは「送信済み / 承諾 / 辞退」です。
- **チャット**  
  スカウト承諾後、企業と学生がメッセージをやり取りできます。
- **通知**  
  スカウト受信・メッセージ受信を通知し、既読にできます。

## 技術スタック

| 層 | 技術 |
| --- | --- |
| Backend | Ruby 3.4.10 / Rails 8.1（API モード） / Puma |
| 認証 | bcrypt（`has_secure_password`） / JWT |
| Database | PostgreSQL（開発: `plex_development` / テスト: `plex_test`） |
| Frontend | Next.js 16（App Router） / React 19 / TypeScript / Tailwind CSS 4 |
| 通信 | REST API（`/api/v1`） / CORS で開発時のフロントオリジンを許可 |

## 必要環境

- Ruby 3.4.10（`backend/.ruby-version` を参照）
- Bundler
- Node.js（npm）
- PostgreSQL（ローカルで起動していること）

macOS で PostgreSQL が未導入なら、例です。

```bash
brew install postgresql@16
brew services start postgresql@16
```

Docker Compose は用意していません。

## セットアップ

API は `http://localhost:3000`、フロントは `http://localhost:3001` で起動します。  
フロントから API を呼ぶ場合のベース URL は `http://localhost:3000` です。開発用 CORS は `http://localhost:3001` を許可しています。

### 1. Backend

```bash
cd backend
bundle install
bin/rails db:prepare
bin/rails db:seed
bin/rails server
```

- ヘルスチェック: `GET http://localhost:3000/up`
- 初回セットアップは `bin/setup` でも行えます（依存関係のインストールと `db:prepare` のあと、開発サーバーを起動します）
- DB を作り直す場合は `bin/setup --reset`、または `bin/rails db:reset` を使ってください

PostgreSQL の接続情報は `backend/config/database.yml` です。開発環境のデフォルト DB 名は `plex_development` です。ユーザー名・パスワード・ホストは環境に合わせて調整してください。

### 2. Frontend

別ターミナルで実行します。

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

ブラウザで `http://localhost:3001` を開きます。  
`npm run dev` はポート **3001** で起動します（Next.js 既定の 3000 ではありません。API とポートがぶつからないようにしています）。

## シードアカウント

`backend/db/seeds.rb` で次のユーザーが入ります。パスワードはいずれも `password` です。

| 役割 | メール | 内容 |
| --- | --- | --- |
| 学生 | `student1@example.com` | 山田太郎（東京大学 / 大学3年 / エンジニア） |
| 学生 | `student2@example.com` | 佐藤花子（京都大学 / 修士1年 / データサイエンティスト） |
| 企業 | `company1@example.com` | ダミー社（IT / 東京都） |
| 企業 | `company2@example.com` | サンプル株式会社（Webサービス / 大阪府） |

ダミー社から山田太郎へのスカウト（件名: 夏季インターンのご案内、ステータス: 送信済み）も投入されます。

## 確認手順

1. `http://localhost:3001` を開く。
2. 企業 `company1@example.com` / `password` でログインする。学生検索と、山田太郎への送信済みスカウトが見られます。
3. 別ブラウザ（またはログアウト後）で学生 `student1@example.com` / `password` でログインする。受信スカウトを開いて承諾すると、チャットできます。
4. 新規登録やプロフィール編集は `/signup` と `/profile` で確認できます。

## 画面

| パス | 説明 |
| --- | --- |
| `/` | トップ。未ログインならログイン / 新規登録、ログイン済みならダッシュボードへの導線 |
| `/signup` | 学生または企業として新規登録 |
| `/login` | ログイン |
| `/dashboard` | 学生: 受信スカウト一覧。企業: 学生検索・送信済みスカウト |
| `/profile` | 自分のプロフィール編集 |

## 実装範囲

API は `/api/v1` 配下の REST です。ログイン後は `Authorization: Bearer <token>` を付けます。エンドポイントの定義は `backend/config/routes.rb` を見てください。トークンは `secret_key_base` で署名し、有効期限は 24 時間です。

### 実装したもの

- 学生 / 企業の新規登録・ログイン（JWT）とロール分岐
- 学生・企業プロフィールの登録・編集
- 企業による学生検索（キーワード、学年、希望勤務地、GitHub / スキル / 資格 / インターン経験の有無）
- スカウトの送信・受信・承諾 / 辞退（同一企業・同一学生は 1 件まで）
- 承諾後のチャット
- 通知（スカウト受信・メッセージ受信。約 30 秒間隔のポーリング）
- 動作確認用のシードデータ

### 対象外にしたもの

- 本番デプロイ、Docker
- メール送信、パスワード再設定
- チャットのリアルタイム更新（WebSocket は使わず、画面を開いたときと送信時に取得します）
- 一覧のページネーション
- フロントエンドの自動テスト

## テスト・品質チェック

### Backend

```bash
cd backend
bin/rails test
bin/ci
```

`bin/ci` はセットアップ、RuboCop、bundler-audit、Brakeman、テスト、シードの再投入までまとめて実行します。

### Frontend

```bash
cd frontend
npm run lint
```

## 開発時の注意

- API の向き先は `frontend/.env.local` の `NEXT_PUBLIC_API_URL` です。未設定時のフォールバックも `http://localhost:3000` です。
- CORS 許可オリジンは開発用に `http://localhost:3001` のみです（`backend/config/initializers/cors.rb`）。
