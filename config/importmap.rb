# NOTE: this pin works because `my_engine/app/assets/javascripts
#       is in the `Rails.application.config.assets.paths`
pin "solid_litequeen/application", to: "solid_litequeen/application.js"
pin "application", to: "application.js", preload: true
