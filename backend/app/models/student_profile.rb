class StudentProfile < ApplicationRecord
  URL_FORMAT = URI::DEFAULT_PARSER.make_regexp(%w[http https])

  belongs_to :user
  has_many :scouts, dependent: :destroy

  validates :name, presence: true
  validates :university, presence: true
  validates :grade, presence: true
  validates :github_url, format: { with: URL_FORMAT }, allow_blank: true
  validate :user_must_be_student

  private

  def user_must_be_student
    return if user.blank? || user.student?

    errors.add(:user, "must have student role")
  end
end
