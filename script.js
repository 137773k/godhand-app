const form = document.querySelector("#scoreForm");
const stockForm = document.querySelector("#stockForm");
const saveReview = document.querySelector("#saveReview");
const watchlistBody = document.querySelector("#watchlistBody");
const historyList = document.querySelector("#historyList");
const fetchHotStocks = document.querySelector("#fetchHotStocks");
const selectedStocks = document.querySelector("#selectedStocks");
const rejectedStocks = document.querySelector("#rejectedStocks");
const hotConcepts = document.querySelector("#hotConcepts");
const publicDataUrl = window.PUBLIC_DATA_URL || "";

const state = {
  watchlist: JSON.parse(localStorage.getItem("shortModelWatchlist") || "[]"),
  history: JSON.parse(localStorage.getItem("shortModelHistory") || "[]"),
};

function value(name) {
  return Number(new FormData(form).get(name));
}

function weighted(parts) {
  return Math.round(parts.reduce((sum, [score, weight]) => sum + score * weight, 0));
}

function getScores() {
  const regime = weighted([
    [value("indexTrend"), 0.3],
    [value("marketBreadth"), 0.25],
    [value("emotion"), 0.25],
    [value("volume"), 0.2],
  ]);

  const sector = weighted([
    [value("relativeStrength"), 0.35],
    [value("leaderDepth"), 0.2],
    [value("continuity"), 0.15],
    [value("sectorVolume"), 0.15],
    [value("catalyst"), 0.15],
  ]);

  const stock = weighted([
    [value("position"), 0.25],
    [value("pattern"), 0.2],
    [value("stockStrength"), 0.2],
    [value("liquidity"), 0.15],
    [100 - value("crowding"), 0.1],
    [value("catalyst"), 0.1],
  ]);

  const total = Math.round(regime * 0.4 + sector * 0.32 + stock * 0.28);
  return { regime, sector, stock, total };
}

function cycleName(score) {
  if (score >= 75) return "主升";
  if (score >= 60) return "轮动";
  if (score >= 45) return "修复";
  return "退潮";
}

function positionByCycle(cycle) {
  const map = {
    主升: "80%-100%",
    轮动: "40%-60%",
    修复: "20%-40%",
    退潮: "0%",
  };
  return map[cycle];
}

function styleByScores({ regime, sector, stock }) {
  if (regime < 45) return "空仓防守";
  if (regime >= 75 && sector >= 70) return "主线龙头首次分歧";
  if (sector >= 65 && stock >= 70) return "回流第一强";
  if (regime < 60 && stock >= 78) return "抱团核心试错";
  return "等待确认";
}

function actionByScores(scores) {
  const cycle = cycleName(scores.regime);
  if (cycle === "退潮") return "不开新仓";
  if (scores.sector < 55) return "方向不够强";
  if (scores.stock < 65) return "只观察核心";
  if (cycle === "修复") return "小仓试错";
  if (cycle === "轮动") return "半仓做回流";
  return "核心仓位进攻";
}

function strategyByScores(scores) {
  const cycle = cycleName(scores.regime);
  const style = styleByScores(scores);
  const action = actionByScores(scores);

  if (cycle === "退潮") {
    return "当前按退潮处理，优先观察亏钱效应是否收敛。不开新仓，只记录高标反馈、跌停扩散和次日修复强度。";
  }

  if (action === "方向不够强") {
    return "市场有一定修复，但板块承接不足。明日不追后排，只等最强方向出现回流确认。";
  }

  if (style === "主线龙头首次分歧") {
    return "明日只盯主线核心，买点限制在首次分歧转强或回踩关键位不破；不及预期、板块回流失败、龙头转弱即退出。";
  }

  if (style === "回流第一强") {
    return "明日按轮动回流处理，只做资金认可方向里的第一强。高开过多不追，回流失败或后排先掉队则降低仓位。";
  }

  if (style === "抱团核心试错") {
    return "明日只允许小仓试错抱团核心，不能扩散到后排。若情绪无法继续抱团，次日直接撤退。";
  }

  return "明日等待确认信号，重点观察指数修复、活跃板块承接和核心票是否给出弱转强。";
}

