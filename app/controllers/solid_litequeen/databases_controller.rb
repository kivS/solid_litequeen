module SolidLitequeen
  class DynamicDatabase < ActiveRecord::Base
    self.abstract_class = true
  end

  class DatabasesController < ApplicationController
    def index
      @databases = ActiveRecord::Base.configurations.configurations.select do |config|
        config.adapter == "sqlite3" && config.env_name == Rails.env && config.database.present?
      end
    end

    def show
      db_id = params.expect(:id)
      database_location = Base64.urlsafe_decode64(db_id)

      DynamicDatabase.establish_connection(
        adapter: "sqlite3",
        database: database_location
      )

      # Retrieve a list of table names
      @tables = DynamicDatabase.connection.tables
    end
  end
end
