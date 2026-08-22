import { altspaceUiStory } from '../story.js';

export default { title: 'Altspace-UI/Atoms/VisualElement' };

const range  = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });
const select = (...options)          => ({ control: { type: 'select', options } });

// ─── VisualElement (all properties) ──────────────────────────────────────────
// Three inner boxes are shown so flex/alignment properties are visible.

export const VisualElement = {
  args: {
    panelWidth:      360,
    panelHeight:     280,
    width:           300,
    height:          220,
    backgroundColor: '#1e2030',
    borderColor:     '#3250b4',
    borderWidth:     2,
    borderRadius:    8,
    paddingTop:      12,
    paddingRight:    12,
    paddingBottom:   12,
    paddingLeft:     12,
    opacity:         1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    flexWrap:        'nowrap',
  },
  argTypes: {
    panelWidth:      range(100, 800, 20),
    panelHeight:     range(80, 600, 20),
    width:           range(40, 700, 10),
    height:          range(40, 500, 10),
    backgroundColor: { control: 'color' },
    borderColor:     { control: 'color' },
    borderWidth:     range(0, 16, 1),
    borderRadius:    range(0, 80, 4),
    paddingTop:      range(0, 80, 4),
    paddingRight:    range(0, 80, 4),
    paddingBottom:   range(0, 80, 4),
    paddingLeft:     range(0, 80, 4),
    opacity:         range(0, 1, 0.05),
    flexDirection:   select('row', 'column', 'row-reverse', 'column-reverse'),
    alignItems:      select('flex-start', 'flex-end', 'center', 'stretch'),
    justifyContent:  select('flex-start', 'flex-end', 'center', 'space-between', 'space-around'),
    gap:             range(0, 60, 4),
    flexWrap:        select('nowrap', 'wrap', 'wrap-reverse'),
  },
  render: ({
    panelWidth, panelHeight, width, height,
    backgroundColor, borderColor, borderWidth, borderRadius,
    paddingTop, paddingRight, paddingBottom, paddingLeft,
    opacity, flexDirection, alignItems, justifyContent, gap, flexWrap,
  }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'VisualElement' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(panelWidth, panelHeight) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display        = 'flex';
    panel.root.style.alignItems     = 'center';
    panel.root.style.justifyContent = 'center';

    const box = new BS.UIVisualElement();
    box.style.width           = `${width}px`;
    box.style.height          = `${height}px`;
    box.style.backgroundColor = backgroundColor;
    box.style.borderColor     = borderColor;
    box.style.borderWidth     = `${borderWidth}px`;
    box.style.borderRadius    = `${borderRadius}px`;
    box.style.paddingTop      = `${paddingTop}px`;
    box.style.paddingRight    = `${paddingRight}px`;
    box.style.paddingBottom   = `${paddingBottom}px`;
    box.style.paddingLeft     = `${paddingLeft}px`;
    box.style.opacity         = opacity;
    box.style.display         = 'flex';
    box.style.flexDirection   = flexDirection;
    box.style.alignItems      = alignItems;
    box.style.justifyContent  = justifyContent;
    box.style.gap             = `${gap}px`;
    box.style.flexWrap        = flexWrap;

    const childColors = ['#e05265', '#52e08a', '#5b9fff'];
    childColors.forEach(color => {
      const child = new BS.UIVisualElement();
      child.style.width           = '60px';
      child.style.height          = '60px';
      child.style.backgroundColor = color;
      child.style.borderRadius    = '4px';
      box.AppendChild(child);
    });

    panel.root.AppendChild(box);
    return obj;
  }),
};

// ─── Flex Row ─────────────────────────────────────────────────────────────────
// Flex layout lives on an inner VE container — gap/flexWrap must not be on the
// panel root as they cause SetStyles to abort in Unity UI Toolkit.

export const FlexRow = {
  args: { gap: 8, justifyContent: 'flex-start', alignItems: 'center' },
  argTypes: {
    gap:            range(0, 40, 4),
    justifyContent: select('flex-start', 'flex-end', 'center', 'space-between', 'space-around'),
    alignItems:     select('flex-start', 'flex-end', 'center', 'stretch'),
  },
  render: ({ gap, justifyContent, alignItems }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'FlexRow' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(400, 80) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.width           = '100%';
    panel.root.style.height          = '100%';

    const container = new BS.UIVisualElement();
    container.style.width          = '100%';
    container.style.height         = '100%';
    container.style.display        = 'flex';
    container.style.flexDirection  = 'row';
    container.style.alignItems     = alignItems;
    container.style.justifyContent = justifyContent;
    container.style.gap            = `${gap}px`;
    container.style.paddingTop     = '8px';
    container.style.paddingRight   = '8px';
    container.style.paddingBottom  = '8px';
    container.style.paddingLeft    = '8px';

    const colors = ['#e05265', '#52e08a', '#5b9fff', '#e0b052'];
    colors.forEach((color, i) => {
      const box = new BS.UIVisualElement();
      box.style.width           = '60px';
      box.style.height          = '60px';
      box.style.backgroundColor = color;
      box.style.borderRadius    = '4px';

      const lbl = new BS.UILabel();
      lbl.SetProperty(BS.PN.text, String(i + 1));
      lbl.style.fontSize       = '20px';
      lbl.style.unityTextAlign = 'middle-center';
      lbl.style.width          = '100%';
      lbl.style.height         = '100%';

      box.AppendChild(lbl);
      container.AppendChild(box);
    });

    panel.root.AppendChild(container);
    return obj;
  }),
};

