/* AI 工作流工作台 Demo · 全部为示例数据 */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const IC = {
    bell: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg>',
    filter: '<svg viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
    chev: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
    chevu: '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>',
    scan: '<svg viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/></svg>',
    print: '<svg viewBox="0 0 24 24"><path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    plug: '<svg viewBox="0 0 24 24"><path d="M9 7V3M15 7V3M6 7h12v4a6 6 0 0 1-12 0zM12 17v4"/></svg>',
    redo: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/></svg>',
    dl: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  };
  const notch = (btns, cls = "") => `<div class="notch ${cls}">${btns.map((b) => `<button class="ib sm ${b[1] || ""}" ${b[2] ? `data-act="${b[2]}"` : ""} aria-label="操作">${IC[b[0]]}</button>`).join("")}</div>`;
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2200);
  }
  const now = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ========== 路由 ========== */
  const TITLES = { ov: "工作台", card: "工艺流程卡补制", rpt: "行政统计报表", exc: "ERP 异常提示", erp: "ERP 接入验证" };
  function go(p) {
    document.querySelectorAll("#nav button").forEach((b) => b.classList.toggle("on", b.dataset.p === p));
    document.querySelectorAll(".page").forEach((s) => s.classList.toggle("on", s.id === "p-" + p));
    $("#title").textContent = TITLES[p];
    RENDER[p]();
    try { if (location.hash !== "#" + p) history.replaceState(null, "", "#" + p); } catch (_) {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $("#nav").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) go(b.dataset.p); });
  $("#subtabs").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    document.querySelectorAll("#subtabs button").forEach((x) => x.classList.toggle("on", x === b));
  });
  $("#refresh").addEventListener("click", () => toast("已刷新（示例数据）"));

  /* ========== 总览 ========== */
  function donut(pct) {
    const r = 34, c = 2 * Math.PI * r, a = c * pct;
    return `<svg viewBox="0 0 100 100" width="110" height="110">
      <defs><pattern id="hp" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#2a2a2a"/><rect width="2" height="5" fill="#505050"/></pattern></defs>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="url(#hp)" stroke-width="16"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="#E1FD09" stroke-width="16" stroke-linecap="round" stroke-dasharray="${a - 6} ${c}" transform="rotate(-90 50 50)"/>
      <circle cx="50" cy="50" r="${r - 8}" fill="none" stroke="#0F0F0F" stroke-width="1"/>
    </svg>`;
  }
  function lineChart() {
    const W = 260, H = 150, pts = [[0, 118], [40, 112], [80, 92], [120, 46], [160, 30], [200, 42], [260, 56]];
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2;
      d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    const days = ["11-20", "11-21", "11-22", "11-23", "11-24"];
    return `<svg viewBox="0 0 ${W + 40} ${H + 10}" width="100%" style="max-height:180px">
      ${days.map((t, i) => `<text x="0" y="${14 + i * 30}" fill="#6a6a6a" font-size="9">${t}</text><line x1="34" x2="${W + 40}" y1="${11 + i * 30}" y2="${11 + i * 30}" stroke="#2c2c2c" stroke-dasharray="2 4"/>`).join("")}
      <g transform="translate(36,0)">
        <path d="${d}" fill="none" stroke="#E1FD09" stroke-width="1.6"/>
        <line x1="160" x2="160" y1="30" y2="${H}" stroke="#555"/>
        <circle cx="160" cy="30" r="4.5" fill="#E1FD09" stroke="#0F0F0F" stroke-width="2"/>
        <text x="170" y="24" fill="#fff" font-size="13" font-family="Outfit">1</text><text x="181" y="24" fill="#E1FD09" font-size="8">条待复核</text>
        <rect x="140" y="${H - 18}" width="40" height="14" rx="7" fill="#222"/><text x="160" y="${H - 8}" fill="#999" font-size="8" text-anchor="middle">11-24</text>
      </g></svg>`;
  }
  const WEEK = [["11-18", 3], ["11-19", 4], ["11-20", 5], ["11-21", 2], ["11-22", 1], ["11-23", 3], ["今天", 6]];
  /* 效果试算：示例参数，复谈时带入客户实际件数与计时 */
  const ROI = {
    rate: 45, monthH: 174,
    rows: [
      { n: "流程卡补制", unit: "张", qty: 40, before: 35, after: 8, wk: 9 },
      { n: "行政统计报表", unit: "份", qty: 12, before: 360, after: 60, wk: 3 },
      { n: "ERP 异常排查", unit: "条", qty: 50, before: 40, after: 10, wk: 12 },
    ],
  };
  const roiRow = (r) => Math.max(0, r.qty * (r.before - r.after)) / 60;
  const roiTot = () => ROI.rows.reduce((a, r) => a + roiRow(r), 0);
  const roiWeek = () => ROI.rows.reduce((a, r) => a + Math.max(0, r.wk * (r.before - r.after)) / 60, 0);
  const f1 = (x) => (Math.round(x * 10) / 10).toLocaleString("zh-CN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const wan = (x) => (x >= 10000 ? f1(x / 10000) + " 万" : Math.round(x).toLocaleString("zh-CN"));
  function roiPaint() {
    const t = roiTot(), set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("roi-h", f1(t)); set("roi-fte", f1(t / ROI.monthH)); set("roi-yr", wan(t * ROI.rate * 12));
    set("roi-h2", f1(t)); set("roi-fte2", f1(t / ROI.monthH)); set("roi-mo2", wan(t * ROI.rate)); set("roi-yr2", wan(t * ROI.rate * 12));
    set("roi-wk", f1(roiWeek()));
    ROI.rows.forEach((r, i) => {
      set("roi-r" + i, f1(roiRow(r)));
      const pc = t ? Math.round((roiRow(r) / t) * 100) : 0;
      const pill = document.getElementById("roi-p" + i);
      if (pill) { pill.style.height = 34 + pc * 0.9 + "px"; pill.querySelector("b").textContent = pc + "%"; }
    });
  }
  RENDER_ov = function () {
    const max = 7;
    $("#p-ov").innerHTML = `
    <div class="grid">
      <div class="c9" style="min-width:0">
        <div class="grid">
          <div class="card c4">
            ${notch([["bell"], ["arrow", "", "go:card"]])}
            <h3>近 7 日补卡任务<small>生产部 · 工艺流程卡</small></h3>
            <div class="big num" style="margin:22px 0 18px"><span class="muted" style="font-size:16px">件</span> 12<small>/ 已出卡 9</small></div>
            <div class="hbar"><i style="width:75%"></i></div>
            <div class="days"><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span></div>
          </div>
          <div class="card acidc c4" style="display:flex;flex-direction:column">
            ${notch([["bell"], ["arrow", "acidb", "roi"]], "on-acid")}
            <h3>每月可节省人工<small style="color:#3a4200">试算 · 示例参数，可现场改</small></h3>
            <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:auto;gap:10px;padding-top:10px">
              <div><div class="big num"><span id="roi-h">0</span><small style="color:#333">h</small></div><div style="font-size:11.5px;line-height:1.45;color:#333">≈ <b id="roi-fte">0</b> 名全职文员<br>≈ ¥<b id="roi-yr">0</b> / 年</div></div>
              <div style="display:flex;gap:6px;align-items:flex-end">
                ${ROI.rows.map((r, i) => `<div style="display:grid;justify-items:center;gap:4px"><div id="roi-p${i}" class="pill-col ${i === 1 ? "dark" : "hatch"}" style="height:60px;width:34px;${i === 1 ? "" : "background-color:rgba(0,0,0,.06)"}"><b style="font-weight:500">0%</b></div><span style="font-size:10px;color:#333">${["补卡", "报表", "异常"][i]}</span></div>`).join("")}
              </div>
            </div>
          </div>
          <div class="card c4">
            ${notch([["bell"], ["arrow"]])}
            <h3>AI 识别一次通过率<small>流程卡字段级</small></h3>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px">
              <div class="legend"><span><i class="dot" style="color:var(--acid)"></i>自动通过 86%</span><span><i class="dot" style="color:#666"></i>人工补录 14%</span></div>
              ${donut(0.86)}
            </div>
          </div>
          <div class="card c12">
            ${notch([["filter", "white"], ["cal"], ["arrow"]])}
            <h3>近 7 日完成的工作流</h3>
            <div class="split">
              <div class="bars">${WEEK.map(([d, v], i) => `<div class="b">${i === 6 ? `<span class="tip">${v} 次</span>` : ""}<div class="col ${i === 6 ? "hi" : ""}" style="height:${(v / max) * 100}%"></div><span class="lab">${d}</span></div>`).join("")}</div>
              <div style="display:grid;gap:26px;padding-bottom:22px">
                <div><div class="big num">24<small>次</small></div><div class="muted" style="font-size:11.5px">出卡 9 · 出表 3 · 异常复核 12</div></div>
                <div><div class="num" style="font-size:30px;font-weight:300"><span id="roi-wk">0</span><small class="muted" style="font-size:13px"> h</small></div><div class="muted" style="font-size:11.5px">近 7 日已省人工（按下方试算参数）</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="c3 stack">
        <div class="card">
          ${notch([["arrow", "", "go:exc"]])}
          <h3>异常监控</h3>
          <div class="card in" style="margin-top:14px;padding:14px">
            <div class="row" style="justify-content:space-between"><span style="font-size:13px">旧卡疑似未失效</span><span class="ib sm" style="background:#1a1a1a">${IC.chevu}</span></div>
            ${lineChart()}
          </div>
          <div class="row" style="justify-content:space-between;padding:14px 4px 4px;font-size:13px;color:#ccc"><span>报表合计不符</span><span class="chip bad">1</span></div>
          <div class="row" style="justify-content:space-between;padding:10px 4px 0;font-size:13px;color:#ccc"><span>资料不足待补</span><span class="chip warn">1</span></div>
        </div>
        <div class="card">
          ${notch([["arrow", "", "go:erp"]])}
          <h3>ERP 接入</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px">
            <div class="card in" style="padding:12px;min-height:110px;display:grid;align-content:space-between"><span class="muted" style="font-size:11.5px">读取</span><div><div class="acid" style="font-size:22px">●</div><div style="font-size:12.5px">已联通</div></div></div>
            <div class="card in" style="padding:12px;min-height:110px;display:grid;align-content:space-between"><span class="muted" style="font-size:11.5px">回写</span><div><div style="font-size:22px;color:#555">○</div><div style="font-size:12.5px">未授权</div></div></div>
          </div>
        </div>
      </div>
      <div class="card c12" id="roi">
        ${notch([["arrow"]])}
        <h3>效果试算<small>每件「手工用时」对比「用工作流后用时（含人工核对）」· 数字可直接修改</small></h3>
        <div class="grid" style="margin-top:12px;align-items:start">
          <div class="c8" style="min-width:0"><div class="tblwrap"><table class="tbl roitbl">
            <thead><tr><th>工作</th><th>每月件数</th><th>手工 分钟/件</th><th>用工作流后 分钟/件</th><th class="r">每月节省</th></tr></thead>
            <tbody>${ROI.rows.map((r, i) => `<tr><td>${r.n}</td>
              <td><input class="inp roi-in" data-roi="${i}:qty" value="${r.qty}" inputmode="numeric"> <span class="muted">${r.unit}</span></td>
              <td><input class="inp roi-in" data-roi="${i}:before" value="${r.before}" inputmode="numeric"></td>
              <td><input class="inp roi-in" data-roi="${i}:after" value="${r.after}" inputmode="numeric"></td>
              <td class="r num"><span id="roi-r${i}">0</span> h</td></tr>`).join("")}</tbody></table></div>
            <div class="row" style="margin-top:12px;gap:10px"><span class="muted" style="font-size:12px">人工成本</span><input class="inp roi-in" data-roi="rate" value="${ROI.rate}" style="width:80px"><span class="muted" style="font-size:12px">元 / 小时（含社保，示例）</span></div>
          </div>
          <div class="c4"><div class="card in" style="padding:18px;display:grid;gap:14px">
            <div><div class="muted" style="font-size:12px">每月节省</div><div class="num" style="font-size:34px;font-weight:300"><span id="roi-h2">0</span><small class="muted" style="font-size:13px"> h</small></div></div>
            <div class="row" style="gap:22px"><div><div class="muted" style="font-size:12px">折合人力</div><div class="num acid" style="font-size:22px"><span id="roi-fte2">0</span> 人</div></div><div><div class="muted" style="font-size:12px">每月</div><div class="num" style="font-size:22px">¥<span id="roi-mo2">0</span></div></div><div><div class="muted" style="font-size:12px">每年</div><div class="num" style="font-size:22px">¥<span id="roi-yr2">0</span></div></div></div>
            <div class="muted" style="font-size:11.5px;line-height:1.6">示例参数仅供演示。请带入贵厂实际件数和计时；正式结论以试点期同任务前后计时（AC-07）并经部门负责人确认为准。按每人每月 ${ROI.monthH} 小时折算。</div>
          </div></div>
        </div>
      </div>
      <div class="card c12">
        ${notch([["filter"], ["arrow"]])}
        <h3>工作流队列</h3>
        <div class="tblwrap" style="margin-top:10px"><table class="tbl">
          <thead><tr><th>任务</th><th>类型</th><th>关联</th><th>经办人</th><th>当前环节</th><th>状态</th><th class="r">更新</th></tr></thead>
          <tbody>
            ${[
              ["T-1124-07", "流程卡补制", "MO-20261118-042", "王敏（生产文员）", "核对补录", ["warn", "待核对 2 项"], "09:41", "card"],
              ["R-2610-GS", "统计报表", "10 月车间工时统计", "陈静（行政统计）", "待查项处理", ["bad", "合计不符"], "09:20", "rpt"],
              ["E-1124-03", "异常复核", "GY-2611-0387", "李工（生产主管）", "等待判定", ["warn", "待复核"], "09:12", "exc"],
              ["T-1124-03", "流程卡补制", "MO-20261115-017", "王敏（生产文员）", "打印核对", ["warn", "结果未知"], "08:55", "card"],
              ["T-1124-05", "流程卡补制", "MO-20261120-008", "王敏（生产文员）", "提交来源", ["dim", "待补资料"], "昨天", "card"],
              ["T-1123-11", "流程卡补制", "MO-20261117-031", "王敏（生产文员）", "出卡登记", ["ok", "已出卡"], "昨天", "card"],
            ].map((r) => `<tr class="click" data-act="go:${r[7]}"><td class="num" style="font-weight:400">${r[0]}</td><td>${r[1]}</td><td class="muted">${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td><span class="chip ${r[5][0]}" style="height:24px">${r[5][1]}</span></td><td class="r muted">${r[6]}</td></tr>`).join("")}
          </tbody></table></div>
      </div>
    </div>`;
    roiPaint();
  };
  var RENDER_ov;

  /* ========== B-01 流程卡补制 ========== */
  const STEPS = ["提交来源", "AI 识别", "核对补录", "打印预览", "出卡登记"];
  const FIELDS0 = [
    { k: "原卡号", v: "GY-2611-0387", wo: "GY-2611-0387", c: 0.97 },
    { k: "工单号", v: "MO-20261118-042", wo: "MO-20261118-042", c: 0.99 },
    { k: "产品编号", v: "P-3305-A", wo: "P-3305-A", c: 0.98 },
    { k: "产品名称", v: "法兰盘 DN80", wo: "法兰盘 DN80", c: 0.95 },
    { k: "材质", v: "45# 钢", wo: "45# 钢", c: 0.93 },
    { k: "批次", v: "B261118-03", wo: "B261118-03", c: 0.71 },
    { k: "数量", v: "102", wo: "120", c: 0.64, req: 1 },
    { k: "工序1 下料 · 操作者", v: "赵强", wo: "—", c: 0.9 },
    { k: "工序2 粗车 · 操作者", v: "孙立", wo: "—", c: 0.88 },
    { k: "工序3 热处理 · 操作者", v: "", wo: "—", c: 0.0, req: 1 },
    { k: "工序4 精车 · 合格数", v: "118", wo: "—", c: 0.86 },
  ];
  const card = {
    step: 0, src: "wo", fields: JSON.parse(JSON.stringify(FIELDS0)), rule: "new", print: null,
    log: [["09:31", "a", "王敏 创建补卡任务 T-1124-07（原卡遗失登记 L-1121-02）"]],
  };
  function fStatus(f) {
    if (f.req && !String(f.v).trim()) return ["bad", "必填缺失"];
    if (f.wo !== "—" && String(f.v).trim() !== f.wo) return ["bad", "与工单冲突"];
    if (f.c && f.c < 0.75 && !f.touched) return ["warn", "低置信度"];
    return ["ok", f.touched ? "已补录" : "一致"];
  }
  const blockers = () => card.fields.filter((f) => fStatus(f)[0] === "bad").length;
  const newNo = () => (card.rule === "new" ? "GY-2611-0387-B1" : "GY-2611-0387");
  function paper() {
    const bad = (k) => { const f = card.fields.find((x) => x.k === k); const s = fStatus(f)[0]; return s === "bad" ? "mark" : s === "warn" ? "mark w" : ""; };
    return `<div class="scan"><div class="paper"><div class="stain"></div>
      <h4>工艺流程卡（副本）</h4>
      <table>
        <tr><th>卡号</th><td class="hw">GY-2611-0387</td><th>工单号</th><td class="hw">MO-20261118-042</td></tr>
        <tr><th>产品编号</th><td class="hw">P-3305-A</td><th>名称</th><td class="hw">法兰盘 DN80</td></tr>
        <tr><th>材质</th><td class="hw">45# 钢</td><th>批次</th><td class="hw"><span class="${bad("批次")}">B26111<span class="blur">8</span>-03</span></td></tr>
        <tr><th>数量</th><td class="hw"><span class="${bad("数量")}">1<span class="blur">2</span>0 → 102?</span></td><th>交期</th><td class="hw">11-29</td></tr>
      </table>
      <table style="margin-top:8px">
        <tr><th>序</th><th>工序</th><th>操作者</th><th>日期</th><th>合格</th></tr>
        <tr><td>1</td><td>下料</td><td class="hw">赵强</td><td class="hw">11-18</td><td class="hw">120</td></tr>
        <tr><td>2</td><td>粗车</td><td class="hw">孙立</td><td class="hw">11-19</td><td class="hw">120</td></tr>
        <tr><td>3</td><td>热处理</td><td class="hw"><span class="${bad("工序3 热处理 · 操作者")} blur">周▇▇</span></td><td class="hw">11-20</td><td class="hw">120</td></tr>
        <tr><td>4</td><td>精车</td><td class="hw">刘洋</td><td class="hw">11-22</td><td class="hw">118</td></tr>
        <tr><td>5</td><td>钻孔</td><td></td><td></td><td></td></tr>
      </table></div>
      <div class="row" style="margin-top:14px;font-size:11.5px;color:#999"><span class="chip dim" style="height:24px">扫描件 S-0387 · 工单副本</span><span class="chip dim" style="height:24px">300dpi</span><span class="sp"></span><span><span style="color:var(--bad)">■</span> 冲突/缺失 <span style="color:var(--warn);margin-left:6px">■</span> 低置信度</span></div>
    </div>`;
  }
  function printCard() {
    const v = (k) => esc(card.fields.find((f) => f.k === k).v);
    return `<div class="print">
      <div style="display:flex;justify-content:space-between;align-items:flex-start"><div class="barcode"></div><span class="stamp">补 制</span></div>
      <h4 style="margin-top:8px">工 艺 流 程 卡</h4>
      <div class="meta"><span>卡号 <b>${newNo()}</b></span><span>模板 QP-07 v3（示例）</span><span>补制 2026-11-24</span></div>
      <table>
        <tr><th>工单号</th><td>${v("工单号")}</td><th>产品编号</th><td>${v("产品编号")}</td></tr>
        <tr><th>产品名称</th><td>${v("产品名称")}</td><th>材质</th><td>${v("材质")}</td></tr>
        <tr><th>批次</th><td>${v("批次")}</td><th>数量</th><td>${v("数量")}</td></tr>
      </table>
      <table style="margin-top:8px">
        <tr><th>序</th><th>工序</th><th>操作者</th><th>合格数</th><th>检验</th></tr>
        <tr><td>1</td><td>下料</td><td>${v("工序1 下料 · 操作者")}</td><td>120</td><td>✓</td></tr>
        <tr><td>2</td><td>粗车</td><td>${v("工序2 粗车 · 操作者")}</td><td>120</td><td>✓</td></tr>
        <tr><td>3</td><td>热处理</td><td>${v("工序3 热处理 · 操作者")}</td><td>120</td><td>✓</td></tr>
        <tr><td>4</td><td>精车</td><td>刘洋</td><td>${v("工序4 精车 · 合格数")}</td><td>✓</td></tr>
        <tr><td>5</td><td>钻孔</td><td></td><td></td><td></td></tr>
        <tr><td>6</td><td>终检入库</td><td></td><td></td><td></td></tr>
      </table>
      <div style="font-size:10px;color:#555;margin-top:8px">补制依据：工单副本 + 扫描件 S-0387 · 原卡 GY-2611-0387 遗失登记 L-1121-02 · 经办 王敏</div>
    </div>`;
  }
  function stepBody() {
    const s = card.step;
    if (s === 0) return `
      <div class="grid">
        <div class="c6">${paper()}</div>
        <div class="c6" style="display:grid;gap:14px;align-content:start">
          <p class="sec-t">补卡任务 T-1124-07</p>
          <dl class="kv"><dt>工单</dt><dd>MO-20261118-042 · 法兰盘 DN80 · 120 件</dd><dt>原卡</dt><dd>GY-2611-0387 <span class="chip bad" style="height:22px">已登记遗失</span></dd><dt>遗失登记</dt><dd>L-1121-02 · 11-21 精车工位</dd><dt>模板</dt><dd>QP-07 工艺流程卡 v3（客户批准版）</dd></dl>
          <div class="field">补制来源（原卡已丢，扫描哪份材料）
            <div class="seg" id="srcSeg">${[["wo", "工单副本"], ["copy", "原卡复印件"], ["photo", "工位照片"]].map(([k, t]) => `<button data-act="src:${k}" class="${card.src === k ? "on" : ""}">${t}</button>`).join("")}</div>
          </div>
          <div class="banner">${IC.shield}<span>缺少可信来源时任务会暂存为「待补资料」，不会出卡。</span></div>
          <div class="row"><button class="btn acidb" data-act="recog">${IC.scan}开始 AI 识别</button><span class="muted" style="font-size:12px">识别后逐字段与 ERP 工单比对</span></div>
        </div>
      </div>`;
    if (s === 1) return `
      <div class="grid"><div class="c6">${paper()}</div>
        <div class="c6"><p class="sec-t">AI 识别中…</p><div class="pipe" id="pipe">
          ${["版面定位与纠偏", "表格结构识别", "手写字段识别", "映射到模板 QP-07 v3", "与 ERP 工单 MO-20261118-042 比对"].map((t) => `<div class="p"><i></i>${t}</div>`).join("")}
        </div></div></div>`;
    if (s === 2) {
      const n = blockers();
      return `
      <div class="grid">
        <div class="c5">${paper()}</div>
        <div class="c7" style="display:grid;gap:12px;align-content:start">
          <div class="row"><p class="sec-t" style="margin:0">识别结果 · 逐字段核对</p><span class="sp"></span>${n ? `<span class="chip bad">${n} 项需处理</span><button class="btn sm line" style="height:28px;margin-left:8px" data-act="autofix">演示：一键补齐</button>` : `<span class="chip ok">全部通过</span>`}</div>
          <div class="tblwrap"><table class="tbl ftbl">
            <thead><tr><th>字段</th><th style="min-width:130px">识别值（可改）</th><th>置信度</th><th>ERP 工单</th><th>状态</th></tr></thead>
            <tbody>${card.fields.map((f, i) => {
              const st = fStatus(f);
              const col = f.c >= 0.85 ? "var(--acid)" : f.c >= 0.7 ? "var(--warn)" : "var(--bad)";
              return `<tr class="${st[0] === "bad" ? "bad" : ""}"><td style="white-space:nowrap">${f.k}${f.req ? ' <span class="acid">*</span>' : ""}</td>
                <td class="v"><input data-fi="${i}" value="${esc(f.v)}" placeholder="无法识别，请补录"></td>
                <td><span class="conf" style="--w:${f.c * 100}%;--c:${col}"><i></i>${f.c ? Math.round(f.c * 100) + "%" : "—"}</span></td>
                <td class="muted">${f.wo}${st[1] === "与工单冲突" ? ` <button class="btn sm line" style="height:22px;padding:0 8px;margin-left:4px" data-act="usewo:${i}">采用</button>` : ""}</td>
                <td><span class="chip ${st[0]}" style="height:22px;font-size:11px">${st[1]}</span></td></tr>`;
            }).join("")}</tbody></table></div>
          <div class="row" style="margin-top:4px">
            <span class="muted" style="font-size:12px">卡号规则</span>
            <div class="seg">${[["new", "新发补卡号"], ["keep", "沿用原卡号"]].map(([k, t]) => `<button data-act="rule:${k}" class="${card.rule === k ? "on" : ""}">${t}</button>`).join("")}</div>
            <span class="muted" style="font-size:12px">→ <b style="color:#fff" class="num">${newNo()}</b></span>
            <span class="sp"></span>
            <button class="btn acidb" data-act="topreview" ${n ? "disabled" : ""}>生成打印预览</button>
          </div>
        </div>
      </div>`;
    }
    if (s === 3) {
      const p = card.print;
      let act = `<button class="btn acidb" data-act="doprint">${IC.print}确认并打印</button>`;
      if (p === "printing") act = `<div class="pipe"><div class="p run"><i></i>已发送至打印机，等待回执…</div></div>`;
      if (p === "unknown") act = `<div class="banner" style="border-color:var(--warn)">${IC.shield}<span><b style="color:var(--warn)">打印机未返回结果。</b>任务已保留，请先到打印机核对是否出纸，再决定是否补打。</span></div>
        <div class="row"><button class="btn white" data-act="pr:ok">已出纸，结果正常</button><button class="btn line" data-act="pr:re">${IC.redo}未出纸，补打</button></div>`;
      return `
      <div class="grid">
        <div class="c6"><div style="background:#2a2a2a;border-radius:16px;padding:22px">${printCard()}</div></div>
        <div class="c6" style="display:grid;gap:14px;align-content:start">
          <p class="sec-t">打印设置</p>
          <div class="grid" style="gap:10px">
            <label class="field c6">打印机<select class="inp"><option>车间 2F · 标签机 ZT410（示例）</option><option>生产办 · A4 激光</option></select></label>
            <label class="field c6">纸型<select class="inp"><option>A5 横向 · 卡纸</option><option>A4</option></select></label>
          </div>
          <dl class="kv"><dt>出卡卡号</dt><dd class="num">${newNo()}</dd><dt>对应任务</dt><dd>T-1124-07 · 工单 MO-20261118-042</dd><dt>补制依据</dt><dd>工单副本 + 扫描件 S-0387</dd><dt>补录字段</dt><dd>${card.fields.filter((f) => f.touched).map((f) => f.k).join("、") || "无"}</dd></dl>
          ${act}
          <button class="btn line sm" style="justify-self:start" data-act="back2">返回核对</button>
        </div>
      </div>`;
    }
    return `
      <div class="grid">
        <div class="c6"><div style="background:#2a2a2a;border-radius:16px;padding:22px;opacity:.9">${printCard()}</div></div>
        <div class="c6" style="display:grid;gap:14px;align-content:start">
          <div class="row"><span class="chip ok"><span class="dot"></span>已出卡</span><span class="muted" style="font-size:12px">一次任务 · 一张有效补卡</span></div>
          <dl class="kv"><dt>出卡</dt><dd class="num">${newNo()}</dd><dt>任务</dt><dd>T-1124-07</dd><dt>打印</dt><dd>${card.reprinted ? "首次结果未知 → 核对未出纸 → 补打 1 次（沿用原任务）" : "1 次，正常"}</dd><dt>经办</dt><dd>王敏 · ${now()}</dd></dl>
          <div class="card in" style="padding:16px">
            <div style="font-size:13px;margin-bottom:6px">⚠ 发现疑似旧卡关系</div>
            <div class="muted" style="font-size:12px">原卡 GY-2611-0387 在 ERP 中仍为「有效」，与新出补卡同挂一个工单。是否失效由业务负责人判定。</div>
            <div class="row" style="margin-top:12px"><button class="btn acidb sm" data-act="go:exc">移交异常复核</button><button class="btn line sm" data-act="restart">再做一张（重置演示）</button></div>
          </div>
        </div>
      </div>`;
  }
  RENDER_card = function () {
    const s = card.step;
    $("#p-card").innerHTML = `
      <div class="steps" style="margin-bottom:14px">${STEPS.map((t, i) => `<div class="s ${i < s ? "done" : i === s ? "cur" : ""}"><b>${i < s ? "✓" : i + 1}</b>${t}</div>`).join("")}</div>
      <div class="grid">
        <div class="c3 stack">
          <div class="card">
            ${notch([["filter"]])}
            <h3>补卡任务队列<small>生产文员 · 王敏</small></h3>
            <div class="list" style="margin-top:14px">
              ${[
                ["T-1124-07", "法兰盘 DN80 · 120 件", s >= 4 ? ["ok", "已出卡"] : ["warn", "进行中"], 1],
                ["T-1124-05", "轴套 φ40 · 原卡与工单均缺", ["dim", "待补资料"]],
                ["T-1124-03", "端盖 C2 · 回执超时", ["warn", "打印结果未知"]],
                ["T-1123-11", "导向座 · 60 件", ["ok", "已出卡"]],
              ].map((r) => `<div class="li ${r[3] ? "on" : ""}" data-act="${r[3] ? "" : "demoonly"}"><div style="flex:1;min-width:0"><div class="t num" style="font-weight:400">${r[0]}</div><div class="d">${r[1]}</div></div><span class="chip ${r[2][0]}" style="height:22px;font-size:11px">${r[2][1]}</span></div>`).join("")}
            </div>
          </div>
          <div class="card">
            <h3>操作记录</h3>
            <div class="tl" style="margin-top:10px">${card.log.slice().reverse().map((e) => `<div class="e"><span class="tm">${e[0]}</span><span class="nd ${e[1]}"></span><span>${e[2]}</span></div>`).join("")}</div>
          </div>
        </div>
        <div class="card c9">
          ${notch([["print"], ["arrow"]])}
          <h3>${STEPS[s]}<small>模板 QP-07 v3 · 工单 MO-20261118-042</small></h3>
          <div style="margin-top:16px">${stepBody()}</div>
        </div>
      </div>`;
  };
  var RENDER_card;
  const logC = (t, k = "a") => card.log.push([now(), k, t]);

  /* ========== B-02 统计报表 ========== */
  const SHOPS = [
    // 车间, 人数, 出勤人天, v1计件, v2计件, 加班
    ["机加车间", 38, 836, 2148.0, 2140.0, 212.5],
    ["热处理车间", 12, 262, 612.5, 617.0, 48.0],
    ["装配车间", 30, 655, 1320.0, 1320.0, 96.0],
    ["质检组", 9, 198, 486.0, 486.0, 20.0],
  ];
  const MANUAL = 4563.0;
  const SRC = [
    [1, "10-08", "J0312", "何磊", "机加车间", "精车", "8.0"],
    [2, "10-08", "J0315", "钱峰", "机加车间", "钻孔", "7.5"],
    [3, "10-09", "J0312", "何磊", "机加车间", "精车", "8.0", "dup0"],
    [4, "10-09", "J0312", "何磊", "机加车间", "精车", "8.0", "dup"],
    [5, "10-09", "R0107", "周涛", "热处理车间", "淬火", "8.0"],
    [6, "10-10", "R0109", "吴凯", "热处理车间", "回火", "", "miss"],
    [7, "10-10", "A0521", "郑雪", "装配车间", "总装", "8.0"],
    [8, "10-10", "Q0033", "冯楠", "质检组", "终检", "6.0"],
  ];
  const rpt = { running: false, versions: [], cur: -1, sel: 0, fix1: false, fix2: false, fix2v: "4.5" };
  function rptIssues() {
    return [
      { id: 0, t: "重复记录", lvl: "bad", d: "源数据第 3、4 行：同工号 J0312、同日期 10-09、同工序「精车」各 8.0h", eff: "机加车间 · 计件工时 +8.0h", rows: [3, 4], fixed: rpt.fix1 },
      { id: 1, t: "工时缺项", lvl: "warn", d: "源数据第 6 行：R0109 吴凯 10-10「回火」工时为空，按口径不补零", eff: "热处理车间 · 计件工时 −4.5h（人工台账值）", rows: [6], fixed: rpt.fix2 },
      { id: 2, t: "合计不符", lvl: "bad", d: "本次合计 4,566.5h，人工核定 4,563.0h，差 +3.5h，可由上两项解释", eff: "报表合计", rows: [3, 4, 6], fixed: rpt.fix1 && rpt.fix2 },
    ];
  }
  function shopChart(vi) {
    const vals = SHOPS.map((s) => (vi === 1 ? s[4] : s[3]));
    const mx = Math.max(...vals);
    return `<div class="bars" style="height:180px">${SHOPS.map((s, i) => `<div class="b">${vals[i] === mx ? `<span class="tip">${vals[i].toFixed(1)}h</span>` : ""}<div class="col ${vals[i] === mx ? "hi" : ""}" style="height:${(vals[i] / mx) * 100}%;max-width:70px"></div><span class="lab">${s[0]}</span></div>`).join("")}</div>`;
  }
  RENDER_rpt = function () {
    const v = rpt.cur >= 0 ? rpt.versions[rpt.cur] : null;
    const vi = v ? v.vi : 0;
    const iss = rptIssues();
    const total = SHOPS.reduce((a, s) => a + (vi === 1 ? s[4] : s[3]), 0);
    const diff = total - MANUAL;
    const selRows = v && vi === 0 ? iss[rpt.sel].rows : [];
    $("#p-rpt").innerHTML = `
    <div class="grid">
      <div class="card c12">
        ${notch([["cal"], ["arrow"]])}
        <h3>报表任务<small>行政统计 · 陈静</small></h3>
        <div class="grid" style="margin-top:14px;align-items:end">
          <label class="field c3">报表<select class="inp"><option>车间月度工时统计表</option><option>行政考勤汇总</option><option>物料领用月报</option></select></label>
          <label class="field c3">统计期间<select class="inp"><option>2026-10（10-01 ~ 10-31）</option><option>2026-09</option></select></label>
          <label class="field c3">数据版本<select class="inp"><option>ERP 报工导出 v3 · 11-20 18:02</option><option>ERP 报工导出 v2 · 11-15</option></select></label>
          <div class="c3 row" style="justify-content:flex-end">
            <button class="btn acidb" data-act="rgen" ${rpt.running ? "disabled" : ""}>${IC.play}${v ? "重新生成" : "生成报表"}</button>
          </div>
        </div>
        <div class="row" style="margin-top:14px;gap:8px">
          <span class="chip line">口径 · 去重键：工号 + 日期 + 工序</span><span class="chip line">缺失：不补零，列为待查</span><span class="chip line">单位：小时，保留 1 位</span><span class="chip line">对照：人工核定 10 月表</span>
        </div>
      </div>

      ${rpt.running || !v ? `
      <div class="card c12" style="min-height:220px">
        <h3>${rpt.running ? "生成中" : "尚未生成"}</h3>
        ${rpt.running ? `<div class="pipe" id="rpipe" style="margin-top:16px;max-width:420px">${["读取 ERP 导出 v3（1,284 行）", "按口径去重 / 校验缺项", "按车间汇总", "与人工核定值比对", "输出报表与待查清单"].map((t) => `<div class="p"><i></i>${t}</div>`).join("")}</div>` : `<p class="muted" style="margin-top:14px">选择报表、期间和数据版本后点击「生成报表」。固定计算规则由程序执行，AI 仅用于解释差异与识别非结构化输入。</p>`}
      </div>` : `
      <div class="c8 stack">
        <div class="card">
          ${notch([["dl", "white", "export"], ["arrow"]])}
          <h3>车间月度工时统计表 · 2026-10<small>版本 ${v.name} · 生成于 ${v.at} · 源：ERP 报工导出 v3</small></h3>
          <div class="grid" style="margin-top:6px;align-items:end">
            <div class="c8">${shopChart(vi)}</div>
            <div class="c4" style="display:grid;gap:16px;padding-bottom:24px">
              <div><div class="big num">${total.toLocaleString("en-US", { minimumFractionDigits: 1 })}<small>h</small></div><div class="muted" style="font-size:11.5px">计件工时合计</div></div>
              <div><div class="num" style="font-size:24px;${Math.abs(diff) < 0.05 ? "color:var(--acid)" : "color:var(--bad)"}">${Math.abs(diff) < 0.05 ? "✓ 0.0" : (diff > 0 ? "+" : "") + diff.toFixed(1)}<small class="muted" style="font-size:12px"> h</small></div><div class="muted" style="font-size:11.5px">对照人工核定 4,563.0h</div></div>
            </div>
          </div>
          <div class="tblwrap"><table class="tbl">
            <thead><tr><th>车间</th><th class="r">人数</th><th class="r">出勤人天</th><th class="r">计件工时</th><th class="r">加班工时</th><th class="r">人均工时</th><th class="r">人工核定</th></tr></thead>
            <tbody>${SHOPS.map((s) => { const val = vi === 1 ? s[4] : s[3]; const ok = val === s[4]; return `<tr class="${ok ? "" : "bad"}"><td>${s[0]}</td><td class="r num">${s[1]}</td><td class="r num">${s[2]}</td><td class="r num" style="${ok ? "" : "color:var(--bad)"}">${val.toFixed(1)}</td><td class="r num">${s[5].toFixed(1)}</td><td class="r num">${(val / s[1]).toFixed(1)}</td><td class="r num muted">${s[4].toFixed(1)}</td></tr>`; }).join("")}
            <tr><td><b>合计</b></td><td class="r num">89</td><td class="r num">1,951</td><td class="r num"><b>${total.toFixed(1)}</b></td><td class="r num">376.5</td><td class="r num">${(total / 89).toFixed(1)}</td><td class="r num muted">${MANUAL.toFixed(1)}</td></tr></tbody></table></div>
        </div>
        <div class="card">
          <h3>源数据定位<small>共 1,284 行，仅显示与待查项相关的行</small></h3>
          <div class="tblwrap" style="margin-top:10px"><table class="tbl">
            <thead><tr><th>行</th><th>日期</th><th>工号</th><th>姓名</th><th>车间</th><th>工序</th><th class="r">工时</th><th>说明</th></tr></thead>
            <tbody>${SRC.map((r) => {
              const hl = selRows.includes(r[0]);
              let note = "";
              if (r[7] === "dup") note = rpt.fix1 ? '<span class="chip ok" style="height:22px">已按口径剔除</span>' : '<span class="chip bad" style="height:22px">与第 3 行重复</span>';
              if (r[7] === "miss") note = rpt.fix2 ? '<span class="chip ok" style="height:22px">已补录 4.5</span>' : '<span class="chip warn" style="height:22px">缺工时</span>';
              const val = r[7] === "miss" && rpt.fix2 ? rpt.fix2v : r[6];
              return `<tr class="${hl ? "hl" : ""}" style="${r[7] === "dup" && rpt.fix1 ? "opacity:.45;text-decoration:line-through" : ""}"><td class="num muted">${r[0]}</td><td>${r[1]}</td><td class="num">${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td class="r num">${val || '<span style="color:var(--bad)">—</span>'}</td><td>${note}</td></tr>`;
            }).join("")}</tbody></table></div>
        </div>
      </div>
      <div class="c4 stack">
        <div class="card ${vi === 1 ? "acidc" : ""}">
          ${notch([["bell"]], vi === 1 ? "on-acid" : "")}
          <h3>待查项</h3>
          ${vi === 1 ? `<div class="big num" style="margin:18px 0 6px">0</div><div style="font-size:12.5px;color:#222">更正后结果与人工核定值一致，可提交给现接收人（行政主管）。</div><div class="row" style="margin-top:14px"><button class="btn sm" style="background:#111;color:var(--acid)" data-act="submit">提交报表</button></div>` : `
          <div class="list" style="margin-top:14px">${iss.map((it) => `<div class="issue ${rpt.sel === it.id ? "on" : ""}" data-act="rsel:${it.id}">
            <div class="t"><span class="chip ${it.fixed ? "ok" : it.lvl}" style="height:22px;font-size:11px">${it.fixed ? "已处理" : it.lvl === "bad" ? "需更正" : "需补录"}</span><span>${it.t}</span></div>
            <div class="d">${it.d}</div><div class="d">影响：<span style="color:#ddd">${it.eff}</span></div>
            ${it.id === 0 && !rpt.fix1 ? `<button class="btn sm line" style="justify-self:start" data-act="fix1">按去重口径剔除第 4 行</button>` : ""}
            ${it.id === 1 && !rpt.fix2 ? `<div class="row"><input class="inp" style="height:30px;width:80px;background:#141414;border-color:#3a3a3a" id="fix2v" value="4.5"><button class="btn sm line" data-act="fix2">按台账补录</button></div>` : ""}
          </div>`).join("")}</div>
          ${rpt.fix1 && rpt.fix2 ? `<button class="btn acidb" style="margin-top:12px;width:100%" data-act="rgen">${IC.redo}资料已更正，重新生成</button>` : ""}`}
        </div>
        <div class="card">
          <h3>版本记录</h3>
          <div class="tl" style="margin-top:10px">${rpt.versions.slice().reverse().map((x) => `<div class="e"><span class="tm">${x.at}</span><span class="nd ${x.vi ? "a" : "r"}"></span><span><b class="num" style="font-weight:500">${x.name}</b> · ${x.vi ? "与人工核定一致" : "3 项待查，合计差 +3.5h"}</span></div>`).join("")}</div>
        </div>
      </div>`}
    </div>`;
  };
  var RENDER_rpt;

  /* ========== B-03 异常提示 ========== */
  const exc = { ex: "A", decision: null, note: "", q: "MO-20261118-042" };
  function relGraph() {
    const A = exc.ex === "A";
    const node = (x, y, w, t, s, st) => `<g transform="translate(${x},${y})"><rect width="${w}" height="54" rx="14" fill="${st === "hi" ? "#E1FD09" : st === "bad" ? "#2a1b17" : "#282828"}" stroke="${st === "bad" ? "#FF6B4A" : "none"}"/><text x="14" y="23" font-size="12.5" fill="${st === "hi" ? "#111" : "#fff"}" font-family="Outfit, sans-serif">${t}</text><text x="14" y="40" font-size="10.5" fill="${st === "hi" ? "#333" : "#999"}">${s}</text></g>`;
    const link = (x1, y1, x2, y2, dash) => `<path d="M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}" fill="none" stroke="${dash ? "#FF6B4A" : "#555"}" stroke-width="1.5" ${dash ? 'stroke-dasharray="4 4"' : ""}/>`;
    if (A) return `<svg viewBox="0 0 640 250" width="100%">
      ${link(170, 125, 240, 55)}${link(170, 125, 240, 195)}${link(420, 55, 480, 55, 1)}${link(420, 195, 480, 195)}${link(330, 82, 330, 168, 1)}
      ${node(10, 98, 160, "MO-20261118-042", "工单 · 法兰盘 120 件")}
      ${node(240, 28, 180, "GY-2611-0387", "原卡 · 实体已遗失 · ERP 有效", "bad")}
      ${node(240, 168, 180, "GY-2611-0387-B1", "补卡 · 11-24 出卡", "hi")}
      ${node(480, 28, 150, "R-88213 精车报工", "11-22 · 挂原卡 118 件", "bad")}
      ${node(480, 168, 150, "R-88240 精车报工", "11-24 · 挂补卡 118 件")}
      <text x="338" y="130" font-size="10.5" fill="#FF6B4A">同工序重复计数？</text>
    </svg>`;
    return `<svg viewBox="0 0 640 250" width="100%">
      ${link(170, 125, 240, 55)}${link(170, 125, 240, 195)}${link(420, 55, 480, 55)}${link(420, 195, 480, 195)}
      ${node(10, 98, 160, "MO-20261118-043", "工单 · 法兰盘 120 件")}
      ${node(240, 28, 180, "GY-2611-0401", "分批卡 1/2 · 60 件 · 有效")}
      ${node(240, 168, 180, "GY-2611-0402", "分批卡 2/2 · 60 件 · 有效")}
      ${node(480, 28, 150, "R-88301 粗车", "11-23 · 60 件")}
      ${node(480, 168, 150, "R-88317 粗车", "11-23 · 60 件")}
      <text x="250" y="130" font-size="10.5" fill="#E1FD09">数量合计 = 工单 120，工序记录不重叠</text>
    </svg>`;
  }
  RENDER_exc = function () {
    const A = exc.ex === "A";
    const recs = A
      ? [["GY-2611-0387", "B261118-03", 120, "精车 · 11-22", "有效", ["bad", "疑似应失效"]], ["GY-2611-0387-B1", "B261118-03", 120, "精车 · 11-24", "有效", ["ok", "补卡"]]]
      : [["GY-2611-0401", "B261118-04", 60, "粗车 · 11-23", "有效", ["ok", "正常分批"]], ["GY-2611-0402", "B261118-05", 60, "粗车 · 11-23", "有效", ["ok", "正常分批"]]];
    const D = { ok: "已确认", no: "已排除", lack: "资料不足" };
    $("#p-exc").innerHTML = `
    <div class="grid">
      <div class="card c12">
        <div class="row">
          <select class="inp" style="width:110px"><option>工单号</option><option>卡号</option><option>批次</option></select>
          <input class="inp" style="flex:1;min-width:180px" id="excq" value="${esc(exc.q)}">
          <button class="btn acidb" data-act="excq">${IC.search}检索</button>
          <span class="sp"></span>
          <div class="seg">${[["A", "样本 A：旧卡 + 补卡"], ["B", "样本 B：正常多卡"]].map(([k, t]) => `<button data-act="ex:${k}" class="${exc.ex === k ? "on" : ""}">${t}</button>`).join("")}</div>
        </div>
        <div class="banner" style="margin-top:12px">${IC.shield}<span><b class="acid">只读模式</b> · 仅提示与记录判定，不回写 ERP。是否回写、由谁审批，待客户信息部门确认。</span></div>
      </div>
      <div class="c8 stack">
        <div class="card">
          ${notch([["arrow"]])}
          <h3>关联关系<small>${A ? "MO-20261118-042" : "MO-20261118-043"} · 同一产品号 P-3305-A</small></h3>
          <div style="margin-top:12px;overflow-x:auto"><div style="min-width:520px">${relGraph()}</div></div>
        </div>
        <div class="card">
          <h3>卡记录</h3>
          <div class="tblwrap" style="margin-top:10px"><table class="tbl">
            <thead><tr><th>卡号</th><th>批次</th><th class="r">数量</th><th>最近报工</th><th>ERP 状态</th><th>判定</th></tr></thead>
            <tbody>${recs.map((r) => `<tr class="${r[5][0] === "bad" ? "bad" : ""}"><td class="num">${r[0]}</td><td class="num">${r[1]}</td><td class="r num">${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td><span class="chip ${r[5][0]}" style="height:22px;font-size:11px">${r[5][1]}</span></td></tr>`).join("")}</tbody>
          </table></div>
        </div>
      </div>
      <div class="c4 stack">
        ${A ? `
        <div class="card">
          ${notch([["bell"]])}
          <h3>疑似问题 E-1124-03</h3>
          <div style="margin-top:12px;display:grid;gap:10px;font-size:12.5px">
            <div style="font-size:14px">原卡已遗失，但 ERP 中仍为有效，且 11-22 有报工挂在原卡上</div>
            <div><div class="sec-t" style="margin:0 0 4px">判定依据</div>
              <div class="list">${["遗失登记 L-1121-02（11-21 精车工位）", "补卡任务 T-1124-07 已出卡 GY-2611-0387-B1", "报工 R-88213 与 R-88240 同工序、同数量 118"].map((t) => `<div class="li" style="cursor:default;padding:9px 12px"><span class="d" style="color:#ddd">${t}</span></div>`).join("")}</div></div>
            <div><div class="sec-t" style="margin:0 0 4px">影响字段</div><div class="row" style="gap:6px"><span class="chip bad">有效卡数</span><span class="chip bad">精车完工数（可能重复 118）</span><span class="chip warn">在制库存</span></div></div>
            <div class="muted" style="font-size:11.5px">提示：首尾工序数据较可信，不能仅凭中间报工推定真实库存。</div>
          </div>
        </div>
        <div class="card ${exc.decision === "ok" ? "acidc" : ""}">
          ${exc.decision === "ok" ? notch([["arrow", "acidb"]], "on-acid") : ""}
          <h3>复核决定<small ${exc.decision === "ok" ? 'style="color:#333"' : ""}>复核人 · 李工（生产主管）</small></h3>
          ${exc.decision ? `<div class="big num" style="margin:16px 0 8px;font-size:30px">${D[exc.decision]}</div>
            <div style="font-size:12.5px">${exc.decision === "ok" ? "已记录。原卡失效需由获授权人员在 ERP 内手工处理，本工具不回写。" : exc.decision === "no" ? "已记录为非问题，同类关系后续将降低提示等级。" : "已退回补资料：请提供 11-22 精车实物交接记录。"}</div>
            ${exc.note ? `<div style="font-size:12px;margin-top:6px;opacity:.8">备注：${esc(exc.note)}</div>` : ""}
            <button class="btn sm ${exc.decision === "ok" ? "" : "line"}" style="margin-top:12px;${exc.decision === "ok" ? "background:#111;color:var(--acid)" : ""}" data-act="dreset">撤回</button>` : `
            <textarea class="inp" id="dnote" rows="2" style="width:100%;margin-top:12px" placeholder="备注（可选）"></textarea>
            <div class="row" style="margin-top:10px"><button class="btn acidb sm" data-act="dec:ok">已确认</button><button class="btn sm" data-act="dec:no">已排除</button><button class="btn sm line" data-act="dec:lack">资料不足</button></div>`}
        </div>` : `
        <div class="card acidc">
          ${notch([["arrow", "acidb"]], "on-acid")}
          <h3>未发现异常</h3>
          <div class="big num" style="margin:16px 0 8px">0</div>
          <div style="font-size:12.5px">同一工单下两张卡为正常分批：数量合计等于工单数量，工序记录不重叠。<br><br><b>同一产品号不足以判定重复。</b></div>
        </div>
        <div class="card"><h3>判定规则（待客户确认）</h3>
          <div class="list" style="margin-top:12px">${["遗失登记后仍有报工挂原卡 → 提示", "同工单多卡、数量合计 > 工单数量 → 提示", "同工序、同数量、跨卡重复报工 → 提示", "分批卡数量合计 = 工单数量 → 不提示"].map((t) => `<div class="li" style="cursor:default;padding:9px 12px"><span class="d" style="color:#ddd">${t}</span></div>`).join("")}</div>
        </div>`}
      </div>
      <div class="card c12">
        ${notch([["filter"], ["arrow"]])}
        <h3>异常清单</h3>
        <div class="tblwrap" style="margin-top:10px"><table class="tbl">
          <thead><tr><th>编号</th><th>类型</th><th>定位</th><th>来源</th><th>状态</th></tr></thead>
          <tbody>${[
            ["E-1124-03", "旧卡疑似未失效", "GY-2611-0387", "补卡 T-1124-07", exc.decision ? ["ok", D[exc.decision]] : ["warn", "待复核"]],
            ["E-1124-02", "报表合计不符", "10 月工时表 · 源行 3/4/6", "报表 R-2610-GS", rpt.versions.some((x) => x.vi) ? ["ok", "已更正"] : ["bad", "待更正"]],
            ["E-1123-09", "跨卡重复报工", "R-87990 / R-88002", "ERP 巡检", ["dim", "资料不足"]],
            ["E-1123-04", "补卡数量与工单不符", "GY-2611-0355-B1", "补卡 T-1122-02", ["ok", "已排除"]],
          ].map((r) => `<tr><td class="num">${r[0]}</td><td>${r[1]}</td><td class="muted">${r[2]}</td><td>${r[3]}</td><td><span class="chip ${r[4][0]}" style="height:22px;font-size:11px">${r[4][1]}</span></td></tr>`).join("")}</tbody></table></div>
      </div>
    </div>`;
  };
  var RENDER_exc;

  /* ========== B-04 ERP 接入 ========== */
  const CHECKS = [
    ["网络连通", "内网代理 → ERP 应用服务器", "ok"],
    ["测试账号认证", "ai_readonly_test · 只读角色", "ok"],
    ["读取工单", "MO 表 · 抽样 50 条 · 字段 12/12", "ok"],
    ["读取工艺流程卡", "卡主表 + 工序明细 · 抽样 50 条", "ok"],
    ["读取报工记录", "报工表 · 近 30 天 · 1,284 行", "ok"],
    ["读取限权字段：成本单价", "应被拦截 · 预期结果", "lock"],
    ["数据更新时间", "报工表最晚延迟约 15 分钟", "ok"],
    ["回写流程卡状态", "未授权 · 需另评审批、留痕与回退", "no"],
  ];
  const erp = { st: CHECKS.map(() => null), running: false, cut: false, log: [] };
  const logE = (t, k = "a") => erp.log.push([now(), k, t]);
  RENDER_erp = function () {
    const done = erp.st.filter((x) => x === "ok" || x === "lock" || x === "no").length;
    $("#p-erp").innerHTML = `
    <div class="grid">
      <div class="card c5 ${done === CHECKS.length ? "" : ""}">
        ${notch([["plug"], ["arrow"]])}
        <h3>连接信息<small>由客户信息部门提供（待核实）</small></h3>
        <dl class="kv" style="margin-top:16px">
          <dt>系统</dt><dd>信诺尔 ERP（版本待核实）</dd><dt>环境</dt><dd>测试库 · 脱敏样本</dd><dt>账号</dt><dd class="num">ai_readonly_test</dd><dt>角色</dt><dd>只读 · 生产 / 行政</dd><dt>访问方式</dt><dd>数据库只读视图 / 导出文件（二选一待定）</dd><dt>模型环境</dt><dd>待确认：本地部署 或 外部模型</dd>
        </dl>
        <div style="margin:18px 0 8px" class="row"><span class="big num">${done}</span><span class="muted">/ ${CHECKS.length} 项已验证</span></div>
        <div class="hbar"><i style="width:${(done / CHECKS.length) * 100}%"></i></div>
        <div class="row" style="margin-top:16px">
          ${erp.cut ? `<button class="btn acidb" data-act="erpgo">${IC.redo}恢复并继续</button>` : `<button class="btn acidb" data-act="erpgo" ${erp.running ? "disabled" : ""}>${IC.play}${done ? "重新验证" : "运行接入验证"}</button>`}
          <button class="btn line" data-act="erpcut" ${erp.running ? "" : "disabled"}>模拟断线</button>
        </div>
      </div>
      <div class="card c7">
        ${notch([["filter"]])}
        <h3>验证清单<small>每一步单独记结论：加载样本 ≠ 插件联通</small></h3>
        <div style="margin-top:8px">${CHECKS.map((c, i) => {
          const s = erp.st[i];
          const ic = s === "ok" ? '<span class="ic ok">✓</span>' : s === "lock" ? '<span class="ic lock">🔒</span>' : s === "no" ? '<span class="ic no">✕</span>' : s === "run" ? '<span class="ic run"></span>' : s === "fail" ? '<span class="ic no">!</span>' : `<span class="ic">${i + 1}</span>`;
          const tag = s === "ok" ? '<span class="chip ok" style="height:22px;font-size:11px">通过</span>' : s === "lock" ? '<span class="chip warn" style="height:22px;font-size:11px">已拦截</span>' : s === "no" ? '<span class="chip dim" style="height:22px;font-size:11px">未授权</span>' : s === "fail" ? '<span class="chip bad" style="height:22px;font-size:11px">连接中断</span>' : "";
          return `<div class="check">${ic}<div>${c[0]}<small>${c[1]}</small></div>${tag}</div>`;
        }).join("")}</div>
      </div>
      <div class="card c7">
        ${notch([["arrow"]])}
        <h3>AI 插件形态示意<small>在 ERP 内以侧边栏运行，读当前选中记录</small></h3>
        <div class="erp" style="margin-top:14px">
          <div class="main">
            <div class="bar">信诺尔 ERP · 生产管理 › 工艺流程卡</div>
            <div class="menu"><span>文件</span><span>编辑</span><span>查询</span><span>报表</span><span>工具</span></div>
            <div style="padding:8px">
              <table><tr><th>卡号</th><th>工单号</th><th>产品</th><th>数量</th><th>状态</th></tr>
                <tr><td>GY-2611-0385</td><td>MO-20261118-040</td><td>轴套 φ40</td><td>80</td><td>在制</td></tr>
                <tr class="sel"><td>GY-2611-0387</td><td>MO-20261118-042</td><td>法兰盘 DN80</td><td>120</td><td>有效</td></tr>
                <tr><td>GY-2611-0387-B1</td><td>MO-20261118-042</td><td>法兰盘 DN80</td><td>120</td><td>有效</td></tr>
                <tr><td>GY-2611-0401</td><td>MO-20261118-043</td><td>法兰盘 DN80</td><td>60</td><td>在制</td></tr>
                <tr><td>GY-2611-0402</td><td>MO-20261118-043</td><td>法兰盘 DN80</td><td>60</td><td>在制</td></tr>
              </table>
            </div>
          </div>
          <div class="plug">
            <div class="row" style="gap:6px"><span class="mini-tag">AI 助手</span><span class="muted" style="font-size:11px">只读</span></div>
            <div class="msg me">这张卡有问题吗？</div>
            <div class="msg">GY-2611-0387 已于 11-21 登记遗失，补卡 -B1 今日已出卡，但原卡仍为「有效」，且 11-22 有精车报工挂在原卡上。<br><span class="acid">建议移交复核 →</span></div>
            <div class="row" style="gap:6px"><button class="btn sm acidb" data-act="go:exc">打开复核</button><button class="btn sm" data-act="go:card">补卡</button></div>
          </div>
        </div>
      </div>
      <div class="card c5">
        <h3>字段映射<small>抽样核对 · 读写能力</small></h3>
        <div class="tblwrap" style="margin-top:10px"><table class="tbl">
          <thead><tr><th>ERP 字段</th><th>含义</th><th>读</th><th>写</th></tr></thead>
          <tbody>${[
            ["CARD.CARD_NO", "流程卡号", "✓", "—"], ["CARD.MO_NO", "工单号", "✓", "—"], ["CARD.STATUS", "卡状态", "✓", "待评"], ["CARD.LOST_FLAG", "遗失标记", "✓", "—"],
            ["RPT.WORK_HRS", "报工工时", "✓", "—"], ["RPT.OPER_CODE", "工序", "✓", "—"], ["ITEM.COST_PRICE", "成本单价", "🔒", "—"],
          ].map((r) => `<tr><td class="num" style="font-size:11.5px">${r[0]}</td><td>${r[1]}</td><td class="${r[2] === "✓" ? "acid" : ""}">${r[2]}</td><td class="muted">${r[3]}</td></tr>`).join("")}</tbody></table></div>
      </div>
      <div class="card c12">
        <h3>访问记录</h3>
        <div class="tl" style="margin-top:10px">${erp.log.length ? erp.log.slice().reverse().map((e) => `<div class="e"><span class="tm">${e[0]}</span><span class="nd ${e[1]}"></span><span>${e[2]}</span></div>`).join("") : '<span class="muted" style="font-size:12.5px">尚未运行验证。</span>'}</div>
      </div>
    </div>`;
  };
  var RENDER_erp;
  async function runErp() {
    if (erp.running) return;
    if (!erp.cut) { erp.st = CHECKS.map(() => null); erp.log = []; logE("以 ai_readonly_test 开始接入验证"); }
    else { logE("连接恢复，从第 " + (erp.st.findIndex((x) => x === "fail") + 1) + " 步继续，保留已完成步骤", "a"); }
    erp.cut = false; erp.running = true;
    for (let i = 0; i < CHECKS.length; i++) {
      if (erp.st[i] && erp.st[i] !== "fail") continue;
      erp.st[i] = "run"; RENDER_erp();
      await sleep(650);
      if (erp.cutReq) { erp.cutReq = false; erp.st[i] = "fail"; erp.cut = true; erp.running = false; logE("第 " + (i + 1) + " 步「" + CHECKS[i][0] + "」连接中断，已完成步骤已保留", "r"); RENDER_erp(); return; }
      erp.st[i] = CHECKS[i][2];
      logE(CHECKS[i][0] + " · " + (CHECKS[i][2] === "ok" ? "通过" : CHECKS[i][2] === "lock" ? "按预期拦截，字段未展示" : "未授权，记入评估项"), CHECKS[i][2] === "ok" ? "a" : "y");
      RENDER_erp();
    }
    erp.running = false; logE("验证完成：读取可用，回写未授权"); RENDER_erp();
  }

  const RENDER = { ov: () => RENDER_ov(), card: () => RENDER_card(), rpt: () => RENDER_rpt(), exc: () => RENDER_exc(), erp: () => RENDER_erp() };

  /* ========== 事件 ========== */
  document.addEventListener("input", (e) => {
    const i = e.target.dataset && e.target.dataset.fi;
    if (i != null) {
      const f = card.fields[+i]; f.v = e.target.value; f.touched = true;
      const tr = e.target.closest("tr"); const st = fStatus(f);
      tr.className = st[0] === "bad" ? "bad" : "";
      tr.lastElementChild.innerHTML = `<span class="chip ${st[0]}" style="height:22px;font-size:11px">${st[1]}</span>`;
      const n = blockers();
      const btn = document.querySelector('[data-act="topreview"]'); if (btn) btn.disabled = !!n;
    }
  });
  document.addEventListener("input", (e) => {
    const k = e.target.dataset && e.target.dataset.roi; if (!k) return;
    const v = parseFloat(e.target.value); const n = isFinite(v) && v >= 0 ? v : 0;
    if (k === "rate") ROI.rate = n; else { const [i, f] = k.split(":"); ROI.rows[+i][f] = n; }
    roiPaint();
  });
  document.addEventListener("change", (e) => { if (e.target.dataset && e.target.dataset.fi != null) RENDER_card(); });
  document.addEventListener("click", async (e) => {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const [a, arg] = el.dataset.act.split(":");
    switch (a) {
      case "go": go(arg); break;
      case "demoonly": toast("演示仅开放 T-1124-07"); break;
      case "src": card.src = arg; RENDER_card(); break;
      case "recog": {
        logC("提交来源：" + { wo: "工单副本", copy: "原卡复印件", photo: "工位照片" }[card.src] + "，开始 AI 识别");
        card.step = 1; RENDER_card();
        const ps = document.querySelectorAll("#pipe .p");
        for (const p of ps) { p.classList.add("run"); await sleep(420); p.classList.remove("run"); p.classList.add("done"); }
        await sleep(250);
        logC("识别完成：11 个字段，2 项冲突/缺失，1 项低置信度", "y");
        card.step = 2; RENDER_card(); break;
      }
      case "usewo": { const f = card.fields[+arg]; f.v = f.wo; f.touched = true; logC("「" + f.k + "」采用工单值 " + f.wo); RENDER_card(); break; }
      case "rule": card.rule = arg; RENDER_card(); break;
      case "autofix": {
        card.fields.forEach((f) => {
          const st = fStatus(f)[0];
          if (st === "ok") return;
          if (f.wo !== "—" && String(f.v).trim() !== f.wo) { f.v = f.wo; f.touched = true; logC("「" + f.k + "」采用工单值 " + f.wo); }
          else if (f.req && !String(f.v).trim()) { f.v = "周凯"; f.touched = true; logC("「" + f.k + "」按热处理记录补录：周凯"); }
          else { f.touched = true; logC("「" + f.k + "」人工确认识别值 " + f.v); }
        });
        RENDER_card(); break;
      }
      case "roi": { const el = document.getElementById("roi"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); break; }
      case "topreview": logC("核对通过，卡号规则：" + (card.rule === "new" ? "新发" : "沿用") + " " + newNo()); card.step = 3; card.print = null; RENDER_card(); break;
      case "back2": card.step = 2; RENDER_card(); break;
      case "doprint":
        card.print = "printing"; logC("发送打印：" + newNo()); RENDER_card();
        await sleep(1500);
        card.print = "unknown"; logC("打印机未返回结果，任务保留待核对", "y"); RENDER_card(); break;
      case "pr":
        if (arg === "ok") { logC("经办人核对：已出纸，结果正常"); card.step = 4; card.print = "done"; RENDER_card(); }
        else {
          card.print = "printing"; card.reprinted = true; logC("核对未出纸 → 补打（沿用任务 T-1124-07，不新增有效卡）", "y"); RENDER_card();
          await sleep(1300); logC("补打完成，出卡登记 " + newNo()); card.step = 4; card.print = "done"; RENDER_card();
        }
        break;
      case "restart":
        card.step = 0; card.fields = JSON.parse(JSON.stringify(FIELDS0)); card.print = null; card.reprinted = false;
        card.log = [["09:31", "a", "王敏 创建补卡任务 T-1124-07（原卡遗失登记 L-1121-02）"]]; RENDER_card(); break;
      case "rgen": {
        rpt.running = true; RENDER_rpt();
        const ps = document.querySelectorAll("#rpipe .p");
        for (const p of ps) { p.classList.add("run"); await sleep(380); p.classList.remove("run"); p.classList.add("done"); }
        await sleep(200);
        const vi = rpt.fix1 && rpt.fix2 ? 1 : 0;
        rpt.versions.push({ name: "v" + (rpt.versions.length + 1), at: now(), vi });
        rpt.cur = rpt.versions.length - 1; rpt.running = false; rpt.sel = 0; RENDER_rpt(); break;
      }
      case "rsel": rpt.sel = +arg; RENDER_rpt(); break;
      case "fix1": rpt.fix1 = true; toast("第 4 行已按去重口径剔除"); RENDER_rpt(); break;
      case "fix2": rpt.fix2v = ($("#fix2v") || {}).value || "4.5"; rpt.fix2 = true; toast("第 6 行已按台账补录"); RENDER_rpt(); break;
      case "export": toast("已导出 车间月度工时统计表_2026-10_" + (rpt.versions[rpt.cur] || {}).name + ".xlsx（演示）"); break;
      case "submit": toast("已提交至行政主管（演示）"); break;
      case "ex": exc.ex = arg; exc.q = arg === "A" ? "MO-20261118-042" : "MO-20261118-043"; RENDER_exc(); break;
      case "excq": { const q = ($("#excq").value || "").trim(); exc.q = q; exc.ex = /043|040[12]/.test(q) ? "B" : "A"; RENDER_exc(); toast("检索完成：2 条卡记录"); break; }
      case "dec": exc.note = ($("#dnote") || {}).value || ""; exc.decision = arg; RENDER_exc(); break;
      case "dreset": exc.decision = null; exc.note = ""; RENDER_exc(); break;
      case "erpgo": runErp(); break;
      case "erpcut": if (erp.running) erp.cutReq = true; break;
    }
  });

  window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (TITLES[h]) go(h); });
  const start = (location.hash || "").slice(1);
  go(TITLES[start] ? start : "ov");
})();
