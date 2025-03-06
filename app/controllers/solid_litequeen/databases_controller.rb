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
      @database_id = params.expect(:id)
      @database_location = Base64.urlsafe_decode64(@database_id)

      DynamicDatabase.establish_connection(
        adapter: "sqlite3",
        database: @database_location
      )

      tables = DynamicDatabase.connection.tables


      @tables = tables.map do |table|
        row_count = DynamicDatabase.connection.select_value("SELECT COUNT(*) FROM #{table}").to_i
        { name: table, row_count: row_count }
      end
    end

    def table_rows
      database_id = params.expect(:database_id)
      @table_name = params.expect(:table)

      @database_location = Base64.urlsafe_decode64(database_id)

      DynamicDatabase.establish_connection(
        adapter: "sqlite3",
        database: @database_location
      )

      @data = DynamicDatabase.connection.select_all("SELECT * FROM #{@table_name} LIMIT 50")
      @row_count = row_count = DynamicDatabase.connection.select_value("SELECT COUNT(*) FROM #{@table_name}").to_i
    end

    def download
      database_id = params.expect(:database_id)
      database_location = Base64.urlsafe_decode64(database_id)

      # Verify the file exists
      unless File.exist?(database_location)
        flash[:error] = "Database file not found"
        redirect_to databases_path and return
      end

      # Get the filename from the path
      filename = File.basename(database_location)

      # Send the file as a download
      send_file database_location,
                filename: filename,
                type: "application/x-sqlite3",
                disposition: "attachment"
    end
  end
end
