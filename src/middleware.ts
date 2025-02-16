import { ClerkMiddlewareAuth, clerkMiddleware } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

//  connecting to Redis database using login details from environment variables

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});


// database will keep trak of the number of times each user has used the app
// allows each user 50 requests per day
// uses a temporary memory cache for faster checks
// turns on analytics so we can see usage patterns
// all records in the db will start with ratelimit:carnegie
const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.fixedWindow(50, '1d'), // 50 requests per day
    ephemeralCache: new Map(),
    analytics: true,
    prefix: "ratelimit:carnegie",
});

//  a simple to check if someone us using our chat API
const isAPI = (path: string) => {
    return path == '/api/chat';
}

// Rate Limit APIs
// wrapping in Clerk middleware to check the user
export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, request: NextRequest) => {
    // we check if someone is accessing our chat API
    if (isAPI(request.nextUrl.pathname)) {
        // get the user id from clerk
        const { userId } = await auth();
        // check if the user has used up their daily limit
        const { success, limit, reset, remaining } = await ratelimit.limit(`${userId}`);

        // success is a boolean thats tells us that user has not reached daily limit and can continue
        // if success is false, they have reached their daily limit and we return an error
        const res = success ?
            NextResponse.next()
            : NextResponse.json(
                { message: 'Daily Token Limit Reached' },
                { status: 429 } // Added this status 429, because it will throw an error and I can catch it in the onError method of useChat
            );

        // adding extra infor to response headers
        // let client know how many request requests are allowed
        // how amny requests are left
        // when the limit will reset
        // send back the response
        res.headers.set("X-RateLimit-Limit", limit.toString());
        res.headers.set("X-RateLimit-Remaining", remaining.toString());
        res.headers.set("X-RateLimit-Reset", reset.toString());
        return res;
    }

    // if theyre not using the chat API, let them through
    return NextResponse.next();
});


// specifying to next.js which paths should through middleware
// all normal pages
// the homepage
// all api routes
export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};