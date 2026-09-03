Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      post "signup", to: "auth#signup"
      post "login", to: "auth#login"
      get "me", to: "auth#me"
      resources :students, only: [ :index ]
      resources :scouts, only: [ :index, :create, :update ] do
        resources :messages, only: [ :index, :create ]
      end
    end
  end
end
