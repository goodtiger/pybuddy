import * as Blockly from 'blockly';

export const kidTheme = Blockly.Theme.defineTheme('kid', {
  name: 'kid',
  base: Blockly.Themes.Classic,
  blockStyles: {
    turtle_blocks: { colourPrimary: '#4caf50', colourSecondary: '#c8e6c9', colourTertiary: '#388e3c' },
  },
  categoryStyles: {
    turtle_category: { colour: '#4caf50' },
  },
});
