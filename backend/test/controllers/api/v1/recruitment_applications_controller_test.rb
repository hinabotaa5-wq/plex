require "test_helper"

class Api::V1::RecruitmentApplicationsControllerTest < ActionDispatch::IntegrationTest
  test "requires authentication" do
    get "/api/v1/applications"

    assert_response :unauthorized
  end

  test "company index returns applications to own recruitments" do
    get "/api/v1/applications", headers: auth_headers(users(:company_one))

    assert_response :success
    ids = json_body["applications"].map { |item| item["id"] }
    assert_includes ids, recruitment_applications(:one).id
    assert_includes ids, recruitment_applications(:two).id
    application = json_body["applications"].find { |item| item["id"] == recruitment_applications(:one).id }
    assert_equal student_profiles(:one).name, application["student"]["name"]
  end

  test "student index returns only own applications" do
    get "/api/v1/applications", headers: auth_headers(users(:one))

    assert_response :success
    ids = json_body["applications"].map { |item| item["id"] }
    assert_includes ids, recruitment_applications(:one).id
    assert_not_includes ids, recruitment_applications(:two).id
    assert_equal recruitments(:one).title, json_body["applications"].first["recruitment"]["title"]
  end

  test "student can apply to a published recruitment" do
    recruitment = company_profiles(:two).recruitments.create!(
      title: "新規公開募集",
      job_type: "エンジニア",
      description: "開発を担当します。",
      location: "大阪府",
      salary: "月給20万円〜",
      status: :published
    )

    assert_difference [ "RecruitmentApplication.count", "Notification.count" ], 1 do
      post "/api/v1/recruitments/#{recruitment.id}/applications",
           params: { application: { body: "応募します。" } },
           as: :json,
           headers: auth_headers(users(:one))
    end

    assert_response :created
    assert_equal "sent", json_body["application"]["status"]
    assert_equal "応募します。", json_body["application"]["body"]
    assert_equal "application_received", Notification.last.action_type
  end

  test "student cannot apply twice to the same recruitment" do
    post "/api/v1/recruitments/#{recruitments(:one).id}/applications",
         params: { application: { body: "再応募します。" } },
         as: :json,
         headers: auth_headers(users(:one))

    assert_response :unprocessable_entity
  end

  test "student cannot apply to a closed recruitment" do
    post "/api/v1/recruitments/#{recruitments(:two).id}/applications",
         params: { application: { body: "応募します。" } },
         as: :json,
         headers: auth_headers(users(:one))

    assert_response :not_found
  end

  test "student create rejects blank body" do
    recruitment = company_profiles(:two).recruitments.create!(
      title: "もう一つの公開募集",
      job_type: "エンジニア",
      description: "開発を担当します。",
      location: "大阪府",
      salary: "月給20万円〜",
      status: :published
    )

    post "/api/v1/recruitments/#{recruitment.id}/applications",
         params: { application: { body: "" } },
         as: :json,
         headers: auth_headers(users(:one))

    assert_response :unprocessable_entity
  end

  test "company cannot apply" do
    post "/api/v1/recruitments/#{recruitments(:one).id}/applications",
         params: { application: { body: "応募します。" } },
         as: :json,
         headers: auth_headers(users(:company_one))

    assert_response :forbidden
  end

  test "company can accept a sent application" do
    assert_difference "Notification.count", 1 do
      patch "/api/v1/applications/#{recruitment_applications(:one).id}",
            params: { application: { status: "accepted" } },
            as: :json,
            headers: auth_headers(users(:company_one))
    end

    assert_response :success
    assert_equal "accepted", json_body["application"]["status"]
    assert recruitment_applications(:one).reload.accepted?
    assert_equal "application_responded", Notification.last.action_type
  end

  test "company can decline a sent application" do
    patch "/api/v1/applications/#{recruitment_applications(:one).id}",
          params: { application: { status: "declined" } },
          as: :json,
          headers: auth_headers(users(:company_one))

    assert_response :success
    assert_equal "declined", json_body["application"]["status"]
    assert recruitment_applications(:one).reload.declined?
  end

  test "company cannot respond twice" do
    patch "/api/v1/applications/#{recruitment_applications(:two).id}",
          params: { application: { status: "declined" } },
          as: :json,
          headers: auth_headers(users(:company_one))

    assert_response :unprocessable_entity
    assert recruitment_applications(:two).reload.accepted?
  end

  test "company cannot update another company's application" do
    patch "/api/v1/applications/#{recruitment_applications(:one).id}",
          params: { application: { status: "accepted" } },
          as: :json,
          headers: auth_headers(users(:company_two))

    assert_response :not_found
    assert recruitment_applications(:one).reload.sent?
  end

  test "student cannot accept an application" do
    patch "/api/v1/applications/#{recruitment_applications(:one).id}",
          params: { application: { status: "accepted" } },
          as: :json,
          headers: auth_headers(users(:one))

    assert_response :forbidden
  end

  private

  def auth_headers(user)
    { Authorization: "Bearer #{JsonWebToken.encode({ sub: user.id })}" }
  end

  def json_body
    JSON.parse(response.body)
  end
end
