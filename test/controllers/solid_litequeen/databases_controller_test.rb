require "test_helper"
require "base64"
require "nokogiri"
require_relative "../../../app/controllers/solid_litequeen/databases_controller"

module SolidLitequeen
  class DatabasesControllerTest < ActionDispatch::IntegrationTest
    include Engine.routes.url_helpers
    self.use_transactional_tests = false

    test "enum mappings include article status" do
      mappings = ::SolidLitequeen::DatabasesController.new.send(:enum_mappings)
      assert_equal({"status" => Article.statuses}, mappings["articles"])
    end

    test "table rows render when schema changes" do
      db_path = File.expand_path("../../dummy/storage/test.sqlite3", __dir__)
      database_id = Base64.urlsafe_encode64(db_path)
      table = "temp_items"

      SolidLitequeen::DynamicDatabase.establish_connection(adapter: "sqlite3", database: db_path)
      SolidLitequeen::DynamicDatabase.connection.execute "DROP TABLE IF EXISTS #{table}"

      SolidLitequeen::DynamicDatabase.connection.execute <<~SQL
        CREATE TABLE #{table} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          obsolete TEXT
        );
      SQL

      post database_set_table_column_order_path(database_id:, table:),
           params: { columnOrder: %w[id name obsolete] }
      assert_response :success

      SolidLitequeen::DynamicDatabase.connection.execute "ALTER TABLE #{table} DROP COLUMN obsolete"

      get database_table_rows_path(database_id:, table:)
      assert_response :success
      assert_select "th[data-column-name='obsolete']", false
    ensure
      SolidLitequeen::DynamicDatabase.connection.execute "DROP TABLE IF EXISTS #{table}"
    end
  end
end
