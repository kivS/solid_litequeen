require_relative "lib/solid_litequeen/version"

Gem::Specification.new do |spec|
  spec.name        = "solid_litequeen"
  spec.version     = SolidLitequeen::VERSION
  spec.authors     = [ "Vik Borges" ]
  spec.email       = [ "kiv.d.dev@gmail.com" ]
  spec.homepage    = "TODO"
  spec.summary     = "TODO: Summary of SolidLitequeen."
  spec.description = "TODO: Description of SolidLitequeen."
  spec.license     = "MIT"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the "allowed_push_host"
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  spec.metadata["allowed_push_host"] = "http://mygemserver.com"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/kivS/solid_litequeen"
  spec.metadata["changelog_uri"] = "TODO: Put your gem's CHANGELOG.md URL here."

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]
  end

  spec.add_dependency "rails", ">= 8.0.1"

  spec.add_development_dependency "web-console"
end
