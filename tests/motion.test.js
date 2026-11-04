const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function browser(reduced=true){
 let paints=0,now=0;const frames=[],elements=new Map(),events={};
 const gradient={addColorStop(){}};
 const context2d=new Proxy({measureText:t=>({width:String(t).length*7}),getImageData:()=>({data:new Uint8ClampedArray(1000*430*4)}),createRadialGradient:()=>gradient,fillRect(){paints++},clearRect(){paints++}}, {get:(o,k)=>k in o?o[k]:()=>{}});
 function element(){return {value:'',textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){return true}},hidden:false,handlers:{},setAttribute(){},getContext:()=>context2d,getBoundingClientRect:()=>({width:600,height:300,left:0,top:0}),addEventListener(k,v){this.handlers[k]=v},focus(){}}}
 const get=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)};
 const doc={hidden:false,body:element(),getElementById:get,querySelector:s=>get(s.slice(1)),querySelectorAll:()=>[],createElement:element,addEventListener:(k,v)=>events[k]=v};
 const motion={matches:reduced,addEventListener(){}};
 const scope={document:doc,innerWidth:600,innerHeight:700,devicePixelRatio:1,matchMedia:()=>motion,performance:{now:()=>now},requestAnimationFrame:f=>{frames.push(f);return frames.length},addEventListener:(k,v)=>events[k]=v,ResizeObserver:class{constructor(cb){this.cb=cb}observe(){this.cb()}},Path2D:class{constructor(){return new Proxy({}, {get:()=>()=>{}})}}};
 scope.window=scope;vm.runInNewContext(fs.readFileSync(require.resolve('../script.js'),'utf8'),scope);
 return {get,doc,events,paints:()=>paints,step(t){now=t;const current=frames.splice(0);for(const cb of current)cb(t)}};
}
test('reduced motion renders a static bloom without repainting every frame',()=>{const b=browser();b.step(100);const count=b.paints();b.step(200);b.step(300);assert.equal(b.paints(),count);b.get('pause').onclick();b.step(400);assert.ok(b.paints()>count);});
test('hidden tabs do not repaint the bloom',()=>{const b=browser(false);b.step(100);b.doc.hidden=true;const count=b.paints();b.step(200);assert.equal(b.paints(),count);});
