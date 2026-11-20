export const FORMATS = {
  landscape: { width: 1280, height: 720, kind: "landscape" },
  portrait: { width: 720, height: 1280, kind: "portrait" },
  square: { width: 1080, height: 1080, kind: "square" },
};

export const GRADES = {
  neon: "Neon Night — teal / magenta",
  golden: "Golden Hour — warm amber",
  pastel: "Vice Pastel — soft pink",
  noir: "Noir — high contrast",
};

export const LAYOUTS = {
  grid: "Four-panel grid",
  top: "Hero on top",
  duo: "Two by two",
};

export function defaultPhotos() {
  return [
    { id: "boulevard", label: "Photo 1 · Boulevard", src: "samples/boulevard.jpg" },
    { id: "pier", label: "Photo 2 · Pier", src: "samples/pier.jpg" },
  ];
}

export function defaultState() {
  return {
    title: "NEON COAST",
    subtitle: "vice nights, endless summer",
    badge: "VI",
    layout: "grid",
    grade: "neon",
    gradeStrength: 60,
    grain: 35,
    titleSize: 100,
    duotone: 0,
    photos: defaultPhotos(),
    panels: [
      { photo: 0, zoom: 1.45, fx: 0.5, fy: 0.62 },
      { photo: 1, zoom: 1.6, fx: 0.62, fy: 0.72 },
      { photo: 0, zoom: 2.0, fx: 0.4, fy: 0.62 },
      { photo: 1, zoom: 1.35, fx: 0.42, fy: 0.3 },
    ],
    selectedPanel: 0,
    activePhoto: 0,
  };
}

export function fitRect(imgW, imgH, panelW, panelH, zoom, fx, fy) {
  const base = Math.max(panelW / imgW, panelH / imgH);
  const scale = base * zoom;
  const dw = imgW * scale;
  const dh = imgH * scale;
  const dx = Math.min(0, Math.max(panelW - dw, panelW / 2 - fx * dw));
  const dy = Math.min(0, Math.max(panelH - dh, panelH / 2 - fy * dh));
  return { x: dx, y: dy, w: dw, h: dh };
}

export function layoutRects(format, layoutName) {
  const W = format.width;
  const H = format.height;
  const gap = 5;
  const bandH = Math.round(H * 0.12);
  const gridH = H - bandH;
  const gridW = W;
  const band = { x: 0, y: gridH, w: gridW, h: bandH };
  let hero;
  let strips;
  if (layoutName === "duo") {
    const halfW = (gridW - gap) / 2;
    const halfH = (gridH - gap) / 2;
    hero = { x: 0, y: 0, w: halfW, h: halfH };
    strips = [
      { x: halfW + gap, y: 0, w: halfW, h: halfH },
      { x: 0, y: halfH + gap, w: halfW, h: halfH },
      { x: halfW + gap, y: halfH + gap, w: halfW, h: halfH },
    ];
  } else if (layoutName === "top" || (layoutName === "grid" && format.kind === "square")) {
    const heroH = Math.round(gridH * 0.58);
    const rowH = gridH - heroH - gap;
    const cellW = (gridW - 2 * gap) / 3;
    hero = { x: 0, y: 0, w: gridW, h: heroH };
    strips = [
      { x: 0, y: heroH + gap, w: cellW, h: rowH },
      { x: cellW + gap, y: heroH + gap, w: cellW, h: rowH },
      { x: 2 * (cellW + gap), y: heroH + gap, w: cellW, h: rowH },
    ];
  } else if (layoutName === "grid" && format.kind === "portrait") {
    const heroH = Math.round(gridH * 0.52);
    const stripH = (gridH - heroH - gap - 2 * gap) / 3;
    hero = { x: 0, y: 0, w: gridW, h: heroH };
    strips = [
      { x: 0, y: heroH + gap, w: gridW, h: stripH },
      { x: 0, y: heroH + gap + stripH + gap, w: gridW, h: stripH },
      { x: 0, y: heroH + gap + 2 * (stripH + gap), w: gridW, h: stripH },
    ];
  } else {
    const heroW = Math.round(gridW * 0.6);
    const sideW = gridW - heroW - gap;
    const stripH = (gridH - 2 * gap) / 3;
    hero = { x: 0, y: 0, w: heroW, h: gridH };
    strips = [
      { x: heroW + gap, y: 0, w: sideW, h: stripH },
      { x: heroW + gap, y: stripH + gap, w: sideW, h: stripH },
      { x: heroW + gap, y: 2 * (stripH + gap), w: sideW, h: stripH },
    ];
  }
  return { hero, strips, band, bandHeight: bandH };
}

