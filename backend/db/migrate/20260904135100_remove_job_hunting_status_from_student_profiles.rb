class RemoveJobHuntingStatusFromStudentProfiles < ActiveRecord::Migration[8.1]
  def change
    remove_column :student_profiles, :job_hunting_status, :string
  end
end
