const portraitSource = "https://media.canva.com/v2/document-image/hash:-276904490/height:1728/id:DAHPQgxsf-U/type:B/width:1152?brand=BAFxyAopMFI&csig=AAAAAAAAAAAAAAAAAAAAAFeo-qqxhT0MvzpYLDoU8zo_KjCnjGo63BtSkuxRmjZE&disableexport=T&exp=1783946566&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export.canva.com%2Fxsf-U%2FDAHPQgxsf-U%2F1%2Fthumbnail%2F0001.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUHXSTDDERN%252F20260712%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20260712T121507Z%26X-Amz-Expires%3D88059%26X-Amz-Signature%3Dd663dbe74135cf722817e5b127ec2aa868bad60c34bb7e24acb1b1d462eb917d%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DMon%252C%252013%2520Jul%25202026%252012%253A42%253A46%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAAHRNLqFz2bBVAEA5hHO1J2aWgcXqRVrgx3Wxy20xJ9Yf&page=1&signed=brand%2Cdisableexport%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const source = await fetch(portraitSource, {
    redirect: "follow",
    cache: "no-store"
  });
  const bytes = new Uint8Array(await source.arrayBuffer());

  return Response.json({
    status: source.status,
    url: source.url,
    contentType: source.headers.get("content-type"),
    contentLength: source.headers.get("content-length"),
    bytes: bytes.length,
    magic: Array.from(bytes.slice(0, 12))
  });
}

// Deployment probe: 2026-07-13T11:56Z
