class AddDepartmentToCompanyProfiles < ActiveRecord::Migration[8.1]
  def change
    add_column :company_profiles, :department, :string
  end
end
