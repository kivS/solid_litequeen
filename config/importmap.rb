# NOTE: this pin works because `my_engine/app/assets/javascripts
#       is in the `Rails.application.config.assets.paths`

pin "application", to: "solid_litequeen/application.js", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
pin_all_from SolidLitequeen::Engine.root.join("app/javascript/solid_litequeen/controllers"), under: "controllers", to: "solid_litequeen/controllers"
# pin_all_from SolidLitequeen::Engine.root.join("app/javascript/solid_litequeen/helpers"), under: "helpers", to: "solid_litequeen/helpers"
