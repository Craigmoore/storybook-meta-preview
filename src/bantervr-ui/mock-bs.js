// Lightweight mock of the BanterVR BS namespace for browser preview.
// Implements enough of the UI system to:
//   (a) render approximate HTML for the browser preview
//   (b) capture a serialised scene graph that the Banter inject script
//       reconstructs using real BS APIs

class Vector2 { constructor(x, y)       { this.x = x; this.y = y; } }
class Vector3 { constructor(x, y, z)    { this.x = x; this.y = y; this.z = z; } }
class Vector4 { constructor(x, y, z, w) { this.x = x; this.y = y; this.z = z; this.w = w; } }
class Quaternion { constructor(x, y, z, w) { this.x = x; this.y = y; this.z = z; this.w = w; } }

export const PN = {
  text:                 'text',
  fontSize:             'fontSize',
  color:                'color',
  richText:             'richText',
  enableWordWrapping:   'enableWordWrapping',
  horizontalAlignment:  'horizontalAlignment',
  verticalAlignment:    'verticalAlignment',
  rectTransformSizeDelta: 'rectTransformSizeDelta',
};

// Maps Unity-specific camelCase USS property names to browser CSS equivalents
// so the HTML preview approximates the final Unity look.
const UNITY_TO_CSS = {
  unityFontStyle(elStyle, v) {
    elStyle.fontWeight = v === 'bold' || v === 'bold-and-italic' ? 'bold' : 'normal';
    elStyle.fontStyle  = v === 'italic' || v === 'bold-and-italic' ? 'italic' : 'normal';
  },
  unityTextAlign(elStyle, v) {
    const ha = { 'upper-left':'left','upper-center':'center','upper-right':'right',
                 'middle-left':'left','middle-center':'center','middle-right':'right',
                 'lower-left':'left','lower-center':'center','lower-right':'right' }[v] ?? '';
    if (ha) elStyle.textAlign = ha;
  },
};

// Proxy that writes to both a plain tracking map (for serialisation) and the
// real CSSStyleDeclaration (for HTML preview rendering).
function styleProxy(elStyle, map) {
  return new Proxy(map, {
    set(t, k, v) {
      t[k] = v;
      if (UNITY_TO_CSS[k]) UNITY_TO_CSS[k](elStyle, v);
      else elStyle[k] = v;
      return true;
    },
    get(t, k) { return k in t ? t[k] : elStyle[k]; },
  });
}

class MockUIElement {
  constructor(tag, type, cssClass) {
    this._type      = type;
    this._el        = document.createElement(tag);
    this._el.className = cssClass;
    this._el.__mock = this;
    this._props     = {};
    this._stylesMap = {};
    this._children  = [];
    this.style      = styleProxy(this._el.style, this._stylesMap);
  }

  SetProperty(prop, value) {
    this._props[prop] = value;
    if (prop === 'text')               { this._el.textContent = value; return this; }
    if (prop === 'fontSize')           { this.style.fontSize = typeof value === 'number' ? `${value}px` : value; return this; }
    if (prop === 'enableWordWrapping') { this._el.style.whiteSpace = value ? 'normal' : 'nowrap'; return this; }
    return this;
  }

  SetStyle(prop, value) { this.style[prop] = value; return this; }
  SetStyles(obj)        { for (const [k, v] of Object.entries(obj)) this.style[k] = v; return this; }

  AppendChild(child) {
    this._children.push(child);
    if (child?._el) this._el.appendChild(child._el);
    return this;
  }
  RemoveChild(child) {
    const i = this._children.indexOf(child);
    if (i !== -1) this._children.splice(i, 1);
    if (child?._el) this._el.removeChild(child._el);
    return this;
  }
  InsertBefore(child, ref) {
    if (child?._el && ref?._el) this._el.insertBefore(child._el, ref._el);
    return this;
  }

  OnClick(fn)      { this._el.addEventListener('click',      fn); return this; }
  OnMouseDown(fn)  { this._el.addEventListener('mousedown',  fn); return this; }
  OnMouseUp(fn)    { this._el.addEventListener('mouseup',    fn); return this; }
  OnMouseEnter(fn) { this._el.addEventListener('mouseenter', fn); return this; }
  OnMouseLeave(fn) { this._el.addEventListener('mouseleave', fn); return this; }
  OnMouseMove(fn)  { this._el.addEventListener('mousemove',  fn); return this; }
  OnFocus(fn)      { this._el.addEventListener('focus',      fn); return this; }
  OnBlur(fn)       { this._el.addEventListener('blur',       fn); return this; }
  OnWheel(fn)      { this._el.addEventListener('wheel',      fn); return this; }
  OnChange(fn)     { this._el.addEventListener('change', e => fn({ value: e.target.value })); return this; }
  OnKeyDown(fn)    { this._el.addEventListener('keydown', e => fn({ key: e.key })); return this; }
  OnKeyUp(fn)      { this._el.addEventListener('keyup',  e => fn({ key: e.key })); return this; }
  AddEventListener(ev, fn)    { this._el.addEventListener(ev, fn); return this; }
  RemoveEventListener(ev, fn) { this._el.removeEventListener(ev, fn); return this; }

