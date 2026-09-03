module Api
  module V1
    class ProfilesController < BaseController
      before_action :authenticate_user!
      before_action :ensure_profile!

      def show
        render json: { profile: profile_payload }
      end

      def update
        if current_profile.update(profile_params)
          render json: { profile: profile_payload }
        else
          render json: { errors: current_profile.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def ensure_profile!
        return if current_profile.present?

        message =
          if current_user.student?
            "Student profile is required"
          elsif current_user.company?
            "Company profile is required"
          else
            "Profile is required"
          end

        render json: { errors: [ message ] }, status: :forbidden
      end

      def current_profile
        if current_user.student?
          current_user.student_profile
        elsif current_user.company?
          current_user.company_profile
        end
      end

      def profile_params
        raw =
          if current_user.student?
            params.require(:profile).permit(
              :name, :university, :grade, :self_pr, :github_url, :portfolio_url
            )
          else
            params.require(:profile).permit(
              :name, :department, :description, :website_url
            )
          end

        normalize_blank_urls(raw)
      end

      def normalize_blank_urls(attrs)
        url_keys =
          if current_user.student?
            %w[github_url portfolio_url]
          else
            %w[website_url]
          end

        attrs.to_h.each_with_object({}) do |(key, value), result|
          result[key] =
            if url_keys.include?(key.to_s) && value.is_a?(String) && value.strip.empty?
              nil
            else
              value
            end
        end
      end

      def profile_payload
        if current_user.student?
          current_profile.slice(:name, :university, :grade, :self_pr, :github_url, :portfolio_url)
        else
          current_profile.slice(:name, :department, :description, :website_url)
        end
      end
    end
  end
end
