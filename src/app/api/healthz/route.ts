// app/api/healthz/route.ts
export const dynamic = 'force-dynamic'; // keine Route-Caches
export const revalidate = 0;

export async function GET() {
    return new Response('ok', {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
        },
    });
}
