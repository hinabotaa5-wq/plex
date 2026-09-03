module Api
  module V1
    class ScoutsController < BaseController
      before_action :authenticate_user!
      before_action :require_student!, only: [ :index, :update ]
      before_action :require_company!, only: [ :create ]

      def index
        scouts = current_user.student_profile.scouts
          .includes(:company_profile)
          .order(created_at: :desc)

        render json: { scouts: scouts.map { |scout| scout_payload_for_student(scout) } }
      end

      def create
        student_profile = StudentProfile.find_by(id: create_params[:student_profile_id])
        unless student_profile
          return render json: { errors: [ "Student not found" ] }, status: :not_found
        end

        scout = current_user.company_profile.scouts.new(
          student_profile: student_profile,
          subject: create_params[:subject],
          body: create_params[:body],
          status: :sent
        )

        if scout.save
          render json: { scout: scout_payload_for_company(scout) }, status: :created
        else
          render json: { errors: scout.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        scout = current_user.student_profile.scouts.find_by(id: params[:id])
        unless scout
          return render json: { errors: [ "Scout not found" ] }, status: :not_found
        end

        unless scout.sent?
          return render json: { errors: [ "Scout has already been responded to" ] }, status: :unprocessable_entity
        end

        status = update_params[:status]
        unless %w[accepted declined].include?(status)
          return render json: { errors: [ "Status must be accepted or declined" ] }, status: :unprocessable_entity
        end

        if scout.update(status: status)
          render json: { scout: scout_payload_for_student(scout) }
        else
          render json: { errors: scout.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def create_params
        params.require(:scout).permit(:student_profile_id, :subject, :body)
      end

      def update_params
        params.require(:scout).permit(:status)
      end

      def scout_payload_for_student(scout)
        {
          id: scout.id,
          status: scout.status,
          subject: scout.subject,
          body: scout.body,
          created_at: scout.created_at,
          company: scout.company_profile.slice(:id, :name, :description, :website_url)
        }
      end

      def scout_payload_for_company(scout)
        {
          id: scout.id,
          status: scout.status,
          subject: scout.subject,
          body: scout.body,
          created_at: scout.created_at,
          student: scout.student_profile.slice(:id, :name, :university, :grade)
        }
      end
    end
  end
end
