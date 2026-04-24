// Paste into Banter browser console, or load via <script> in index.html

window.addEventListener('bs-loaded', () => {
  const scene = BS.BanterScene.GetInstance();

  scene.On('unity-loaded', async () => {
    console.log('[ui-test] starting test');

    const panelObj = new BS.GameObject({
      name: 'UIPanel',
      localPosition: new BS.Vector3(0, 1.5, 2),
      localEulerAngles: new BS.Vector3(0, 180, 0),
    });

    const panel = await panelObj.AddComponent(new BS.BanterUI(new BS.Vector2(512, 512), false));

    console.log('[ui-test] panel oid:', panel.oid);

    // White background filling the whole panel
    const bg = panel.CreateVisualElement();
    await bg.Async();
    bg.SetStyles({ width: '100%', height: '100%', backgroundColor: '#1a1a2e' });

    const label = panel.CreateLabel('Hello World', bg);
    await label.Async();
    label.style.fontSize = '48px';
    label.style.color = '#ffffff';

    console.log('[ui-test] done');
  });
});
