(()=>{var e={};e.id=3790,e.ids=[3790],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19174:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>g,routeModule:()=>h,serverHooks:()=>x,workAsyncStorage:()=>c,workUnitAsyncStorage:()=>u});var s={};r.r(s),r.d(s,{GET:()=>l,dynamic:()=>d,revalidate:()=>p});var i=r(96559),a=r(48088),o=r(37719),n=r(32190);let d="force-dynamic",p=86400;async function l(e,{params:t}){try{var r,s;let e=parseInt(t.width,10)||400,i=parseInt(t.height,10)||300;console.log(`Generating placeholder image: ${e}x${i}`);let a=(r=e,s=i,`
    <svg 
      width="${r}" 
      height="${s}" 
      viewBox="0 0 ${r} ${s}" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1a1a2e" stop-opacity="1" />
          <stop offset="100%" stop-color="#0f3460" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect width="${r}" height="${s}" fill="url(#grad)" />
      <rect 
        x="${.3*r}" 
        y="${.35*s}" 
        width="${.4*r}" 
        height="${.3*s}" 
        stroke="#e2b714" 
        stroke-width="2" 
        fill="none" 
        rx="4"
      />
      <line 
        x1="${.3*r}" 
        y1="${.35*s}" 
        x2="${.7*r}" 
        y2="${.65*s}" 
        stroke="#e2b714" 
        stroke-width="2" 
      />
      <line 
        x1="${.7*r}" 
        y1="${.35*s}" 
        x2="${.3*r}" 
        y2="${.65*s}" 
        stroke="#e2b714" 
        stroke-width="2" 
      />
      <text 
        x="50%" 
        y="85%" 
        font-family="system-ui, sans-serif" 
        font-size="${.05*Math.max(r,s)}px" 
        fill="#e2b714" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${r} \xd7 ${s}
      </text>
    </svg>
  `.trim());return new n.NextResponse(a,{headers:{"Content-Type":"image/svg+xml","Cache-Control":"public, max-age=604800, stale-while-revalidate=31536000",ETag:`"placeholder-${e}-${i}"`,Vary:"Accept"}})}catch(e){return console.error("Error generating placeholder:",e),new n.NextResponse("Error generating placeholder",{status:500})}}let h=new i.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/placeholder/[width]/[height]/route",pathname:"/api/placeholder/[width]/[height]",filename:"route",bundlePath:"app/api/placeholder/[width]/[height]/route"},resolvedPagePath:"/Users/drgn003/AutomatIQ/AI-website-auditor/app/api/placeholder/[width]/[height]/route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:c,workUnitAsyncStorage:u,serverHooks:x}=h;function g(){return(0,o.patchFetch)({workAsyncStorage:c,workUnitAsyncStorage:u})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},96487:()=>{}};var t=require("../../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[4243,580],()=>r(19174));module.exports=s})();