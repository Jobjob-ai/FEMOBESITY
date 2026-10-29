(function(){
'use strict';
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function safe(fn){try{fn()}catch(e){if(window.console)console.error(e)}}

/* toast */
var toastEl,toastT;
function toast(msg,bad){
  if(!toastEl){toastEl=document.createElement('div');toastEl.id='toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');document.body.appendChild(toastEl)}
  toastEl.textContent=msg;toastEl.className='show'+(bad?' bad':'');
  clearTimeout(toastT);toastT=setTimeout(function(){toastEl.className=''},3200);
}
/* copy with fallback */
function copyText(t){
  return new Promise(function(res,rej){
    function fb(){var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;top:0;opacity:0';document.body.appendChild(a);a.focus();a.select();a.setSelectionRange(0,t.length);var r=false;try{r=document.execCommand('copy')}catch(e){}document.body.removeChild(a);r?res():rej()}
    if(navigator.clipboard&&navigator.clipboard.writeText&&window.isSecureContext){navigator.clipboard.writeText(t).then(res,fb)}else fb();
  });
}

/* progress, back-to-top, sticky bar */
safe(function(){
  var bar=$('#progress'),top=$('#top'),sb=$('#bar'),hero=$('.hero');
  function onScroll(){
    var h=document.documentElement,max=h.scrollHeight-h.clientHeight,y=h.scrollTop||window.pageYOffset;
    if(bar)bar.style.width=(max>0?y/max*100:0)+'%';
    if(top)top.classList.toggle('show',y>900);
    if(sb&&hero)sb.classList.toggle('show',y>hero.offsetHeight-60);
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  if(top)top.addEventListener('click',function(){window.scrollTo({top:0})});
});

/* lightbox */
safe(function(){
  var lb=$('#lb');if(!lb)return;
  var zs=$$('a.zoom');
  if(!lb.showModal){return}
  var img=$('img',lb),opener=null,pushed=false;
  function open(a){
    img.src=a.getAttribute('href');img.alt=$('img',a).alt;opener=a;
    lb.showModal();
    try{history.pushState({lb:1},'');pushed=true}catch(e){pushed=false}
    var x=$('#lbx');if(x)x.focus();
  }
  zs.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();open(a)})});
  lb.addEventListener('click',function(){lb.close()});
  lb.addEventListener('close',function(){
    if(pushed){pushed=false;try{if(history.state&&history.state.lb)history.back()}catch(e){}}
    if(opener){try{opener.focus()}catch(e){}opener=null}
  });
  window.addEventListener('popstate',function(){if(lb.open){pushed=false;lb.close()}});
});

/* OS picker */
safe(function(){
  var tabs=$$('.ospick [role=tab]');if(!tabs.length)return;
  function pick(t,focus){
    tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1;var p=document.getElementById(x.getAttribute('aria-controls'));if(p)p.hidden=!on});
    if(focus)t.focus();
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){pick(t)});
    t.addEventListener('keydown',function(e){
      var k=e.key,n=null;
      if(k==='ArrowLeft'||k==='ArrowRight')n=tabs[(i+1)%tabs.length];
      else if(k==='Home')n=tabs[0];else if(k==='End')n=tabs[tabs.length-1];
      if(n){e.preventDefault();pick(n,true)}
    });
  });
  tabs.forEach(function(x){x.tabIndex=0});
  /* preselect on desktop only */
  var ua=navigator.userAgent||'',mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(ua)||(navigator.maxTouchPoints>1&&/Mac/.test(ua));
  if(!mobile){var os=/Win/i.test((navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||ua)?'win':(/Mac/i.test(navigator.platform||ua)?'mac':'');
    var t=os&&$('.ospick [data-os='+os+']');if(t)pick(t)}
});

/* copy chips + case */
safe(function(){
  $$('[data-copy]').forEach(function(c){
    var lab=$('.cl',c),orig=lab?lab.textContent:'',val=c.getAttribute('data-copy');
    c.addEventListener('click',function(){
      copyText(val).then(function(){
        c.classList.add('done');if(lab)lab.textContent='הועתק ✓';toast(val.length>40?'הועתק':'הועתק: '+val);
        setTimeout(function(){c.classList.remove('done');if(lab)lab.textContent=orig},2200);
      },function(){toast('ההעתקה נכשלה. סמנו את הטקסט והעתיקו ידנית.',true)});
    });
  });
  var btn=$('#copy'),ok=$('#copyok'),src=$('#casetxt');
  if(btn&&src)btn.addEventListener('click',function(){
    var t=src.textContent.trim();
    copyText(t).then(function(){
      var m='סיפור המקרה הועתק. עכשיו עוברים ל-OpenEvidence ומדביקים.';
      toast(m);if(ok){ok.textContent='✓ הועתק';setTimeout(function(){ok.textContent=''},3000)}
    },function(){toast('ההעתקה נכשלה. נסו שוב או פתחו את האתר בדפדפן אחר.',true)});
  });
});

/* hero shader: soft flowing gradient. Decorative, paused off-screen, static with reduced motion */
safe(function(){
  var cv=$('#fx');if(!cv)return;
  var gl=cv.getContext('webgl',{antialias:false,alpha:false,powerPreference:'low-power'});if(!gl){cv.style.display='none';return}
  var vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs='precision mediump float;uniform vec2 r;uniform float t;'+
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
  'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}'+
  'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}'+
  'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv;q.x*=r.x/r.y;'+
  'float a=fbm(q*1.5+vec2(t*.03,t*.01));float b=fbm(q*2.1+a*1.6+vec2(-t*.025,t*.035));'+
  'vec3 base=vec3(.016,.039,.094),teal=vec3(.09,.16,.22),gold=vec3(.95,.76,.31);'+
  'vec3 c=mix(base,teal,smoothstep(.25,.75,b));'+
  'c+=gold*pow(smoothstep(.5,.95,a*b*1.8),2.)*.22;'+
  'c=mix(base,c,smoothstep(0.,.5,uv.y));gl_FragColor=vec4(c,1.);}';
  function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null}
  var v=sh(gl.VERTEX_SHADER,vs),f=sh(gl.FRAGMENT_SHADER,fs);if(!v||!f){cv.style.display='none';return}
  var pg=gl.createProgram();gl.attachShader(pg,v);gl.attachShader(pg,f);gl.linkProgram(pg);
  if(!gl.getProgramParameter(pg,gl.LINK_STATUS)){cv.style.display='none';return}
  gl.useProgram(pg);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(pg,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var ur=gl.getUniformLocation(pg,'r'),ut=gl.getUniformLocation(pg,'t');
  function size(){var s=.5,w=Math.max(2,Math.round(cv.clientWidth*s)),h=Math.max(2,Math.round(cv.clientHeight*s));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(ur,cv.width,cv.height)}
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,vis=true,last=0,t0=performance.now();
  function draw(now){size();gl.uniform1f(ut,((now||t0)-t0)/1000+12);gl.drawArrays(gl.TRIANGLES,0,3)}
  function loop(now){if(vis&&!document.hidden&&now-last>33){last=now;draw(now)}requestAnimationFrame(loop)}
  draw(t0);
  window.addEventListener('resize',function(){draw(performance.now())});
  if(!reduce){if('IntersectionObserver' in window){new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(cv)}requestAnimationFrame(loop)}
});
})();
