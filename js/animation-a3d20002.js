import{g as i}from"./gsap-e9ea83b5.js";function h(){const o=i.timeline();return o.from(".page-title",{opacity:0,y:-30,duration:.8,ease:"power2.out"}).from(".chart-panel",{opacity:0,y:20,duration:.6,stagger:.1,ease:"power2.out",onComplete:function(){document.querySelectorAll(".chart-panel").forEach(n=>{n.style.opacity="1",n.style.visibility="visible"})}},"-=0.4"),o}function v(o,n,l=2){const e={value:0};i.to(e,{value:n,duration:l,ease:"power2.out",onUpdate:()=>{o.textContent=Math.floor(e.value).toLocaleString()}})}function y(o,n={}){const e={...{count:20,interval:2e3,colors:["#C8A96E","#4ECDC4","#E07B54","#8B7355"],minSize:10,maxSize:20},...n},r=typeof o=="string"?document.querySelector(o):o;if(!r)return;function c(){const t=document.createElement("div");t.className="falling-leaf";const a=Math.random()*(e.maxSize-e.minSize)+e.minSize,u=e.colors[Math.floor(Math.random()*e.colors.length)],m=Math.random()*100,d=Math.random()*5+5,p=Math.random()*2;t.style.cssText=`
      position: absolute;
      width: ${a}px;
      height: ${a}px;
      background: ${u};
      opacity: 0.6;
      border-radius: 0 ${a}px;
      left: ${m}vw;
      top: -${a}px;
      pointer-events: none;
      z-index: 0;
    `,r.appendChild(t),i.to(t,{y:"100vh",x:`+=${Math.random()*100-50}`,rotation:Math.random()*360,duration:d,delay:p,ease:"none",onComplete:()=>{t.remove()}})}for(let t=0;t<e.count;t++)setTimeout(c,t*200);const s=setInterval(c,e.interval);return()=>{clearInterval(s),r.querySelectorAll(".falling-leaf").forEach(t=>t.remove())}}export{v as c,y as f,h as p};
//# sourceMappingURL=animation-a3d20002.js.map
