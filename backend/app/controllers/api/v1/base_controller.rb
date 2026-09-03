module Api
  module V1
    class BaseController < ApplicationController
      private

      def current_user
        return @current_user if defined?(@current_user)

        token = request.headers["Authorization"]&.split(" ")&.last
        payload = JsonWebToken.decode(token)
        @current_user = payload && User.find_by(id: payload[:sub])
      end

      def authenticate_user!
        render json: { errors: [ "Unauthorized" ] }, status: :unauthorized unless current_user
      end

      def require_company!
        unless current_user.company?
          return render json: { errors: [ "Forbidden" ] }, status: :forbidden
        end

        if current_user.company_profile.blank?
          render json: { errors: [ "Company profile is required" ] }, status: :forbidden
        end
      end

      def require_student!
        unless current_user.student?
          return render json: { errors: [ "Forbidden" ] }, status: :forbidden
        end

        if current_user.student_profile.blank?
          render json: { errors: [ "Student profile is required" ] }, status: :forbidden
        end
      end
    end
  end
end
