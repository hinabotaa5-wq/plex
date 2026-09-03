student1 = User.find_or_create_by!(email: "student1@example.com") do |user|
  user.password = "password"
  user.role = :student
end
student1.create_student_profile!(
  name: "山田太郎",
  university: "東京大学",
  grade: "大学3年",
  self_pr: "Ruby on Rails と TypeScript を学習中です。インターンで実践的な開発に挑戦したいです。",
  github_url: "https://github.com/example-yamada",
  portfolio_url: "https://yamada.example.com"
) unless student1.student_profile

student2 = User.find_or_create_by!(email: "student2@example.com") do |user|
  user.password = "password"
  user.role = :student
end
student2.create_student_profile!(
  name: "佐藤花子",
  university: "京都大学",
  grade: "修士1年",
  self_pr: "機械学習と Web アプリケーション開発の両方に興味があります。",
  github_url: "https://github.com/example-sato"
) unless student2.student_profile

company1 = User.find_or_create_by!(email: "company1@example.com") do |user|
  user.password = "password"
  user.role = :company
end
company1.create_company_profile!(
  name: "ダミー社",
  description: "ソフトウェア開発を行う会社です。新しい事業として、インターン生と企業をマッチングするスカウトサービスを運営しています。",
  website_url: "https://dummy-corp.example.com"
) unless company1.company_profile

company2 = User.find_or_create_by!(email: "company2@example.com") do |user|
  user.password = "password"
  user.role = :company
end
company2.create_company_profile!(
  name: "サンプル株式会社",
  description: "Web サービスの企画・開発を行っています。エンジニアインターンを募集しています。",
  website_url: "https://sample.example.com"
) unless company2.company_profile

Scout.find_or_create_by!(
  company_profile: company1.company_profile,
  student_profile: student1.student_profile
) do |scout|
  scout.subject = "夏季インターンのご案内"
  scout.body = "山田さんの GitHub を拝見し、ぜひ一度カジュアルにお話できればと思いご連絡しました。"
  scout.status = :sent
end