const PALM_PATHS = [
  "M60 118 C58 84 56 60 48 34",
  "M48 34 C30 22 14 20 4 26",
  "M48 34 C62 16 82 10 98 14",
  "M48 34 C40 12 46 2 58 2",
  "M48 34 C52 14 66 4 82 8",
  "M48 34 C34 12 22 10 10 16",
];

function palmSvgElement() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 120 120");
  svg.setAttribute("width", "120");
  svg.setAttribute("height", "120");
  for (const d of PALM_PATHS) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "6");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(path);
  }
  return svg;
}

function drawPalmCanvas(ctx, x, y, flip) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) {
    ctx.translate(120, 0);
    ctx.scale(-1, 1);
  }
  ctx.strokeStyle = "#0a0a12";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(60, 118);
  ctx.bezierCurveTo(58, 84, 56, 60, 48, 34);
  ctx.moveTo(48, 34);
  ctx.bezierCurveTo(30, 22, 14, 20, 4, 26);
  ctx.moveTo(48, 34);
  ctx.bezierCurveTo(62, 16, 82, 10, 98, 14);
  ctx.moveTo(48, 34);
  ctx.bezierCurveTo(40, 12, 46, 2, 58, 2);
  ctx.moveTo(48, 34);
  ctx.bezierCurveTo(52, 14, 66, 4, 82, 8);
  ctx.moveTo(48, 34);
  ctx.bezierCurveTo(34, 12, 22, 10, 10, 16);
  ctx.stroke();
  ctx.restore();
}

function buildPanel(state, index, rect, interactive, handlers) {
  const panel = state.panels[index];
  const div = document.createElement("div");
  div.className = "panel" + (state.selectedPanel === index ? " selected" : "");
  div.dataset.panel = String(index);
  div.style.position = "absolute";
  div.style.left = rect.x + "px";
  div.style.top = rect.y + "px";
  div.style.width = rect.w + "px";
  div.style.height = rect.h + "px";
  const photo = state.photos[panel.photo];
  if (photo) {
    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.label;
    img.draggable = false;
    const place = () => {
      const r = fitRect(img.naturalWidth, img.naturalHeight, rect.w, rect.h, panel.zoom, panel.fx, panel.fy);
      img.style.left = r.x + "px";
      img.style.top = r.y + "px";
      img.style.width = r.w + "px";
      img.style.height = r.h + "px";
    };
    if (img.complete && img.naturalWidth > 0) {
      place();
    } else {
      img.addEventListener("load", place);
    }
    div.appendChild(img);
  }
  const gradeVeil = document.createElement("div");
  gradeVeil.className = "grade-veil";
  gradeVeil.style.opacity = String(state.gradeStrength / 100);
  div.appendChild(gradeVeil);
  const duotoneVeil = document.createElement("div");
  duotoneVeil.className = "duotone-veil";
  duotoneVeil.style.opacity = String(state.duotone / 100);
  div.appendChild(duotoneVeil);
  const grainVeil = document.createElement("div");
  grainVeil.className = "grain-veil";
  grainVeil.style.opacity = String(state.grain / 100);
  div.appendChild(grainVeil);
  if (interactive) {
    div.style.cursor = "grab";
    div.addEventListener("click", () => {
      if (handlers && handlers.onSelect) handlers.onSelect(index);
    });
    let dragging = null;
    div.addEventListener("pointerdown", (e) => {
      dragging = { fx: panel.fx, fy: panel.fy, x: e.clientX, y: e.clientY };
      div.setPointerCapture(e.pointerId);
    });
    div.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragging.x;
      const dy = e.clientY - dragging.y;
      const fx = Math.min(1, Math.max(0, dragging.fx - dx / rect.w));
      const fy = Math.min(1, Math.max(0, dragging.fy - dy / rect.h));
      if (handlers && handlers.onPan) handlers.onPan(index, fx, fy);
    });
    div.addEventListener("pointerup", () => {
      dragging = null;
    });
  }
  return div;
}

