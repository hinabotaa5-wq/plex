require "test_helper"

class MessageTest < ActiveSupport::TestCase
  test "valid when belonging to a scout" do
    message = Message.new(scout: scouts(:one), user: users(:one), body: "こんにちは")

    assert message.valid?
  end

  test "valid when belonging to a recruitment application" do
    message = Message.new(
      recruitment_application: recruitment_applications(:two),
      user: users(:one),
      body: "よろしくお願いします"
    )

    assert message.valid?
  end

  test "invalid without a parent" do
    message = Message.new(user: users(:one), body: "本文")

    assert_not message.valid?
    assert_includes message.errors[:base], "must belong to a scout or a recruitment application"
  end

  test "invalid when belonging to both a scout and an application" do
    message = Message.new(
      scout: scouts(:one),
      recruitment_application: recruitment_applications(:two),
      user: users(:one),
      body: "本文"
    )

    assert_not message.valid?
    assert_includes message.errors[:base], "must belong to a scout or a recruitment application"
  end

  test "requires body" do
    message = Message.new(scout: scouts(:one), user: users(:one), body: nil)

    assert_not message.valid?
    assert_includes message.errors[:body], "can't be blank"
  end
end
