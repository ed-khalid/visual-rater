defmodule VisualRater.Repo.Migrations.CreateSong do
  use Ecto.Migration

  def change do
    create table(:songs) do
      add :name, :string
      add :rating, :float
      add :album_id, references(:albums)

      timestamps()
    end

  end
end
