import{u as m,i as u,a as M,b as f,c as y,d as g,f as v,g as b,h as x,j as C,k as E,l as S,m as $,n as w,o as L,p as V,q as k,r as T,s as B,t as N,v as O,w as A,x as P,y as z}from"./echarts-77501837.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function n(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(e){if(e.ep)return;e.ep=!0;const r=n(e);fetch(e.href,r)}})();m([u,M,f,y,g,v,b,x,C,E,S,$,w,L,V,k,T,B,N,O,A,P,z]);async function H(a){try{const t=await fetch(a);if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);return await t.json()}catch(t){return console.error("加载数据失败:",a,t),null}}function D(a){return"/ancient-architecture-viz/"+"data/"+a}async function Q(a){const t=D(a);return H(t)}const s={primary:"#C8A96E",secondary:"#4ECDC4",accent:"#E07B54",bgDark:"#0d1117",bgCard:"rgba(13, 17, 23, 0.8)",textPrimary:"rgba(255, 255, 255, 0.9)",textSecondary:"rgba(255, 255, 255, 0.6)",textMuted:"rgba(255, 255, 255, 0.4)",chart:["#C8A96E","#4ECDC4","#E07B54","#9B59B6","#3498DB","#2ECC71","#F39C12","#E74C3C"]};function X(a,t){if(!a||!t)return!1;const n=String(a),e={先秦:/商|周|夏|春秋|战国|先秦/,秦汉:/秦|汉/,魏晋:/魏|晋|南北朝|曹魏|北魏|东魏|西魏|北齐|北周|前秦|后秦|西秦|北汉|西夏|三国/,隋唐:/隋|唐/,宋元:/宋|元|辽|金/,明清:/明|清/}[t];return e?e.test(n):n.includes(t)}const Z={color:s.chart,backgroundColor:"transparent",textStyle:{fontFamily:'"Microsoft YaHei", "PingFang SC", sans-serif',color:s.textPrimary},title:{textStyle:{color:s.primary,fontSize:16,fontWeight:"normal"},subtextStyle:{color:s.textSecondary}},legend:{textStyle:{color:s.textSecondary}},tooltip:{backgroundColor:"rgba(13, 17, 23, 0.9)",borderColor:s.primary,borderWidth:1,textStyle:{color:s.textPrimary}},xAxis:{axisLine:{lineStyle:{color:"rgba(255, 255, 255, 0.2)"}},axisLabel:{color:s.textSecondary},splitLine:{lineStyle:{color:"rgba(255, 255, 255, 0.1)"}}},yAxis:{axisLine:{lineStyle:{color:"rgba(255, 255, 255, 0.2)"}},axisLabel:{color:s.textSecondary},splitLine:{lineStyle:{color:"rgba(255, 255, 255, 0.1)"}}}},d=(a,t="0 0 120 80")=>`<svg viewBox="${t}" xmlns="http://www.w3.org/2000/svg" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">${a}</svg>`,j=d(`
  <path d="M10 66h100"/>
  <path d="M18 66v-8h84v8"/>
  <path d="M14 58h92"/>
  <path d="M24 58l6-14h60l6 14"/>
  <path d="M22 44h76"/>
  <path d="M32 44l8-14h40l8 14"/>
  <path d="M28 30h64"/>
  <path d="M38 30c6-6 38-6 44 0"/>
  <path d="M40 66v-8M56 66v-8M72 66v-8M88 66v-8"/>
  <path d="M24 30c-4-4-2-8 2-9M96 30c4-4 2-8-2-9"/>
`),F=d(`
  <path d="M8 66h104"/>
  <path d="M16 66V48h34v18"/>
  <path d="M12 48l21-16 21 16"/>
  <path d="M50 66V42h34v24"/>
  <path d="M46 42l21-14 21 14"/>
  <path d="M60 66V54h10v12"/>
  <path d="M24 56h8v10h-8z"/>
  <path d="M88 66V34h20v32"/>
  <path d="M84 34h28"/>
`),q=d(`
  <path d="M6 62h108"/>
  <path d="M12 62c0-22 22-34 48-34s48 12 48 34"/>
  <path d="M12 62c0-14 20-22 48-22s48 8 48 22"/>
  <path d="M28 54c6-9 18-14 32-14s26 5 32 14"/>
  <path d="M36 60V46M60 60V40M84 60V46"/>
  <path d="M6 66h108"/>
