import{g as s}from"./glyphs-c4593ec9.js";let t=null;function i(){if(!t)return;const e=t,a=e.querySelector(".drawer__panel");e.classList.remove("is-open"),a&&(a.style.transform="translateX(102%)"),setTimeout(()=>e.remove(),380),t=null}function n(e){i();const a=document.createElement("div");a.className="drawer",a.innerHTML=`
    <div class="drawer__mask"></div>
    <aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="${e.title||"详情"}">
      <button class="drawer__close" aria-label="关闭">✕</button>
      ${e.glyph||e.category?`<div class="drawer__glyph">${e.glyph||s(e.category)}</div>`:""}
      <header class="drawer__head">
        <h2 class="drawer__title">${e.title||""}</h2>
        ${e.subtitle?`<p class="drawer__subtitle">${e.subtitle}</p>`:""}
      </header>
      ${e.fields&&e.fields.length?`<dl class="drawer__fields">${e.fields.filter(l=>l.value).map(l=>`<div class="drawer__field">
                <dt>${l.label}</dt>
                <dd>${l.value}</dd>
              </div>`).join("")}</dl>`:""}
      ${e.body?`<div class="drawer__body">${e.body}</div>`:""}
      ${e.tags&&e.tags.length?`<div class="drawer__tags">${e.tags.map(l=>`<span class="drawer__tag">${l}</span>`).join("")}</div>`:""}
    </aside>
  `,document.body.appendChild(a),t=a;const r=a.querySelector(".drawer__panel");requestAnimationFrame(()=>{a.classList.add("is-open"),r.style.transform="translateX(0)"}),a.querySelector(".drawer__mask").addEventListener("click",i),a.querySelector(".drawer__close").addEventListener("click",i);const d=l=>{l.key==="Escape"&&(i(),document.removeEventListener("keydown",d))};document.addEventListener("keydown",d),setTimeout(()=>{var l;return(l=r.focus)==null?void 0:l.call(r)},60)}function o(e){n({title:e.name,subtitle:[e.dynasty,e.category,e.location].filter(Boolean).join(" · "),category:e.category,fields:[{label:"朝代",value:e.dynasty},{label:"类别",value:e.category},{label:"所在地",value:e.location},{label:"始建年代",value:e.builtYear},{label:"保护级别",value:e.protectionLevel},{label:"主持营造",value:e.architect||"佚名"}],body:[e.significance?`<p class="drawer__lead">${e.significance}</p>`:"",e.description?`<p>${e.description}</p>`:""].join(""),tags:[String(e.description||"").includes("世界遗产")||String(e.description||"").includes("世界文化")?"世界文化遗产":"",String(e.description||"").includes("现存")?"现存实物":""].filter(Boolean)})}export{n as a,o as s};
