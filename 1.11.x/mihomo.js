function operator(proxies) {
  // ========== 国内关键词 ==========
  const domesticKeywords = [
    "北京","上海","广州","深圳","杭州","成都","南京",
    "武汉","重庆","天津","苏州","西安","长沙","郑州",
    "东莞","青岛","沈阳","宁波","昆明","大连","厦门",
    "合肥","佛山","福州","哈尔滨","济南","温州","长春",
    "石家庄","常州","泉州","南宁","贵阳","南昌","太原",
    "烟台","嘉兴","南通","金华","珠海","惠州","徐州",
    "海口","乌鲁木齐","兰州","呼和浩特","银川","西宁",
    "拉萨","绍兴","桂林","三亚","芜湖","镇江","盐城",
    "广东","浙江","江苏","四川","湖北","湖南","河北",
    "河南","山东","辽宁","陕西","山西","安徽","福建",
    "江西","黑龙江","吉林","云南","贵州","甘肃","青海",
    "广西","内蒙古","西藏","宁夏","新疆",
    "中国","国内","回国","CN","China",
    "华东","华南","华北","华中","西南","西北","东北"
  ];

  function isDomestic(name) {
    if (!name) return false;
    const lowerName = name.toLowerCase();
    return domesticKeywords.some(kw => lowerName.includes(kw.toLowerCase()));
  }

  // ========== 记录原始顺序 ==========
  proxies.forEach((p, idx) => { p._origIndex = idx; });

  // ========== 排序：国内优先 → vmess优先 → 按名称 → 原始顺序 ==========
  proxies.sort((a, b) => {
    const aDom = isDomestic(a.name) ? 0 : 1;
    const bDom = isDomestic(b.name) ? 0 : 1;
    if (aDom !== bDom) return aDom - bDom;

    const aVM = a.type === "vmess" ? 0 : 1;
    const bVM = b.type === "vmess" ? 0 : 1;
    if (aVM !== bVM) return aVM - bVM;

    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return a._origIndex - b._origIndex;
  });

  proxies.forEach(p => delete p._origIndex);

  // ========== 节点处理 ==========
  return proxies.map(p => {
    const isDom = isDomestic(p.name);

    // 1. 打标签（添加前缀）
    const prefix = isDom ? "[国内] " : "[国外] ";
    if (!p.name.startsWith(prefix)) {
      p.name = prefix + p.name;
    }

    // 2. 链式代理：国外节点走百度免流，国内不链式
    if (!isDom) {
      p["dialer-proxy"] = "百度免流选择";   // Mihomo 专用字段
    } else {
      // 确保国内节点不携带 dialer-proxy
      delete p["dialer-proxy"];
    }
    // 同时移除 sing-box 的 detour 字段（如果存在）
    delete p.detour;

    // 3. vmess 专属：加 "ml" 子前缀 + Host 伪装
    if (p.type === "vmess") {
      // 已带有 [国内]/[国外] 前缀，追加 ml
      if (!p.name.includes("ml ")) {
        p.name = p.name.replace(/^(\[(国内|国外)\] )/, "$1ml ");
      }
      if (p.network === "ws") {
        p["ws-opts"] = p["ws-opts"] || {};
        p["ws-opts"].headers = p["ws-opts"].headers || {};
        p["ws-opts"].headers["Host"] = "t7z.cupid.iqiyi.com";
      } else if (p.network === "http") {
        p["http-opts"] = p["http-opts"] || {};
        p["http-opts"].headers = p["http-opts"].headers || {};
        p["http-opts"].headers["Host"] = "t7z.cupid.iqiyi.com";
      }
    }
    return p;
  });
}
