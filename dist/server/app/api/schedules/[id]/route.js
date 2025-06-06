(()=>{var e={};e.id=2570,e.ids=[2570],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64374:(e,t,s)=>{"use strict";s.r(t),s.d(t,{patchFetch:()=>R,routeModule:()=>c,serverHooks:()=>_,workAsyncStorage:()=>E,workUnitAsyncStorage:()=>w});var r={};s.r(r),s.d(r,{DELETE:()=>l,PATCH:()=>o});var a=s(96559),i=s(48088),n=s(37719),u=s(32190),d=s(71321);async function o(e,{params:t}){try{if(!e.headers.get("x-user-id"))return u.NextResponse.json({error:"Unauthorized"},{status:401});let s=await e.json(),r=await d.EP.update(t.id,s);if(!r)return u.NextResponse.json({error:"Schedule not found"},{status:404});return u.NextResponse.json({schedule:r})}catch(e){return console.error("Error updating schedule:",e),u.NextResponse.json({error:"Internal server error"},{status:500})}}async function l(e,{params:t}){try{if(!e.headers.get("x-user-id"))return u.NextResponse.json({error:"Unauthorized"},{status:401});return await d.EP.delete(t.id),u.NextResponse.json({message:"Schedule deleted successfully"})}catch(e){return console.error("Error deleting schedule:",e),u.NextResponse.json({error:"Internal server error"},{status:500})}}let c=new a.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/schedules/[id]/route",pathname:"/api/schedules/[id]",filename:"route",bundlePath:"app/api/schedules/[id]/route"},resolvedPagePath:"/Users/drgn003/AutomatIQ/AI-website-auditor/app/api/schedules/[id]/route.ts",nextConfigOutput:"",userland:r}),{workAsyncStorage:E,workUnitAsyncStorage:w,serverHooks:_}=c;function R(){return(0,n.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:w})}},71321:(e,t,s)=>{"use strict";s.d(t,{C1:()=>r,EP:()=>i,Yc:()=>a});let r={async create(e){let[t]=await sql`
      INSERT INTO websites (user_id, name, url, description, audit_frequency, notifications, tags)
      VALUES (${e.user_id}, ${e.name}, ${e.url}, 
              ${e.description||""}, ${e.audit_frequency||"weekly"}, 
              ${e.notifications??!0}, ${e.tags||[]})
      RETURNING *
    `;return t},findByUserId:async e=>await sql`
      SELECT w.*, 
             COUNT(a.id) as total_audits,
             AVG(a.overall_score) as average_score,
             MAX(a.completed_at) as last_audit_at
      FROM websites w
      LEFT JOIN audits a ON w.id = a.website_id AND a.status = 'completed'
      WHERE w.user_id = ${e}
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `,async findById(e){let[t]=await sql`
      SELECT * FROM websites WHERE id = ${e}
    `;return t},async update(e,t){let s=Object.keys(t).map((e,t)=>`${e} = $${t+2}`).join(", "),r=Object.values(t),[a]=await sql`
      UPDATE websites 
      SET ${sql.unsafe(s)}
      WHERE id = ${e}
      RETURNING *
    `.apply(null,[e,...r]);return a},async delete(e){await sql`DELETE FROM websites WHERE id = ${e}`}},a={async create(e){let[t]=await sql`
      INSERT INTO notifications (user_id, website_id, audit_id, type, title, message, priority, action_url)
      VALUES (${e.user_id}, ${e.website_id||null}, 
              ${e.audit_id||null}, ${e.type}, 
              ${e.title}, ${e.message}, 
              ${e.priority||"medium"}, ${e.action_url||null})
      RETURNING *
    `;return t},findByUserId:async(e,t=50)=>await sql`
      SELECT n.*, w.name as website_name
      FROM notifications n
      LEFT JOIN websites w ON n.website_id = w.id
      WHERE n.user_id = ${e}
      ORDER BY n.created_at DESC
      LIMIT ${t}
    `,async markAsRead(e){let[t]=await sql`
      UPDATE notifications 
      SET read = true 
      WHERE id = ${e}
      RETURNING *
    `;return t},async markAllAsRead(e){await sql`
      UPDATE notifications 
      SET read = true 
      WHERE user_id = ${e} AND read = false
    `},async delete(e){await sql`DELETE FROM notifications WHERE id = ${e}`},async getUnreadCount(e){let[t]=await sql`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ${e} AND read = false
    `;return Number.parseInt(t.count)}},i={async create(e){let[t]=await sql`
      INSERT INTO audit_schedules (website_id, user_id, frequency, time_of_day, timezone, next_run_at)
      VALUES (${e.website_id}, ${e.user_id}, ${e.frequency}, 
              ${e.time_of_day||"09:00:00"}, ${e.timezone||"UTC"}, 
              NOW() + INTERVAL '1 day')
      RETURNING *
    `;return t},findByUserId:async e=>await sql`
      SELECT s.*, w.name as website_name, w.url as website_url
      FROM audit_schedules s
      JOIN websites w ON s.website_id = w.id
      WHERE s.user_id = ${e}
      ORDER BY s.next_run_at ASC
    `,findDueSchedules:async()=>await sql`
      SELECT s.*, w.name as website_name, w.url as website_url, u.email as user_email
      FROM audit_schedules s
      JOIN websites w ON s.website_id = w.id
      JOIN users u ON s.user_id = u.id
      WHERE s.is_active = true 
      AND s.next_run_at <= NOW()
      ORDER BY s.next_run_at ASC
    `,async updateNextRun(e,t){let[s]=await sql`
      UPDATE audit_schedules 
      SET last_run_at = NOW(), next_run_at = ${t}
      WHERE id = ${e}
      RETURNING *
    `;return s},async toggle(e,t){let[s]=await sql`
      UPDATE audit_schedules 
      SET is_active = ${t}
      WHERE id = ${e}
      RETURNING *
    `;return s}}},78335:()=>{},96487:()=>{}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[4243,580],()=>s(64374));module.exports=r})();