function updateView() {
  const scores = getScores();
  const cycle = cycleName(scores.regime);
  const style = styleByScores(scores);
  const action = actionByScores(scores);

  document.querySelector("#totalScore").textContent = scores.total;
  document.querySelector("#regimeLabel").textContent = cycle;
  document.querySelector("#positionLabel").textContent = positionByCycle(cycle);
  document.querySelector("#styleLabel").textContent = style;
  document.querySelector("#cycleResult").textContent = `${cycle} ${scores.regime}`;
  document.querySelector("#sectorResult").textContent = scores.sector;
  document.querySelector("#stockResult").textContent = scores.stock;
  document.querySelector("#actionResult").textContent = action;
  document.querySelector("#strategyText").textContent = strategyByScores(scores);
}

function persist() {
  localStorage.setItem("shortModelWatchlist", JSON.stringify(state.watchlist));
  localStorage.setItem("shortModelHistory", JSON.stringify(state.history));
}

function renderWatchlist() {
  if (!state.watchlist.length) {
    watchlistBody.innerHTML = `<tr><td colspan="5">还没有标的，先把核心票加入池子。</td></tr>`;
    return;
  }

  watchlistBody.innerHTML = state.watchlist
    .map(
      (item, index) => `
        <tr>
          <td><strong>${item.stockName}</strong></td>
          <td>${item.sectorName}</td>
          <td>${item.role}</td>
          <td>${item.plan || "待补充"}</td>
          <td><button class="delete-btn" data-delete="${index}" type="button">删除</button></td>
        </tr>
      `,
    )
    .join("");
}

function renderHistory() {
  if (!state.history.length) {
    historyList.innerHTML = `<div class="history-card"><div><span>暂无记录</span><strong>保存今日复盘后会显示在这里。</strong></div></div>`;
    return;
  }

  historyList.innerHTML = state.history
    .slice()
    .reverse()
    .map(
      (item) => `
        <article class="history-card">
          <div><span>日期</span><strong>${item.date}</strong></div>
          <div><span>周期</span><strong>${item.cycle}</strong></div>
          <div><span>综合分</span><strong>${item.total}</strong></div>
          <div><span>打法</span><strong>${item.style}</strong></div>
          <div><span>动作</span><strong>${item.action}</strong></div>
        </article>
      `,
    )
    .join("");
}

function formatNumber(value) {
  if (!Number.isFinite(Number(value))) return "--";
  return Number(value).toFixed(2);
}

function formatTime(iso) {
  if (!iso) return "--";
  return new Date(iso).toLocaleString("zh-CN", { hour12: false });
}

