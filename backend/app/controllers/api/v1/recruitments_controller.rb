module Api
  module V1
    class RecruitmentsController < BaseController
      before_action :authenticate_user!
      before_action :require_company!, only: [ :create, :update ]

      def index
        if current_user.company?
          unless current_user.company_profile
            return render json: { errors: [ "Company profile is required" ] }, status: :forbidden
          end

          recruitments = current_user.company_profile.recruitments.recent
          render json: { recruitments: recruitments.map { |recruitment| recruitment_payload(recruitment) } }
        elsif current_user.student?
          unless current_user.student_profile
            return render json: { errors: [ "Student profile is required" ] }, status: :forbidden
          end

          recruitments = Recruitment.published.recent.includes(:company_profile)
          render json: { recruitments: recruitments.map { |recruitment| recruitment_payload_for_student(recruitment) } }
        else
          render json: { errors: [ "Forbidden" ] }, status: :forbidden
        end
      end

      def show
        if current_user.company?
          unless current_user.company_profile
            return render json: { errors: [ "Company profile is required" ] }, status: :forbidden
          end

          recruitment = current_user.company_profile.recruitments.find_by(id: params[:id])
          unless recruitment
            return render json: { errors: [ "Recruitment not found" ] }, status: :not_found
          end

          render json: { recruitment: recruitment_payload(recruitment) }
        elsif current_user.student?
          unless current_user.student_profile
            return render json: { errors: [ "Student profile is required" ] }, status: :forbidden
          end

          recruitment = Recruitment.published.includes(:company_profile).find_by(id: params[:id])
          unless recruitment
            return render json: { errors: [ "Recruitment not found" ] }, status: :not_found
          end

          render json: { recruitment: recruitment_payload_for_student(recruitment) }
        else
          render json: { errors: [ "Forbidden" ] }, status: :forbidden
        end
      end

      def create
        attrs = recruitment_params
        return if performed?

        recruitment = current_user.company_profile.recruitments.new(attrs)

        if recruitment.save
          render json: { recruitment: recruitment_payload(recruitment) }, status: :created
        else
          render json: { errors: recruitment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        recruitment = current_user.company_profile.recruitments.find_by(id: params[:id])
        unless recruitment
          return render json: { errors: [ "Recruitment not found" ] }, status: :not_found
        end

        attrs = recruitment_params
        return if performed?

        if recruitment.update(attrs)
          render json: { recruitment: recruitment_payload(recruitment) }
        else
          render json: { errors: recruitment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def recruitment_params
        attrs = params.require(:recruitment).permit(
          :title, :job_type, :description, :location, :salary, :period, :status
        )

        if attrs.key?(:status) && Recruitment.statuses.keys.exclude?(attrs[:status].to_s)
          render json: { errors: [ "Status must be published or closed" ] }, status: :unprocessable_entity
        end

        attrs
      end

      def recruitment_payload(recruitment)
        recruitment.slice(
          :id, :title, :job_type, :description, :location, :salary, :period, :status,
          :created_at, :updated_at
        )
      end

      def recruitment_payload_for_student(recruitment)
        recruitment_payload(recruitment).merge(
          company: recruitment.company_profile.slice(
            :id,
            :name,
            :department,
            :description,
            :website_url,
            :industry,
            :number_of_employees,
            :location
          )
        )
      end
    end
  end
end
