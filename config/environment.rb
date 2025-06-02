require "rails"
require "action_controller/railtie"
require "solid_litequeen"
require "ostruct"

SolidLitequeen.importmap.draw(SolidLitequeen::Engine.root.join("config/importmap.rb"))

module Rails
  class << self
    def root
      SolidLitequeen::Engine.root
    end

    def env
      ActiveSupport::StringInquirer.new(ENV["RAILS_ENV"] || "development")
    end

    def application
      @application ||= OpenStruct.new(importmap: SolidLitequeen.importmap)
    end
  end
end
