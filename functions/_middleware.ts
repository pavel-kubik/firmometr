export const onRequest = async ({ request, next }: { request: Request; next: () => Promise<Response> }) => {
  const response = await next();
  if (new URL(request.url).hostname !== 'firmometr.cz') {
    const blocked = new Response(response.body, response);
    blocked.headers.set('X-Robots-Tag', 'noindex');
    return blocked;
  }
  return response;
};
