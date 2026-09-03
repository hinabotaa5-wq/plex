class CompanyProfile < ApplicationRecord
  URL_FORMAT = URI::DEFAULT_PARSER.make_regexp(%w[http https])

  belongs_to :user
  has_many :scouts, dependent: :destroy

  validates :name, presence: true
  validates :website_url, format: { with: URL_FORMAT }, allow_blank: true
  validate :user_must_be_company

  private

  def user_must_be_company
    return if user.blank? || user.company?

    errors.add(:user, "must have company role")
  end
end
