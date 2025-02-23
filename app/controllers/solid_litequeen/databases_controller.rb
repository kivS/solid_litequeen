module SolidLitequeen
  class DatabasesController < ApplicationController
    def index
      @databases = ActiveRecord::Base.configurations.configurations.select do |config|
        config.adapter == "sqlite3" && config.env_name == Rails.env && config.database.present?
      end
    end

    def show
      env_name, name = params.expect(:id).split("-", 2)
    end
  end
end
