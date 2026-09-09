require "test_helper"

class ScoutTest < ActiveSupport::TestCase
  def valid_attributes
    {
      company_profile: company_profiles(:one),
      student_profile: student_profiles(:two),
      subject: "夏季インターンのご案内",
      body: "一度カジュアルにお話できればと思いご連絡しました。"
    }
  end

  test "valid scout is sent" do
    scout = scouts(:one)

    assert scout.valid?
    assert scout.sent?
  end

  test "company and student combination is unique" do
    duplicate = Scout.new(
      company_profile: company_profiles(:one),
      student_profile: student_profiles(:one),
      subject: "重複スカウト",
      body: "同じ学生には送れないはずです。"
    )

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:company_profile_id], "has already been taken"
  end

  test "same company can scout a different student" do
    scout = Scout.new(valid_attributes)

    assert scout.valid?
  end

  test "status can change from sent to accepted" do
    scout = scouts(:one)

    assert scout.update(status: :accepted)
    assert scout.accepted?
  end

  test "status can change from sent to declined" do
    scout = scouts(:two)

    assert scout.update(status: :declined)
    assert scout.declined?
  end

  test "status enum includes sent accepted and declined" do
    assert_includes Scout.statuses.keys, "sent"
    assert_includes Scout.statuses.keys, "accepted"
    assert_includes Scout.statuses.keys, "declined"
  end
end
