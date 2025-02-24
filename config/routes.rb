SolidLitequeen::Engine.routes.draw do
  resources :databases, only: [ :index, :show ] do
    get ":table", to: "databases#table_rows", as: :table_rows
  end
  root to: "databases#index"
end
