class Scout < ApplicationRecord
  belongs_to :company_profile
  belongs_to :student_profile

  enum :status, { sent: 0, accepted: 1, declined: 2 }

  validates :subject, presence: true
  validates :body, presence: true
  validates :status, presence: true
  validates :company_profile_id, uniqueness: { scope: :student_profile_id }
end