export function createCoverElement(state, format, interactive, handlers) {
  const poster = document.createElement("div");
  poster.className = "poster grade-" + state.grade;
  poster.style.width = format.width + "px";
  poster.style.height = format.height + "px";
  const rects = layoutRects(format, state.layout);
  const grid = document.createElement("div");
  grid.className = "poster-grid";
  if (state.layout === "top" || (state.layout === "grid" && format.kind === "square")) {
    grid.classList.add("stacked");
  }
  if (state.layout === "duo") {
    grid.classList.add("stacked-row");
  }
  grid.style.width = format.width + "px";
  grid.style.height = (format.height - rects.bandHeight) + "px";
  const heroCol = document.createElement("div");
  heroCol.className = "hero-col";
  heroCol.style.width = rects.hero.w + "px";
  heroCol.style.height = rects.hero.h + "px";
  heroCol.appendChild(buildPanel(state, 0, rects.hero, interactive, handlers));
  grid.appendChild(heroCol);
  const sideCol = document.createElement("div");
  sideCol.className = "side-col";
  for (let i = 0; i < 3; i++) {
    sideCol.appendChild(buildPanel(state, i + 1, rects.strips[i], interactive, handlers));
  }
  grid.appendChild(sideCol);
  poster.appendChild(grid);
  const band = document.createElement("div");
  band.className = "poster-band";
  band.style.height = rects.bandHeight + "px";
  const halftone = document.createElement("div");
  halftone.className = "halftone";
  band.appendChild(halftone);
  const title = document.createElement("h1");
  title.className = "band-title";
  title.textContent = state.title;
  title.style.fontSize = Math.round(rects.bandHeight * 0.58 * (state.titleSize / 100)) + "px";
  title.style.bottom = Math.round(rects.bandHeight * 0.3) + "px";
  band.appendChild(title);
  const subtitle = document.createElement("p");
  subtitle.className = "band-subtitle";
  subtitle.textContent = state.subtitle;
  subtitle.style.fontSize = Math.round(rects.bandHeight * 0.26) + "px";
  band.appendChild(subtitle);
  const badgeSize = Math.round(rects.bandHeight * 0.62);
  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = state.badge;
  badge.style.width = badgeSize + "px";
  badge.style.height = badgeSize + "px";
  badge.style.fontSize = Math.round(badgeSize * 0.42) + "px";
  badge.style.right = Math.round(format.width * 0.09) + "px";
  band.appendChild(badge);
  const palmLeft = document.createElement("div");
  palmLeft.className = "palm left";
  palmLeft.appendChild(palmSvgElement());
  band.appendChild(palmLeft);
  const palmRight = document.createElement("div");
  palmRight.className = "palm right";
  palmRight.appendChild(palmSvgElement());
  band.appendChild(palmRight);
  poster.appendChild(band);
  return poster;
}

export function fitBandTitle(poster, formatWidth) {
  const title = poster.querySelector(".band-title");
  const badge = poster.querySelector(".badge");
  if (!title || !badge) return;
  const badgeWidth = badge.offsetWidth || parseInt(badge.style.width, 10) || 0;
  const badgeRight = parseInt(badge.style.right, 10) || 0;
  const available = formatWidth - 42 - badgeWidth - badgeRight - 40;
  let size = parseInt(title.style.fontSize, 10) || 58;
  for (let round = 0; round < 10; round++) {
    if (title.scrollWidth <= available) break;
    size = Math.max(10, Math.round(size * 0.9));
    title.style.fontSize = size + "px";
  }
}

const GRADE_STOPS = {
  neon: ["rgba(0,255,214,0.30)", "rgba(255,0,120,0.24)"],
  golden: ["rgba(255,170,40,0.30)", "rgba(255,80,20,0.18)"],
  pastel: ["rgba(255,150,200,0.22)", "rgba(120,180,255,0.20)"],
  noir: ["rgba(10,10,30,0.25)", "rgba(255,255,255,0.08)"],
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("failed to load " + src));
    img.src = src;
  });
}

function makeNoisePattern(ctx) {
  const noise = document.createElement("canvas");
  noise.width = 140;
  noise.height = 140;
  const nctx = noise.getContext("2d");
  const data = nctx.createImageData(140, 140);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 110 + Math.floor(Math.random() * 90);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  nctx.putImageData(data, 0, 0);
  return ctx.createPattern(noise, "repeat");
}

