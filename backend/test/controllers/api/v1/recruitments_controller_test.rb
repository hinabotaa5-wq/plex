require "test_helper"

class Api::V1::RecruitmentsControllerTest < ActionDispatch::IntegrationTest
  test "requires authentication" do
    get "/api/v1/recruitments"

    assert_response :unauthorized
  end

  test "company index returns only own recruitments" do
    get "/api/v1/recruitments", headers: auth_headers(users(:company_one))

    assert_response :success
    ids = json_body["recruitments"].map { |item| item["id"] }
    assert_includes ids, recruitments(:one).id
    assert_not_includes ids, recruitments(:two).id
  end

  test "student index returns only published recruitments with company" do
    get "/api/v1/recruitments", headers: auth_headers(users(:one))

    assert_response :success
    ids = json_body["recruitments"].map { |item| item["id"] }
    assert_includes ids, recruitments(:one).id
    assert_not_includes ids, recruitments(:two).id
    assert_equal "ダミー社", json_body["recruitments"].first["company"]["name"]
  end

  test "company show returns own recruitment" do
    get "/api/v1/recruitments/#{recruitments(:one).id}", headers: auth_headers(users(:company_one))

    assert_response :success
    assert_equal recruitments(:one).id, json_body["recruitment"]["id"]
  end

  test "company show does not return another company's recruitment" do
    get "/api/v1/recruitments/#{recruitments(:two).id}", headers: auth_headers(users(:company_one))

    assert_response :not_found
  end

  test "student show returns published recruitment" do
    get "/api/v1/recruitments/#{recruitments(:one).id}", headers: auth_headers(users(:one))

    assert_response :success
    assert_equal recruitments(:one).title, json_body["recruitment"]["title"]
    assert_equal "ダミー社", json_body["recruitment"]["company"]["name"]
  end

  test "student show does not return closed recruitment" do
    get "/api/v1/recruitments/#{recruitments(:two).id}", headers: auth_headers(users(:one))

    assert_response :not_found
  end

  test "company can create a recruitment" do
    assert_difference -> { company_profiles(:one).recruitments.count }, 1 do
      post "/api/v1/recruitments",
           params: {
             recruitment: {
               title: "冬季インターン",
               job_type: "エンジニア",
               description: "開発を担当します。",
               location: "東京都",
               salary: "時給1,500円〜",
               period: "1ヶ月"
             }
           },
           as: :json,
           headers: auth_headers(users(:company_one))
    end

    assert_response :created
    assert_equal "冬季インターン", json_body["recruitment"]["title"]
    assert_equal "published", json_body["recruitment"]["status"]
  end

  test "company create rejects invalid params" do
    post "/api/v1/recruitments",
         params: { recruitment: { title: "" } },
         as: :json,
         headers: auth_headers(users(:company_one))

    assert_response :unprocessable_entity
    assert json_body["errors"].present?
  end

  test "student cannot create a recruitment" do
    post "/api/v1/recruitments",
         params: {
           recruitment: {
             title: "冬季インターン",
             job_type: "エンジニア",
             description: "開発を担当します。",
             location: "東京都",
             salary: "時給1,500円〜"
           }
         },
         as: :json,
         headers: auth_headers(users(:one))

    assert_response :forbidden
  end

  test "company can update own recruitment" do
    patch "/api/v1/recruitments/#{recruitments(:one).id}",
          params: { recruitment: { title: "更新後のタイトル", status: "closed" } },
          as: :json,
          headers: auth_headers(users(:company_one))

    assert_response :success
    assert_equal "更新後のタイトル", json_body["recruitment"]["title"]
    assert_equal "closed", json_body["recruitment"]["status"]
    assert recruitments(:one).reload.closed?
  end

  test "company cannot update another company's recruitment" do
    patch "/api/v1/recruitments/#{recruitments(:two).id}",
          params: { recruitment: { title: "不正な更新" } },
          as: :json,
          headers: auth_headers(users(:company_one))

    assert_response :not_found
    assert_equal "デザイナーインターン", recruitments(:two).reload.title
  end

  test "company update rejects invalid status" do
    patch "/api/v1/recruitments/#{recruitments(:one).id}",
          params: { recruitment: { status: "draft" } },
          as: :json,
          headers: auth_headers(users(:company_one))

    assert_response :unprocessable_entity
    assert_equal [ "Status must be published or closed" ], json_body["errors"]
    assert recruitments(:one).reload.published?
  end

  private

  def auth_headers(user)
    { Authorization: "Bearer #{JsonWebToken.encode({ sub: user.id })}" }
  end

  def json_body
    JSON.parse(response.body)
  end
end
