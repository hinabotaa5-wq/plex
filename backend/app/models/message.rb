class Message < ApplicationRecord
  belongs_to :scout, optional: true
  belongs_to :recruitment_application, optional: true
  belongs_to :user

  validates :body, presence: true
  validate :exactly_one_parent

  private

  def exactly_one_parent
    return if scout.present? ^ recruitment_application.present?

    errors.add(:base, "must belong to a scout or a recruitment application")
  end
end
