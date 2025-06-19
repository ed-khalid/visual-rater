
interface Props {
    trackId: string
}

export const SpotifyEmbeddablePlayer = ({trackId}: Props) => {

    return <div id="spotify-player">
        <iframe
          src={`https://open.spotify.com/embed/track/${trackId}`}
          width="300"
          height="80"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
    </div>

}