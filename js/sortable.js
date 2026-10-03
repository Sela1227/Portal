/* ═══════════════════════════════════════════
   SELA Portal — 長按拖曳排序

   長按卡片 → 進入編輯模式 → 拖曳調整 → 完成
   順序存在瀏覽器 localStorage（各裝置獨立）
   ═══════════════════════════════════════════ */

const Sortable = (() => {
  const PREFIX     = 'sela.order.';
  const LONG_PRESS = 450;   // ms
  const MOVE_SLOP  = 8;     // px，超過視為捲動而非長按

  const lists    = [];      // { container, key }
  let editMode   = false;
  let isDragging = false;   // 全域旗標，供 touchmove 判斷
  let bar        = null;

  /* ── localStorage ── */

  function load(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function save(key, names) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(names)); } catch {}
  }

  function clear(key) {
    try { localStorage.removeItem(PREFIX + key); } catch {}
  }

  /* 依儲存順序重排；未記錄的新工具排在最後 */
  function applyOrder(tools, key) {
    const order = load(key);
    if (!order) return tools.slice();
    const map = new Map(tools.map(t => [t.name, t]));
    const out = [];
    order.forEach(n => {
      if (map.has(n)) { out.push(map.get(n)); map.delete(n); }
    });
    map.forEach(t => out.push(t));
    return out;
  }

  /* ── 編輯模式 ── */

  function buildBar() {
    bar = document.createElement('div');
    bar.className = 'sort-bar';
    bar.innerHTML = `
      <button class="sort-btn sort-btn-ghost" data-act="reset">重設順序</button>
      <span class="sort-hint">拖曳卡片調整位置</span>
      <button class="sort-btn sort-btn-solid" data-act="done">完成</button>`;
    bar.addEventListener('click', e => {
      const act = e.target.dataset.act;
      if (act === 'done')  exitEdit();
      if (act === 'reset') resetAll();
    });
    document.body.appendChild(bar);
  }

  function enterEdit() {
    if (editMode) return;
    editMode = true;
    document.body.classList.add('sorting');
    lists.forEach(l => l.container.classList.add('edit-mode'));
    if (!bar) buildBar();
    requestAnimationFrame(() => bar.classList.add('show'));
    if (navigator.vibrate) navigator.vibrate(12);
  }

  function exitEdit() {
    if (!editMode) return;
    editMode = false;
    document.body.classList.remove('sorting');
    lists.forEach(l => l.container.classList.remove('edit-mode'));
    if (bar) bar.classList.remove('show');
  }

  function resetAll() {
    lists.forEach(l => clear(l.key));
    exitEdit();
    location.reload();
  }

  /* 把目前 DOM 順序寫回 localStorage */
  function persist(container, key) {
    const names = [...container.querySelectorAll('.tool-card')]
      .map(c => c.dataset.name)
      .filter(Boolean);
    if (names.length) save(key, names);
  }

  /* 拖曳中阻止頁面捲動（iOS / Android 需非被動監聽） */
  document.addEventListener('touchmove', e => {
    if (isDragging) e.preventDefault();
  }, { passive: false });

  /* 擋掉瀏覽器原生拖曳：<a>、<img> 預設可拖，會發出 pointercancel 中斷自訂拖曳 */
  document.addEventListener('dragstart', e => {
    if (e.target.closest && e.target.closest('.tool-card')) e.preventDefault();
  });

  /* ── 綁定一個容器 ── */

  function bind(container, key) {
    let timer = null, dragging = null;
    let startX = 0, startY = 0, downX = 0, downY = 0, didDrag = false;

    container.addEventListener('pointerdown', e => {
      if (e.button != null && e.button !== 0) return;
      const card = e.target.closest('.tool-card');
      if (!card || card.classList.contains('disabled')) return;

      downX = e.clientX; downY = e.clientY;
      didDrag = false;

      const px = e.clientX, py = e.clientY, pid = e.pointerId;

      const begin = () => {
        timer = null;
        enterEdit();
        dragging   = card;
        didDrag    = true;
        isDragging = true;
        startX = px; startY = py;
        const r = card.getBoundingClientRect();
        card.style.width  = r.width  + 'px';
        card.style.height = r.height + 'px';
        card.classList.add('dragging');
        try { card.setPointerCapture(pid); } catch {}
      };

      if (editMode) begin();                          // 已在編輯模式 → 直接拖
      else timer = setTimeout(begin, LONG_PRESS);     // 否則先長按
    });

    container.addEventListener('pointermove', e => {
      // 尚未進入拖曳：移動超過閾值代表使用者在捲動，取消長按
      if (!dragging) {
        if (timer && (Math.abs(e.clientX - downX) > MOVE_SLOP ||
                      Math.abs(e.clientY - downY) > MOVE_SLOP)) {
          clearTimeout(timer); timer = null;
        }
        return;
      }

      e.preventDefault();

      const dx = e.clientX - startX, dy = e.clientY - startY;
      dragging.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;

      // 指標真正進入其他卡片範圍時才交換（落在間隙則不動，避免連續誤判）
      let over = null;
      for (const el of dragging.parentNode.children) {
        if (el === dragging || !el.classList.contains('tool-card')) continue;
        const r = el.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right &&
            e.clientY >= r.top  && e.clientY <= r.bottom) { over = el; break; }
      }
      if (!over) return;

      // 交換 DOM，並修正原點，讓卡片視覺上仍黏在手指下
      dragging.style.transform = '';
      const prev = dragging.getBoundingClientRect();

      const kids = [...dragging.parentNode.children];
      if (kids.indexOf(dragging) < kids.indexOf(over)) over.after(dragging);
      else                                             over.before(dragging);

      const next = dragging.getBoundingClientRect();
      startX += next.left - prev.left;
      startY += next.top  - prev.top;

      dragging.style.transform =
        `translate(${e.clientX - startX}px, ${e.clientY - startY}px) scale(1.06)`;
    });

    function finish() {
      if (timer) { clearTimeout(timer); timer = null; }
      isDragging = false;
      if (!dragging) return;
      dragging.classList.remove('dragging');
      dragging.style.transform = '';
      dragging.style.width     = '';
      dragging.style.height    = '';
      dragging = null;
      persist(container, key);
    }

    container.addEventListener('pointerup',     finish);
    container.addEventListener('pointercancel', finish);

    // 編輯模式中或剛拖曳完 → 不要觸發連結
    container.addEventListener('click', e => {
      if (editMode || didDrag) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    // 長按時不要跳出瀏覽器原生選單
    container.addEventListener('contextmenu', e => {
      if (editMode || dragging) e.preventDefault();
    });

    lists.push({ container, key });
  }

  /* 點編輯模式外的空白處 → 結束編輯 */
  document.addEventListener('pointerdown', e => {
    if (!editMode) return;
    if (e.target.closest('.tool-card') || e.target.closest('.sort-bar')) return;
    exitEdit();
  });

  return { bind, applyOrder, exitEdit };
})();
