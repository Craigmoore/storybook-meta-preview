import { altspace3dStory } from '../story.js';

export default { title: 'Altspace-3D/Molecules/Volumes' };

export const Volumes = {
  args: {},
  render: () => altspace3dStory((_, BS) => {
    const items = [
      { comp: new BS.BanterBox({ width: 0.6, height: 0.6, depth: 0.6 }),                  color: [0.91, 0.27, 0.38, 1], x: -3   },
      { comp: new BS.BanterSphere({ radius: 0.35 }),                                       color: [0.27, 0.53, 1,    1], x: -1.8 },
      { comp: new BS.BanterCylinder({ radiusTop: 0.25, radiusBottom: 0.25, height: 0.7 }), color: [0.27, 0.8,  0.47, 1], x: -0.6 },
      { comp: new BS.BanterCone({ radius: 0.35, height: 0.8 }),                            color: [1,    0.67, 0.13, 1], x:  0.6 },
      { comp: new BS.BanterTorus({ radius: 0.3, tube: 0.1 }),                              color: [0.8,  0.27, 0.93, 1], x:  1.8 },
      { comp: new BS.BanterTorusKnot({ radius: 0.25, tube: 0.08 }),                        color: [0.07, 0.87, 0.87, 1], x:  3,   side: 'Double' },
    ];
    return items.map(({ comp, color, x, side }) => {
      const obj = new BS.GameObject({ name: comp._type, localPosition: new BS.Vector3(x, 0, 0) });
      obj.AddComponent(comp);
      obj.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(...color), ...(side ? { side } : {}) }));
      return obj;
    });
  }, { cameraPosition: { x: 0, y: 2, z: 6 } }),
};
