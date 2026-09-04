module Api
  module V1
    class MessagesController < BaseController
      before_action :authenticate_user!
      before_action :set_accepted_scout

      def index
        messages = @scout.messages.includes(:user).order(:created_at)
        render json: { messages: messages.map { |message| message_payload(message) } }
      end

      def create
        message = @scout.messages.new(body: message_params[:body], user: current_user)

        if message.save
          notify_recipient(message)
          render json: { message: message_payload(message) }, status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_accepted_scout
        scout = Scout.find_by(id: params[:scout_id])
        unless scout && participant?(scout) && scout.accepted?
          return render json: { errors: [ "Scout not found" ] }, status: :not_found
        end

        @scout = scout
      end

      def participant?(scout)
        if current_user.company?
          current_user.company_profile&.id == scout.company_profile_id
        elsif current_user.student?
          current_user.student_profile&.id == scout.student_profile_id
        else
          false
        end
      end

      def message_params
        params.require(:message).permit(:body)
      end

      def notify_recipient(message)
        recipient = message_recipient
        return if recipient.blank? || recipient.id == current_user.id

        Notification.notify!(
          user: recipient,
          action_type: "message_received",
          title: "新しいメッセージが届きました",
          body: message.body.truncate(40),
          notifiable: message
        )
      end

      def message_recipient
        if current_user.company?
          @scout.student_profile&.user
        elsif current_user.student?
          @scout.company_profile&.user
        end
      end

      def message_payload(message)
        {
          id: message.id,
          body: message.body,
          created_at: message.created_at,
          user_id: message.user_id,
          sender_role: message.user.role
        }
      end
    end
  end
end
