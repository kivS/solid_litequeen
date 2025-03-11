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

      @database_location = Base64.urlsafe_decode64(@database_id)

      DynamicDatabase.establish_connection(
        adapter: "sqlite3",
        database: @database_location
      )

      table_columns = DynamicDatabase.connection.columns(@table_name)

      @columns_info = table_columns.each_with_object({}) do |column, hash|
        hash[column.name] = {
          sql_type: column.sql_type_metadata.sql_type,
          type: column.sql_type_metadata.type,
          limit: column.sql_type_metadata.limit,
          precision: column.sql_type_metadata.precision,
          scale: column.sql_type_metadata.scale,
          null: column.null,
          default: column.default
        }
      end

      # Verify the sort column exists in the table to prevent SQL injection
      valid_columns = table_columns.map(&:name)

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
      database_id = params[:database_id]
      database_location = Base64.urlsafe_decode64(database_id)

      # Ensure the database file exists
      unless File.exist?(database_location)
        flash[:error] = "Database file not found"
        redirect_to databases_path and return
      end

      # Create a temporary file for the backup
      backup_file = Tempfile.new([ "backup", ".sqlite3" ])
      backup_file.close  # Close the file so SQLite3 can write to it

      begin
        # Establish connection like we've been doing elsewhere
        DynamicDatabase.establish_connection(
          adapter: "sqlite3",
          database: database_location
        )

        # Use VACUUM INTO for a more efficient backup
        DynamicDatabase.connection.execute("VACUUM INTO '#{backup_file.path}'")

        # Close the connection
        DynamicDatabase.connection.close

        # Send the backup file as a download
        send_file backup_file.path,
                  filename: File.basename(database_location),
                  type: "application/x-sqlite3",
                  disposition: "attachment"
      ensure
        # Cleanup: the Tempfile will be unlinked when garbage-collected
        backup_file.unlink if backup_file && File.exist?(backup_file.path)
      end
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
