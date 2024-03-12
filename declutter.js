globalThis.defaultResponses = function(request) {

  if (request.url.includes('google9b9ccfe85609fdf9.html')) {
      return fetch('https://files.servleteer.com/google9b9ccfe85609fdf9.html');
  }

  if (request.url.split('?')[0].split('#')[0].endsWith('robots.txt')) {
      return new Response(
          `User-agent: *
  Allow: /`);
  }
  if (`${request.headers.get('user-agent')}`.includes('bot')) {
      return new Response('Go away bot', {
          status: 403,
          statusText: 'Go away bot'
      });
  }
  if(request.url.includes('sw.js')){
    return zfetch(`https://patrick-ring-motive.github.io/FinancialJournal/injects/sw.js?${new Date().getTime()}`);
  }
  return false;

}
