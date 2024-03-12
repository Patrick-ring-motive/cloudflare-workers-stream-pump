globalThis.console.error=console.log;
globalThis.console.warn=console.log;
globalThis.Promise.reject=Promise.resolve;
if(!Node.prototype.nativeRemoveChild){
  Node.prototype.nativeRemoveChild=Node.prototype.removeChild;
  Node.prototype.removeChild=function(n){
    try{
      return this.nativeRemoveChild(n);
    }catch(e){
      return this;
    }
  };
}
if(!Promise.prototype.nativeThen){
  Promise.prototype.nativeThen = Promise.prototype.then;
  Promise.prototype.then = function(onFulfilled, onRejected) {
    if(!onRejected){
      onRejected = onFulfilled;
    }
    return this.nativeThen(onFulfilled, onRejected); 
  }
}

if(!Object.nativeEntries){
  Object.nativeEntries=Object.entries;
  Object.entries=function(){
  try{return Object.nativeEntries(...arguments);}catch(e){return [];}
      
  }
}

if(!Object.nativeKeys){
  Object.nativeKeys=Object.keys;
  Object.keys=function(){
  try{return Object.nativeKeys(...arguments);}catch(e){return [];}
      
  }
}
