export default async (_req: Request) => {
  return new Response(JSON.stringify({ message: "Hello from Netlify Functions!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = {
  path: "/api/hello",
};
