require "importmap-rails"

module SolidLitequeen
  class Engine < ::Rails::Engine
    isolate_namespace SolidLitequeen

    initializer "solid_litequeen.importmap", before: "importmap" do |app|
      # NOTE: this will add pins from this engine to the main app
      # https://github.com/rails/importmap-rails#composing-import-maps
      app.config.importmap.paths << root.join("config/importmap.rb")

      # Add the engine's JavaScript directory to the asset paths
      app.config.assets.paths << root.join("app/assets/javascripts")

      # NOTE: something about cache; I did not look into it.
      # https://github.com/rails/importmap-rails#sweeping-the-cache-in-development-and-test
      app.config.importmap.cache_sweepers << root.join("app/assets/javascripts")
    end

    # NOTE: add engine manifest to precompile assets in production
    initializer "solid_litequeen.assets" do |app|
      app.config.assets.precompile += %w[solid_litequeen_manifest]
    end
  end
end
