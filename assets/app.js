(function(){
  /* nav highlight */
  var links=[].slice.call(document.querySelectorAll('nav a')),secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))});
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.classList.toggle('on',l.getAttribute('href')==='#'+e.target.id)})}})},{rootMargin:'-35% 0px -60% 0px'});secs.forEach(function(s){if(s)io.observe(s)})}
  /* reading progress + back to top */
  var bar=document.getElementById('progress'),top=document.getElementById('top');
  function onScroll(){var h=document.documentElement,max=h.scrollHeight-h.clientHeight;bar.style.width=(max>0?h.scrollTop/max*100:0)+'%';top.classList.toggle('show',h.scrollTop>900)}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  top.addEventListener('click',function(){window.scrollTo({top:0})});
  /* image lightbox */
  var lb=document.getElementById('lb');
  if(lb&&lb.showModal){var lbi=lb.querySelector('img');
    [].slice.call(document.querySelectorAll('a.zoom')).forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();lbi.src=a.getAttribute('href');lbi.alt=a.querySelector('img').alt;lb.showModal()})});
    lb.addEventListener('click',function(e){if(e.target===lb||e.target.id==='lbx')lb.close()});}
  /* copy chips */
  function copyTxt(t,okf,failf){
    function fb(){var a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();var r=false;try{r=document.execCommand('copy')}catch(e){}document.body.removeChild(a);(r?okf:failf)()}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(okf,fb)}else fb();
  }
  [].slice.call(document.querySelectorAll('[data-copy]')).forEach(function(c){
    var lab=c.querySelector('.cl'),orig=lab?lab.textContent:'';
    c.addEventListener('click',function(){copyTxt(c.getAttribute('data-copy'),function(){c.classList.add('done');if(lab)lab.textContent='הועתק';setTimeout(function(){c.classList.remove('done');if(lab)lab.textContent=orig},2000)},function(){if(lab)lab.textContent='סמנו והעתיקו ידנית'})});
  });
  /* copy case */
  var btn=document.getElementById('copy'),ok=document.getElementById('copyok');
  btn.addEventListener('click',function(){
    var t=document.getElementById('casetxt').textContent.trim();
    function done(m){ok.textContent=m;setTimeout(function(){ok.textContent=''},3000)}
    function fb(){var a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');done('הועתק. הדביקו בשיחה ב-OpenEvidence.')}catch(e){done('ההעתקה נכשלה. סמנו והעתיקו ידנית.')}document.body.removeChild(a)}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){done('הועתק. הדביקו בשיחה ב-OpenEvidence.')},fb)}else fb();
  });
  /* hero shader: soft flowing gradient. Decorative, paused off-screen, static with reduced motion */
  var cv=document.getElementById('fx');if(!cv)return;
  var gl=cv.getContext('webgl',{antialias:false,alpha:false,powerPreference:'low-power'});if(!gl){cv.style.display='none';return}
  var vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs='precision mediump float;uniform vec2 r;uniform float t;'+
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
  'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}'+
  'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}'+
  'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv;q.x*=r.x/r.y;'+
  'float a=fbm(q*1.5+vec2(t*.03,t*.01));float b=fbm(q*2.1+a*1.6+vec2(-t*.025,t*.035));'+
  'vec3 base=vec3(.027,.043,.078),teal=vec3(.04,.2,.3),gold=vec3(.85,.62,.16);'+
  'vec3 c=mix(base,teal,smoothstep(.25,.75,b));'+
  'c+=gold*pow(smoothstep(.5,.95,a*b*1.8),2.)*.3;'+
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
})();
