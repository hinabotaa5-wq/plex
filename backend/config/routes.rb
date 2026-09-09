Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      post "signup", to: "auth#signup"
      post "login", to: "auth#login"
      get "me", to: "auth#me"
      resource :profile, only: [ :show, :update ]
      resources :students, only: [ :index ]
      resources :recruitments, only: [ :index, :show, :create, :update ] do
        resources :applications, only: [ :create ], controller: "recruitment_applications"
      end
      resources :applications, only: [ :index, :update ], controller: "recruitment_applications" do
        resources :messages, only: [ :index, :create ]
      end
      resources :notifications, only: [ :index ] do
        collection do
          patch :read_all
        end
        member do
          patch :read
        end
      end
      resources :scouts, only: [ :index, :create, :update ] do
        resources :messages, only: [ :index, :create ]
      end
    end
  end
end
