require "test_helper"

class Api::V1::ApplicationMessagesControllerTest < ActionDispatch::IntegrationTest
  test "requires authentication" do
    get "/api/v1/applications/#{recruitment_applications(:two).id}/messages"

    assert_response :unauthorized
  end

  test "participants can list messages on an accepted application" do
    application = recruitment_applications(:two)
    application.messages.create!(user: users(:two), body: "よろしくお願いします。")

    get "/api/v1/applications/#{application.id}/messages",
        headers: auth_headers(users(:company_one))

    assert_response :success
    assert_equal "よろしくお願いします。", json_body["messages"].first["body"]
    assert_equal "student", json_body["messages"].first["sender_role"]
  end

  test "student can send a message on an accepted application" do
    application = recruitment_applications(:two)

    assert_difference [ "Message.count", "Notification.count" ], 1 do
      post "/api/v1/applications/#{application.id}/messages",
           params: { message: { body: "来週ご連絡します。" } },
           as: :json,
           headers: auth_headers(users(:two))
    end

    assert_response :created
    assert_equal "来週ご連絡します。", json_body["message"]["body"]
    assert_equal application.id, Message.last.recruitment_application_id
    assert_nil Message.last.scout_id
    assert_equal "message_received", Notification.last.action_type
    assert_equal users(:company_one).id, Notification.last.user_id
  end

  test "company can send a message on an accepted application" do
    application = recruitment_applications(:two)

    assert_difference "Message.count", 1 do
      post "/api/v1/applications/#{application.id}/messages",
           params: { message: { body: "面接日程を調整しましょう。" } },
           as: :json,
           headers: auth_headers(users(:company_one))
    end

    assert_response :created
    assert_equal users(:two).id, Notification.last.user_id
  end

  test "cannot message a sent application" do
    post "/api/v1/applications/#{recruitment_applications(:one).id}/messages",
         params: { message: { body: "まだ承諾前です。" } },
         as: :json,
         headers: auth_headers(users(:company_one))

    assert_response :not_found
  end

  test "non participant cannot access application messages" do
    get "/api/v1/applications/#{recruitment_applications(:two).id}/messages",
        headers: auth_headers(users(:one))

    assert_response :not_found
  end

  test "other company cannot access application messages" do
    get "/api/v1/applications/#{recruitment_applications(:two).id}/messages",
        headers: auth_headers(users(:company_two))

    assert_response :not_found
  end

  test "rejects blank body" do
    post "/api/v1/applications/#{recruitment_applications(:two).id}/messages",
         params: { message: { body: "" } },
         as: :json,
         headers: auth_headers(users(:two))

    assert_response :unprocessable_entity
  end

  private

  def auth_headers(user)
    { Authorization: "Bearer #{JsonWebToken.encode({ sub: user.id })}" }
  end

  def json_body
    JSON.parse(response.body)
  end
end
