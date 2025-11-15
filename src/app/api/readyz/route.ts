// app/api/readyz/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function ping(url: string, ms = 500) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
        const res = await fetch(url, { method: 'GET', cache: 'no-store', signal: controller.signal });
        return res.ok;
    } catch {
        return false;
    } finally {
        clearTimeout(id);
    }
}

export async function GET() {
    const base = process.env.NEXT_PUBLIC_FRONTEND_API_URL;
    if (!base) {
        return new Response('ready', { status: 200, headers: { 'Cache-Control': 'no-store' } });
    }

    const okHealth = await ping(`${base}/healthz`);
    const okReady  = await ping(`${base}/readyz`);

    if (!okHealth || !okReady) {
        return new Response('backend not ready', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
        });
    }

    return new Response('ready', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
}
