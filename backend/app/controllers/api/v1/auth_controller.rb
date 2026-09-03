module Api
  module V1
    class AuthController < BaseController
      before_action :authenticate_user!, only: :me

      def signup
        user = User.new(signup_params)
        ensure_profile_present(user)

        if user.errors.empty? && user.save
          render json: auth_response(user), status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_by(email: params[:email])
        if user&.authenticate(params[:password])
          render json: auth_response(user), status: :ok
        else
          render json: { errors: [ "Invalid email or password" ] }, status: :unauthorized
        end
      end

      def me
        render json: { user: user_payload(current_user) }
      end

      private

      def signup_params
        params.require(:user).permit(
          :email,
          :password,
          :role,
          student_profile_attributes: [
            :name, :university, :grade, :self_pr, :github_url, :portfolio_url
          ],
          company_profile_attributes: [ :name, :description, :website_url ]
        )
      end

      def ensure_profile_present(user)
        if user.student? && user.student_profile.blank?
          user.errors.add(:student_profile, "can't be blank")
        elsif user.company? && user.company_profile.blank?
          user.errors.add(:company_profile, "can't be blank")
        end
      end

      def auth_response(user)
        {
          token: JsonWebToken.encode({ sub: user.id }),
          user: user_payload(user)
        }
      end

      def user_payload(user)
        {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: profile_payload(user)
        }
      end

      def profile_payload(user)
        if user.student?
          user.student_profile&.slice(:name, :university, :grade, :self_pr, :github_url, :portfolio_url)
        else
          user.company_profile&.slice(:name, :department, :description, :website_url)
        end
      end
    end
  end
end
