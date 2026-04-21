import * as THREE from 'three';
import { setColor, setSize } from '../utils.js';
import { edgesFromGeometry } from '../geometry.js';
import { openbrushStory } from '../story.js';
import { makeTree, makeRock, makeTerrain, makeRoadNetwork } from './structures.js';

export default { title: 'OpenBrush/Molecules/Structures' };

const WHITE = setColor(0.45, 0.45, 0.45);
const RED   = setColor(0.914, 0.271, 0.376);
const SIZE  = setSize(0.03);

export const Terrain = {
  render: () => openbrushStory({ commands: [SIZE, ...makeTerrain()] }),
};

export const Road = {
  render: () => openbrushStory({ commands: [SIZE, ...makeRoadNetwork()] }),
};

export const Rocks = {
  render: () => openbrushStory({ commands: [
    SIZE,
    ...makeRock(-0.5,  0,  0.1, 0.45),
    ...makeRock( 0.4,  0, -0.1, 0.3),
    ...makeRock( 0,    0,  0.5, 0.22),
  ]}),
};

export const Tree = {
  render: () => openbrushStory({ commands: [SIZE, ...makeTree()] }),
};

export const SmallHouse = {
  render: () => {
    const s = 1.4;
    // r chosen so the prism base width (r√3) exactly matches the cube face width (s)
    const r = s / Math.sqrt(3);
    // after rotateX(-π/2), prism base sits at local y = -r/2; shift up so it meets cube top (s/2)
    const roofY = s / 2 + r / 2;
    const roofMatrix = new THREE.Matrix4()
      .makeTranslation(0, roofY, 0)
      .multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    return openbrushStory({ commands: [
      WHITE, SIZE,
      ...edgesFromGeometry(new THREE.BoxGeometry(s, s, s)),
      RED,
      ...edgesFromGeometry(new THREE.CylinderGeometry(r, r, s, 3), roofMatrix),
    ]});
  },
};
