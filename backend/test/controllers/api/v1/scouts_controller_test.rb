require "test_helper"

class Api::V1::ScoutsControllerTest < ActionDispatch::IntegrationTest
  test "requires authentication" do
    get "/api/v1/scouts"

    assert_response :unauthorized
  end

  test "company index returns only own scouts" do
    get "/api/v1/scouts", headers: auth_headers(users(:company_one))

    assert_response :success
    ids = json_body["scouts"].map { |item| item["id"] }
    assert_includes ids, scouts(:one).id
    assert_not_includes ids, scouts(:two).id
    scout = json_body["scouts"].find { |item| item["id"] == scouts(:one).id }
    assert_equal student_profiles(:one).name, scout["student"]["name"]
  end

  test "student index returns only own scouts" do
    get "/api/v1/scouts", headers: auth_headers(users(:one))

    assert_response :success
    ids = json_body["scouts"].map { |item| item["id"] }
    assert_includes ids, scouts(:one).id
    assert_not_includes ids, scouts(:two).id
    assert_equal company_profiles(:one).name, json_body["scouts"].first["company"]["name"]
  end

  test "company can send a scout" do
    assert_difference [ "Scout.count", "Notification.count" ], 1 do
      post "/api/v1/scouts",
           params: {
             scout: {
               student_profile_id: student_profiles(:two).id,
               subject: "夏季インターンのご案内",
               body: "一度カジュアルにお話できればと思いご連絡しました。"
             }
           },
           as: :json,
           headers: auth_headers(users(:company_one))
    end

    assert_response :created
    assert_equal "sent", json_body["scout"]["status"]
    assert_equal "夏季インターンのご案内", json_body["scout"]["subject"]
    assert_equal "scout_received", Notification.last.action_type
    assert_equal users(:two).id, Notification.last.user_id
  end

  test "company cannot scout the same student twice" do
    post "/api/v1/scouts",
         params: {
           scout: {
             student_profile_id: student_profiles(:one).id,
             subject: "再送",
             body: "同じ学生には送れないはずです。"
           }
         },
         as: :json,
         headers: auth_headers(users(:company_one))

    assert_response :unprocessable_entity
  end

  test "student cannot create a scout" do
    post "/api/v1/scouts",
         params: {
           scout: {
             student_profile_id: student_profiles(:two).id,
             subject: "学生からは送れない",
             body: "本文"
           }
         },
         as: :json,
         headers: auth_headers(users(:one))

    assert_response :forbidden
  end

  test "student can accept a sent scout" do
    patch "/api/v1/scouts/#{scouts(:one).id}",
          params: { scout: { status: "accepted" } },
          as: :json,
          headers: auth_headers(users(:one))

    assert_response :success
    assert_equal "accepted", json_body["scout"]["status"]
    assert scouts(:one).reload.accepted?
  end

  test "student can decline a sent scout" do
    patch "/api/v1/scouts/#{scouts(:two).id}",
          params: { scout: { status: "declined" } },
          as: :json,
          headers: auth_headers(users(:two))

    assert_response :success
    assert_equal "declined", json_body["scout"]["status"]
    assert scouts(:two).reload.declined?
  end

  test "student cannot respond twice" do
    scout = scouts(:one)
    scout.update!(status: :accepted)

    patch "/api/v1/scouts/#{scout.id}",
          params: { scout: { status: "declined" } },
          as: :json,
          headers: auth_headers(users(:one))

    assert_response :unprocessable_entity
    assert scout.reload.accepted?
  end

  test "student cannot update another student's scout" do
    patch "/api/v1/scouts/#{scouts(:two).id}",
          params: { scout: { status: "accepted" } },
          as: :json,
          headers: auth_headers(users(:one))

    assert_response :not_found
    assert scouts(:two).reload.sent?
  end

  test "company cannot accept a scout" do
    patch "/api/v1/scouts/#{scouts(:one).id}",
          params: { scout: { status: "accepted" } },
          as: :json,
          headers: auth_headers(users(:company_one))

    assert_response :forbidden
    assert scouts(:one).reload.sent?
  end

  test "student update rejects invalid status" do
    patch "/api/v1/scouts/#{scouts(:one).id}",
          params: { scout: { status: "sent" } },
          as: :json,
          headers: auth_headers(users(:one))

    assert_response :unprocessable_entity
    assert scouts(:one).reload.sent?
  end

  private

  def auth_headers(user)
    { Authorization: "Bearer #{JsonWebToken.encode({ sub: user.id })}" }
  end

  def json_body
    JSON.parse(response.body)
  end
end
