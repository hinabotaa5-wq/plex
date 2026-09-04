# Backend（Rails API）

インターンマッチの API です。Ruby on Rails 8.1（API モード）で、PostgreSQL を使います。

セットアップ、シードアカウント、確認手順、テスト手順はリポジトリ直下の [README.md](../README.md) を見てください。

## このディレクトリでよく使うコマンド

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

## 補足

- Ruby バージョンは `.ruby-version`（3.4.10）です。
- 開発 DB は `plex_development`、テスト DB は `plex_test` です（`config/database.yml`）。
- ヘルスチェックは `GET /up` です。
- API の名前空間は `/api/v1` です。認証は JWT（`Authorization: Bearer <token>`）です。
