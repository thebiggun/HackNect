import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dash(.*)',
  '/creator-dash(.*)',
  '/explore/:id/register(.*)',
  '/teams(.*)',
  '/registrations(.*)',
  '/hosting(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn();
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico).*)',
  ],
}; 