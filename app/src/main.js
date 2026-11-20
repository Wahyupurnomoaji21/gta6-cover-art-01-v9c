import {
  FORMATS,
  GRADES,
  LAYOUTS,
  createCoverElement,
  defaultState,
  drawCover,
  fitBandTitle,
  previewCaption,
} from "./cover.js";
import { applyShot, readShot } from "./shots.js";

const state = applyShot(defaultState(), readShot());
const shot = readShot();

function fitPoster(poster, boxWidth, designWidth, designHeight) {
  const scale = Math.min(1, boxWidth / designWidth);
  const wrap = document.createElement("div");
  wrap.className = "poster-scale";
  wrap.style.width = designWidth * scale + "px";
  wrap.style.height = designHeight * scale + "px";
  wrap.style.transform = "scale(" + scale + ")";
  wrap.appendChild(poster);
  return wrap;
}

function renderCoverStage() {
  document.body.style.background = "#120a2e";
  const app = document.getElementById("app");
  app.innerHTML = "";
  const stage = document.createElement("div");
  stage.className = "cover-stage";
  const format = FORMATS[shot.format];
  const poster = createCoverElement(state, format, false, null);
  const scale = Math.min(
    window.innerWidth / format.width,
    window.innerHeight / format.height,
  );
  const wrap = document.createElement("div");
  wrap.className = "poster-scale";
  wrap.style.width = format.width * scale + "px";
  wrap.style.height = format.height * scale + "px";
  wrap.style.transform = "scale(" + scale + ")";
  wrap.style.transformOrigin = "center center";
  wrap.appendChild(poster);
  stage.appendChild(wrap);
  app.appendChild(stage);
  fitBandTitle(poster, format.width);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => fitBandTitle(poster, format.width));
  }
}

