export const authConfig = {
    pages: {
      signIn: '/login', // Redirect users here if they aren't logged in
    },
    callbacks: {
      authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user;
        
        // List of pages that require login
        const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
        const isOnPacing = nextUrl.pathname.startsWith('/pacing');
        const isOnInsights = nextUrl.pathname.startsWith('/insights');
        const isOnSimulate = nextUrl.pathname.startsWith('/simulate');
        
        // List of pages users shouldn't see if they are already logged in
        const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup');
  
        // 1. Protect Private Routes
        if (isOnDashboard || isOnPacing || isOnInsights || isOnSimulate) {
          if (isLoggedIn) return true;
          return false; // Redirect to /login
        }
  
        // 2. Redirect Logged-In Users away from Login/Signup
        if (isOnAuth && isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
  
        return true;
      },
    },
    providers: [], // Keep empty here (Edge safe)
  }