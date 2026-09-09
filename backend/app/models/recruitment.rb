class Recruitment < ApplicationRecord
  belongs_to :company_profile
  has_many :recruitment_applications, dependent: :destroy

  enum :status, { published: 0, closed: 1 }

  validates :title, presence: true
  validates :job_type, presence: true
  validates :description, presence: true
  validates :location, presence: true
  validates :salary, presence: true
  validates :status, presence: true

  scope :recent, -> { order(created_at: :desc) }
end
