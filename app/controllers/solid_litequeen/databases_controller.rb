module SolidLitequeen
  class DynamicDatabase < ActiveRecord::Base
    self.abstract_class = true
  end

  class DatabasesController < ApplicationController
    def index
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
      @database_id = params.expect(:database_id)
      @table_name = params.expect(:table)

      # Create a unique key for this table's sort preferences
      sort_key = "#{@database_id}_#{@table_name}_sort"

      # Update session if new sort params are provided
      if params[:sort_column].present?
        session[sort_key] = {
          sort_column: params[:sort_column].to_s,
          sort_direction: (params[:sort_direction]&.upcase == "DESC" ? "DESC" : "ASC")
        }.stringify_keys # Ensure all keys are strings in session
      end

      # Get sort preferences from session or set defaults with string keys
      sort_prefs = session[sort_key]&.with_indifferent_access || {
        "sort_column" => nil,
        "sort_direction" => nil
      }

      @sort_column = sort_prefs["sort_column"]
      @sort_direction = sort_prefs["sort_direction"]

      # debugger

      @database_location = Base64.urlsafe_decode64(@database_id)

      DynamicDatabase.establish_connection(
        adapter: "sqlite3",
        database: @database_location
      )

      # Verify the sort column exists in the table to prevent SQL injection
      valid_columns = DynamicDatabase.connection.columns(@table_name).map(&:name)

      # Use the column order from session if it exists; otherwise, default to all columns
      ordered_columns = session["#{@database_id}_#{@table_name}_column_order"] || valid_columns

      order_clause = if @sort_column.present? && valid_columns.include?(@sort_column)
        "#{DynamicDatabase.connection.quote_column_name(@sort_column)} #{@sort_direction}"
      end

      sql = [ "SELECT #{ordered_columns.join(', ')} FROM #{@table_name}" ]
      sql << "ORDER BY #{order_clause}" if order_clause
      sql << "LIMIT 50"


      @data = DynamicDatabase.connection.select_all(sql.join(" "))

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

    def set_column_order
      table_name = params[:table]
      database_id = params[:database_id]

      column_order = params[:columnOrder]

      # Store column order in session using database and table as key
      session["#{database_id}_#{table_name}_column_order"] = column_order

      head :ok
    end
  end
end
