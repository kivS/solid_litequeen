module SolidLitequeen
  class HomepageController < ApplicationController
    def index
      @databases = ActiveRecord::Base.configurations.configurations.select do |config|
        config.adapter == "sqlite3"
      end
    end
  end
end
