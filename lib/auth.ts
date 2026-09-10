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

// Separate password for the tutor dashboard (/tutor, /api/room/*/state,
// /api/room/*/tutor-score, /api/room/*/export) so students who know the
// classroom password still can't open the dashboard and see everyone's
// transcripts and scores. Set TUTOR_PASSWORD in Vercel environment variables.
export function checkTutorAuth(request: Request): Response | null {
  const password = process.env.TUTOR_PASSWORD;
  if (!password) {
    return new Response(
      JSON.stringify({ error: "TUTOR_PASSWORD is not configured on the server. Set it in your environment variables to use the tutor dashboard." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const header = request.headers.get("x-tutor-password");
  if (header === password) return null; // correct

  return new Response(JSON.stringify({ error: "Incorrect tutor password." }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
