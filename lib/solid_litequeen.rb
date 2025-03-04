require "solid_litequeen/version"
require "solid_litequeen/engine"

module SolidLitequeen
  mattr_accessor :importmap, default: Importmap::Map.new
end
