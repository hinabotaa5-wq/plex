class StudentProfile < ApplicationRecord
  URL_FORMAT = URI::DEFAULT_PARSER.make_regexp(%w[http https])
  TIME_FORMAT = /\A\d{2}:\d{2}(:\d{2})?\z/
  AVAILABLE_DAYS_PER_WEEK = %w[週1日 週2日 週3日 週4日 週5日以上 応相談].freeze
  WEEKDAYS = %w[月 火 水 木 金 土 日].freeze

  belongs_to :user
  has_many :scouts, dependent: :destroy

  validates :name, presence: true
  validates :university, presence: true
  validates :grade, presence: true
  validates :github_url, format: { with: URL_FORMAT }, allow_blank: true
  validates :available_days_per_week, inclusion: { in: AVAILABLE_DAYS_PER_WEEK }, allow_blank: true
  validates :available_time_from, format: { with: TIME_FORMAT }, allow_blank: true
  validates :available_time_to, format: { with: TIME_FORMAT }, allow_blank: true
  validate :user_must_be_student

  private

  def user_must_be_student
    return if user.blank? || user.student?

    errors.add(:user, "must have student role")
  end
end
