// BanterVR UI demo — load via <script src="..."> in index.html or paste into
// the browser console. Demonstrates all known-good patterns for BanterUI.
//
// Rules discovered through testing (violations cause silent failures):
//
//  STYLES
//  • Never use compound shorthands: padding, margin, border, gap, flex.
//    Use individual properties: paddingTop/Right/Bottom/Left, marginBottom, etc.
//    Banter's SetStyles aborts the entire call on any unsupported property,
//    discarding every other property in the same call.
//  • Never use: gap, rowGap, columnGap, wordSpacing, unity* properties
//    (unityFontStyle, unityTextAlign, etc.) — all cause SetStyles to abort.
//  • Spacing between siblings: use marginBottom / marginRight on each child.
//
//  LABELS
//  • Always set backgroundColor:'rgba(0,0,0,0)' on UILabel.
//    Unity defaults to white; without the explicit override the label is opaque.
//
//  BUTTONS
//  • Do not set width on a UIButton in a flex-column layout.
//    UIButton uses content-box sizing; an explicit width causes its 1px border
//    to overflow the panel. Flex stretch sizes it correctly without a width.
//
//  SLIDERS
//  • Set lowValue and highValue via SetProperty, then WaitForEndOfFrame,
//    then set value. Setting value before the layout pass is ignored.
//
//  TOGGLES
//  • Set value via SetProperty('value', 'true') or SetProperty('value', 'false').
//    JS booleans and integers are silently ignored by the JS→Unity bridge.
//    Call WaitForEndOfFrame before setting value.
//  • Use panel.CreateToggle(parent) — do not pass a boolean as the first arg.

window.addEventListener('bs-loaded', () => {
  const scene = BS.BanterScene.GetInstance();

  scene.On('unity-loaded', async () => {
    const obj = new BS.GameObject({
      name:             'UIDemo',
      localPosition:    new BS.Vector3(0, 1.5, 2),
      localEulerAngles: new BS.Vector3(0, 180, 0),
    });

    const panel = await obj.AddComponent(new BS.BanterUI(new BS.Vector2(360, 300), false));

    // Root — flex column, individual padding only, no shorthand
    const root = panel.CreateVisualElement();
    await root.Async();
    root.SetStyles({
      width:           '100%',
      height:          '100%',
      backgroundColor: '#10121c',
      display:         'flex',
      flexDirection:   'column',
      paddingTop:      '16px',
      paddingRight:    '16px',
      paddingBottom:   '16px',
      paddingLeft:     '16px',
    });

    // ── Title label ───────────────────────────────────────────────────────────
    const title = panel.CreateLabel(undefined, root);
    await title.Async();
    title.text = 'BanterVR UI Demo';
    title.SetStyles({
      fontSize:        '20px',
      color:           '#ffffff',
      backgroundColor: 'rgba(0,0,0,0)', // required — Unity default is white
      marginBottom:    '14px',
    });

    // ── Slider ────────────────────────────────────────────────────────────────
    // CreateSlider(min, max, parent) sets the range at creation time,
    // but lowValue/highValue must also be set via SetProperty after Async().
    // WaitForEndOfFrame is required before setting value or it is ignored.
    const slider = panel.CreateSlider(0, 100, root);
    await slider.Async();
    slider.SetProperty('lowValue',  0);
    slider.SetProperty('highValue', 100);
    await scene.WaitForEndOfFrame();
    slider.SetProperty('value', 65);
    slider.SetStyles({ marginBottom: '14px' });

    // ── Toggle row ────────────────────────────────────────────────────────────
    const toggleRow = panel.CreateVisualElement(root);
    await toggleRow.Async();
    toggleRow.SetStyles({
      display:        'flex',
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
      marginBottom:   '14px',
    });

    const toggleLbl = panel.CreateLabel(undefined, toggleRow);
    await toggleLbl.Async();
    toggleLbl.text = 'Enable feature';
    toggleLbl.SetStyles({
      fontSize:        '16px',
      color:           '#cccccc',
      backgroundColor: 'rgba(0,0,0,0)',
    });

    // WaitForEndOfFrame required before setting value; pass string not boolean
    const toggle = panel.CreateToggle(toggleRow);
    await toggle.Async();
    await scene.WaitForEndOfFrame();
    toggle.SetProperty('value', 'true');
    toggle.SetStyles({ width: '40px', height: '20px' });

    // ── Button ────────────────────────────────────────────────────────────────
    // No width set — flex-column stretch fills the content area correctly.
    // Explicit width adds to the border under content-box, overflowing the panel.
    const btn = panel.CreateButton(root);
    await btn.Async();
    btn.text = 'Confirm';
    btn.SetStyles({ height: '44px', fontSize: '16px' });

    console.log('[ui-demo] done');
  });
});