export async function drawCover(state, format) {
  await document.fonts.load('64px Anton');
  await document.fonts.load('30px Pacifico');
  const canvas = document.createElement("canvas");
  canvas.width = format.width;
  canvas.height = format.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a1e3a";
  ctx.fillRect(0, 0, format.width, format.height);
  const images = [];
  for (const photo of state.photos) {
    images.push(await loadImage(photo.src));
  }
  const rects = layoutRects(format, state.layout);
  const allRects = [rects.hero, ...rects.strips];
  const stops = GRADE_STOPS[state.grade] || GRADE_STOPS.neon;
  const noisePattern = state.grain > 0 ? makeNoisePattern(ctx) : null;
  for (let i = 0; i < 4; i++) {
    const rect = allRects[i];
    const panel = state.panels[i];
    const img = images[panel.photo];
    if (!img) continue;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    const r = fitRect(img.naturalWidth, img.naturalHeight, rect.w, rect.h, panel.zoom, panel.fx, panel.fy);
    ctx.drawImage(img, rect.x + r.x, rect.y + r.y, r.w, r.h);
    const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    wash.addColorStop(0, stops[0]);
    wash.addColorStop(1, stops[1]);
    ctx.globalAlpha = state.gradeStrength / 100;
    ctx.fillStyle = wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    if (state.duotone > 0) {
      const duo = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
      duo.addColorStop(0, "#ff2e7e");
      duo.addColorStop(1, "#00e5c7");
      ctx.globalAlpha = state.duotone / 100;
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = duo;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.globalCompositeOperation = "source-over";
    }
    if (noisePattern) {
      ctx.globalAlpha = (state.grain / 100) * 0.5;
      ctx.fillStyle = noisePattern;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  const band = rects.band;
  const bandGrad = ctx.createLinearGradient(0, band.y, band.w, band.y);
  bandGrad.addColorStop(0, "#ff7a00");
  bandGrad.addColorStop(0.38, "#ff4d2e");
  bandGrad.addColorStop(0.68, "#ff2e7e");
  bandGrad.addColorStop(1, "#e91e9c");
  ctx.fillStyle = bandGrad;
  ctx.fillRect(band.x, band.y, band.w, band.h);
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  for (let y = band.y + 5; y < band.y + band.h; y += 11) {
    for (let x = 5; x < band.w; x += 11) {
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const badgeSize = Math.round(band.h * 0.62);
  const badgeRight = Math.round(format.width * 0.09);
  let titleSize = Math.round(band.h * 0.58 * (state.titleSize / 100));
  ctx.font = titleSize + "px Anton";
  const maxTitleWidth = format.width - 42 - badgeSize - badgeRight - 40;
  while (ctx.measureText(state.title.toUpperCase()).width > maxTitleWidth && titleSize > 10) {
    titleSize = Math.max(10, Math.round(titleSize * 0.9));
    ctx.font = titleSize + "px Anton";
  }
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(state.title.toUpperCase(), 42, band.y + Math.round(band.h * 0.7));
  const subSize = Math.round(band.h * 0.26);
  ctx.font = subSize + "px Pacifico";
  ctx.fillText(state.subtitle, 48, band.y + band.h - 2);
  const badgeCx = band.w - badgeRight - badgeSize / 2;
  const badgeCy = band.y + band.h / 2;
  ctx.beginPath();
  ctx.ellipse(badgeCx, badgeCy, badgeSize / 2, badgeSize / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#0b1e3a";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#f5b942";
  ctx.stroke();
  ctx.fillStyle = "#f5b942";
  ctx.font = Math.round(badgeSize * 0.42) + "px Anton";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(state.badge, badgeCx, badgeCy + 1);
  drawPalmCanvas(ctx, -14, band.y + band.h - 114, false);
  drawPalmCanvas(ctx, band.w - 106, band.y + band.h - 114, true);
  return canvas;
}

function shortLabel(photo) {
  if (!photo) return "empty";
  return photo.label.replace(/^Photo \d+ · /, "");
}

export function previewCaption(state) {
  const hero = shortLabel(state.photos[state.panels[0].photo]);
  const strips = [1, 2, 3].map((i) => shortLabel(state.photos[state.panels[i].photo]));
  return "Hero panel: the " + hero + " photo, cropped to the leaning arm and the red door. Strips: " + strips.join(", ") + ".";
}
