// Prepare clean electron-builder inputs. Never modify out, dist, profiles or active animations.
// This command does not build, launch, install, activate, publish or call an AI provider.
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
function option(name) {
  const index = args.indexOf(name);
  if (index < 0 || !args[index + 1]) throw new Error(`Missing ${name}`);
  return args[index + 1];
}
const bundles = path.resolve(option('--bundles'));
const output = path.resolve(option('--output'));
const platform = option('--platform');
const arch = option('--arch');
if (!['win', 'mac'].includes(platform) || !['x64', 'arm64'].includes(arch) || (platform === 'win' && arch !== 'x64')) throw new Error('Unsupported release target');
const within = (parent, target) => {
  const relative = path.relative(parent, target);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
};
if (!path.isAbsolute(option('--output')) || !path.isAbsolute(option('--bundles')) || within(root, output) || within(root, bundles)) throw new Error('Release outputs must be absolute and outside the repository');
for (const folder of [output, bundles]) {
  let current = folder;
  while (true) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error('Linked build path is not allowed');
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
}
if (fs.existsSync(output)) throw new Error('Staging output already exists; inspect before reuse');
for (const entry of ['main/index.js', 'preload/index.js', 'renderer/index.html']) if (!fs.existsSync(path.join(bundles, entry))) throw new Error(`Missing bundle ${entry}`);
if (require(path.join(root, 'node_modules/electron/package.json')).version !== '44.2.0') throw new Error('Expected Electron 44.2.0');
const config = yaml.load(fs.readFileSync(path.join(root, 'electron-builder.yml'), 'utf8'));
const nodeFile = path.join(root, 'resources/bin', platform === 'win' ? 'node.exe' : 'node');
if (!fs.existsSync(nodeFile)) throw new Error('Portable Node is missing');
fs.mkdirSync(path.join(output, 'initial/src'), { recursive: true });
// Neutral first-run content exists only in staging. Saved sessions continue to restore normally.
const starter = `// @title: Motion Suite Pro
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
interface Props {accentColor?: string; backgroundColor?: string; titleText?: string; subtitleText?: string; badgeText?: string; isTransparent?: boolean; scale?: number; offsetX?: number; offsetY?: number; glowIntensity?: number; speedMultiplier?: number;}
export const DynamicMotion: React.FC<Props> = ({accentColor='#72b7ad', backgroundColor='#15191d', titleText='', subtitleText='', badgeText='', isTransparent=false, scale=1, offsetX=0, offsetY=0, glowIntensity=0, speedMultiplier=1}) => {
 const frame=useCurrentFrame(); const {width,height,durationInFrames}=useVideoConfig();
 const phase=Math.max(0,Math.min(1,frame*speedMultiplier/Math.max(1,durationInFrames-1)));
 return <AbsoluteFill style={{backgroundColor:isTransparent?'transparent':backgroundColor,alignItems:'center',justifyContent:'center',color:accentColor}}><div style={{transform:\`translate(\${offsetX}px,\${offsetY}px) scale(\${scale})\`,textAlign:'center'}}><svg width={width*.22} height={height*.35} viewBox="0 0 100 100" style={{filter:glowIntensity>0?\`drop-shadow(0 0 \${glowIntensity}px \${accentColor})\`:'none'}}><circle cx="50" cy="50" r="32" fill="none" stroke={accentColor} strokeWidth="3" pathLength={1} strokeDasharray={1} strokeDashoffset={1-phase}/></svg>{badgeText&&<div>{badgeText}</div>}{titleText&&<div>{titleText}</div>}{subtitleText&&<div>{subtitleText}</div>}</div></AbsoluteFill>;
};
export const VibeGraphic=DynamicMotion;
export default DynamicMotion;
`;
fs.writeFileSync(path.join(output, 'initial/src/VibeGraphic.tsx'), starter);
const initial = { width: 1920, height: 1080, fps: 30, durationInFrames: 150, isTransparent: false, titleText: '', subtitleText: '', badgeText: '', scale: 1, offsetX: 0, offsetY: 0, glowIntensity: 0, speedMultiplier: 1 };
for (const file of ['src/video_config.json', 'video_config.json']) fs.writeFileSync(path.join(output, 'initial', file), JSON.stringify(initial, null, 2));
config.directories = { ...config.directories, output: path.join(output, 'artifacts'), buildResources: path.join(root, 'build') };
config.files = ['package.json', { from: bundles, to: 'out', filter: ['**/*'] }, { from: path.join(root, 'resources/icon.png'), to: 'resources/icon.png' }];
config.extraResources = config.extraResources.map(item => {
  const result = { ...item, from: path.resolve(root, item.from) };
  if (item.to === 'remotion_env') result.filter = [...item.filter, '!src/VibeGraphic.tsx', '!src/video_config.json', '!video_config.json', '!render_props.json', '!public/assets/**/*', '!src/prototypes/**/*', '!**/*.log', '!**/.env*', '!**/private*.pem', '!**/license.json', '!**/clock_sync.dat'];
  return result;
});
config.extraResources.push({ from: path.join(output, 'initial'), to: 'remotion_env', filter: ['**/*'] });
config.extraFiles = config.extraFiles.map(item => ({ ...item, from: path.resolve(root, item.from) }));
for (const name of ['win', 'mac']) if (config[name]?.extraResources) config[name].extraResources = config[name].extraResources.map(item => ({ ...item, from: path.resolve(root, item.from) }));
config.win.icon = path.join(root, config.win.icon);
config.mac.icon = path.join(root, config.mac.icon);
for (const key of ['installerIcon', 'uninstallerIcon', 'installerHeaderIcon']) config.nsis[key] = path.join(root, config.nsis[key]);
fs.writeFileSync(path.join(output, 'release-config.json'), JSON.stringify(config, null, 2));
console.log(path.join(output, 'release-config.json'));
