class CreateStudentProfiles < ActiveRecord::Migration[8.1]
  def change
    create_table :student_profiles do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, index: { unique: true }
      t.string :name, null: false
      t.string :university, null: false
      t.string :grade, null: false
      t.text :self_pr
      t.string :github_url
      t.string :portfolio_url

      t.timestamps
    end
  end
end