function stockCard(stock, rejected = false) {
  const reasons = rejected && stock.rejects.length ? stock.rejects : stock.reasons;
  const reasonHtml = reasons.length
    ? reasons.map((reason) => `<li>${reason}</li>`).join("")
    : "<li>热度不足或缺少明确板块共振，暂不进入核心池。</li>";
  const backtest = stock.backtest;
  const backtestHtml = backtest
    ? `<div class="stock-backtest">
        <div class="stock-backtest-head">
          <strong>倒退回测：${backtest.summary.verdict}</strong>
          <span>${backtest.mode} · 样本 ${backtest.summary.sampleCount}</span>
        </div>
        <div class="stock-backtest-metrics">
          <span>次日胜率 ${backtest.summary.winRate1d}%</span>
          <span>次日均收 ${formatNumber(backtest.summary.avgNextClose)}%</span>
          <span>三日最高 ${formatNumber(backtest.summary.avgMax3d)}%</span>
          <span>最深回撤 ${formatNumber(backtest.summary.worstDrawdown)}%</span>
        </div>
        <p>${backtest.summary.note}</p>
        ${
          backtest.cases.length
            ? `<div class="backtest-cases">
                ${backtest.cases
                  .slice(0, 3)
                  .map(
                    (item) => `
                      <span>${item.date} · ${item.type} · 次日${formatNumber(item.nextClosePct)}% · 三日${formatNumber(item.max3dPct)}%</span>
                    `,
                  )
                  .join("")}
              </div>`
            : ""
        }
      </div>`
    : "";

  return `
    <article class="stock-pick-card ${rejected ? "rejected" : ""}">
      <div class="stock-pick-head">
        <div>
          <h4>${stock.name || "--"} <small>${stock.code} · ${stock.board}</small></h4>
        </div>
        <div class="score-badge">${stock.score}</div>
      </div>
      <div class="stock-tags">
        <span class="role-tag">${stock.role || "角色待定"}</span>
        <span class="type-tag">${stock.ticketType || "票型待定"}</span>
        <span>${stock.setup}</span>
        <span>${stock.mainConcept || "未归类"}</span>
        <span>${stock.klineProfile ? stock.klineProfile.wave : "形态未知"}</span>
        <span>涨跌 ${formatNumber(stock.changePct)}%</span>
        <span>换手 ${formatNumber(stock.turnoverRate)}%</span>
        <span>多单 ${stock.gamePlan ? stock.gamePlan.longStrength : "--"}</span>
        <span>热榜 ${stock.combinedRank}</span>
      </div>
      <ul class="reason-list">${reasonHtml}</ul>
      ${backtestHtml}
      ${
        stock.gamePlan
          ? `<div class="game-plan ${stock.gamePlan.canGame ? "can-game" : ""}">
              <div class="game-plan-head">
                <strong>${stock.gamePlan.decision}</strong>
                <span>多单强度 ${stock.gamePlan.longStrength}/100</span>
              </div>
              <p>${stock.gamePlan.gameReason}</p>
              <p>${stock.gamePlan.sectorLine}</p>
              <p>${stock.gamePlan.preferenceLine}</p>
              <p>${stock.gamePlan.priceLine}</p>
              <p>${stock.gamePlan.longLine}</p>
              <p>${stock.gamePlan.holderLine}</p>
            </div>`
          : ""
      }
      ${
        stock.tradePlan
          ? `<div class="trade-plan">
              <div><span>买点</span><p>${stock.tradePlan.buy}</p></div>
              <div><span>次日</span><p>${stock.tradePlan.nextDay}</p></div>
              <div><span>卖点</span><p>${stock.tradePlan.sell}</p></div>
              <div><span>风险</span><p>${stock.tradePlan.risk}</p></div>
            </div>`
          : ""
      }
      ${
        rejected
          ? ""
          : `<button class="primary-btn add-pick-btn" data-code="${stock.code}" type="button">加入核心标的池</button>`
      }
    </article>
  `;
}

function renderMarketState(market) {
  const snapshot = market.snapshot;
  const state = market.state;
  const external = market.externalRisk;
  document.querySelector("#marketCycle").textContent = state.cycle;
  document.querySelector("#marketOperation").textContent = state.operation;
  document.querySelector("#marketAmount").textContent = `${snapshot.shszAmountYi} 亿`;
  document.querySelector("#marketBreadth").textContent = `${snapshot.upCount}/${snapshot.downCount}`;
  document.querySelector("#marketScore").textContent = state.marketScore;
  document.querySelector("#marketPosition").textContent = state.position;
  document.querySelector("#tradingStyle").textContent = market.tradingStyle.style;
  document.querySelector("#tradingPreference").textContent = market.tradingStyle.preference;
  document.querySelector("#tradingBias").textContent = market.tradingStyle.bias;
  document.querySelector("#marketSummary").textContent = `${state.summary.join("；")}。当前先按“${state.operation}”处理，入选阈值 ${state.minScore} 分。`;

  document.querySelector("#externalLevel").textContent = `${external.level} · 风险${external.risk} · 扣${external.penalty}`;
  document.querySelector("#externalIndexes").innerHTML = external.indexes.length
    ? external.indexes
        .map(
          (item) => `
            <div>
              <span>${item.name}</span>
              <strong>${formatNumber(item.changePct)}%</strong>
            </div>
          `,
        )
        .join("")
    : `<div><span>外部指数</span><strong>暂无数据</strong></div>`;
  document.querySelector("#externalReasons").innerHTML = external.reasons
    .map((reason) => `<span>${reason}</span>`)
    .join("");
}

