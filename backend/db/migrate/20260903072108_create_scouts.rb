class CreateScouts < ActiveRecord::Migration[8.1]
  def change
    create_table :scouts do |t|
      t.references :company_profile, null: false, foreign_key: { on_delete: :cascade }
      t.references :student_profile, null: false, foreign_key: { on_delete: :cascade }
      t.string :subject, null: false
      t.text :body, null: false
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :scouts, [ :company_profile_id, :student_profile_id ], unique: true
  end
end
