import { ClerkMiddlewareAuth, clerkMiddleware } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.fixedWindow(15, '1d'), // 15 requests per day
    ephemeralCache: new Map(),
    analytics: true,
    prefix: "ratelimit:carnegie",
});

const isAPI = (path: string) => {
    return path.startsWith('/api/chat');
}

// Rate Limit APIs
export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, request: NextRequest) => {
    if (isAPI(request.nextUrl.pathname)) {
        const { userId } = await auth();
        const { success, limit, reset, remaining } = await ratelimit.limit(`${userId}`);

        const res = success ?
            NextResponse.next()
            : NextResponse.json(
                { message: 'Daily Token Limit Reached' },
                { status: 429 } // Added this status 429, because it will throw an error and I can catch it in the onError method of useChat
            );

        res.headers.set("X-RateLimit-Limit", limit.toString());
        res.headers.set("X-RateLimit-Remaining", remaining.toString());
        res.headers.set("X-RateLimit-Reset", reset.toString());
        return res;
    }
    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};