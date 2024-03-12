void async function RemoveAds(){
  if(!globalThis.declare){
    await import('https://unpkg.com/javaxscript/framework.js');
  }
  declare(()=>{
    queryApplyAll('iframe,[data-content="Advertisement"],[id^="sda"],script[src^="https://s.yimg.com"],[src*="doubleclick.net"]',el=>{
      el.remove();
    });
  });
}();
