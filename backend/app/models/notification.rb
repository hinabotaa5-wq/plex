class Notification < ApplicationRecord
  ACTION_TYPES = %w[scout_received message_received].freeze

  belongs_to :user
  belongs_to :notifiable, polymorphic: true

  validates :action_type, presence: true, inclusion: { in: ACTION_TYPES }
  validates :title, presence: true

  scope :unread, -> { where(is_read: false) }
  scope :recent, -> { order(created_at: :desc) }

  def self.notify!(user:, action_type:, title:, body:, notifiable:)
    create!(
      user: user,
      action_type: action_type,
      title: title,
      body: body,
      notifiable: notifiable
    )
  end
end
