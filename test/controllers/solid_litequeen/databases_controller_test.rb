require "test_helper"
require "base64"
require "nokogiri"

module SolidLitequeen
  class DatabasesControllerTest < ActionDispatch::IntegrationTest
    include Engine.routes.url_helpers

    test "enum mappings include article status" do
      Article.first
      mappings = ::SolidLitequeen::DatabasesController.new.send(:enum_mappings)
      assert_equal({"status" => {"draft" => 0, "published" => 1}}, mappings["articles"])
    end
  end
end
