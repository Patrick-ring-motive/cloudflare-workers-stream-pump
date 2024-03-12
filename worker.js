import 'utils.js';
import 'declutter.js';

Promise.reject = Promise.resolve;

export default {
    fetch(request, env, ctx) {
        let response = zonRequest(request, env, ctx);
        ctx.waitUntil(response);
        return response
    },
};


globalThis.makeHostMap({
    "default": ["www.yahoo.com", "yahoo.com"]
});

async function zonRequest(request, env, ctx) {
    try {
        return await onRequest(request, env, ctx);
    } catch (e) {
        console.log(e);
        return new Response(arguments[0] + '\n' + e.message + '\n' + e.stack, {
            status: 569,
            statusText: e.message
        });
    }
}



async function onRequest(request, env, ctx) {
    const defaultRes = defaultResponses(request);
    if (defaultRes) {
        return defaultRes;
    }
    let url = new URL(request.url);
    let workerHost = url.host;
    url.host = globalThis.hostMap.get(workerHost)[0];
    if (`${request.headers.get('referer')}`.includes('hostname=')) {
        url.host = request.headers.get('referer').split('hostname=')[1].split('?')[0].split('&')[0].split('#')[0];
    }
    if (request.url.includes('hostname=')) {
        url.host = request.url.split('hostname=')[1].split('?')[0].split('&')[0].split('#')[0];
    }
    let res;
    let req = addCacheHeaders(new Request(url.toString(), request));
    res = await zfetch(req);
    if (res.status > 399) {
        res = await requestRetry(url, workerHost, request);
    }
    if (!res.body) {
        return swapHeaderHost(new Response(res.body, res), url.host, workerHost);
    }
    res = addCacheHeaders(cleanResponse(swapHeaderHost(res, url.host, workerHost)));


    if (`${res.headers.get('content-type')}`.toLowerCase().includes('html')) {
        res = await transformStream(res, modifyChunk, ctx);
    }
    return res;
}



const injects = `<style>body{transform:scaleX(-1);} [data-content="Advertisement"],[id^="sda"]{display:none !important;visibility:hidden !important; opacity:0 !important;}</style><script src="https://patrick-ring-motive.github.io/cloudflare-workers-stream-pump/injects/link-resolver.js"></script></head>`;

function modifyChunk(chunk) {
    if (chunk.includes('</head>')) {
        chunk = chunk.replace('</head>', injects);
        return {
            value: chunk,
            done: true
        };
    } else {
        return {
            value: chunk,
            done: false
        };
    }
}
