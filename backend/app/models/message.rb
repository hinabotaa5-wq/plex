class Message < ApplicationRecord
  belongs_to :scout
  belongs_to :user

  validates :body, presence: true
end
