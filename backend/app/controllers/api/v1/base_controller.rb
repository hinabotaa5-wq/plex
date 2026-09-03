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
    end
  end
end
