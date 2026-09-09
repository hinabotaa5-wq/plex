require "test_helper"

class RecruitmentApplicationTest < ActiveSupport::TestCase
  def valid_attributes
    {
      recruitment: recruitments(:one),
      student_profile: student_profiles(:one),
      body: "開発に携わりたく応募しました。"
    }
  end

  test "valid application" do
    application = recruitment_applications(:one)

    assert application.valid?
    assert application.sent?
  end

  test "requires body" do
    application = RecruitmentApplication.new(valid_attributes.merge(body: nil))

    assert_not application.valid?
    assert_includes application.errors[:body], "can't be blank"
  end

  test "student can apply only once per recruitment" do
    duplicate = RecruitmentApplication.new(valid_attributes)

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:student_profile_id], "has already been taken"
  end

  test "cannot apply to closed recruitment" do
    application = RecruitmentApplication.new(
      valid_attributes.merge(recruitment: recruitments(:two), student_profile: student_profiles(:two))
    )

    assert_not application.valid?
    assert_includes application.errors[:recruitment], "must be published"
  end

  test "belongs to recruitment and student_profile" do
    application = recruitment_applications(:one)

    assert_equal recruitments(:one), application.recruitment
    assert_equal student_profiles(:one), application.student_profile
  end

  test "recruitment has many applications" do
    assert_includes recruitments(:one).recruitment_applications, recruitment_applications(:one)
  end

  test "status enum includes sent accepted and declined" do
    assert recruitment_applications(:one).sent?
    assert recruitment_applications(:two).accepted?
  end
end
