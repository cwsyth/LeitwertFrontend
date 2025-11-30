export default function Footer() {
    const version = process.env.NEXT_PUBLIC_APP_VERSION || 'unknown';

    return (
    <footer className="main-footer flex items-center justify-center">
        <div className="max-w-[var(--content-max-width)] w-full flex items-center justify-between text-white">
            <span className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-xl">© 2025 Lagebild</span>
            <span className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-xl">Dashboard {version}</span>
        </div>
    </footer>
    );
}
