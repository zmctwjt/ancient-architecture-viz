(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function r(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(e){if(e.ep)return;e.ep=!0;const n=r(e);fetch(e.href,n)}})();async function m(o){try{const t=await fetch(o);if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);return await t.json()}catch(t){return console.error("加载数据失败:",o,t),null}}function u(o){return"/ancient-architecture-viz/"+"data/"+o}async function y(o){const t=u(o);return m(t)}const s={primary:"#C8A96E",secondary:"#4ECDC4",accent:"#E07B54",bgDark:"#0d1117",bgCard:"rgba(13, 17, 23, 0.8)",textPrimary:"rgba(255, 255, 255, 0.9)",textSecondary:"rgba(255, 255, 255, 0.6)",textMuted:"rgba(255, 255, 255, 0.4)",chart:["#C8A96E","#4ECDC4","#E07B54","#9B59B6","#3498DB","#2ECC71","#F39C12","#E74C3C"]};function f(o,t){if(!o||!t)return!1;const r=String(o),e={先秦:/商|周|夏|春秋|战国|先秦/,秦汉:/秦|汉/,魏晋:/魏|晋|南北朝|曹魏|北魏|东魏|西魏|北齐|北周|前秦|后秦|西秦|北汉|西夏|三国/,隋唐:/隋|唐/,宋元:/宋|元|辽|金/,明清:/明|清/}[t];return e?e.test(r):r.includes(t)}const b={color:s.chart,backgroundColor:"transparent",textStyle:{fontFamily:'"Microsoft YaHei", "PingFang SC", sans-serif',color:s.textPrimary},title:{textStyle:{color:s.primary,fontSize:16,fontWeight:"normal"},subtextStyle:{color:s.textSecondary}},legend:{textStyle:{color:s.textSecondary}},tooltip:{backgroundColor:"rgba(13, 17, 23, 0.9)",borderColor:s.primary,borderWidth:1,textStyle:{color:s.textPrimary}},xAxis:{axisLine:{lineStyle:{color:"rgba(255, 255, 255, 0.2)"}},axisLabel:{color:s.textSecondary},splitLine:{lineStyle:{color:"rgba(255, 255, 255, 0.1)"}}},yAxis:{axisLine:{lineStyle:{color:"rgba(255, 255, 255, 0.2)"}},axisLabel:{color:s.textSecondary},splitLine:{lineStyle:{color:"rgba(255, 255, 255, 0.1)"}}}};function g(o){const t=document.getElementById("info-modal-overlay");t&&t.remove();const r=document.createElement("div");r.id="info-modal-overlay",r.className="modal-overlay",r.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  `;const i=document.createElement("div");i.className="modal-content",i.style.cssText=`
    background: rgba(20, 25, 35, 0.98);
    border: 1px solid rgba(200, 169, 110, 0.4);
    border-radius: 12px;
    padding: 0.3rem;
    max-width: 6rem;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    transform: scale(0.9);
    transition: transform 0.3s ease;
    position: relative;
  `;const e=document.createElement("button");e.innerHTML="✕",e.style.cssText=`
    position: absolute;
    top: 0.1rem;
    right: 0.1rem;
    width: 0.3rem;
    height: 0.3rem;
    background: transparent;
    border: 1px solid rgba(200, 169, 110, 0.3);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.14rem;
    transition: all 0.3s ease;
  `,e.onmouseenter=()=>{e.style.background="#E07B54",e.style.borderColor="#E07B54",e.style.color="white"},e.onmouseleave=()=>{e.style.background="transparent",e.style.borderColor="rgba(200, 169, 110, 0.3)",e.style.color="rgba(255, 255, 255, 0.6)"},e.onclick=()=>c(r);const n=document.createElement("h3");n.className="info-modal-title",n.textContent=o.title,n.style.cssText=`
    font-size: 0.2rem;
    color: #C8A96E;
    margin-bottom: 0.15rem;
    text-align: center;
    border-bottom: 1px solid rgba(200, 169, 110, 0.2);
    padding-bottom: 0.1rem;
  `;const a=document.createElement("div");a.className="info-modal-body",a.style.cssText=`
    font-size: 0.13rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.8;
  `,a.innerHTML=o.content,i.appendChild(e),i.appendChild(n),i.appendChild(a),r.appendChild(i),document.body.appendChild(r),requestAnimationFrame(()=>{r.style.opacity="1",r.style.visibility="visible",i.style.transform="scale(1)"}),r.addEventListener("click",l=>{l.target===r&&c(r)});const d=l=>{l.key==="Escape"&&(c(r),document.removeEventListener("keydown",d))};document.addEventListener("keydown",d)}function c(o){const t=o.querySelector(".modal-content");o.style.opacity="0",o.style.visibility="hidden",t&&(t.style.transform="scale(0.9)"),setTimeout(()=>{o.remove()},300)}export{s as C,b as E,y as l,f as m,g as s};
//# sourceMappingURL=infoModal-0bcfa56d.js.map
