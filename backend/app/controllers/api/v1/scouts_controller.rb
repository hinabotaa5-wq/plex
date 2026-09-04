module Api
  module V1
    class ScoutsController < BaseController
      before_action :authenticate_user!
      before_action :require_student!, only: [ :update ]
      before_action :require_company!, only: [ :create ]

      def index
        if current_user.company?
          unless current_user.company_profile
            return render json: { errors: [ "Company profile is required" ] }, status: :forbidden
          end

          scouts = current_user.company_profile.scouts
            .includes(:student_profile)
            .order(created_at: :desc)

          render json: { scouts: scouts.map { |scout| scout_payload_for_company(scout) } }
        elsif current_user.student?
          unless current_user.student_profile
            return render json: { errors: [ "Student profile is required" ] }, status: :forbidden
          end

          scouts = current_user.student_profile.scouts
            .includes(:company_profile)
            .order(created_at: :desc)

          render json: { scouts: scouts.map { |scout| scout_payload_for_student(scout) } }
        else
          render json: { errors: [ "Forbidden" ] }, status: :forbidden
        end
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
          notify_student(scout)
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

      def notify_student(scout)
        recipient = scout.student_profile.user
        return if recipient.blank?

        company_name = scout.company_profile.name
        Notification.notify!(
          user: recipient,
          action_type: "scout_received",
          title: "新しいスカウトが届きました",
          body: "#{company_name}から「#{scout.subject}」が届きました",
          notifiable: scout
        )
      end

      def scout_payload_for_student(scout)
        {
          id: scout.id,
          status: scout.status,
          subject: scout.subject,
          body: scout.body,
          created_at: scout.created_at,
          company: scout.company_profile.slice(
            :id,
            :name,
            :department,
            :description,
            :website_url,
            :industry,
            :number_of_employees,
            :salary,
            :location,
            :recruiting_job_type
          )
        }
      end

      def scout_payload_for_company(scout)
        {
          id: scout.id,
          status: scout.status,
          subject: scout.subject,
          body: scout.body,
          created_at: scout.created_at,
          student: scout.student_profile.slice(
            :id, :name, :university, :grade, :faculty,
            :desired_job_type, :desired_location,
            :self_pr, :gakuchika, :skills, :qualifications,
            :intern_experience,
            :github_url,
            :available_days_per_week, :available_weekdays,
            :available_time_from, :available_time_to
          )
        }
      end
    end
  end
end