  QuerySelector(sel)    { const el = this._el.querySelector(sel);       return el?.__mock ?? null; }
  QuerySelectorAll(sel) { return [...this._el.querySelectorAll(sel)].map(el => el.__mock).filter(Boolean); }

  toJSON() {
    return {
      type:       this._type,
      properties: { ...this._props },
      styles:     { ...this._stylesMap },
      children:   this._children.map(c => c.toJSON?.()).filter(Boolean),
    };
  }
}

export class UILabel extends MockUIElement {
  constructor() {
    super('div', 'UILabel', 'bs-label');
    this.style.backgroundColor = 'rgba(0,0,0,0)';
    this.style.color           = '#ffffff';
    this.style.fontSize        = '16px';
  }
}

export class UIButton extends MockUIElement {
  constructor() {
    super('button', 'UIButton', 'bs-button');
    this.style.backgroundColor = 'rgba(50, 80, 180, 0.7)';
    this.style.borderWidth      = '1px';
    this.style.borderColor      = 'rgba(100, 140, 255, 0.4)';
    this.style.borderRadius     = '5px';
    this.style.color            = '#ffffff';
    this.style.fontSize         = '16px';
  }
}

export class UIScrollView extends MockUIElement {
  constructor() { super('div', 'UIScrollView', 'bs-scroll-view'); }
}

export class UIVisualElement extends MockUIElement {
  constructor() { super('div', 'UIVisualElement', 'bs-visual-element'); }
}

export class UISlider extends MockUIElement {
  constructor() {
    super('input', 'UISlider', 'bs-slider');
    this._el.type = 'range';
    this._min   = 0;
    this._max   = 100;
    this._value = 50;
  }
  SetRange(min, max) {
    this._min = min; this._max = max;
    this._el.min = min; this._el.max = max;
    return this;
  }
  SetValue(v) {
    this._value = v;
    this._el.value = v;
    return this;
  }
  OnChange(fn) { this._el.addEventListener('input', e => fn({ value: parseFloat(e.target.value) })); return this; }
  toJSON() {
    return { ...super.toJSON(), min: this._min, max: this._max, value: this._value };
  }
}

export class UIToggle extends MockUIElement {
  constructor() {
    super('label', 'UIToggle', 'bs-toggle');
    this._checkbox = document.createElement('input');
    this._checkbox.type = 'checkbox';
    this._el.appendChild(this._checkbox);
    this._checked = false;
  }
  SetChecked(v) {
    this._checked = v;
    if (v) this._checkbox.setAttribute('checked', '');
    else   this._checkbox.removeAttribute('checked');
    return this;
  }
  OnChange(fn) { this._checkbox.addEventListener('change', e => fn({ value: e.target.checked })); return this; }
  toJSON() {
    return { ...super.toJSON(), checked: this._checked };
  }
}

class MockRoot {
  constructor(el) {
    this._el        = el;
    this._stylesMap = {};
    this._children  = [];
    this.style      = styleProxy(el.style, this._stylesMap);
  }
  AppendChild(child) {
    this._children.push(child);
    if (child?._el) this._el.appendChild(child._el);
    return this;
  }
  RemoveChild(child) {
    const i = this._children.indexOf(child);
    if (i !== -1) this._children.splice(i, 1);
    if (child?._el) this._el.removeChild(child._el);
    return this;
  }
  SetStyles(obj) { for (const [k, v] of Object.entries(obj)) this.style[k] = v; return this; }
}

export class BanterUIPanel {
  constructor({ resolution } = {}) {
    this._res          = resolution ? { x: resolution.x, y: resolution.y } : { x: 400, y: 200 };
    this._el           = document.createElement('div');
    this._el.className = 'bs-panel';
    this._el.style.width  = `${this._res.x}px`;
    this._el.style.height = `${this._res.y}px`;

    // Root lives in a separate inner div so the panel div keeps its pixel
    // dimensions for the browser preview (otherwise root.style.width='100%'
    // overwrites the explicit pixel width set above).
    const rootEl = document.createElement('div');
    this._el.appendChild(rootEl);

    this.root = new MockRoot(rootEl);
    this.root.style.width           = '100%';
    this.root.style.height          = '100%';
    this.root.style.backgroundColor = '#10121c';
  }
  toJSON() {
    return {
      type:       'BanterUIPanel',
      resolution: { ...this._res },
      rootStyles: { ...this.root._stylesMap },
      children:   this.root._children.map(c => c.toJSON?.()).filter(Boolean),
    };
  }
}

export class GameObject {
  constructor({ name = 'GameObject' } = {}) {
    this.name        = name;
    this._el         = document.createElement('div');
    this._el.className = 'bs-gameobject';
    this._el.title   = name;
    this._components = [];
  }
  AddComponent(component) {
    this._components.push(component);
    if (component?._el) this._el.appendChild(component._el);
    return component;
  }
  toJSON() {
    return {
      name:       this.name,
      components: this._components.map(c => c.toJSON?.()).filter(Boolean),
    };
  }
}

export const MockBS = {
  Vector2, Vector3, Vector4, Quaternion,
  GameObject, BanterUIPanel,
  UILabel, UIButton, UISlider, UIToggle, UIScrollView, UIVisualElement,
  PN,
};
