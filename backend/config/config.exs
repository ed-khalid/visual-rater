# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :visual_rater,
  ecto_repos: [VisualRater.Repo]

# Configures the endpoint
config :visual_rater, VisualRater.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "FuXUg9e3VDyFXJkSS6KefcmlXX69Kxf/6Qdpy8ST/zNw2+faqW1fl68FhT7D08OM",
  render_errors: [view: VisualRater.ErrorView, accepts: ~w(json)],
  pubsub: [name: VisualRater.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"

config :phoenix, :json_library, Jason
