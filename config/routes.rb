SolidLitequeen::Engine.routes.draw do
  resources :databases, only: [ :index, :show ]
  root to: "databases#index"
end
