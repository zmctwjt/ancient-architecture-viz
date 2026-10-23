const h=(e,t="0 0 120 80")=>`<svg viewBox="${t}" xmlns="http://www.w3.org/2000/svg" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">${e}</svg>`,p=h(`
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
`),M=h(`
  <path d="M8 66h104"/>
  <path d="M16 66V48h34v18"/>
  <path d="M12 48l21-16 21 16"/>
  <path d="M50 66V42h34v24"/>
  <path d="M46 42l21-14 21 14"/>
  <path d="M60 66V54h10v12"/>
  <path d="M24 56h8v10h-8z"/>
  <path d="M88 66V34h20v32"/>
  <path d="M84 34h28"/>
`),m=h(`
  <path d="M6 62h108"/>
  <path d="M12 62c0-22 22-34 48-34s48 12 48 34"/>
  <path d="M12 62c0-14 20-22 48-22s48 8 48 22"/>
  <path d="M28 54c6-9 18-14 32-14s26 5 32 14"/>
  <path d="M36 60V46M60 60V40M84 60V46"/>
  <path d="M6 66h108"/>
`),v=h(`
  <path d="M14 70h92"/>
  <path d="M26 70V34h68v36"/>
  <path d="M30 34h60"/>
  <path d="M34 34l26-14 26 14"/>
  <path d="M40 46h40M40 58h40"/>
  <path d="M52 20V12h16v8"/>
  <path d="M56 12V6h8v6"/>
  <path d="M26 22h68"/>
`),u=h(`
  <path d="M6 66h108"/>
  <path d="M40 66V50M80 66V50"/>
  <path d="M34 50h52"/>
  <path d="M36 50l24-22 24 22"/>
  <path d="M60 28V18"/>
  <path d="M56 18h8"/>
  <path d="M46 66v-8M60 66v-8M74 66v-8"/>
  <path d="M14 72c8 4 16 4 24 0s16-4 24 0 16 4 24 0 16-4 24 0"/>
`),f=h(`
  <path d="M8 66h104"/>
  <path d="M30 66l18-30h24l18 30z"/>
  <path d="M40 52h40"/>
  <path d="M52 36h16"/>
  <path d="M18 66V44h10v22M92 66V44h10v22"/>
  <path d="M14 44h18M88 44h18"/>
`),y=h(`
  <path d="M6 68h108"/>
  <path d="M10 68V46h100v22"/>
  <path d="M10 46v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6"/>
  <path d="M44 68V56h32v12"/>
  <path d="M46 56V44h28v12"/>
  <path d="M48 44l12-8 12 8"/>
`),g=h(`
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
`),d={palace:p,house:M,bridge:m,temple:v,garden:u,tomb:f,city:y,default:g};function b(e=""){const t=String(e);return/皇宫|宫殿|宫/.test(t)?d.palace:/民居|大院|庄园|住宅|四合院/.test(t)?d.house:/桥/.test(t)?d.bridge:/寺|庙|塔|石窟/.test(t)?d.temple:/园林|园/.test(t)?d.garden:/陵|墓/.test(t)?d.tomb:/城址|古城|城墙|城堡/.test(t)?d.city:d.default}function x(e){const t=document.getElementById("info-modal-overlay");t&&t.remove();const n=document.createElement("div");n.id="info-modal-overlay",n.className="modal-overlay",n.style.cssText=`
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
  `;const a=document.createElement("button");a.innerHTML="✕",a.style.cssText=`
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
  `,a.onmouseenter=()=>{a.style.background="#C8452F",a.style.borderColor="#C8452F",a.style.color="white"},a.onmouseleave=()=>{a.style.background="transparent",a.style.borderColor="rgba(200, 169, 110, 0.3)",a.style.color="rgba(255, 255, 255, 0.6)"},a.onclick=()=>i(n);const s=document.createElement("h3");s.className="info-modal-title",s.textContent=e.title,s.style.cssText=`
    font-size: 0.2rem;
    color: #C8A96E;
    margin-bottom: 0.15rem;
    text-align: center;
    border-bottom: 1px solid rgba(200, 169, 110, 0.2);
    padding-bottom: 0.1rem;
  `;const l=document.createElement("div");if(l.className="info-modal-body",l.style.cssText=`
    font-size: 0.13rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.8;
  `,l.innerHTML=e.content,e.ornament!==!1){const r=document.createElement("div");r.className="info-modal-ornament",r.innerHTML=e.ornament?b(e.ornament):d.default,o.appendChild(a),o.appendChild(r)}else o.appendChild(a);o.appendChild(s),o.appendChild(l),n.appendChild(o),document.body.appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.visibility="visible",o.style.transform="scale(1)"}),n.addEventListener("click",r=>{r.target===n&&i(n)});const c=r=>{r.key==="Escape"&&(i(n),document.removeEventListener("keydown",c))};document.addEventListener("keydown",c)}function i(e){const t=e.querySelector(".modal-content");e.style.opacity="0",e.style.visibility="hidden",t&&(t.style.transform="scale(0.9)"),setTimeout(()=>{e.remove()},300)}export{x as s};
