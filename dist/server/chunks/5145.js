"use strict";exports.id=5145,exports.ids=[5145],exports.modules={5145:(e,t,i)=>{var n=Object.defineProperty,r=Object.getOwnPropertyDescriptor,s=Object.getOwnPropertyNames,a=Object.prototype.hasOwnProperty,l=(e,t)=>{for(var i in t)n(e,i,{get:t[i],enumerable:!0})},o={};l(o,{Analytics:()=>u,IpDenyList:()=>k,MultiRegionRatelimit:()=>G,Ratelimit:()=>K}),e.exports=((e,t,i,l)=>{if(t&&"object"==typeof t||"function"==typeof t)for(let i of s(t))a.call(e,i)||void 0===i||n(e,i,{get:()=>t[i],enumerable:!(l=r(t,i))||l.enumerable});return e})(n({},"__esModule",{value:!0}),o);var c=i(97698),u=class{analytics;table="events";constructor(e){this.analytics=new c.Analytics({redis:e.redis,window:"1h",prefix:e.prefix??"@upstash/ratelimit",retention:"90d"})}extractGeo(e){return void 0!==e.geo?e.geo:void 0!==e.cf?e.cf:{}}async record(e){await this.analytics.ingest(this.table,e)}async series(e,t){let i=Math.min((this.analytics.getBucket(Date.now())-this.analytics.getBucket(t))/36e5,256);return this.analytics.aggregateBucketsWithPipeline(this.table,e,i)}async getUsage(e=0){let t=Math.min((this.analytics.getBucket(Date.now())-this.analytics.getBucket(e))/36e5,256);return await this.analytics.getAllowedBlocked(this.table,t)}async getUsageOverTime(e,t){return await this.analytics.aggregateBucketsWithPipeline(this.table,t,e)}async getMostAllowedBlocked(e,t,i){return t=t??5,this.analytics.getMostAllowedBlocked(this.table,e,t,void 0,i)}},d=class{cache;constructor(e){this.cache=e}isBlocked(e){if(!this.cache.has(e))return{blocked:!1,reset:0};let t=this.cache.get(e);return t<Date.now()?(this.cache.delete(e),{blocked:!1,reset:0}):{blocked:!0,reset:t}}blockUntil(e,t){this.cache.set(e,t)}set(e,t){this.cache.set(e,t)}get(e){return this.cache.get(e)||null}incr(e){let t=this.cache.get(e)??0;return t+=1,this.cache.set(e,t),t}pop(e){this.cache.delete(e)}empty(){this.cache.clear()}size(){return this.cache.size}};function m(e){let t=e.match(/^(\d+)\s?(ms|s|m|h|d)$/);if(!t)throw Error(`Unable to parse window size: ${e}`);let i=Number.parseInt(t[1]);switch(t[2]){case"ms":return i;case"s":return 1e3*i;case"m":return 1e3*i*60;case"h":return 1e3*i*3600;case"d":return 1e3*i*86400;default:throw Error(`Unable to parse window size: ${e}`)}}var h=async(e,t,i,n)=>{try{return await e.redis.evalsha(t.hash,i,n)}catch(r){if(`${r}`.includes("NOSCRIPT")){let r=await e.redis.scriptLoad(t.script);return r!==t.hash&&console.warn("Upstash Ratelimit: Expected hash and the hash received from Redis are different. Ratelimit will work as usual but performance will be reduced."),await e.redis.evalsha(r,i,n)}throw r}},f={singleRegion:{fixedWindow:{limit:{script:`
  local key           = KEYS[1]
  local window        = ARGV[1]
  local incrementBy   = ARGV[2] -- increment rate per request at a given value, default is 1

  local r = redis.call("INCRBY", key, incrementBy)
  if r == tonumber(incrementBy) then
  -- The first time this key is set, the value will be equal to incrementBy.
  -- So we only need the expire command once
  redis.call("PEXPIRE", key, window)
  end

  return r
`,hash:"b13943e359636db027ad280f1def143f02158c13"},getRemaining:{script:`
      local key = KEYS[1]
      local tokens = 0

      local value = redis.call('GET', key)
      if value then
          tokens = value
      end
      return tokens
    `,hash:"8c4c341934502aee132643ffbe58ead3450e5208"}},slidingWindow:{limit:{script:`
  local currentKey  = KEYS[1]           -- identifier including prefixes
  local previousKey = KEYS[2]           -- key of the previous bucket
  local tokens      = tonumber(ARGV[1]) -- tokens per window
  local now         = ARGV[2]           -- current timestamp in milliseconds
  local window      = ARGV[3]           -- interval in milliseconds
  local incrementBy = ARGV[4]           -- increment rate per request at a given value, default is 1

  local requestsInCurrentWindow = redis.call("GET", currentKey)
  if requestsInCurrentWindow == false then
    requestsInCurrentWindow = 0
  end

  local requestsInPreviousWindow = redis.call("GET", previousKey)
  if requestsInPreviousWindow == false then
    requestsInPreviousWindow = 0
  end
  local percentageInCurrent = ( now % window ) / window
  -- weighted requests to consider from the previous window
  requestsInPreviousWindow = math.floor(( 1 - percentageInCurrent ) * requestsInPreviousWindow)
  if requestsInPreviousWindow + requestsInCurrentWindow >= tokens then
    return -1
  end

  local newValue = redis.call("INCRBY", currentKey, incrementBy)
  if newValue == tonumber(incrementBy) then
    -- The first time this key is set, the value will be equal to incrementBy.
    -- So we only need the expire command once
    redis.call("PEXPIRE", currentKey, window * 2 + 1000) -- Enough time to overlap with a new window + 1 second
  end
  return tokens - ( newValue + requestsInPreviousWindow )
`,hash:"e1391e429b699c780eb0480350cd5b7280fd9213"},getRemaining:{script:`
  local currentKey  = KEYS[1]           -- identifier including prefixes
  local previousKey = KEYS[2]           -- key of the previous bucket
  local now         = ARGV[1]           -- current timestamp in milliseconds
  local window      = ARGV[2]           -- interval in milliseconds

  local requestsInCurrentWindow = redis.call("GET", currentKey)
  if requestsInCurrentWindow == false then
    requestsInCurrentWindow = 0
  end

  local requestsInPreviousWindow = redis.call("GET", previousKey)
  if requestsInPreviousWindow == false then
    requestsInPreviousWindow = 0
  end

  local percentageInCurrent = ( now % window ) / window
  -- weighted requests to consider from the previous window
  requestsInPreviousWindow = math.floor(( 1 - percentageInCurrent ) * requestsInPreviousWindow)

  return requestsInPreviousWindow + requestsInCurrentWindow
`,hash:"65a73ac5a05bf9712903bc304b77268980c1c417"}},tokenBucket:{limit:{script:`
  local key         = KEYS[1]           -- identifier including prefixes
  local maxTokens   = tonumber(ARGV[1]) -- maximum number of tokens
  local interval    = tonumber(ARGV[2]) -- size of the window in milliseconds
  local refillRate  = tonumber(ARGV[3]) -- how many tokens are refilled after each interval
  local now         = tonumber(ARGV[4]) -- current timestamp in milliseconds
  local incrementBy = tonumber(ARGV[5]) -- how many tokens to consume, default is 1
        
  local bucket = redis.call("HMGET", key, "refilledAt", "tokens")
        
  local refilledAt
  local tokens

  if bucket[1] == false then
    refilledAt = now
    tokens = maxTokens
  else
    refilledAt = tonumber(bucket[1])
    tokens = tonumber(bucket[2])
  end
        
  if now >= refilledAt + interval then
    local numRefills = math.floor((now - refilledAt) / interval)
    tokens = math.min(maxTokens, tokens + numRefills * refillRate)

    refilledAt = refilledAt + numRefills * interval
  end

  if tokens == 0 then
    return {-1, refilledAt + interval}
  end

  local remaining = tokens - incrementBy
  local expireAt = math.ceil(((maxTokens - remaining) / refillRate)) * interval
        
  redis.call("HSET", key, "refilledAt", refilledAt, "tokens", remaining)
  redis.call("PEXPIRE", key, expireAt)
  return {remaining, refilledAt + interval}
`,hash:"5bece90aeef8189a8cfd28995b479529e270b3c6"},getRemaining:{script:`
  local key         = KEYS[1]
  local maxTokens   = tonumber(ARGV[1])
        
  local bucket = redis.call("HMGET", key, "refilledAt", "tokens")

  if bucket[1] == false then
    return {maxTokens, -1}
  end
        
  return {tonumber(bucket[2]), tonumber(bucket[1])}
`,hash:"a15be2bb1db2a15f7c82db06146f9d08983900d0"}},cachedFixedWindow:{limit:{script:`
  local key     = KEYS[1]
  local window  = ARGV[1]
  local incrementBy   = ARGV[2] -- increment rate per request at a given value, default is 1

  local r = redis.call("INCRBY", key, incrementBy)
  if r == incrementBy then
  -- The first time this key is set, the value will be equal to incrementBy.
  -- So we only need the expire command once
  redis.call("PEXPIRE", key, window)
  end
      
  return r
`,hash:"c26b12703dd137939b9a69a3a9b18e906a2d940f"},getRemaining:{script:`
  local key = KEYS[1]
  local tokens = 0

  local value = redis.call('GET', key)
  if value then
      tokens = value
  end
  return tokens
`,hash:"8e8f222ccae68b595ee6e3f3bf2199629a62b91a"}}},multiRegion:{fixedWindow:{limit:{script:`
	local key           = KEYS[1]
	local id            = ARGV[1]
	local window        = ARGV[2]
	local incrementBy   = tonumber(ARGV[3])

	redis.call("HSET", key, id, incrementBy)
	local fields = redis.call("HGETALL", key)
	if #fields == 2 and tonumber(fields[2])==incrementBy then
	-- The first time this key is set, and the value will be equal to incrementBy.
	-- So we only need the expire command once
	  redis.call("PEXPIRE", key, window)
	end

	return fields
`,hash:"a8c14f3835aa87bd70e5e2116081b81664abcf5c"},getRemaining:{script:`
      local key = KEYS[1]
      local tokens = 0

      local fields = redis.call("HGETALL", key)

      return fields
    `,hash:"8ab8322d0ed5fe5ac8eb08f0c2e4557f1b4816fd"}},slidingWindow:{limit:{script:`
	local currentKey    = KEYS[1]           -- identifier including prefixes
	local previousKey   = KEYS[2]           -- key of the previous bucket
	local tokens        = tonumber(ARGV[1]) -- tokens per window
	local now           = ARGV[2]           -- current timestamp in milliseconds
	local window        = ARGV[3]           -- interval in milliseconds
	local requestId     = ARGV[4]           -- uuid for this request
	local incrementBy   = tonumber(ARGV[5]) -- custom rate, default is  1

	local currentFields = redis.call("HGETALL", currentKey)
	local requestsInCurrentWindow = 0
	for i = 2, #currentFields, 2 do
	requestsInCurrentWindow = requestsInCurrentWindow + tonumber(currentFields[i])
	end

	local previousFields = redis.call("HGETALL", previousKey)
	local requestsInPreviousWindow = 0
	for i = 2, #previousFields, 2 do
	requestsInPreviousWindow = requestsInPreviousWindow + tonumber(previousFields[i])
	end

	local percentageInCurrent = ( now % window) / window
	if requestsInPreviousWindow * (1 - percentageInCurrent ) + requestsInCurrentWindow >= tokens then
	  return {currentFields, previousFields, false}
	end

	redis.call("HSET", currentKey, requestId, incrementBy)

	if requestsInCurrentWindow == 0 then 
	  -- The first time this key is set, the value will be equal to incrementBy.
	  -- So we only need the expire command once
	  redis.call("PEXPIRE", currentKey, window * 2 + 1000) -- Enough time to overlap with a new window + 1 second
	end
	return {currentFields, previousFields, true}
`,hash:"cb4fdc2575056df7c6d422764df0de3a08d6753b"},getRemaining:{script:`
	local currentKey    = KEYS[1]           -- identifier including prefixes
	local previousKey   = KEYS[2]           -- key of the previous bucket
	local now         	= ARGV[1]           -- current timestamp in milliseconds
  	local window      	= ARGV[2]           -- interval in milliseconds

	local currentFields = redis.call("HGETALL", currentKey)
	local requestsInCurrentWindow = 0
	for i = 2, #currentFields, 2 do
	requestsInCurrentWindow = requestsInCurrentWindow + tonumber(currentFields[i])
	end

	local previousFields = redis.call("HGETALL", previousKey)
	local requestsInPreviousWindow = 0
	for i = 2, #previousFields, 2 do
	requestsInPreviousWindow = requestsInPreviousWindow + tonumber(previousFields[i])
	end

	local percentageInCurrent = ( now % window) / window
  	requestsInPreviousWindow = math.floor(( 1 - percentageInCurrent ) * requestsInPreviousWindow)
	
	return requestsInCurrentWindow + requestsInPreviousWindow
`,hash:"558c9306b7ec54abb50747fe0b17e5d44bd24868"}}}},p={script:`
      local pattern = KEYS[1]

      -- Initialize cursor to start from 0
      local cursor = "0"

      repeat
          -- Scan for keys matching the pattern
          local scan_result = redis.call('SCAN', cursor, 'MATCH', pattern)

          -- Extract cursor for the next iteration
          cursor = scan_result[1]

          -- Extract keys from the scan result
          local keys = scan_result[2]

          for i=1, #keys do
          redis.call('DEL', keys[i])
          end

      -- Continue scanning until cursor is 0 (end of keyspace)
      until cursor == "0"
    `,hash:"54bd274ddc59fb3be0f42deee2f64322a10e2b50"},w="denyList",g="ipDenyList",y="ipDenyListStatus",b=`
  -- Checks if values provideed in ARGV are present in the deny lists.
  -- This is done using the allDenyListsKey below.

  -- Additionally, checks the status of the ip deny list using the
  -- ipDenyListStatusKey below. Here are the possible states of the
  -- ipDenyListStatusKey key:
  -- * status == -1: set to "disabled" with no TTL
  -- * status == -2: not set, meaning that is was set before but expired
  -- * status  >  0: set to "valid", with a TTL
  --
  -- In the case of status == -2, we set the status to "pending" with
  -- 30 second ttl. During this time, the process which got status == -2
  -- will update the ip deny list.

  local allDenyListsKey     = KEYS[1]
  local ipDenyListStatusKey = KEYS[2]

  local results = redis.call('SMISMEMBER', allDenyListsKey, unpack(ARGV))
  local status  = redis.call('TTL', ipDenyListStatusKey)
  if status == -2 then
    redis.call('SETEX', ipDenyListStatusKey, 30, "pending")
  end

  return { results, status }
`,k={};l(k,{ThresholdError:()=>x,disableIpDenyList:()=>E,updateIpDenyList:()=>I});var v=e=>864e5-((e||Date.now())-72e5)%864e5,x=class extends Error{constructor(e){super(`Allowed threshold values are from 1 to 8, 1 and 8 included. Received: ${e}`),this.name="ThresholdError"}},R=async e=>{if("number"!=typeof e||e<1||e>8)throw new x(e);try{let t=await fetch(`https://raw.githubusercontent.com/stamparm/ipsum/master/levels/${e}.txt`);if(!t.ok)throw Error(`Error fetching data: ${t.statusText}`);return(await t.text()).split("\n").filter(e=>e.length>0)}catch(e){throw Error(`Failed to fetch ip deny list: ${e}`)}},I=async(e,t,i,n)=>{let r=await R(i),s=[t,w,"all"].join(":"),a=[t,w,g].join(":"),l=[t,y].join(":"),o=e.multi();return o.sdiffstore(s,s,a),o.del(a),o.sadd(a,r.at(0),...r.slice(1)),o.sdiffstore(a,a,s),o.sunionstore(s,s,a),o.set(l,"valid",{px:n??v()}),await o.exec()},E=async(e,t)=>{let i=[t,w,"all"].join(":"),n=[t,w,g].join(":"),r=[t,y].join(":"),s=e.multi();return s.sdiffstore(i,i,n),s.del(n),s.set(r,"disabled"),await s.exec()},P=new d(new Map),A=e=>e.find(e=>P.isBlocked(e).blocked),T=e=>{P.size()>1e3&&P.empty(),P.blockUntil(e,Date.now()+6e4)},W=async(e,t,i)=>{let n,[r,s]=await e.eval(b,[[t,w,"all"].join(":"),[t,y].join(":")],i);return r.map((e,t)=>{e&&(T(i[t]),n=i[t])}),{deniedValue:n,invalidIpDenyList:-2===s}},q=(e,t,[i,n],r)=>{if(n.deniedValue&&(i.success=!1,i.remaining=0,i.reason="denyList",i.deniedValue=n.deniedValue),n.invalidIpDenyList){let n=I(e,t,r);i.pending=Promise.all([i.pending,n])}return i},B=e=>({success:!1,limit:0,remaining:0,reset:0,pending:Promise.resolve(),reason:"denyList",deniedValue:e}),S=class{limiter;ctx;prefix;timeout;primaryRedis;analytics;enableProtection;denyListThreshold;constructor(e){this.ctx=e.ctx,this.limiter=e.limiter,this.timeout=e.timeout??5e3,this.prefix=e.prefix??"@upstash/ratelimit",this.enableProtection=e.enableProtection??!1,this.denyListThreshold=e.denyListThreshold??6,this.primaryRedis="redis"in this.ctx?this.ctx.redis:this.ctx.regionContexts[0].redis,this.analytics=e.analytics?new u({redis:this.primaryRedis,prefix:this.prefix}):void 0,e.ephemeralCache instanceof Map?this.ctx.cache=new d(e.ephemeralCache):void 0===e.ephemeralCache&&(this.ctx.cache=new d(new Map))}limit=async(e,t)=>{let i=null;try{let n=this.getRatelimitResponse(e,t),{responseArray:r,newTimeoutId:s}=this.applyTimeout(n);i=s;let a=await Promise.race(r);return this.submitAnalytics(a,e,t)}finally{i&&clearTimeout(i)}};blockUntilReady=async(e,t)=>{let i;if(t<=0)throw Error("timeout must be positive");let n=Date.now()+t;for(;!(i=await this.limit(e)).success;){if(0===i.reset)throw Error("This should not happen");let e=Math.min(i.reset,n)-Date.now();if(await new Promise(t=>setTimeout(t,e)),Date.now()>n)break}return i};resetUsedTokens=async e=>{let t=[this.prefix,e].join(":");await this.limiter().resetTokens(this.ctx,t)};getRemaining=async e=>{let t=[this.prefix,e].join(":");return await this.limiter().getRemaining(this.ctx,t)};getRatelimitResponse=async(e,t)=>{let i=this.getKey(e),n=this.getDefinedMembers(e,t),r=A(n),s=r?[B(r),{deniedValue:r,invalidIpDenyList:!1}]:await Promise.all([this.limiter().limit(this.ctx,i,t?.rate),this.enableProtection?W(this.primaryRedis,this.prefix,n):{deniedValue:void 0,invalidIpDenyList:!1}]);return q(this.primaryRedis,this.prefix,s,this.denyListThreshold)};applyTimeout=e=>{let t=null,i=[e];if(this.timeout>0){let e=new Promise(e=>{t=setTimeout(()=>{e({success:!0,limit:0,remaining:0,reset:0,pending:Promise.resolve(),reason:"timeout"})},this.timeout)});i.push(e)}return{responseArray:i,newTimeoutId:t}};submitAnalytics=(e,t,i)=>{if(this.analytics)try{let n=i?this.analytics.extractGeo(i):void 0,r=this.analytics.record({identifier:"denyList"===e.reason?e.deniedValue:t,time:Date.now(),success:"denyList"===e.reason?"denied":e.success,...n}).catch(e=>{let t="Failed to record analytics";`${e}`.includes("WRONGTYPE")&&(t=`
    Failed to record analytics. See the information below:

    This can occur when you uprade to Ratelimit version 1.1.2
    or later from an earlier version.

    This occurs simply because the way we store analytics data
    has changed. To avoid getting this error, disable analytics
    for *an hour*, then simply enable it back.

    `),console.warn(t,e)});e.pending=Promise.all([e.pending,r])}catch(e){console.warn("Failed to record analytics",e)}return e};getKey=e=>[this.prefix,e].join(":");getDefinedMembers=(e,t)=>[e,t?.ip,t?.userAgent,t?.country].filter(Boolean)};function _(){let e="",t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",i=t.length;for(let n=0;n<16;n++)e+=t.charAt(Math.floor(Math.random()*i));return e}var G=class extends S{constructor(e){super({prefix:e.prefix,limiter:e.limiter,timeout:e.timeout,analytics:e.analytics,ctx:{regionContexts:e.redis.map(e=>({redis:e})),cache:e.ephemeralCache?new d(e.ephemeralCache):void 0}})}static fixedWindow(e,t){let i=m(t);return()=>({async limit(t,n,r){if(t.cache){let{blocked:i,reset:r}=t.cache.isBlocked(n);if(i)return{success:!1,limit:e,remaining:0,reset:r,pending:Promise.resolve(),reason:"cacheBlock"}}let s=_(),a=Math.floor(Date.now()/i),l=[n,a].join(":"),o=r?Math.max(1,r):1,c=t.regionContexts.map(e=>({redis:e.redis,request:h(e,f.multiRegion.fixedWindow.limit,[l],[s,i,o])})),u=e-(await Promise.any(c.map(e=>e.request))).reduce((e,t,i)=>{let n=0;return i%2&&(n=Number.parseInt(t)),e+n},0);async function d(){let t=[...new Set((await Promise.all(c.map(e=>e.request))).flat().reduce((e,t,i)=>(i%2==0&&e.push(t),e),[])).values()];for(let i of c){let n=(await i.request).reduce((e,t,i)=>{let n=0;return i%2&&(n=Number.parseInt(t)),e+n},0),r=(await i.request).reduce((e,t,i)=>(i%2==0&&e.push(t),e),[]);if(n>=e)continue;let s=t.filter(e=>!r.includes(e));if(0!==s.length)for(let e of s)await i.redis.hset(l,{[e]:o})}}let m=u>0,p=(a+1)*i;return t.cache&&!m&&t.cache.blockUntil(n,p),{success:m,limit:e,remaining:u,reset:p,pending:d()}},async getRemaining(t,n){let r=Math.floor(Date.now()/i),s=[n,r].join(":"),a=t.regionContexts.map(e=>({redis:e.redis,request:h(e,f.multiRegion.fixedWindow.getRemaining,[s],[null])}));return{remaining:Math.max(0,e-(await Promise.any(a.map(e=>e.request))).reduce((e,t,i)=>{let n=0;return i%2&&(n=Number.parseInt(t)),e+n},0)),reset:(r+1)*i}},async resetTokens(e,t){let i=[t,"*"].join(":");e.cache&&e.cache.pop(t),await Promise.all(e.regionContexts.map(e=>{h(e,p,[i],[null])}))}})}static slidingWindow(e,t){let i=m(t),n=m(t);return()=>({async limit(t,r,s){if(t.cache){let{blocked:i,reset:n}=t.cache.isBlocked(r);if(i)return{success:!1,limit:e,remaining:0,reset:n,pending:Promise.resolve(),reason:"cacheBlock"}}let a=_(),l=Date.now(),o=Math.floor(l/i),c=[r,o].join(":"),u=[r,o-1].join(":"),d=s?Math.max(1,s):1,m=t.regionContexts.map(t=>({redis:t.redis,request:h(t,f.multiRegion.slidingWindow.limit,[c,u],[e,l,n,a,d])})),p=l%n/n,[w,g,y]=await Promise.any(m.map(e=>e.request));y&&w.push(a,d.toString());let b=g.reduce((e,t,i)=>{let n=0;return i%2&&(n=Number.parseInt(t)),e+n},0),k=w.reduce((e,t,i)=>{let n=0;return i%2&&(n=Number.parseInt(t)),e+n},0),v=e-(Math.ceil(b*(1-p))+k);async function x(){let t=[...new Set((await Promise.all(m.map(e=>e.request))).flatMap(([e])=>e).reduce((e,t,i)=>(i%2==0&&e.push(t),e),[])).values()];for(let i of m){let[n,r,s]=await i.request,a=n.reduce((e,t,i)=>(i%2==0&&e.push(t),e),[]);if(n.reduce((e,t,i)=>{let n=0;return i%2&&(n=Number.parseInt(t)),e+n},0)>=e)continue;let l=t.filter(e=>!a.includes(e));if(0!==l.length)for(let e of l)await i.redis.hset(c,{[e]:d})}}let R=(o+1)*n;return t.cache&&!y&&t.cache.blockUntil(r,R),{success:!!y,limit:e,remaining:Math.max(0,v),reset:R,pending:x()}},async getRemaining(t,n){let r=Date.now(),s=Math.floor(r/i),a=[n,s].join(":"),l=[n,s-1].join(":"),o=t.regionContexts.map(e=>({redis:e.redis,request:h(e,f.multiRegion.slidingWindow.getRemaining,[a,l],[r,i])}));return{remaining:Math.max(0,e-await Promise.any(o.map(e=>e.request))),reset:(s+1)*i}},async resetTokens(e,t){let i=[t,"*"].join(":");e.cache&&e.cache.pop(t),await Promise.all(e.regionContexts.map(e=>{h(e,p,[i],[null])}))}})}},K=class extends S{constructor(e){super({prefix:e.prefix,limiter:e.limiter,timeout:e.timeout,analytics:e.analytics,ctx:{redis:e.redis},ephemeralCache:e.ephemeralCache,enableProtection:e.enableProtection,denyListThreshold:e.denyListThreshold})}static fixedWindow(e,t){let i=m(t);return()=>({async limit(t,n,r){let s=Math.floor(Date.now()/i),a=[n,s].join(":");if(t.cache){let{blocked:i,reset:r}=t.cache.isBlocked(n);if(i)return{success:!1,limit:e,remaining:0,reset:r,pending:Promise.resolve(),reason:"cacheBlock"}}let l=r?Math.max(1,r):1,o=await h(t,f.singleRegion.fixedWindow.limit,[a],[i,l]),c=o<=e,u=Math.max(0,e-o),d=(s+1)*i;return t.cache&&!c&&t.cache.blockUntil(n,d),{success:c,limit:e,remaining:u,reset:d,pending:Promise.resolve()}},async getRemaining(t,n){let r=Math.floor(Date.now()/i),s=[n,r].join(":");return{remaining:Math.max(0,e-await h(t,f.singleRegion.fixedWindow.getRemaining,[s],[null])),reset:(r+1)*i}},async resetTokens(e,t){let i=[t,"*"].join(":");e.cache&&e.cache.pop(t),await h(e,p,[i],[null])}})}static slidingWindow(e,t){let i=m(t);return()=>({async limit(t,n,r){let s=Date.now(),a=Math.floor(s/i),l=[n,a].join(":"),o=[n,a-1].join(":");if(t.cache){let{blocked:i,reset:r}=t.cache.isBlocked(n);if(i)return{success:!1,limit:e,remaining:0,reset:r,pending:Promise.resolve(),reason:"cacheBlock"}}let c=r?Math.max(1,r):1,u=await h(t,f.singleRegion.slidingWindow.limit,[l,o],[e,s,i,c]),d=u>=0,m=(a+1)*i;return t.cache&&!d&&t.cache.blockUntil(n,m),{success:d,limit:e,remaining:Math.max(0,u),reset:m,pending:Promise.resolve()}},async getRemaining(t,n){let r=Date.now(),s=Math.floor(r/i),a=[n,s].join(":"),l=[n,s-1].join(":");return{remaining:Math.max(0,e-await h(t,f.singleRegion.slidingWindow.getRemaining,[a,l],[r,i])),reset:(s+1)*i}},async resetTokens(e,t){let i=[t,"*"].join(":");e.cache&&e.cache.pop(t),await h(e,p,[i],[null])}})}static tokenBucket(e,t,i){let n=m(t);return()=>({async limit(t,r,s){if(t.cache){let{blocked:e,reset:n}=t.cache.isBlocked(r);if(e)return{success:!1,limit:i,remaining:0,reset:n,pending:Promise.resolve(),reason:"cacheBlock"}}let a=Date.now(),l=s?Math.max(1,s):1,[o,c]=await h(t,f.singleRegion.tokenBucket.limit,[r],[i,n,e,a,l]),u=o>=0;return t.cache&&!u&&t.cache.blockUntil(r,c),{success:u,limit:i,remaining:o,reset:c,pending:Promise.resolve()}},async getRemaining(e,t){let[r,s]=await h(e,f.singleRegion.tokenBucket.getRemaining,[t],[i]),a=Date.now()+n,l=s+n;return{remaining:r,reset:-1===s?a:l}},async resetTokens(e,t){e.cache&&e.cache.pop(t),await h(e,p,[t],[null])}})}static cachedFixedWindow(e,t){let i=m(t);return()=>({async limit(t,n,r){if(!t.cache)throw Error("This algorithm requires a cache");let s=Math.floor(Date.now()/i),a=[n,s].join(":"),l=(s+1)*i,o=r?Math.max(1,r):1;if("number"==typeof t.cache.get(a)){let n=t.cache.incr(a),r=n<e,s=r?h(t,f.singleRegion.cachedFixedWindow.limit,[a],[i,o]):Promise.resolve();return{success:r,limit:e,remaining:e-n,reset:l,pending:s}}let c=await h(t,f.singleRegion.cachedFixedWindow.limit,[a],[i,o]);t.cache.set(a,c);let u=e-c;return{success:u>=0,limit:e,remaining:u,reset:l,pending:Promise.resolve()}},async getRemaining(t,n){if(!t.cache)throw Error("This algorithm requires a cache");let r=Math.floor(Date.now()/i),s=[n,r].join(":");return"number"==typeof t.cache.get(s)?{remaining:Math.max(0,e-(t.cache.get(s)??0)),reset:(r+1)*i}:{remaining:Math.max(0,e-await h(t,f.singleRegion.cachedFixedWindow.getRemaining,[s],[null])),reset:(r+1)*i}},async resetTokens(e,t){if(!e.cache)throw Error("This algorithm requires a cache");let n=[t,Math.floor(Date.now()/i)].join(":");e.cache.pop(n);let r=[t,"*"].join(":");await h(e,p,[r],[null])}})}}},97698:e=>{var t=Object.defineProperty,i=Object.getOwnPropertyDescriptor,n=Object.getOwnPropertyNames,r=Object.prototype.hasOwnProperty,s={};((e,i)=>{for(var n in i)t(e,n,{get:i[n],enumerable:!0})})(s,{Analytics:()=>c}),e.exports=((e,s,a,l)=>{if(s&&"object"==typeof s||"function"==typeof s)for(let a of n(s))r.call(e,a)||void 0===a||t(e,a,{get:()=>s[a],enumerable:!(l=i(s,a))||l.enumerable});return e})(t({},"__esModule",{value:!0}),s);var a=`
local key = KEYS[1]
local field = ARGV[1]

local data = redis.call("ZRANGE", key, 0, -1, "WITHSCORES")
local count = {}

for i = 1, #data, 2 do
  local json_str = data[i]
  local score = tonumber(data[i + 1])
  local obj = cjson.decode(json_str)

  local fieldValue = obj[field]

  if count[fieldValue] == nil then
    count[fieldValue] = score
  else
    count[fieldValue] = count[fieldValue] + score
  end
end

local result = {}
for k, v in pairs(count) do
  table.insert(result, {k, v})
end

return result
`,l=`
local prefix = KEYS[1]
local first_timestamp = tonumber(ARGV[1]) -- First timestamp to check
local increment = tonumber(ARGV[2])       -- Increment between each timestamp
local num_timestamps = tonumber(ARGV[3])  -- Number of timestampts to check (24 for a day and 24 * 7 for a week)
local num_elements = tonumber(ARGV[4])    -- Number of elements to fetch in each category
local check_at_most = tonumber(ARGV[5])   -- Number of elements to check at most.

local keys = {}
for i = 1, num_timestamps do
  local timestamp = first_timestamp - (i - 1) * increment
  table.insert(keys, prefix .. ":" .. timestamp)
end

-- get the union of the groups
local zunion_params = {"ZUNION", num_timestamps, unpack(keys)}
table.insert(zunion_params, "WITHSCORES")
local result = redis.call(unpack(zunion_params))

-- select num_elements many items
local true_group = {}
local false_group = {}
local denied_group = {}
local true_count = 0
local false_count = 0
local denied_count = 0
local i = #result - 1

-- index to stop at after going through "checkAtMost" many items:
local cutoff_index = #result - 2 * check_at_most

-- iterate over the results
while (true_count + false_count + denied_count) < (num_elements * 3) and 1 <= i and i >= cutoff_index do
  local score = tonumber(result[i + 1])
  if score > 0 then
    local element = result[i]
    if string.find(element, "success\\":true") and true_count < num_elements then
      table.insert(true_group, {score, element})
      true_count = true_count + 1
    elseif string.find(element, "success\\":false") and false_count < num_elements then
      table.insert(false_group, {score, element})
      false_count = false_count + 1
    elseif string.find(element, "success\\":\\"denied") and denied_count < num_elements then
      table.insert(denied_group, {score, element})
      denied_count = denied_count + 1
    end
  end
  i = i - 2
end

return {true_group, false_group, denied_group}
`,o=`
local prefix = KEYS[1]
local first_timestamp = tonumber(ARGV[1])
local increment = tonumber(ARGV[2])
local num_timestamps = tonumber(ARGV[3])

local keys = {}
for i = 1, num_timestamps do
  local timestamp = first_timestamp - (i - 1) * increment
  table.insert(keys, prefix .. ":" .. timestamp)
end

-- get the union of the groups
local zunion_params = {"ZUNION", num_timestamps, unpack(keys)}
table.insert(zunion_params, "WITHSCORES")
local result = redis.call(unpack(zunion_params))

return result
`,c=class{redis;prefix;bucketSize;constructor(e){this.redis=e.redis,this.prefix=e.prefix??"@upstash/analytics",this.bucketSize=this.parseWindow(e.window)}validateTableName(e){if(!/^[a-zA-Z0-9_-]+$/.test(e))throw Error(`Invalid table name: ${e}. Table names can only contain letters, numbers, dashes and underscores.`)}parseWindow(e){if("number"==typeof e){if(e<=0)throw Error(`Invalid window: ${e}`);return e}let t=/^(\d+)([smhd])$/;if(!t.test(e))throw Error(`Invalid window: ${e}`);let[,i,n]=e.match(t),r=parseInt(i);switch(n){case"s":return 1e3*r;case"m":return 1e3*r*60;case"h":return 1e3*r*3600;case"d":return 1e3*r*86400;default:throw Error(`Invalid window unit: ${n}`)}}getBucket(e){return Math.floor((e??Date.now())/this.bucketSize)*this.bucketSize}async ingest(e,...t){this.validateTableName(e),await Promise.all(t.map(async t=>{let i=this.getBucket(t.time),n=[this.prefix,e,i].join(":");await this.redis.zincrby(n,1,JSON.stringify({...t,time:void 0}))}))}formatBucketAggregate(e,t,i){let n={};return e.forEach(([e,i])=>{"success"==t&&(e=1===e?"true":null===e?"false":e),n[t]=n[t]||{},n[t][(e??"null").toString()]=i}),{time:i,...n}}async aggregateBucket(e,t,i){this.validateTableName(e);let n=this.getBucket(i),r=[this.prefix,e,n].join(":"),s=await this.redis.eval(a,[r],[t]);return this.formatBucketAggregate(s,t,n)}async aggregateBuckets(e,t,i,n){this.validateTableName(e);let r=this.getBucket(n),s=[];for(let n=0;n<i;n+=1)s.push(this.aggregateBucket(e,t,r)),r-=this.bucketSize;return Promise.all(s)}async aggregateBucketsWithPipeline(e,t,i,n,r){this.validateTableName(e),r=r??48;let s=this.getBucket(n),l=[],o=this.redis.pipeline(),c=[];for(let n=1;n<=i;n+=1){let u=[this.prefix,e,s].join(":");o.eval(a,[u],[t]),l.push(s),s-=this.bucketSize,(n%r==0||n==i)&&(c.push(o.exec()),o=this.redis.pipeline())}return(await Promise.all(c)).flat().map((e,i)=>this.formatBucketAggregate(e,t,l[i]))}async getAllowedBlocked(e,t,i){this.validateTableName(e);let n=[this.prefix,e].join(":"),r=this.getBucket(i),s=await this.redis.eval(o,[n],[r,this.bucketSize,t]),a={};for(let e=0;e<s.length;e+=2){let t=s[e],i=t.identifier,n=+s[e+1];a[i]||(a[i]={success:0,blocked:0}),a[i][t.success?"success":"blocked"]=n}return a}async getMostAllowedBlocked(e,t,i,n,r){this.validateTableName(e);let s=[this.prefix,e].join(":"),a=this.getBucket(n),[o,c,u]=await this.redis.eval(l,[s],[a,this.bucketSize,t,i,r??5*i]);return{allowed:this.toDicts(o),ratelimited:this.toDicts(c),denied:this.toDicts(u)}}toDicts(e){let t=[];for(let i=0;i<e.length;i+=1){let n=+e[i][0],r=e[i][1];t.push({identifier:r.identifier,count:n})}return t}}}};