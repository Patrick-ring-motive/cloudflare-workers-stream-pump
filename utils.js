//utils so as to not bloat the actualy logic of the worker
globalThis.utilImports = true;

globalThis.zfetch = async function() {
    try {
        return await fetch(...arguments);
    } catch (e) {
        console.log(e);
        return new Response(arguments[0] + '\n' + e.message + '\n' + e.stack, {
            status: 569,
            statusText: e.message
        });
    }
};

globalThis.makeHostMap = function(map) {

    globalThis.hostMap = map;
    globalThis.hostMap.get = (key) => {
        if (globalThis.hostMap[key]) {
            return globalThis.hostMap[key];
        }
        return globalThis.hostMap.default;
    }
}

String.prototype.toCharCodes = function() {
    let charCodeArr = [];
    for (let i = 0; i < this.length; i++) {
        const code = this.charCodeAt(i);
        charCodeArr.push(code);
    }
    return new Uint8Array(charCodeArr);
}

globalThis.zdecoder = function() {
    if (!globalThis.decoder) {
        globalThis.decoder = new TextDecoder();
        globalThis.decoder.zdecode = function(raw) {
            try {
                return globalThis.decoder.decode(raw);
            } catch (e) {
                return e.message;
            }
        }
    }
    return globalThis.decoder;
}

globalThis.zencoder = function() {
    if (!globalThis.encoder) {
        globalThis.encoder = new TextEncoder();
        globalThis.encoder.zencode = function(str) {
            try {
                return globalThis.encoder.encode(str);
            } catch (e) {
                return e.message.toCharCodes();
            }
        }
    }
    return globalThis.encoder;
}

globalThis.zgetReader = function(stream) {
    if (!stream) {
        return;
    }
    let r = Object.create(null);
    r.reader = stream.getReader();
    r.almostDone = false;
    return r;
}

globalThis.zread = async function(reader) {
    if (reader.almostDone) {
        try {
            reader.reader.releaseLock();
        } catch (e) {}
        return {
            value: undefined,
            done: true
        };
    }
    try {
        let rtrn = await reader.reader.read();
        if (rtrn.done) {
            try {
                reader.reader.releaseLock();
            } catch (e) {}
        }
        return rtrn;
    } catch (e) {
        reader.almostDone = true;
        return {
            value: e.message,
            done: false
        };
    }
};

globalThis.swapHeaderHost = function(res, oldHost, newHost) {
    try {
        res.headers.forEach((value, key) => {
            res.headers.set(key, value.replace(oldHost, newHost));
            res.headers.delete('content-length');
            res.headers.delete('transfer-encoding');
        });
    } catch (e) {
        res = new Response(res.body, res);
        res.headers.forEach((value, key) => {
            res.headers.set(key, value.replace(oldHost, newHost));
            res.headers.delete('content-length');
            res.headers.delete('transfer-encoding');
        });
    }
    return res;
};

globalThis.requestRetry = async function(url, workerHost, request) {
    url.host = globalThis.hostMap.get(workerHost)[1];
    let req;
    if (request.method.toUpperCase() != 'GET') {
        req = new Request(url.toString(), {
            method: 'GET',
            headers: request.headers
        });
    } else {
        req = new Request(url.toString(), request);
    }
    let res = await zfetch(req);
    res = new Response(res.body, res);
    res = swapHeaderHost(res, url.host, workerHost);
    return res;
}



globalThis.cleanResponse = function(response) {
    try {
        response.headers.delete('Access-Control-Allow-Origin');
        response.headers.set('Access-Control-Allow-Origin', "*");
        response.headers.delete('Access-Control-Allow-Methods');
        response.headers.delete('Access-Control-Allow-Headers');
        response.headers.delete('Access-Control-Allow-Credentials');
        response.headers.delete('Access-Control-Max-Age');
        response.headers.delete('Referrer-Policy');
        response.headers.delete('Content-Security-Policy');
        response.headers.delete('X-Frame-Options');
        response.headers.delete('Strict-Transport-Security');
        response.headers.delete('X-Content-Type-Options');
        response.headers.delete('Cross-Origin-Embedder-Policy');
        response.headers.delete('Cross-Origin-Resource-Policy');
        response.headers.delete('Cross-Origin-Opener-Policy');
    } catch (e) {
        response = new Response(response.body, response);
        response.headers.delete('Access-Control-Allow-Origin');
        response.headers.set('Access-Control-Allow-Origin', "*");
        response.headers.delete('Access-Control-Allow-Methods');
        response.headers.delete('Access-Control-Allow-Headers');
        response.headers.delete('Access-Control-Allow-Credentials');
        response.headers.delete('Access-Control-Max-Age');
        response.headers.delete('Referrer-Policy');
        response.headers.delete('Content-Security-Policy');
        response.headers.delete('X-Frame-Options');
        response.headers.delete('Strict-Transport-Security');
        response.headers.delete('X-Content-Type-Options');
        response.headers.delete('Cross-Origin-Embedder-Policy');
        response.headers.delete('Cross-Origin-Resource-Policy');
        response.headers.delete('Cross-Origin-Opener-Policy');
    }
    return response;
};

globalThis.makeAwaitUntil = function(ctx) {
    return async function(promise) {
        ctx.waitUntil(promise);
        return promise;
    }
}

globalThis.tryReleaseLock = function(stream, reader) {
    if (stream?.locked) {
        try {
            reader.releaseLock();
        } catch (e) {
            console.log(e.message);
        }
    }
}

async function promise() {
    return true;
}

globalThis.addCacheHeaders = function(re) {
    re.headers.set('Cloudflare-CDN-Cache-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    re.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    re.headers.set('CDN-Cache-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    re.headers.set('Cache-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    re.headers.set('Surrogate-Control', 'public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000');
    return re;
}

globalThis.transformStream = async function(res, transform, ctx) {
    let reader;
    try {
        reader = zgetReader(res.body);
    } catch (e) {
        console.log(e.message);
    }
    let resolveStreamProcessed;
    const streamProcessed = new Promise(resolve => resolveStreamProcessed = resolve);
    let stream = new ReadableStream({
        async start(controller) {
            let modifiedChunk = {
                value: "",
                done: false
            };
            while (true) {
                try {
                    const chunk = await (zread(reader));
                    if (chunk.done) {
                        break;
                    }
                    let encodedChunk;
                    if (!modifiedChunk.done) {
                        let decodedChunk = zdecoder().zdecode(chunk.value);
                        modifiedChunk = transform(decodedChunk);
                        encodedChunk = zencoder().zencode(modifiedChunk.value);
                    } else {
                        encodedChunk = chunk.value;
                    }
                    controller.enqueue(encodedChunk);
                } catch (e) {
                    console.log(e.message);
                    break;
                }
            }
            controller.close();
            resolveStreamProcessed();
        }
    });

    ctx.waitUntil(streamProcessed);
    tryReleaseLock(reader.reader);
    res = new Response(stream, res);
    return res;

}



globalThis.makeAwaitUntil = function(ctx) {
    return async function(promise) {
        ctx.waitUntil(promise);
        return promise;
    }
}
