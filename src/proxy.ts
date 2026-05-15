import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      // Allow access to the login page without a token
      if (req.nextUrl.pathname === "/admin/login") {
        return true;
      }
      // Require ADMIN role for all other /admin routes
      return token?.role === "ADMIN";
    },
  },
});

export const config = { matcher: ["/admin/:path*"] };
