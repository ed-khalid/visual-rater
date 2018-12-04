defmodule VisualRaterWeb.Router do
  use VisualRaterWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", VisualRaterWeb do
    resources "/artists", ArtistController, except: [:new, :edit]
    pipe_through :api
  end
end