function renderEditor() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const editor = document.createElement("div");
  editor.className = "editor";

  const topbar = document.createElement("div");
  topbar.className = "topbar";
  const brand = document.createElement("div");
  brand.className = "brand";
  const star = document.createElement("span");
  star.className = "star";
  star.textContent = "★";
  brand.appendChild(star);
  brand.appendChild(document.createTextNode("GTA VI · COVER MAKER"));
  const live = document.createElement("div");
  live.className = "live";
  live.textContent = "LIVE PREVIEW";
  const size = document.createElement("div");
  size.className = "size";
  size.textContent = "1280 × 720 · PNG";
  topbar.appendChild(brand);
  topbar.appendChild(live);
  topbar.appendChild(size);
  editor.appendChild(topbar);

  const body = document.createElement("div");
  body.className = "editor-body";
  const controls = document.createElement("div");
  controls.className = "controls";
  const previewCol = document.createElement("div");
  previewCol.className = "preview-col";

  // Card 1 — photos
  const card1 = document.createElement("div");
  card1.className = "card";
  const h1 = document.createElement("h2");
  h1.textContent = "1 · YOUR PHOTOS";
  card1.appendChild(h1);
  const note = document.createElement("p");
  note.className = "note";
  note.textContent = "Photos stay on your machine — nothing is uploaded.";
  card1.appendChild(note);
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.multiple = true;
  fileInput.style.display = "none";
  card1.appendChild(fileInput);
  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-pink";
  addBtn.textContent = "Add photos...";
  addBtn.addEventListener("click", () => fileInput.click());
  card1.appendChild(addBtn);
  const thumbs = document.createElement("div");
  thumbs.className = "thumbs";
  card1.appendChild(thumbs);
  const btnRow = document.createElement("div");
  btnRow.className = "btn-row";
  const fillBtn = document.createElement("button");
  fillBtn.className = "btn btn-ghost";
  fillBtn.textContent = "Fill every panel with photo 1";
  fillBtn.addEventListener("click", () => {
    for (const panel of state.panels) panel.photo = 0;
    refresh();
  });
  const dealBtn = document.createElement("button");
  dealBtn.className = "btn btn-ghost";
  dealBtn.textContent = "Deal photos across panels";
  dealBtn.addEventListener("click", () => {
    state.panels.forEach((panel, i) => {
      panel.photo = i % state.photos.length;
    });
    refresh();
  });
  btnRow.appendChild(fillBtn);
  btnRow.appendChild(dealBtn);
  card1.appendChild(btnRow);
  controls.appendChild(card1);

  // Card 2 — cover settings
  const card2 = document.createElement("div");
  card2.className = "card";
  const h2 = document.createElement("h2");
  h2.textContent = "2 · THE COVER";
  card2.appendChild(h2);

  function textField(labelText, key) {
    const field = document.createElement("div");
    field.className = "field";
    const label = document.createElement("label");
    label.textContent = labelText;
    const input = document.createElement("input");
    input.type = "text";
    input.value = state[key];
    input.addEventListener("input", () => {
      state[key] = input.value;
      refresh();
    });
    field.appendChild(label);
    field.appendChild(input);
    return { field, input };
  }
  const titleField = textField("Title", "title");
  const subtitleField = textField("Subtitle", "subtitle");
  const badgeField = textField("Badge", "badge");
  card2.appendChild(titleField.field);
  card2.appendChild(subtitleField.field);
  card2.appendChild(badgeField.field);

  function selectField(labelText, key, options) {
    const field = document.createElement("div");
    field.className = "field";
    const label = document.createElement("label");
    label.textContent = labelText;
    const select = document.createElement("select");
    for (const [value, text] of Object.entries(options)) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      if (value === state[key]) option.selected = true;
      select.appendChild(option);
    }
    select.addEventListener("change", () => {
      state[key] = select.value;
      refresh();
    });
    field.appendChild(label);
    field.appendChild(select);
    return field;
  }
  card2.appendChild(selectField("Layout", "layout", LAYOUTS));
  card2.appendChild(selectField("Colour grade", "grade", GRADES));

  function sliderField(labelText, key, min, max) {
    const row = document.createElement("div");
    row.className = "slider-row";
    const label = document.createElement("label");
    const name = document.createElement("span");
    name.textContent = labelText;
    const out = document.createElement("output");
    out.textContent = state[key] + " %";
    label.appendChild(name);
    label.appendChild(out);
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.value = String(state[key]);
    input.addEventListener("input", () => {
      state[key] = Number(input.value);
      out.textContent = state[key] + " %";
      refresh();
    });
    row.appendChild(label);
    row.appendChild(input);
    return row;
  }
  card2.appendChild(sliderField("Grade strength", "gradeStrength", 0, 100));
  card2.appendChild(sliderField("Grain", "grain", 0, 100));
  card2.appendChild(sliderField("Title size", "titleSize", 50, 150));
  card2.appendChild(sliderField("Duotone", "duotone", 0, 100));

  const exportBtn = document.createElement("button");
  exportBtn.className = "btn btn-orange";
  exportBtn.textContent = "Export cover · 1280 × 720 PNG";
  exportBtn.addEventListener("click", async () => {
    exportBtn.textContent = "Drawing cover...";
    try {
      const canvas = await drawCover(state, FORMATS.landscape);
      const link = document.createElement("a");
      link.download = "neon-coast-cover.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      exportBtn.textContent = "Export cover · 1280 × 720 PNG";
    } catch (err) {
      exportBtn.textContent = "Export failed — try again";
    }
  });
  card2.appendChild(exportBtn);
  controls.appendChild(card2);

  // Preview column
  const previewWrap = document.createElement("div");
  previewWrap.className = "preview-wrap";
  previewCol.appendChild(previewWrap);
  const caption = document.createElement("p");
  caption.className = "preview-caption";
  previewCol.appendChild(caption);
  const hint = document.createElement("div");
  hint.className = "panel-hint";
  previewCol.appendChild(hint);

  body.appendChild(controls);
  body.appendChild(previewCol);
  editor.appendChild(body);
  app.appendChild(editor);

  function buildThumbs() {
    thumbs.innerHTML = "";
    state.photos.forEach((photo, i) => {
      const btn = document.createElement("button");
      btn.className = "thumb" + (state.activePhoto === i ? " active" : "");
      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.label;
      const span = document.createElement("span");
      span.textContent = photo.label;
      btn.appendChild(img);
      btn.appendChild(span);
      btn.addEventListener("click", () => {
        state.activePhoto = i;
        state.panels[state.selectedPanel].photo = i;
        refresh();
      });
      thumbs.appendChild(btn);
    });
  }

  function buildHint() {
    hint.innerHTML = "";
    const text = document.createTextNode(
      "Selected panel " + (state.selectedPanel + 1) + " of 4 — click a panel to select it, drag inside it to crop, or zoom it here.",
    );
    hint.appendChild(text);
    const row = document.createElement("div");
    row.className = "row";
    const use1 = document.createElement("button");
    use1.className = "btn btn-ghost";
    use1.textContent = "Use photo 1";
    use1.addEventListener("click", () => {
      state.panels[state.selectedPanel].photo = 0;
      refresh();
    });
    const use2 = document.createElement("button");
    use2.className = "btn btn-ghost";
    use2.textContent = "Use photo 2";
    use2.addEventListener("click", () => {
      state.panels[state.selectedPanel].photo = 1;
      refresh();
    });
    const zoom = document.createElement("input");
    zoom.type = "range";
    zoom.min = "100";
    zoom.max = "300";
    zoom.value = String(Math.round(state.panels[state.selectedPanel].zoom * 100));
    zoom.addEventListener("input", () => {
      state.panels[state.selectedPanel].zoom = Number(zoom.value) / 100;
      refresh();
    });
    const reset = document.createElement("button");
    reset.className = "btn btn-ghost";
    reset.textContent = "Reset crop";
    reset.addEventListener("click", () => {
      const defaults = defaultState().panels[state.selectedPanel];
      state.panels[state.selectedPanel].zoom = defaults.zoom;
      state.panels[state.selectedPanel].fx = defaults.fx;
      state.panels[state.selectedPanel].fy = defaults.fy;
      refresh();
    });
    row.appendChild(use1);
    row.appendChild(use2);
    row.appendChild(zoom);
    row.appendChild(reset);
    hint.appendChild(row);
  }

  function refresh() {
    const format = FORMATS.landscape;
    previewWrap.innerHTML = "";
    const poster = createCoverElement(state, format, true, {
      onSelect: (index) => {
        state.selectedPanel = index;
        refresh();
      },
      onPan: () => {},
    });
    const boxWidth = previewCol.clientWidth || 800;
    const wrap = fitPoster(poster, boxWidth, format.width, format.height);
    previewWrap.appendChild(wrap);
    fitBandTitle(poster, format.width);
    caption.textContent = previewCaption(state);
    titleField.input.value = state.title;
    buildThumbs();
    buildHint();
  }

  fileInput.addEventListener("change", () => {
    const files = Array.from(fileInput.files || []);
    let loaded = 0;
    files.forEach((file, n) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base = file.name.replace(/\.[^.]+$/, "");
        state.photos.push({
          id: "user-" + Date.now() + "-" + n,
          label: "Photo " + (state.photos.length + 1) + " · " + base,
          src: reader.result,
        });
        loaded++;
        if (loaded === files.length) refresh();
      };
      reader.readAsDataURL(file);
    });
  });

  window.addEventListener("resize", refresh);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refresh);
  }
  refresh();
}

if (shot.editor) {
  renderEditor();
} else {
  renderCoverStage();
}
