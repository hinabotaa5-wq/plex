module Api
  module V1
    class NotificationsController < BaseController
      before_action :authenticate_user!

      def index
        notifications = current_user.notifications.includes(:notifiable).recent

        render json: {
          notifications: notifications.map { |notification| notification_payload(notification) },
          unread_count: current_user.notifications.unread.count
        }
      end

      def read_all
        current_user.notifications.unread.update_all(is_read: true)

        render json: { unread_count: 0 }
      end

      def read
        notification = current_user.notifications.find_by(id: params[:id])
        unless notification
          return render json: { errors: [ "Notification not found" ] }, status: :not_found
        end

        notification.update!(is_read: true)

        render json: { notification: notification_payload(notification) }
      end

      private

      def notification_payload(notification)
        {
          id: notification.id,
          action_type: notification.action_type,
          title: notification.title,
          body: notification.body,
          is_read: notification.is_read,
          notifiable_type: notification.notifiable_type,
          notifiable_id: notification.notifiable_id,
          scout_id: scout_id_for(notification),
          created_at: notification.created_at
        }
      end

      def scout_id_for(notification)
        case notification.notifiable
        when Scout
          notification.notifiable_id
        when Message
          notification.notifiable.scout_id
        end
      end
    end
  end
end
