require "test_helper"

class RecruitmentTest < ActiveSupport::TestCase
  def valid_attributes
    {
      company_profile: company_profiles(:one),
      title: "夏季エンジニアインターン",
      job_type: "エンジニア",
      description: "Webアプリケーション開発に携わっていただきます。",
      location: "東京都",
      salary: "時給1,500円〜",
      period: "2ヶ月"
    }
  end

  test "valid recruitment" do
    recruitment = Recruitment.new(valid_attributes)

    assert recruitment.valid?
    assert recruitment.published?
  end

  test "period is optional" do
    recruitment = Recruitment.new(valid_attributes.merge(period: nil))

    assert recruitment.valid?
  end

  test "requires title" do
    recruitment = Recruitment.new(valid_attributes.merge(title: nil))

    assert_not recruitment.valid?
    assert_includes recruitment.errors[:title], "can't be blank"
  end

  test "requires job_type" do
    recruitment = Recruitment.new(valid_attributes.merge(job_type: nil))

    assert_not recruitment.valid?
    assert_includes recruitment.errors[:job_type], "can't be blank"
  end

  test "requires description" do
    recruitment = Recruitment.new(valid_attributes.merge(description: nil))

    assert_not recruitment.valid?
    assert_includes recruitment.errors[:description], "can't be blank"
  end

  test "requires location" do
    recruitment = Recruitment.new(valid_attributes.merge(location: nil))

    assert_not recruitment.valid?
    assert_includes recruitment.errors[:location], "can't be blank"
  end

  test "requires salary" do
    recruitment = Recruitment.new(valid_attributes.merge(salary: nil))

    assert_not recruitment.valid?
    assert_includes recruitment.errors[:salary], "can't be blank"
  end

  test "belongs to company_profile" do
    recruitment = recruitments(:one)

    assert_equal company_profiles(:one), recruitment.company_profile
  end

  test "company_profile has many recruitments" do
    assert_includes company_profiles(:one).recruitments, recruitments(:one)
  end

  test "status enum includes published and closed" do
    published = recruitments(:one)
    closed = recruitments(:two)

    assert published.published?
    assert closed.closed?
  end

  test "recent scope orders by created_at desc" do
    older = recruitments(:one)
    newer = recruitments(:two)
    older.update_columns(created_at: 2.days.ago)
    newer.update_columns(created_at: 1.hour.ago)

    assert_equal [ newer, older ], Recruitment.recent.to_a
  end
end
