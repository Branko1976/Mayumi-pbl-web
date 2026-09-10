export function checkAuth(request: Request): Response | null {
  const password = process.env.CLASSROOM_PASSWORD;
  if (!password) return null;
  const header = request.headers.get("x-classroom-password");
  if (header === password) return null;
  return new Response(JSON.stringify({ error: "Incorrect classroom password." }), {
    status: 401, headers: { "Content-Type": "application/json" },
  });
}

export function checkTutorAuth(request: Request): Response | null {
  const password = process.env.TUTOR_PASSWORD;
  if (!password) {
    return new Response(
      JSON.stringify({ error: "TUTOR_PASSWORD is not configured. Set it in your Vercel environment variables." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  const header = request.headers.get("x-tutor-password");
  if (header === password) return null;
  return new Response(JSON.stringify({ error: "Incorrect tutor password." }), {
    status: 401, headers: { "Content-Type": "application/json" },
  });
}
