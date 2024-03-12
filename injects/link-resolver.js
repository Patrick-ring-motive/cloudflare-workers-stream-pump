void async function LinkResolver(){
  if(!globalThis.declare){
    await import('https://unpkg.com/javaxscript/framework.js');
  }
  globalThis.hostList = ['www.yahoo.com','yahoo.com'];
      declare(() => {
          const hostList = globalThis.hostList;
          const hostList_length = hostList.length;

          const attrs = ['src', 'href'];
          const attrs_length = attrs.length;

          for (let i = 0; i < hostList_length; i++) {
              const host = hostList[i];
              for (let x = 0; x < attrs_length; x++) {
                  const attr = attrs[x];
                  queryApplyAll(`[${attr}*="https://${host}"]`, (el) => {
                      try {
                          let c = '?';
                          if (el[attr].includes('?')) {
                              c = '&';
                          }
                          el.updateAttribute(attr, el[attr].replace(new RegExp(host,"gi"), location.host) + c + 'hostname=' + host);
                      } catch (e) {
                          console.log(e.message);
                      }
                  });
              }
          }
      });
}();
