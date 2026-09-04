class StudentProfile < ApplicationRecord
  URL_FORMAT = URI::DEFAULT_PARSER.make_regexp(%w[http https])
  TIME_FORMAT = /\A\d{2}:\d{2}(:\d{2})?\z/
  AVAILABLE_DAYS_PER_WEEK = %w[週1日 週2日 週3日 週4日 週5日以上 応相談].freeze
  WEEKDAYS = %w[月 火 水 木 金 土 日].freeze

  belongs_to :user
  has_many :scouts, dependent: :destroy

  before_validation :normalize_list_fields

  validates :name, presence: true
  validates :university, presence: true
  validates :grade, presence: true
  validates :faculty, presence: true
  validates :desired_job_type, presence: true
  validates :desired_location, presence: true
  validates :available_days_per_week, presence: true, inclusion: { in: AVAILABLE_DAYS_PER_WEEK }
  validates :available_weekdays, presence: true
  validates :available_time_from, presence: true, format: { with: TIME_FORMAT }
  validates :available_time_to, presence: true, format: { with: TIME_FORMAT }
  validates :self_pr, presence: true
  validates :gakuchika, presence: true
  validates :github_url, format: { with: URL_FORMAT }, allow_blank: true
  validate :user_must_be_student

  private

  def normalize_list_fields
    locations = parse_string_list(desired_location)
    self.desired_location = locations.empty? ? nil : locations.to_json

    weekdays = WEEKDAYS & parse_string_list(available_weekdays)
    self.available_weekdays = weekdays.empty? ? nil : weekdays.to_json
  end

  def parse_string_list(value)
    items =
      case value
      when nil
        []
      when Array
        value
      when String
        stripped = value.strip
        parse_json_array(stripped) || (stripped.empty? ? [] : [ stripped ])
      else
        Array.wrap(value)
      end

    items.map { |item| item.to_s.strip }.reject(&:blank?).uniq
  end

  def parse_json_array(value)
    parsed = JSON.parse(value)
    parsed if parsed.is_a?(Array)
  rescue JSON::ParserError
    nil
  end

  def user_must_be_student
    return if user.blank? || user.student?

    errors.add(:user, "must have student role")
  end
end