function renderStyleAnalysis(analysis) {
  const conclusion = document.querySelector("#styleAnalysisConclusion");
  const reverseLogic = document.querySelector("#styleReverseLogic");
  const profitLocation = document.querySelector("#profitLocation");
  const profitContinuity = document.querySelector("#profitContinuity");
  const profitCases = document.querySelector("#profitCases");
  const continuityReasons = document.querySelector("#continuityReasons");

  if (!analysis) {
    conclusion.textContent = "等待抓取";
    reverseLogic.innerHTML = `<div>倒推路径：先看赚钱效应在哪里，再看载体，再看能否持续，最后决定选股方案。</div>`;
    profitLocation.textContent = "--";
    profitContinuity.textContent = "--";
    profitCases.innerHTML = "";
    continuityReasons.innerHTML = "";
    return;
  }

  conclusion.textContent = analysis.conclusion;
  profitLocation.textContent = analysis.profitEffect.location;
  profitContinuity.textContent = analysis.profitEffect.continuity;
  reverseLogic.innerHTML = analysis.reverseLogic.map((item, index) => `<div><span>${index + 1}</span><p>${item}</p></div>`).join("");
  profitCases.innerHTML = analysis.examples.length
    ? analysis.examples
        .map(
          (item) => `
            <article class="profit-case">
              <div class="profit-case-head">
                <strong>${item.name}</strong>
                <span>${item.effectType}</span>
              </div>
              <div class="profit-case-tags">
                <span>${item.code}</span>
                <span>${item.role}</span>
                <span>${item.ticketType}</span>
                <span>${item.concept}</span>
              </div>
              <p>${item.reason}</p>
              <div class="profit-case-metrics">
                <span>涨跌 ${formatNumber(item.changePct)}%</span>
                <span>形态 ${item.wave}</span>
                <span>多单 ${item.longStrength}</span>
              </div>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">暂无足够清晰的赚钱效应案例。</div>`;
  continuityReasons.innerHTML = analysis.profitEffect.continuityReasons
    .map((reason) => `<span>${reason}</span>`)
    .join("");
}

function renderBacktestSummary(payload) {
  const all = [...payload.selected, ...payload.rejected].filter((stock) => stock.backtest);
  const tested = all.filter((stock) => stock.backtest.summary.sampleCount > 0);
  const label = document.querySelector("#backtestSummaryLabel");
  const samples = document.querySelector("#btSamples");
  const winRate = document.querySelector("#btWinRate");
  const avgClose = document.querySelector("#btAvgClose");
  const avgMax = document.querySelector("#btAvgMax");
  const note = document.querySelector("#backtestNote");

  if (!tested.length) {
    label.textContent = "样本不足";
    samples.textContent = "0";
    winRate.textContent = "--";
    avgClose.textContent = "--";
    avgMax.textContent = "--";
    note.textContent = "近180日没有找到足够多的相似触发点，回测不作为加分项。";
    return;
  }

  const totalSamples = tested.reduce((sum, stock) => sum + stock.backtest.summary.sampleCount, 0);
  const avgWinRate = tested.reduce((sum, stock) => sum + stock.backtest.summary.winRate1d, 0) / tested.length;
  const close = tested.reduce((sum, stock) => sum + stock.backtest.summary.avgNextClose, 0) / tested.length;
  const max = tested.reduce((sum, stock) => sum + stock.backtest.summary.avgMax3d, 0) / tested.length;
  const strongCount = tested.filter((stock) => ["历史有效", "可验证"].includes(stock.backtest.summary.verdict)).length;

  const poolCount = tested.filter((stock) => stock.backtest.mode === "同类模式池").length;
  label.textContent = strongCount ? `${strongCount}/${tested.length} 只通过验证` : "整体偏弱";
  samples.textContent = totalSamples;
  winRate.textContent = `${Math.round(avgWinRate)}%`;
  avgClose.textContent = `${formatNumber(close)}%`;
  avgMax.textContent = `${formatNumber(max)}%`;
  note.textContent = `用当前风格偏好倒推近180日相似触发点；其中${poolCount}只因单股样本不足，采用同类模式池。若回测偏弱，只能降低预期，不能因为热度高就硬做。`;
}

function renderHotStocks(payload) {
  document.querySelector("#hotUpdatedAt").textContent = formatTime(payload.updatedAt);
  document.querySelector("#eastCount").textContent = `${payload.sources.eastmoney} 只`;
  document.querySelector("#thsCount").textContent = `${payload.sources.ths} 只`;
  renderMarketState(payload.market);
  renderStyleAnalysis(payload.market.tradingStyle.analysis);
  renderBacktestSummary(payload);

  hotConcepts.innerHTML = payload.hotConcepts.length
    ? payload.hotConcepts
        .map((item) => {
          const sectorText = item.sector ? `${item.sector.name} ${formatNumber(item.sector.changePct)}%` : "无板块匹配";
          return `<span>${item.resonance ? "共振" : "未共振"} · ${item.name} · ${item.count}只 · 热${item.heatScore} / 共${item.resonanceScore} · ${sectorText}</span>`;
        })
        .join("")
    : "<span>暂无方向聚集</span>";

  selectedStocks.dataset.payload = JSON.stringify(payload.selected);
  selectedStocks.innerHTML = payload.selected.length
    ? payload.selected.map((stock) => stockCard(stock)).join("")
    : `<div class="empty-state">当前热榜没有符合框架的核心候选，按模型应继续等待。</div>`;

  rejectedStocks.innerHTML = payload.rejected.length
    ? payload.rejected.map((stock) => stockCard(stock, true)).join("")
    : `<div class="empty-state">暂无剔除项。</div>`;
}

async function loadHotStocks() {
  fetchHotStocks.disabled = true;
  fetchHotStocks.textContent = "抓取中...";
  selectedStocks.innerHTML = `<div class="empty-state">正在抓取东方财富和同花顺热榜，并按你的框架筛选。</div>`;
  rejectedStocks.innerHTML = "";

  try {
    let payload = null;
    let lastError = null;
    for (const url of ["/api/hot-stocks", publicDataUrl].filter(Boolean)) {
      try {
        const response = await fetch(url, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || data.error || "抓取失败");
        payload = data;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!payload) throw lastError || new Error("抓取失败");
    renderHotStocks(payload);
  } catch (error) {
    selectedStocks.innerHTML = `<div class="empty-state">抓取失败：${error.message}</div>`;
  } finally {
    fetchHotStocks.disabled = false;
    fetchHotStocks.textContent = "抓取并筛选";
  }
}

form.addEventListener("input", updateView);

stockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(stockForm).entries());
  state.watchlist.push(data);
  persist();
  renderWatchlist();
  stockForm.reset();
});

watchlistBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  state.watchlist.splice(Number(button.dataset.delete), 1);
  persist();
  renderWatchlist();
});

selectedStocks.addEventListener("click", (event) => {
  const button = event.target.closest("[data-code]");
  if (!button) return;

  const picks = JSON.parse(selectedStocks.dataset.payload || "[]");
  const stock = picks.find((item) => item.code === button.dataset.code);
  if (!stock) return;

  state.watchlist.push({
    stockName: `${stock.name} ${stock.code}`,
    sectorName: stock.mainConcept,
    role: `${stock.role || "角色待定"} / ${stock.setup}`,
    plan: `入选理由：${stock.reasons.join("；")}。博弈：${stock.gamePlan.decision}，${stock.gamePlan.holderLine} 买点：${stock.tradePlan.buy} 卖点：${stock.tradePlan.sell}`,
  });
  persist();
  renderWatchlist();
  button.textContent = "已加入";
});

saveReview.addEventListener("click", () => {
  const scores = getScores();
  const cycle = cycleName(scores.regime);
  state.history.push({
    date: new Date().toLocaleDateString("zh-CN"),
    cycle,
    total: scores.total,
    style: styleByScores(scores),
    action: actionByScores(scores),
  });
  persist();
  renderHistory();
});

fetchHotStocks.addEventListener("click", loadHotStocks);

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");
  });
});

updateView();
renderWatchlist();
renderHistory();
loadHotStocks();
