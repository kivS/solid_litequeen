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

      foreign_keys = []

      @tables = tables.map do |table|
        fk = DynamicDatabase.connection.foreign_keys(table)
        foreign_keys.concat(fk) unless fk.empty?

        row_count = DynamicDatabase.connection.select_value("SELECT COUNT(*) FROM #{table}").to_i
        { name: table, row_count: row_count }
      end

      tables = {}
      relations = []

      foreign_keys.each do |rel|
        from_table = rel[:from_table]
        to_table = rel[:to_table]
        fk_field =  rel.dig(:options).dig(:column)
        pk_field = rel.dig(:options).dig(:primary_key)

        # Initialize tables if not already present
        tables[from_table] ||= { name: from_table, fields: [] }
        tables[to_table]   ||= { name: to_table, fields: [] }

        # Add fields if not already included
        tables[from_table][:fields] << fk_field unless tables[from_table][:fields].include?(fk_field)
        tables[to_table][:fields] << pk_field unless tables[to_table][:fields].include?(pk_field)

        # Build a simplified relation object
        relations << {
          from_table: from_table,
          from_field: fk_field,
          to_table: to_table,
          to_field: pk_field
        }
      end

      @table_relations = {
        tables: tables.values,
        relations: relations
      }
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

      foreign_keys = DynamicDatabase.connection.foreign_keys(@table_name)

      primary_key_column_name = DynamicDatabase.connection.primary_key(@table_name)


      # Build a mapping from column name to its foreign key details
      fk_info = {}
      foreign_keys.each do |fk|
        # Depending on your Rails version, you might access these properties as below:
        fk_info[fk.column] = {
          to_table: fk.to_table,
          primary_key: fk.primary_key,
          on_update: fk.options.dig(:on_update),
          on_delete: fk.options.dig(:on_delete)
        }
      end

      # Retrieve index info
      indexes = DynamicDatabase.connection.indexes(@table_name)
      index_data = {}
      indexes.each do |index|
        index.columns.each do |column_name|
          index_data[column_name] ||= []
          index_data[column_name] << { name: index.name, unique: index.unique }
        end
      end

      enum_info = enum_mappings[@table_name] || {}

      @columns_info = table_columns.each_with_object({}) do |column, hash|
        info = {
          sql_type: column.sql_type_metadata.sql_type,
          type: column.sql_type_metadata.type,
          limit: column.sql_type_metadata.limit,
          precision: column.sql_type_metadata.precision,
          scale: column.sql_type_metadata.scale,
          null: column.null,
          default: column.default,
          is_primary_key: primary_key_column_name == column.name
        }

        # Append foreign key info if available for this column
        if fk_info[column.name]
          info[:foreign_key] = fk_info[column.name]
        end

        # Append enum options if present
        info[:enum_options] = enum_info[column.name] if enum_info[column.name]

        # Append index info if available for this column
        info[:indexes] = index_data[column.name] if index_data[column.name]

        hash[column.name] = info
      end

      # Verify the sort column exists in the table to prevent SQL injection
      valid_columns = table_columns.map(&:name)

      stored_order = session["#{@database_id}_#{@table_name}_column_order"] || []
      ordered_columns = (stored_order & valid_columns)
      ordered_columns = valid_columns if ordered_columns.empty?

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

        # Send the backup file as a download
        send_file backup_file.path,
                  filename: File.basename(database_location),
                  type: "application/x-sqlite3",
                  disposition: "attachment"
      end
    end



    def set_column_order
      table_name = params[:table]
      database_id = params[:database_id]

      column_order = params[:columnOrder]

      database_location = Base64.urlsafe_decode64(database_id)
      valid_columns = ActiveRecord::Base.connection.columns(table_name).map(&:name)
      sanitized_order = column_order & valid_columns

      session["#{database_id}_#{table_name}_column_order"] = sanitized_order

      head :ok
    end

    def get_foreign_key_data
      @database_id = params.expect(:database_id)
      @table_name = params.expect(:table)
      @target_table = params.expect(:target_table)
      @target_field = params.expect(:target_field)
      @target_field_value = params.expect(:target_field_value)

      @database_location = Base64.urlsafe_decode64(@database_id)

      DynamicDatabase.establish_connection(
        adapter: "sqlite3",
        database: @database_location
      )


      # Query the target table for the record matching the foreign key value
      query = "SELECT * FROM #{@target_table} WHERE #{@target_field} = ? LIMIT 1"
      @result = DynamicDatabase.connection.exec_query(query, "SQL", [ @target_field_value ])


      render partial: "foreign-key-data"
    end

    private

    def enum_mappings
      Rails.application.eager_load! unless Rails.application.config.eager_load
      ActiveRecord::Base.descendants.each_with_object({}) do |model, map|
        next if model.abstract_class?
        model.defined_enums.each do |attr, mapping|
          (map[model.table_name] ||= {})[attr] = mapping
        end
      end
    end
  end
end
