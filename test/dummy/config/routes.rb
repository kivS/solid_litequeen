Rails.application.routes.draw do
  resources :articles
  mount SolidLitequeen::Engine => "/solid_litequeen"
  root "articles#index"
end
