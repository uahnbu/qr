const { generateImages } = require('pwa-asset-generator');
const { rename } = require('fs').promises;

const pwaArgs = ['dist/logo.png', 'dist/images'];
const appleIcon = 'apple-icon-180.png';
const manifest = 'dist/manifest.json';
const index = '';

(async () => {
  console.log('Generating Apple icon...');
  await generateImages(...pwaArgs, {
    background: '#227',
    iconOnly: true,
    log: false
  });
  console.log('Storing Apple icon');
  await rename('dist/images/' + appleIcon, 'dist/' + appleIcon);
  console.log('Generating transparent icons...');
  await generateImages(...pwaArgs, {
    ...(manifest && { manifest }),
    ...(index && {index}),
    opaque: false,
    favicon: true,
    mstile: true,
    log: false
  });
  // TODO: Reprettify index.html
  console.log('Replacing Apple icon...');
  await rename('dist/' + appleIcon, 'dist/images/' + appleIcon);
  console.log('Generating Apple splash screens...');
  await generateImages(...pwaArgs, {
    background: '#227',
    splashOnly: true,
    log: false
  });
  console.log('Completed.');
})();