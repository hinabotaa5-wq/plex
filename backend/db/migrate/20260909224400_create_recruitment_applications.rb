class CreateRecruitmentApplications < ActiveRecord::Migration[8.1]
  def change
    create_table :recruitment_applications do |t|
      t.references :recruitment, null: false, foreign_key: { on_delete: :cascade }
      t.references :student_profile, null: false, foreign_key: { on_delete: :cascade }
      t.text :body, null: false
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :recruitment_applications,
              [ :recruitment_id, :student_profile_id ],
              unique: true,
              name: "idx_applications_on_recruitment_and_student"
  end
end
