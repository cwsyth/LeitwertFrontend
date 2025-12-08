import { NextRequest } from 'next/server';

const API_BASE_URL = process.env.INTERNAL_FRONTEND_API_URL;

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const params = await context.params;
    return proxyRequest(request, params.path, 'GET');
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const params = await context.params;
    return proxyRequest(request, params.path, 'POST');
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const params = await context.params;
    return proxyRequest(request, params.path, 'PUT');
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const params = await context.params;
    return proxyRequest(request, params.path, 'DELETE');
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const params = await context.params;
    return proxyRequest(request, params.path, 'PATCH');
}

async function proxyRequest(
    request: NextRequest,
    path: string[],
    method: string
) {
    const targetPath = path.join('/');
    const url = `${API_BASE_URL}/${targetPath}`;

    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    console.log(`Proxying ${method} request to: ${fullUrl}`);

    let body = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
        try {
            body = await request.text();
        } catch {
            // Kein Body
        }
    }

    const headers: Record<string, string> = {};
    const contentType = request.headers.get('Content-Type');
    if (contentType) {
        headers['Content-Type'] = contentType;
    }

    const auth = request.headers.get('Authorization');
    if (auth) {
        headers['Authorization'] = auth;
    }

    try {
        const response = await fetch(fullUrl, {
            method,
            headers,
            body,
            cache: 'no-store',
        });

        const responseData = await response.text();

        return new Response(responseData, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
            },
        });
    } catch (error) {
        console.error('Proxy request failed:', error);
        return new Response(
            JSON.stringify({
                error: 'Internal API request failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                url: fullUrl
            }),
            {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}