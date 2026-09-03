class AddExtendedFieldsToProfiles < ActiveRecord::Migration[8.1]
  def change
    change_table :student_profiles do |t|
      t.string :faculty
      t.string :desired_job_type
      t.string :desired_location
      t.text :gakuchika
      t.text :skills
      t.text :qualifications
      t.text :intern_experience
      t.string :job_hunting_status
    end

    change_table :company_profiles do |t|
      t.string :industry
      t.string :number_of_employees
      t.string :salary
      t.string :location
      t.string :recruiting_job_type
    end
  end
end
