import { altspace3dStory, hexToVec } from '../story.js';

export default { title: 'Altspace-3D/Atoms/Primitives' };

const range = (min, max, step = 0.1) => ({ control: { type: 'range', min, max, step } });

export const Box = {
  args:     { width: 1, height: 1, depth: 1, color: '#e94560' },
  argTypes: { width: range(0.1, 3), height: range(0.1, 3), depth: range(0.1, 3), color: { control: 'color' } },
  render: ({ width, height, depth, color }) => altspace3dStory((_, BS) => {
    const [r, g, b] = hexToVec(color);
    const obj = new BS.GameObject({ name: 'Box' });
    obj.AddComponent(new BS.BanterBox({ width, height, depth }));
    obj.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(r, g, b, 1) }));
    return obj;
  }),
};

export const Sphere = {
  args:     { radius: 0.5, color: '#4488ff' },
  argTypes: { radius: range(0.1, 2), color: { control: 'color' } },
  render: ({ radius, color }) => altspace3dStory((_, BS) => {
    const [r, g, b] = hexToVec(color);
    const obj = new BS.GameObject({ name: 'Sphere' });
    obj.AddComponent(new BS.BanterSphere({ radius }));
    obj.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(r, g, b, 1) }));
    return obj;
  }),
};

export const Cylinder = {
  args:     { radiusTop: 0.3, radiusBottom: 0.3, height: 1, color: '#44cc77' },
  argTypes: { radiusTop: range(0.05, 1), radiusBottom: range(0.05, 1), height: range(0.1, 3), color: { control: 'color' } },
  render: ({ radiusTop, radiusBottom, height, color }) => altspace3dStory((_, BS) => {
    const [r, g, b] = hexToVec(color);
    const obj = new BS.GameObject({ name: 'Cylinder' });
    obj.AddComponent(new BS.BanterCylinder({ radiusTop, radiusBottom, height }));
    obj.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(r, g, b, 1) }));
    return obj;
  }),
};

export const Cone = {
  args:     { radius: 0.5, height: 1.2, color: '#ffaa22' },
  argTypes: { radius: range(0.1, 2), height: range(0.1, 3), color: { control: 'color' } },
  render: ({ radius, height, color }) => altspace3dStory((_, BS) => {
    const [r, g, b] = hexToVec(color);
    const obj = new BS.GameObject({ name: 'Cone' });
    obj.AddComponent(new BS.BanterCone({ radius, height }));
    obj.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(r, g, b, 1) }));
    return obj;
  }),
};

export const Torus = {
  args:     { radius: 0.6, tube: 0.2, color: '#cc44ee' },
  argTypes: { radius: range(0.2, 2), tube: range(0.05, 0.5), color: { control: 'color' } },
  render: ({ radius, tube, color }) => altspace3dStory((_, BS) => {
    const [r, g, b] = hexToVec(color);
    const obj = new BS.GameObject({ name: 'Torus' });
    obj.AddComponent(new BS.BanterTorus({ radius, tube }));
    obj.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(r, g, b, 1) }));
    return obj;
  }),
};

export const TorusKnot = {
  args:     { radius: 0.4, tube: 0.12, color: '#12dfdf' },
  argTypes: { radius: range(0.1, 1.5), tube: range(0.02, 0.4), color: { control: 'color' } },
  render: ({ radius, tube, color }) => altspace3dStory((_, BS) => {
    const [r, g, b] = hexToVec(color);
    const obj = new BS.GameObject({ name: 'TorusKnot' });
    obj.AddComponent(new BS.BanterTorusKnot({ radius, tube }));
    obj.AddComponent(new BS.BanterMaterial({ color: new BS.Vector4(r, g, b, 1), side: 'Double' }));
    return obj;
  }),
};

