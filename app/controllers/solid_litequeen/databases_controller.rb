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

      tables = DynamicDatabase.connection.tables


      @table_info = tables.map do |table|
        row_count = DynamicDatabase.connection.select_value("SELECT COUNT(*) FROM #{table}").to_i
        { name: table, row_count: row_count }
      end
    end
  end
end
