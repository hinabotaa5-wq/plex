# インターンマッチ

プレックスのインターン課題で作った、学生と企業のスカウトサービスです。

企業は学生を検索してスカウトを送る。学生が承諾したらチャットできるようにした。時間が余ったので、企業が募集を出す機能と、学生からの応募も入れた。スカウトも応募も、送って、承諾か辞退して、通ったら話す、という流れは揃えてある。

- [backend/](backend/README.md) Rails（APIモード）
- [frontend/](frontend/README.md) Next.js（App Router / TypeScript / Tailwind CSS）

## 方針

課題のヒントに「企業は何を見て探すか」「学生は企業のどこに惹かれるか」とあったので、機能を増やすより先にそこを考えた。予定調整やグループチャットより、マッチするまでの流れをちゃんと作ることにした。

企業が絞り込みそうな条件（学年、希望勤務地、GitHub、スキル、資格、インターン経験の有無）で学生検索できるようにした。学生には、承諾するまでチャットが来ないようにした。知らない企業からいきなりメッセージが来続けるのは避けたかった。

必須の学生登録と、企業から学生への連絡は入っている。その上で検索、募集掲載、通知も通してある。

## 起動

API が http://localhost:3000 、フロントが http://localhost:3001 。手順は [backend/README.md](backend/README.md) と [frontend/README.md](frontend/README.md)。

シードのパスワードは全部 `password`。

- 企業: `company1@example.com` （学生検索、山田太郎へのスカウト、自社の募集と応募）
- 学生: `student1@example.com` （スカウトの承諾とチャット、募集への応募）

Docker は用意していない。

## 構成

フロントは Next.js、API は Rails、DB は PostgreSQL。認可やドメインのルールは API 側に置いて、フロントはロールごとの画面を出している。

認証は bcrypt と JWT（24時間）。ログイン後は `Authorization: Bearer <token>`。

- Backend: Ruby 3.4.10 / Rails 8.1（APIモード）
- Frontend: Next.js 16 / React 19 / TypeScript / Tailwind CSS 4
- DB: PostgreSQL

## 実装で気をつけたところ

スカウトと応募のステータスはどちらも `sent` / `accepted` / `declined`。返事は一度だけ。承諾した相手とだけチャットできる。募集は `published` と `closed` で、公開中だけ応募できる。

User に role を持たせて、プロフィールは `student_profiles` と `company_profiles` に分けた。学生の項目と企業の項目を同じテーブルに入れたくなかった。登録のときはユーザーとプロフィールを一緒に作る。

API のパスはロールで増やしすぎないようにした。`GET /api/v1/scouts` は、企業なら自分が送った一覧、学生なら受け取った一覧になる。認可は `BaseController` の `authenticate_user!`、`require_company!`、`require_student!`。

壊れると困るものは DB にも制約を付けた。スカウトは企業と学生の組み合わせで一意、応募は募集と学生で一意。メッセージは scout か応募のどちらか一方にだけ紐づく。通知は polymorphic で、返すときに `scout_id` か `application_id` を付けて、フロントが該当の画面を開けるようにした。

チャットの画面はスカウトと応募で使い回している。通知は 30 秒おきに取りに行く。WebSocket まではやっていない。マッチの状態のほうが先だった。

学生検索のキーワードは `sanitize_sql_like` している。希望勤務地は都道府県のリストにあるものだけ通す。

## テスト

```bash
cd backend
bin/rails test
```

スカウトの送信、同じ学生への再送、承諾と辞退、二重に返事できないこと、他人のスカウトを触れないことを見ている。募集と応募、承諾後のメッセージも。フロントのテストは書いていない。`npm run lint` だけ。

## やってないこと

デプロイ、Docker、メール、パスワード再設定。チャットのリアルタイム更新（画面を開いたときと送ったときに取る）。一覧のページネーション。希望勤務地と稼働曜日は文字列に JSON を入れていて、jsonb にはしていない。
