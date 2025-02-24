# SolidLitequeen
Short description and motivation.

## Usage
How to use my plugin.

## Installation
Add this line to your application's Gemfile:

```ruby
gem "solid_litequeen"
```

And then execute:
```bash
$ bundle
```

Or install it yourself as:
```bash
$ gem install solid_litequeen
```

After we need to mount in `routes.rb`:
```ruby
mount SolidLitequeen::Engine => "/solid_litequeen"
```

You can now navigate to `/solid_litequeen` to access the application



## Authentication

The application inherits from your `ApplicationController` and with it the authentication system you have in your application.


## Contributing
Contribution directions go here.

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
