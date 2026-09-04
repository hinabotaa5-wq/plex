class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.string :action_type, null: false
      t.string :title, null: false
      t.text :body
      t.boolean :is_read, null: false, default: false
      t.references :notifiable, polymorphic: true, null: false

      t.timestamps
    end

    add_index :notifications, [ :user_id, :is_read ]
  end
end
