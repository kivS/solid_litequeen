require "importmap-rails"
require "turbo-rails"
require "stimulus-rails"


module SolidLitequeen
  class Engine < ::Rails::Engine
    isolate_namespace SolidLitequeen

    initializer "solid_litequeen.assets" do |app|
      app.config.assets.paths << root.join("app/assets/stylesheets")
      app.config.assets.paths << root.join("app/javascript")
      app.config.assets.paths << root.join("vendor/javascript")
      app.config.assets.precompile += %w[ solid_litequeen_manifest ]
    end

    initializer "solid_litequeen.importmap", after: "importmap" do |app|
      SolidLitequeen.importmap.draw(root.join("config/importmap.rb"))
      if app.config.importmap.sweep_cache && app.config.reloading_enabled?
        SolidLitequeen.importmap.cache_sweeper(watches: [ root.join("app/javascript"), root.join("vendor/javascript") ])

        ActiveSupport.on_load(:action_controller_base) do
          before_action { SolidLitequeen.importmap.cache_sweeper.execute_if_updated }
        end
      end
    end
  end
end
