module Api
  module V1
    class StudentsController < BaseController
      before_action :authenticate_user!
      before_action :require_company!

      def index
        students = StudentProfile.order(created_at: :desc)
        render json: { students: students.map { |student| student_payload(student) } }
      end

      private

      def student_payload(student)
        student.slice(:id, :name, :university, :grade, :self_pr, :github_url, :portfolio_url)
      end
    end
  end
end
