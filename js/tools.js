/* ═══════════════════════════════════════════
   SELA Portal — 共用工具清單

   調整順序：移動陣列項目即可
   上面的項目 = 顯示在左上角
   ═══════════════════════════════════════════ */

/* ── 癌症中心（同仁首頁 + Workspace 皆使用） ── */
const CC_TOOLS = [
  { name: '個管病患追蹤系統',     url: 'https://sela1227.github.io/Patient-follow/',         icon: 'users' },
  { name: '癌症資源中心系統',     url: 'https://sela1227.github.io/cancer-resource-center/', icon: 'book' },
  { name: '肺癌臨床路徑',         url: 'https://sela1227.github.io/Lung-ca-nevigation/',     icon: 'grid' },
  { name: '個管多專科會議系統',   url: 'https://sela1227.github.io/MDT/',                    icon: 'users-plus' },
  { name: '病歷整理輔助系統',     url: 'https://sela1227.github.io/Chart/',                  icon: 'file-text' },
  { name: '癌症醫院專案系統',     url: 'https://web-production-0b5be.up.railway.app/',       icon: 'briefcase' },
  { name: '病歷互審系統',         url: 'https://web-production-a2c46.up.railway.app/',       icon: 'file-edit' },
  { name: '健保癌症藥物速查系統', url: 'https://sela1227.github.io/Cancer-Drug/',            icon: 'pill' },
  { name: '個管師訓練系統',       url: 'https://sela1227.github.io/CCM-manual/',             icon: 'graduation' },
];

/* ── 放腫科（僅 Workspace 使用） ── */
const RTO_TOOLS = [
  { name: 'QCC 個人體重監測', url: 'https://sela1227.github.io/RTO-QCC/', icon: 'activity' },
  { name: 'QA 工具',          url: '',                                    icon: 'clipboard', disabled: true },
];
