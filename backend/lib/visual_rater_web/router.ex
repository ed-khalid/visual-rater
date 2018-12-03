defmodule VisualRaterWeb.Router do
  use VisualRaterWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", VisualRaterWeb do
    pipe_through :api
  end
end
