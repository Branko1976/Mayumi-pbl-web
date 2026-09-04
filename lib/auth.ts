// Shared password check for all API routes.
// Set CLASSROOM_PASSWORD in Vercel environment variables.
// If not set, the app runs open (useful for testing).

export function checkAuth(request: Request): Response | null {
  const password = process.env.CLASSROOM_PASSWORD;
  if (!password) return null; // no password configured → open access

  const header = request.headers.get("x-classroom-password");
  if (header === password) return null; // correct

  return new Response(JSON.stringify({ error: "Incorrect classroom password." }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
