export default function WhiteshadowBackground() {
    return (
        <>
            <div className="absolute inset-0 bg-white" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,_rgba(53,68,93,0.12),_transparent_60%),radial-gradient(circle_at_85%_75%,_rgba(53,68,93,0.08),_transparent_60%)] blur-3xl" />
        </>
    )
}