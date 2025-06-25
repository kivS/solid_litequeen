require "test_helper"
require "base64"
require "nokogiri"

module SolidLitequeen
  class DatabasesControllerTest < ActionDispatch::IntegrationTest
    include Engine.routes.url_helpers

    setup do
      @tmp_db = Tempfile.new(["litequeen", ".sqlite3"])
      SolidLitequeen::DynamicDatabase.establish_connection(
        adapter: "sqlite3",
        database: @tmp_db.path
      )
      SolidLitequeen::DynamicDatabase.connection.create_table :items do |t|
        t.string :name
      end
    end

    teardown do
      SolidLitequeen::DynamicDatabase.remove_connection
      @tmp_db.close
      @tmp_db.unlink
    end

    test "enum mappings include article status" do
      mappings = ::SolidLitequeen::DatabasesController.new.send(:enum_mappings)
      assert_equal({"status" => {"draft" => 0, "published" => 1}}, mappings["articles"])
    end

    test "new columns are appended to stored order" do
      database_id = Base64.urlsafe_encode64(@tmp_db.path)

      post "/solid_litequeen/databases/#{database_id}/tables/items/set-column-order", params: { columnOrder: ["id", "name"] }

      SolidLitequeen::DynamicDatabase.connection.add_column :items, :description, :string

      get "/solid_litequeen/databases/#{database_id}/tables/items"
      assert_response :success

      doc = Nokogiri::HTML(@response.body)
      headers = doc.css('th').map { |th| th['data-column-name'] }
      assert_includes headers, 'description'
    end

    test "removed columns are ignored from stored order" do
      SolidLitequeen::DynamicDatabase.connection.add_column :items, :obsolete, :string

      database_id = Base64.urlsafe_encode64(@tmp_db.path)
      post "/solid_litequeen/databases/#{database_id}/tables/items/set-column-order", params: { columnOrder: ["id", "obsolete", "name"] }

      SolidLitequeen::DynamicDatabase.connection.remove_column :items, :obsolete

      get "/solid_litequeen/databases/#{database_id}/tables/items"
      assert_response :success

      doc = Nokogiri::HTML(@response.body)
      headers = doc.css('th').map { |th| th['data-column-name'] }
      refute_includes headers, 'obsolete'
    end
  end
end
