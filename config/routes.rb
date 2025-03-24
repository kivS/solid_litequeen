SolidLitequeen::Engine.routes.draw do
  resources :databases, only: [ :index, :show ] do
    get "/tables/:table", to: "databases#table_rows", as: :table_rows
    post "/tables/:table/set-column-order", to: "databases#set_column_order", as: :set_table_column_order
    get "/tables/:table/foreign-key-data/:target_table/:target_field/:target_field_value", to: "databases#get_foreign_key_data", as: :get_table_foreign_key_data
    get "download", to: "databases#download", as: "download"
  end
  root to: "databases#index"
end
