void async function LinkResolver(){
  if(!globalThis.declare){
    await import('https://unpkg.com/javaxscript/framework.js');
  }
  declare(()=>{
    queryApplyAll('[data-content="Advertisement"],[id^="sda"]',el=>{
      el.remove();
    });
  });
}();