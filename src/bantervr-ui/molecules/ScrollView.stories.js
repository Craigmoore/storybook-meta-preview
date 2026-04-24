import { banterUiStory } from '../story.js';

export default { title: 'BanterVR-UI/Molecules/ScrollView' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ─── Vertical List ────────────────────────────────────────────────────────────

export const VerticalList = {
  args: { itemCount: 12, itemHeight: 44, panelHeight: 200 },
  argTypes: {
    itemCount:   range(3, 24, 1),
    itemHeight:  range(28, 80, 4),
    panelHeight: range(100, 400, 20),
  },
  render: ({ itemCount, itemHeight, panelHeight }) => banterUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'ScrollVertical' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(320, panelHeight) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.width  = '100%';
    panel.root.style.height = '100%';

    const sv = new BS.UIScrollView();
    sv.style.width  = '100%';
    sv.style.height = '100%';

    for (let i = 0; i < itemCount; i++) {
      const row = new BS.UIVisualElement();
      row.style.display           = 'flex';
      row.style.alignItems        = 'center';
      row.style.paddingLeft       = '16px';
      row.style.paddingRight      = '16px';
      row.style.height            = `${itemHeight}px`;
      row.style.borderBottomColor = '#2a2d40';
      row.style.borderBottomWidth = '1px';
      row.style.backgroundColor   = i % 2 === 0 ? '#10121c' : '#14172a';

      const lbl = new BS.UILabel();
      lbl.SetProperty(BS.PN.text, `Item ${i + 1}`);
      lbl.style.fontSize = '16px';

      row.AppendChild(lbl);
      sv.AppendChild(row);
    }

    panel.root.AppendChild(sv);
    return obj;
  }),
};

// ─── Horizontal List ──────────────────────────────────────────────────────────

export const HorizontalList = {
  args: { itemCount: 8, itemWidth: 120, panelWidth: 400 },
  argTypes: {
    itemCount:  range(2, 16, 1),
    itemWidth:  range(60, 200, 10),
    panelWidth: range(200, 600, 20),
  },
  render: ({ itemCount, itemWidth, panelWidth }) => banterUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'ScrollHorizontal' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(panelWidth, 160) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.width  = '100%';
    panel.root.style.height = '100%';

    const sv = new BS.UIScrollView();
    sv.style.width         = '100%';
    sv.style.height        = '100%';
    sv.style.flexDirection = 'row';

    const colors = ['#3250b4','#1a5c38','#5c1a28','#5c4a1a','#2a1a5c','#1a4a5c','#3a5c1a','#5c3a1a'];

    for (let i = 0; i < itemCount; i++) {
      const card = new BS.UIVisualElement();
      card.style.width           = `${itemWidth}px`;
      card.style.height          = '120px';
      card.style.backgroundColor = colors[i % colors.length];
      card.style.borderRadius    = '8px';
      card.style.display         = 'flex';
      card.style.alignItems      = 'center';
      card.style.justifyContent  = 'center';
      card.style.flexShrink      = '0';
      card.style.marginRight     = '8px';

      const lbl = new BS.UILabel();
      lbl.SetProperty(BS.PN.text, `Card ${i + 1}`);
      lbl.style.fontSize = '14px';

      card.AppendChild(lbl);
      sv.AppendChild(card);
    }

    panel.root.AppendChild(sv);
    return obj;
  }),
};

// ─── Mixed Content ────────────────────────────────────────────────────────────

export const MixedContent = {
  args: { panelHeight: 280 },
  argTypes: {
    panelHeight: range(150, 500, 20),
  },
  render: ({ panelHeight }) => banterUiStory((scene, BS) => {
    const obj   = new BS.GameObject({ name: 'ScrollMixed' });
    const panel = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(320, panelHeight) }));
    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.width  = '100%';
    panel.root.style.height = '100%';

    const sv = new BS.UIScrollView();
    sv.style.width  = '100%';
    sv.style.height = '100%';

    const sections = [
      { heading: 'Audio',    items: ['Music Volume', 'SFX Volume', 'Voice Volume'] },
      { heading: 'Graphics', items: ['Resolution', 'Anti-aliasing', 'Shadows', 'Draw Distance'] },
      { heading: 'Controls', items: ['Sensitivity', 'Invert Y'] },
    ];

    sections.forEach(({ heading, items }) => {
      const header = new BS.UIVisualElement();
      header.style.paddingTop    = '10px';
      header.style.paddingRight  = '16px';
      header.style.paddingBottom = '4px';
      header.style.paddingLeft   = '16px';
      header.style.backgroundColor = '#1e2030';

      const hLbl = new BS.UILabel();
      hLbl.SetProperty(BS.PN.text, heading.toUpperCase());
      hLbl.style.fontSize      = '12px';
      hLbl.style.color         = '#8888aa';
      hLbl.style.letterSpacing = '1px';
      header.AppendChild(hLbl);
      sv.AppendChild(header);

      items.forEach(item => {
        const row = new BS.UIVisualElement();
        row.style.display           = 'flex';
        row.style.alignItems        = 'center';
        row.style.paddingLeft       = '16px';
        row.style.paddingRight      = '16px';
        row.style.height            = '44px';
        row.style.borderBottomColor = '#2a2d40';
        row.style.borderBottomWidth = '1px';

        const lbl = new BS.UILabel();
        lbl.SetProperty(BS.PN.text, item);
        lbl.style.fontSize = '15px';
        row.AppendChild(lbl);
        sv.AppendChild(row);
      });
    });

    panel.root.AppendChild(sv);
    return obj;
  }),
};
