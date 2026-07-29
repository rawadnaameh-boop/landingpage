import { NextRequest, NextResponse } from "next/server";

/**
 * When API_BASE_URL is set (e.g. docker-compose or ECS service discovery),
 * proxy browser requests for /api/* through Next.js to the backend.
 * When unset, the load balancer should route /api/* directly to the backend.
 */
export async function middleware(request: NextRequest) {
  const backendBase = process.env.API_BASE_URL?.replace(/\/$/, "");
  if (!backendBase) {
    return NextResponse.next();
  }

  const target = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    backendBase,
  );

  const headers = new Headers(request.headers);
  headers.delete("host");

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  const response = await fetch(target, init);

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export const config = {
  matcher: "/api/:path*",
};
