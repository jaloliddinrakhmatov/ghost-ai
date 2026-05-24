import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

function toPathPattern(urlOrPath: string | undefined, fallback: string) {
  if (!urlOrPath) return `${fallback}(.*)`;
  try {
    return `${new URL(urlOrPath).pathname}(.*)`;
  } catch {
    return `${urlOrPath}(.*)`;
  }
}

const isPublicRoute = createRouteMatcher([
  toPathPattern(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL, "/sign-in"),
  toPathPattern(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL, "/sign-up"),
]);

export const proxy = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff2?)$).*)",
    "/clerk/(.*)",
  ],
};
