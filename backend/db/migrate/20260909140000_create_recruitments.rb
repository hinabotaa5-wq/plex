class CreateRecruitments < ActiveRecord::Migration[8.1]
  def change
    create_table :recruitments do |t|
      t.references :company_profile, null: false, foreign_key: { on_delete: :cascade }
      t.string :title, null: false
      t.string :job_type, null: false
      t.text :description, null: false
      t.string :location, null: false
      t.string :salary, null: false
      t.string :period
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :recruitments, :status
  end
end