// ─── Flex Column ──────────────────────────────────────────────────────────────

export const FlexColumn = {
  args: { gap: 8, justifyContent: 'flex-start', alignItems: 'stretch' },
  argTypes: {
    gap:            range(0, 40, 4),
    justifyContent: select('flex-start', 'flex-end', 'center', 'space-between', 'space-around'),
    alignItems:     select('flex-start', 'flex-end', 'center', 'stretch'),
  },
  render: ({ gap, justifyContent, alignItems }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'FlexColumn' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(200, 280) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.width           = '100%';
    panel.root.style.height          = '100%';

    const container = new BS.UIVisualElement();
    container.style.width          = '100%';
    container.style.height         = '100%';
    container.style.display        = 'flex';
    container.style.flexDirection  = 'column';
    container.style.alignItems     = alignItems;
    container.style.justifyContent = justifyContent;
    container.style.gap            = `${gap}px`;
    container.style.paddingTop     = '8px';
    container.style.paddingRight   = '8px';
    container.style.paddingBottom  = '8px';
    container.style.paddingLeft    = '8px';

    const items = ['Alpha', 'Beta', 'Gamma', 'Delta'];
    items.forEach((text, i) => {
      const row = new BS.UIVisualElement();
      row.style.display         = 'flex';
      row.style.alignItems      = 'center';
      row.style.paddingTop      = '8px';
      row.style.paddingRight    = '12px';
      row.style.paddingBottom   = '8px';
      row.style.paddingLeft     = '12px';
      row.style.backgroundColor = i % 2 === 0 ? '#1e2030' : '#252840';
      row.style.borderRadius    = '4px';

      const lbl = new BS.UILabel();
      lbl.SetProperty(BS.PN.text, text);
      lbl.style.fontSize = '16px';

      row.AppendChild(lbl);
      container.AppendChild(row);
    });

    panel.root.AppendChild(container);
    return obj;
  }),
};

// ─── Flex Wrap ────────────────────────────────────────────────────────────────

export const FlexWrap = {
  args: { itemSize: 70, gap: 8 },
  argTypes: {
    itemSize: range(40, 120, 10),
    gap:      range(0, 32, 4),
  },
  render: ({ itemSize, gap }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'FlexWrap' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(340, 280) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.width           = '100%';
    panel.root.style.height          = '100%';

    const container = new BS.UIVisualElement();
    container.style.width         = '100%';
    container.style.height        = '100%';
    container.style.display       = 'flex';
    container.style.flexDirection = 'row';
    container.style.flexWrap      = 'wrap';
    container.style.alignContent  = 'flex-start';
    container.style.gap           = `${gap}px`;
    container.style.paddingTop    = '8px';
    container.style.paddingRight  = '8px';
    container.style.paddingBottom = '8px';
    container.style.paddingLeft   = '8px';

    const colors = [
      '#e05265','#52e08a','#5b9fff','#e0b052',
      '#b052e0','#52cce0','#e0a252','#7fe052',
    ];
    colors.forEach((color, i) => {
      const box = new BS.UIVisualElement();
      box.style.width           = `${itemSize}px`;
      box.style.height          = `${itemSize}px`;
      box.style.backgroundColor = color;
      box.style.borderRadius    = '6px';
      box.style.display         = 'flex';
      box.style.alignItems      = 'center';
      box.style.justifyContent  = 'center';

      const lbl = new BS.UILabel();
      lbl.SetProperty(BS.PN.text, String(i + 1));
      lbl.style.fontSize = '18px';

      box.AppendChild(lbl);
      container.AppendChild(box);
    });

    panel.root.AppendChild(container);
    return obj;
  }),
};

// ─── Nested ───────────────────────────────────────────────────────────────────

export const Nested = {
  args: { depth: 3, baseSize: 220, padding: 16 },
  argTypes: {
    depth:    range(1, 5, 1),
    baseSize: range(100, 300, 20),
    padding:  range(8, 40, 4),
  },
  render: ({ depth, baseSize, padding }) => altspaceUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'VENested' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(baseSize + 40, baseSize + 40) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display        = 'flex';
    panel.root.style.alignItems     = 'center';
    panel.root.style.justifyContent = 'center';

    const colors = ['#3250b4','#1a5c38','#5c1a28','#5c4a1a','#2a1a5c'];

    function makeBox(d) {
      const box = new BS.UIVisualElement();
      box.style.backgroundColor = colors[d % colors.length];
      box.style.borderRadius    = '6px';
      box.style.paddingTop      = `${padding}px`;
      box.style.paddingRight    = `${padding}px`;
      box.style.paddingBottom   = `${padding}px`;
      box.style.paddingLeft     = `${padding}px`;
      box.style.display         = 'flex';
      box.style.alignItems      = 'center';
      box.style.justifyContent  = 'center';
      if (d < depth - 1) box.AppendChild(makeBox(d + 1));
      return box;
    }

    const root = makeBox(0);
    root.style.width  = `${baseSize}px`;
    root.style.height = `${baseSize}px`;
    panel.root.AppendChild(root);
    return obj;
  }),
};
