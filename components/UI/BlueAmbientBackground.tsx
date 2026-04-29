export default function AmbientBackground() {
    return (
        <>
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_25%,_rgba(40,60,93,0.10),_transparent_60%),radial-gradient(circle_at_85%_75%,_rgba(40,60,93,0.06),_transparent_60%)] blur-3xl" />
        </>
    )
}