`),I=d(`
  <path d="M14 70h92"/>
  <path d="M26 70V34h68v36"/>
  <path d="M30 34h60"/>
  <path d="M34 34l26-14 26 14"/>
  <path d="M40 46h40M40 58h40"/>
  <path d="M52 20V12h16v8"/>
  <path d="M56 12V6h8v6"/>
  <path d="M26 22h68"/>
`),R=d(`
  <path d="M6 66h108"/>
  <path d="M40 66V50M80 66V50"/>
  <path d="M34 50h52"/>
  <path d="M36 50l24-22 24 22"/>
  <path d="M60 28V18"/>
  <path d="M56 18h8"/>
  <path d="M46 66v-8M60 66v-8M74 66v-8"/>
  <path d="M14 72c8 4 16 4 24 0s16-4 24 0 16 4 24 0 16-4 24 0"/>
`),U=d(`
  <path d="M8 66h104"/>
  <path d="M30 66l18-30h24l18 30z"/>
  <path d="M40 52h40"/>
  <path d="M52 36h16"/>
  <path d="M18 66V44h10v22M92 66V44h10v22"/>
  <path d="M14 44h18M88 44h18"/>
`),W=d(`
  <path d="M6 68h108"/>
  <path d="M10 68V46h100v22"/>
  <path d="M10 46v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6"/>
  <path d="M44 68V56h32v12"/>
  <path d="M46 56V44h28v12"/>
  <path d="M48 44l12-8 12 8"/>
`),J=d(`
  <path d="M8 62h104"/>
  <path d="M20 62V50h80v12"/>
  <path d="M16 50h88"/>
  <path d="M26 50l8-12h52l8 12"/>
  <path d="M24 38h72"/>
  <path d="M34 38l10-12h32l10 12"/>
  <path d="M30 26h60"/>
  <path d="M36 26c6-8 42-8 48 0"/>
  <path d="M26 26c-5-3-4-9 1-11M94 26c5-3 4-9-1-11"/>
  <path d="M40 62v-6M60 62v-6M80 62v-6"/>
`),l={palace:j,house:F,bridge:q,temple:I,garden:R,tomb:U,city:W,default:J};function K(a=""){const t=String(a);return/皇宫|宫殿|宫/.test(t)?l.palace:/民居|大院|庄园|住宅|四合院/.test(t)?l.house:/桥/.test(t)?l.bridge:/寺|庙|塔|石窟/.test(t)?l.temple:/园林|园/.test(t)?l.garden:/陵|墓/.test(t)?l.tomb:/城址|古城|城墙|城堡/.test(t)?l.city:l.default}function G(a){const t=document.getElementById("info-modal-overlay");t&&t.remove();const n=document.createElement("div");n.id="info-modal-overlay",n.className="modal-overlay",n.style.cssText=`
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
  `;const o=document.createElement("div");o.className="modal-content",o.style.cssText=`
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
  `,e.onmouseenter=()=>{e.style.background="#E07B54",e.style.borderColor="#E07B54",e.style.color="white"},e.onmouseleave=()=>{e.style.background="transparent",e.style.borderColor="rgba(200, 169, 110, 0.3)",e.style.color="rgba(255, 255, 255, 0.6)"},e.onclick=()=>h(n);const r=document.createElement("h3");r.className="info-modal-title",r.textContent=a.title,r.style.cssText=`
    font-size: 0.2rem;
    color: #C8A96E;
    margin-bottom: 0.15rem;
    text-align: center;
    border-bottom: 1px solid rgba(200, 169, 110, 0.2);
    padding-bottom: 0.1rem;
  `;const i=document.createElement("div");if(i.className="info-modal-body",i.style.cssText=`
    font-size: 0.13rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.8;
  `,i.innerHTML=a.content,a.ornament!==!1){const c=document.createElement("div");c.className="info-modal-ornament",c.innerHTML=a.ornament?K(a.ornament):l.default,o.appendChild(e),o.appendChild(c)}else o.appendChild(e);o.appendChild(r),o.appendChild(i),n.appendChild(o),document.body.appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.visibility="visible",o.style.transform="scale(1)"}),n.addEventListener("click",c=>{c.target===n&&h(n)});const p=c=>{c.key==="Escape"&&(h(n),document.removeEventListener("keydown",p))};document.addEventListener("keydown",p)}function h(a){const t=a.querySelector(".modal-content");a.style.opacity="0",a.style.visibility="hidden",t&&(t.style.transform="scale(0.9)"),setTimeout(()=>{a.remove()},300)}export{s as C,Z as E,Q as l,X as m,G as s};
