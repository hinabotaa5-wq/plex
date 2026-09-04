class User < ApplicationRecord
  has_secure_password

  enum :role, { student: 0, company: 1 }

  has_one :student_profile, dependent: :destroy
  has_one :company_profile, dependent: :destroy
  has_many :notifications, dependent: :destroy
  accepts_nested_attributes_for :student_profile
  accepts_nested_attributes_for :company_profile

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true
  validates :password, length: { minimum: 6 }, allow_nil: true
end
