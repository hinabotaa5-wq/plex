# Backend（Rails API）

インターンマッチの API です。Ruby on Rails 8.1（API モード）と PostgreSQL を使います。

設計の説明はリポジトリ直下の [README.md](../README.md) を見てください。

## 必要環境

- Ruby 3.4.10（`.ruby-version` を参照）
- Bundler
- PostgreSQL（ローカルで起動していること）

macOS で PostgreSQL が未導入なら、例です。

```bash
brew install postgresql@16
brew services start postgresql@16
```

接続情報は `config/database.yml` です。開発 DB は `plex_development`、テスト DB は `plex_test` です。ユーザー名・パスワード・ホストは環境に合わせて調整してください。

## セットアップ

```bash
cd backend
bundle install
bin/rails db:prepare
bin/rails db:seed
bin/rails server
```

- API: `http://localhost:3000`
- ヘルスチェック: `GET http://localhost:3000/up`
- 初回セットアップは `bin/setup` でも行えます（依存関係のインストールと `db:prepare` のあと、開発サーバーを起動します）
- サーバーを起動しない場合は `bin/setup --skip-server`
- DB を作り直す場合は `bin/setup --reset`、または `bin/rails db:reset`

開発用 CORS は `http://localhost:3001` のみ許可しています（`config/initializers/cors.rb`）。

## 認証

API は `/api/v1` 配下の REST です。ログイン後は `Authorization: Bearer <token>` を付けます。トークンは `secret_key_base` で署名し、有効期限は 24 時間です。エンドポイントの定義は `config/routes.rb` を見てください。

## シードアカウント

`db/seeds.rb` で次のユーザーが入ります。パスワードはいずれも `password` です。

| 役割 | メール | 内容 |
| --- | --- | --- |
| 学生 | `student1@example.com` | 山田太郎（東京大学 / 大学3年 / エンジニア） |
| 学生 | `student2@example.com` | 佐藤花子（京都大学 / 修士1年 / データサイエンティスト） |
| 企業 | `company1@example.com` | ダミー社（IT / 東京都） |
| 企業 | `company2@example.com` | サンプル株式会社（Webサービス / 大阪府） |

合わせて投入されるデータです。

- ダミー社 → 山田太郎へのスカウト（件名: 夏季インターンのご案内、ステータス: 送信済み）
- ダミー社の公開募集「夏季エンジニアインターン」と、山田太郎からの未応答応募
- サンプル株式会社の公開募集「エンジニアインターン」（佐藤花子は承諾済み、山田太郎は辞退）と、承諾後のメッセージ
- サンプル株式会社の締め切った募集「デザイナーインターン」

## よく使うコマンド

```bash
bundle install
bin/setup                 # 依存関係のインストールと DB 準備（その後サーバー起動）
bin/setup --skip-server   # サーバーは起動しない
bin/rails db:prepare
bin/rails db:seed
bin/rails server          # http://localhost:3000
bin/rails test
bin/ci
```

## テスト・品質チェック

```bash
bin/rails test
bin/ci
```

`bin/ci` はセットアップ、RuboCop、bundler-audit、Brakeman、テスト、シードの再投入までまとめて実行します。
