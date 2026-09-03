module Api
  module V1
    class StudentsController < BaseController
      before_action :authenticate_user!
      before_action :require_company!

      PREFECTURES = %w[
        北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県
        茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県
        新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県
        三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県
        鳥取県 島根県 岡山県 広島県 山口県
        徳島県 香川県 愛媛県 高知県
        福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県
      ].freeze

      def index
        students = StudentProfile.order(created_at: :desc)
        students = apply_filters(students)
        render json: { students: students.map { |student| student_payload(student) } }
      end

      private

      def apply_filters(students)
        students = filter_by_q(students) if params[:q].present?
        students = students.where(grade: params[:grade]) if params[:grade].present?
        students = filter_by_has_github(students) if params[:has_github].to_s == "true"
        students = filter_by_has_qualifications(students) if params[:has_qualifications].to_s == "true"
        students = filter_by_has_intern_experience(students) if params[:has_intern_experience].to_s == "true"
        students = filter_by_desired_locations(students)
        students
      end

      def filter_by_q(students)
        pattern = "%#{StudentProfile.sanitize_sql_like(params[:q].to_s.strip)}%"
        students.where(
          "name ILIKE :q OR university ILIKE :q OR self_pr ILIKE :q",
          q: pattern
        )
      end

      def filter_by_has_github(students)
        students.where.not(github_url: [nil, ""])
      end

      def filter_by_has_qualifications(students)
        students.where.not(qualifications: [nil, ""])
      end

      def filter_by_has_intern_experience(students)
        students.where.not(intern_experience: [nil, ""])
      end

      def filter_by_desired_locations(students)
        locations = Array(params[:desired_locations]).map { |item| item.to_s.strip } & PREFECTURES
        return students if locations.empty?

        clauses = locations.map { "desired_location ILIKE ?" }
        patterns = locations.map { |location| "%#{StudentProfile.sanitize_sql_like(location)}%" }
        students.where(clauses.join(" OR "), *patterns)
      end

      def student_payload(student)
        student.slice(
          :id, :name, :university, :grade, :faculty,
          :desired_job_type, :desired_location,
          :self_pr, :gakuchika, :skills, :qualifications,
          :intern_experience, :job_hunting_status,
          :github_url, :portfolio_url
        )
      end
    end
  end
end
