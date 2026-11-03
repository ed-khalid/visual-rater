import './SaveErrorBanner.css'

interface Props {
    error: string | null
    onDismiss: () => void
}

export const SaveErrorBanner = ({ error, onDismiss }: Props) => {
    if (!error) return null
    return <div className="save-error-banner" role="alert">
        <span>{error}</span>
        <button onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
}
