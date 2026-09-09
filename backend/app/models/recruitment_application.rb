class RecruitmentApplication < ApplicationRecord
  belongs_to :recruitment
  belongs_to :student_profile
  has_many :messages, dependent: :destroy

  enum :status, { sent: 0, accepted: 1, declined: 2 }

  validates :body, presence: true
  validates :status, presence: true
  validates :student_profile_id, uniqueness: { scope: :recruitment_id }
  validate :recruitment_must_be_published, on: :create

  scope :recent, -> { order(created_at: :desc) }

  private

  def recruitment_must_be_published
    return if recruitment.blank? || recruitment.published?

    errors.add(:recruitment, "must be published")
  end
end
