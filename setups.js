// Registry of all experimental setups.
// Each setup has its own .storybook-[name]/ config, story directory at
// src/[name]/, and dedicated ports so multiple setups can run simultaneously.
//
// Add a new setup:
//   1. Add an entry here
//   2. Create .storybook-[name]/main.js (and preview.js, preview-head.html)
//   3. Create src/[name]/atoms/ and src/[name]/molecules/
//   4. Add "storybook:[name]", "relay:[name]", "dev:[name]" scripts to package.json

export const setups = {
  html:        { storybookPort: 6006, relayPort: 3333 },
  'threejs-2d': { storybookPort: 6007, relayPort: 3334 },
  'threejs-3d': { storybookPort: 6008, relayPort: 3335 },
  'audio':      { storybookPort: 6009, relayPort: 3336 },
  'openbrush':  { storybookPort: 6010, relayPort: 3337 },
};
