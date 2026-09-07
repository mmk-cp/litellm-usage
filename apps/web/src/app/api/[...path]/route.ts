import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const backendUrl = process.env.BACKEND_URL;
  const secret = process.env.INTERNAL_API_SECRET;
  if (!backendUrl || !secret) {
    return NextResponse.json(
      { success: false, message: "Server is not configured.", errorCode: "SERVER_CONFIG_ERROR" },
      { status: 500 },
    );
  }
  const { path } = await context.params;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    const contentType = request.headers.get("content-type") ?? "";
    if (contentLength > 16_384) {
      return NextResponse.json(
        { success: false, message: "Request body is too large.", errorCode: "PAYLOAD_TOO_LARGE" },
        { status: 413 },
      );
    }
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return NextResponse.json(
        {
          success: false,
          message: "Content-Type must be application/json.",
          errorCode: "UNSUPPORTED_MEDIA_TYPE",
        },
        { status: 415 },
      );
    }
  }
  const target = new URL(`/api/${path.join("/")}${request.nextUrl.search}`, backendUrl);
  const headers = new Headers({
    accept: "application/json",
    "content-type": request.headers.get("content-type") ?? "application/json",
    cookie: request.headers.get("cookie") ?? "",
    "x-internal-api-secret": secret,
    "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "",
  });
  try {
    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer();
    if (body && body.byteLength > 16_384) {
      return NextResponse.json(
        { success: false, message: "Request body is too large.", errorCode: "PAYLOAD_TOO_LARGE" },
        { status: 413 },
      );
    }
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const responseHeaders = new Headers({
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    });
    upstream.headers
      .getSetCookie()
      .forEach((cookie) => responseHeaders.append("set-cookie", cookie));
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return NextResponse.json(
      { success: false, message: "API service is unavailable.", errorCode: "API_UNAVAILABLE" },
      { status: 503 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const DELETE = proxy;
