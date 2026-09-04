class AddAvailabilityToStudentProfiles < ActiveRecord::Migration[8.1]
  def change
    change_table :student_profiles do |t|
      t.string :available_days_per_week
      t.string :available_weekdays
      t.string :available_time_from
      t.string :available_time_to
    end
  end
end
