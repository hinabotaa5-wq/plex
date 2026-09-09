class AllowMessagesOnRecruitmentApplications < ActiveRecord::Migration[8.1]
  def change
    change_column_null :messages, :scout_id, true
    add_reference :messages, :recruitment_application, foreign_key: { on_delete: :cascade }

    add_check_constraint :messages,
                         "(scout_id IS NULL) <> (recruitment_application_id IS NULL)",
                         name: "messages_scout_xor_application"
  end
end
