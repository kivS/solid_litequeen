SolidLitequeen::Engine.routes.draw do
  resources :databases, only: [ :index, :show ] do
    get "/tables/:table", to: "databases#table_rows", as: :table_rows
    post "/tables/:table/set-column-order", to: "databases#set_column_order", as: :set_table_column_order
    get "download", to: "databases#download", as: "download"
  end
  root to: "databases#index"
end
