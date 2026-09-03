# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_03_094544) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "company_profiles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "department"
    t.text "description"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.string "website_url"
    t.index ["user_id"], name: "index_company_profiles_on_user_id", unique: true
  end

  create_table "messages", force: :cascade do |t|
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.bigint "scout_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["scout_id"], name: "index_messages_on_scout_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "scouts", force: :cascade do |t|
    t.text "body", null: false
    t.bigint "company_profile_id", null: false
    t.datetime "created_at", null: false
    t.integer "status", default: 0, null: false
    t.bigint "student_profile_id", null: false
    t.string "subject", null: false
    t.datetime "updated_at", null: false
    t.index ["company_profile_id", "student_profile_id"], name: "index_scouts_on_company_profile_id_and_student_profile_id", unique: true
    t.index ["company_profile_id"], name: "index_scouts_on_company_profile_id"
    t.index ["student_profile_id"], name: "index_scouts_on_student_profile_id"
  end

  create_table "student_profiles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "github_url"
    t.string "grade", null: false
    t.string "name", null: false
    t.string "portfolio_url"
    t.text "self_pr"
    t.string "university", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_student_profiles_on_user_id", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.integer "role", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "company_profiles", "users", on_delete: :cascade
  add_foreign_key "messages", "scouts", on_delete: :cascade
  add_foreign_key "messages", "users", on_delete: :cascade
  add_foreign_key "scouts", "company_profiles", on_delete: :cascade
  add_foreign_key "scouts", "student_profiles", on_delete: :cascade
  add_foreign_key "student_profiles", "users", on_delete: :cascade
end
