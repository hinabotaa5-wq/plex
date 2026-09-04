class CompanyProfile < ApplicationRecord
  URL_FORMAT = URI::DEFAULT_PARSER.make_regexp(%w[http https])

  belongs_to :user
  has_many :scouts, dependent: :destroy

  validates :name, presence: true
  validates :department, presence: true
  validates :industry, presence: true
  validates :number_of_employees, presence: true
  validates :salary, presence: true
  validates :location, presence: true
  validates :recruiting_job_type, presence: true
  validates :description, presence: true
  validates :website_url, presence: true, format: { with: URL_FORMAT }
  validate :user_must_be_company

  private

  def user_must_be_company
    return if user.blank? || user.company?

    errors.add(:user, "must have company role")
  end
end
