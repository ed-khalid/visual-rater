defmodule VisualRater.Repo.Migrations.CreateAlbum do
  use Ecto.Migration

  def change do
    create table(:albums) do
      add :name, :string
      add :year, :integer

      add :artist_id, references(:artists)

      timestamps()
    end

  end
end
