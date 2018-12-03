defmodule VisualRater.Repo do
  use Ecto.Repo,
    otp_app: :visual_rater,
    adapter: Ecto.Adapters.Postgres
end
