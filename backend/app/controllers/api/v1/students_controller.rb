module Api
  module V1
    class StudentsController < BaseController
      before_action :authenticate_user!
      before_action :require_company!

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

      def student_payload(student)
        student.slice(:id, :name, :university, :grade, :self_pr, :github_url, :portfolio_url)
      end
    end
  end
end
