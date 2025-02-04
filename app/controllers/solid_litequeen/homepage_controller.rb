module SolidLitequeen
  class HomepageController < ApplicationController
    def index
      @databases = ActiveRecord::Base.configurations.configurations.select do |config|
        config.adapter == "sqlite3" && config.env_name == Rails.env && config.database.present?
      end
    end
  end
end
