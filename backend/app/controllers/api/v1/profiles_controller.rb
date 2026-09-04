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
        if current_user.student?
          permitted = params.require(:profile).permit(
            :name, :university, :grade, :self_pr, :github_url,
            :faculty, :desired_job_type, :gakuchika,
            :skills, :qualifications, :intern_experience,
            :available_days_per_week, :available_time_from, :available_time_to,
            desired_location: [],
            available_weekdays: []
          )
          attrs = normalize_blank_urls(permitted)
          %w[available_days_per_week available_time_from available_time_to].each do |key|
            attrs[key] = nil if attrs[key].is_a?(String) && attrs[key].strip.empty?
          end
          if params[:profile].key?(:desired_location)
            attrs["desired_location"] = serialize_desired_location(params[:profile][:desired_location])
          end
          if params[:profile].key?(:available_weekdays)
            attrs["available_weekdays"] = serialize_available_weekdays(params[:profile][:available_weekdays])
          end
          attrs
        else
          raw = params.require(:profile).permit(
            :name, :department, :description, :website_url,
            :industry, :number_of_employees, :salary, :location, :recruiting_job_type
          )
          normalize_blank_urls(raw)
        end
      end

      def serialize_desired_location(value)
        locations = parse_string_list(value)
        locations.empty? ? nil : locations.to_json
      end

      def serialize_available_weekdays(value)
        weekdays = StudentProfile::WEEKDAYS & parse_string_list(value)
        weekdays.empty? ? nil : weekdays.to_json
      end

      def parse_string_list(value)
        items =
          case value
          when nil
            []
          when Array
            value
          when String
            stripped = value.strip
            parse_json_array(stripped) || (stripped.empty? ? [] : [ stripped ])
          else
            Array.wrap(value)
          end

        items.map { |item| item.to_s.strip }.reject(&:blank?).uniq
      end

      def parse_json_array(value)
        parsed = JSON.parse(value)
        parsed if parsed.is_a?(Array)
      rescue JSON::ParserError
        nil
      end

      def normalize_blank_urls(attrs)
        url_keys =
          if current_user.student?
            %w[github_url]
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
          current_profile.slice(
            :name, :university, :grade, :self_pr, :github_url,
            :faculty, :desired_job_type, :desired_location, :gakuchika,
            :skills, :qualifications, :intern_experience,
            :available_days_per_week, :available_weekdays,
            :available_time_from, :available_time_to
          )
        else
          current_profile.slice(
            :name, :department, :description, :website_url,
            :industry, :number_of_employees, :salary, :location, :recruiting_job_type
          )
        end
      end
    end
  end
end
