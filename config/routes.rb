SolidLitequeen::Engine.routes.draw do
  resources :databases, only: [ :index, :show ] do
    get "/tables/:table", to: "databases#table_rows", as: :table_rows
    get "download", to: "databases#download", as: "download"
  end
  root to: "databases#index"
end
