
function $(sel){return document.querySelector(sel)}
function el(tag,opts){const e=document.createElement(tag);Object.assign(e,opts||{});return e}

function fmtUSD(n){return "$"+n.toLocaleString(undefined,{maximumFractionDigits:0})}

function handleBlueprint(){
  const biz = $("#bp-biz").value.trim()||"SaaS startup"
  const users = parseInt($("#bp-users").value||"5000",10)
  const provider = $("#bp-provider").value
  const region = $("#bp-region").value
  const scale = users>20000?"Large":users>3000?"Medium":"Small"

  const services = {
    aws:["ALB","ECS/Fargate","RDS","ElastiCache","CloudWatch","S3","CloudFront"],
    azure:["Front Door","App Service","Azure SQL","Redis","Azure Monitor","Blob","CDN"],
    gcp:["Cloud Load Balancer","GKE/Cloud Run","Cloud SQL","MemoryStore","Cloud Monitoring","GCS","Cloud CDN"]
  }[provider]

  const lines=[
    `Blueprint for a ${scale} ${biz} on ${provider.toUpperCase()} (${region})`,
    `Layers:`,
    `• Edge/CDN ➜ ${services[0]} ➜ App (${services[1]}) ➜ DB (${services[2]})`,
    `• Cache: ${services[3]} • Observability: ${services[4]} • Storage: ${services[5]} • CDN: ${services[6]}`,
    `Capacity hints: ${Math.ceil(users/1000)} app units, HA DB, autoscaling on traffic > 70% CPU`,
  ].join("\n")

  // draw a tiny SVG diagram
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="220">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#10c9c4"/><stop offset="100%" stop-color="#9c6bff"/>
        </linearGradient>
      </defs>
      <rect x="16" y="16" width="96%" height="188" rx="14" fill="#0b1326" stroke="rgba(154,179,217,.3)"/>
      <g font-family="ui-monospace" font-size="12" fill="#eaf2ff" text-anchor="middle">
        <rect x="60" y="40" width="180" height="36" rx="8" fill="url(#g1)" />
        <text x="150" y="63">Edge / CDN</text>
        <line x1="150" y1="76" x2="320" y2="100" stroke="#3aa3ff"/>
        <rect x="320" y="84" width="180" height="36" rx="8" fill="#173055" stroke="#3aa3ff"/>
        <text x="410" y="106">${services[1]}</text>
        <line x1="410" y1="120" x2="520" y2="150" stroke="#3aa3ff"/>
        <rect x="520" y="134" width="180" height="36" rx="8" fill="#173055" stroke="#3aa3ff"/>
        <text x="610" y="156">${services[2]}</text>
      </g>
    </svg>
  `

  $("#bp-output").textContent = lines
  $("#bp-diagram").innerHTML = svg
}

function handleCost(){
  const workloads = parseInt($("#c-workloads").value||"3",10)
  const storageTB = parseFloat($("#c-storage").value||"2")
  const trafficTB = parseFloat($("#c-traffic").value||"5")
  const discount = parseInt($("#c-discount").value||"0",10)
  const provider = $("#c-provider").value

  // super simple model for demo purposes only
  const base = {aws: 2100, azure: 1950, gcp: 1850}[provider] // per workload/month
  const storage = storageTB * {aws:90, azure:80, gcp:75}[provider] // per TB
  const egress = trafficTB * {aws:85, azure:80, gcp:70}[provider]

  let subtotal = workloads*base + storage + egress
  let savings = subtotal * (discount/100)
  let total = subtotal - savings

  const rows = [
    ["Provider", provider.toUpperCase()],
    ["Workloads", workloads],
    ["Storage (TB)", storageTB],
    ["Traffic (TB)", trafficTB],
    ["Subtotal", fmtUSD(Math.round(subtotal))],
    ["Discount", `${discount}% (-${fmtUSD(Math.round(savings))})`],
    ["Est. Monthly Total", fmtUSD(Math.round(total))],
  ]

  const out = rows.map(r=>`${r[0]}: ${r[1]}`).join("\n")
  $("#c-output").textContent = out
}

function handleProposal(){
  const client = $("#p-client").value.trim()||"BrightWave Media"
  const scenario = $("#p-scenario").value.trim()||"Migrate monolith to Azure App Service with managed SQL"
  const goals = $("#p-goals").value.trim()||"Reduce infra costs by 30%, improve reliability, add observability"

  const body = `Executive Proposal — ${client}

Objective
- ${goals}

Recommended Approach
- ${scenario}
- Phased rollout: Assess ➜ Pilot ➜ Migrate ➜ Optimize
- Architecture: Front Door ➜ App Service ➜ Azure SQL ➜ Redis ➜ Monitor

Deliverables
- Architecture blueprint + cost model
- Cutover and rollback plan
- SLOs and dashboards

Timeline
- Week 1–2: Discovery & design
- Week 3–4: Pilot & testing
- Week 5–6: Migration & hardening

Business Impact
- Faster delivery, improved uptime, cost efficiency
`

  $("#p-output").textContent = body
}

document.addEventListener("DOMContentLoaded", ()=>{
  $("#bp-run").addEventListener("click", handleBlueprint)
  $("#c-run").addEventListener("click", handleCost)
  $("#p-run").addEventListener("click", handleProposal)
  handleBlueprint();handleCost();handleProposal();
})
