require_relative "lib/solid_litequeen/version"

Gem::Specification.new do |spec|
  spec.name        = "solid_litequeen"
  spec.version     = SolidLitequeen::VERSION
  spec.authors     = [ "Vik Borges" ]
  spec.email       = [ "kiv.d.dev@gmail.com" ]
  spec.homepage    = "https://solid.litequeen.com"
  spec.summary     = "Manage SQLite databases on your server with ease"
  spec.description = "Lite Queen is an open-source SQLite database management software for Ruby on Rails projects"
  spec.license     = "MIT"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the "allowed_push_host"
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  # spec.metadata["allowed_push_host"] = "http://mygemserver.com"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/kivS/solid_litequeen"
  spec.metadata["changelog_uri"] = "https://solid.litequeen.com"

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]
  end

  spec.add_dependency "rails", ">= 8.0.1"
  spec.add_dependency "importmap-rails"
  spec.add_dependency "turbo-rails"
  spec.add_dependency "stimulus-rails"
  spec.add_dependency "sqlite3"


  spec.add_development_dependency "tailwindcss-rails", "~> 4.0"
  spec.add_development_dependency "debug"
  spec.add_development_dependency "web-console"
  spec.add_development_dependency "propshaft"
  spec.add_development_dependency "sqlite3"
  spec.add_development_dependency "puma"
  # spec.add_development_dependency "hotwire-spark"
end
