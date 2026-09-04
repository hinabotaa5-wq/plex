class RemovePortfolioUrlFromStudentProfiles < ActiveRecord::Migration[8.1]
  def change
    remove_column :student_profiles, :portfolio_url, :string
  end
end
