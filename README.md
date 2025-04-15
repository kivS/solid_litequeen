# SolidLitequeen
Lite Queen is a Rails engine that allows you to manage SQLite databases in your Rails application. It provides a user-friendly interface to view and maintain your SQLite data directly from your app.



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
mount SolidLitequeen::Engine => "/sqlite"
```

You can now navigate to `/sqlite` to access the application



## Authentication

The application inherits from your `ApplicationController` and with it the authentication system you have in your application.


## Contributing
Contribution directions go here.

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
