export async function GET({request}: any) {
  const url = new URL(request.url);
  const num = Number(url.searchParams.get('num') ?? 1);
  return new Response(JSON.stringify({data: 'hello world ' + num}));
}