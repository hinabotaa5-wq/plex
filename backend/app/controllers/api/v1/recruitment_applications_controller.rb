module Api
  module V1
    class RecruitmentApplicationsController < BaseController
      before_action :authenticate_user!
      before_action :require_student!, only: [ :create ]
      before_action :require_company!, only: [ :update ]

      def index
        if current_user.company?
          unless current_user.company_profile
            return render json: { errors: [ "Company profile is required" ] }, status: :forbidden
          end

          applications = current_user.company_profile.recruitment_applications
            .includes(:student_profile, recruitment: :company_profile)
            .recent

          render json: {
            applications: applications.map { |application| payload_for_company(application) }
          }
        elsif current_user.student?
          unless current_user.student_profile
            return render json: { errors: [ "Student profile is required" ] }, status: :forbidden
          end

          applications = current_user.student_profile.recruitment_applications
            .includes(recruitment: :company_profile)
            .recent

          render json: {
            applications: applications.map { |application| payload_for_student(application) }
          }
        else
          render json: { errors: [ "Forbidden" ] }, status: :forbidden
        end
      end

      def create
        recruitment = Recruitment.published.find_by(id: params[:recruitment_id])
        unless recruitment
          return render json: { errors: [ "Recruitment not found" ] }, status: :not_found
        end

        application = current_user.student_profile.recruitment_applications.new(
          recruitment: recruitment,
          body: create_params[:body],
          status: :sent
        )

        if application.save
          notify_company(application)
          render json: { application: payload_for_student(application) }, status: :created
        else
          render json: { errors: application.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        application = current_user.company_profile.recruitment_applications.find_by(id: params[:id])
        unless application
          return render json: { errors: [ "Application not found" ] }, status: :not_found
        end

        unless application.sent?
          return render json: { errors: [ "Application has already been responded to" ] }, status: :unprocessable_entity
        end

        status = update_params[:status]
        unless %w[accepted declined].include?(status)
          return render json: { errors: [ "Status must be accepted or declined" ] }, status: :unprocessable_entity
        end

        if application.update(status: status)
          notify_student(application)
          render json: { application: payload_for_company(application) }
        else
          render json: { errors: application.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def create_params
        params.require(:application).permit(:body)
      end

      def update_params
        params.require(:application).permit(:status)
      end

      def notify_company(application)
        recipient = application.recruitment.company_profile.user
        return if recipient.blank?

        student_name = application.student_profile.name
        title = application.recruitment.title
        Notification.notify!(
          user: recipient,
          action_type: "application_received",
          title: "新しい応募が届きました",
          body: "#{student_name}から「#{title}」への応募が届きました",
          notifiable: application
        )
      end

      def notify_student(application)
        recipient = application.student_profile.user
        return if recipient.blank?

        title = application.recruitment.title
        result = application.accepted? ? "承諾" : "辞退"
        Notification.notify!(
          user: recipient,
          action_type: "application_responded",
          title: "応募が#{result}されました",
          body: "「#{title}」への応募が#{result}されました",
          notifiable: application
        )
      end

      def payload_for_student(application)
        recruitment = application.recruitment
        {
          id: application.id,
          status: application.status,
          body: application.body,
          created_at: application.created_at,
          recruitment: recruitment.slice(
            :id, :title, :job_type, :description, :location, :salary, :period, :status
          ).merge(
            company: recruitment.company_profile.slice(
              :id, :name, :department, :description, :website_url,
              :industry, :number_of_employees, :location
            )
          )
        }
      end

      def payload_for_company(application)
        {
          id: application.id,
          status: application.status,
          body: application.body,
          created_at: application.created_at,
          recruitment: application.recruitment.slice(
            :id, :title, :job_type, :location, :salary, :period, :status
          ),
          student: application.student_profile.slice(
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
