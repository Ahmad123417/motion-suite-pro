// @title: Motion Suite Pro
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
interface Props {accentColor?: string; backgroundColor?: string; titleText?: string; subtitleText?: string; badgeText?: string; isTransparent?: boolean; scale?: number; offsetX?: number; offsetY?: number; glowIntensity?: number; speedMultiplier?: number;}
export const DynamicMotion: React.FC<Props> = ({accentColor='#72b7ad', backgroundColor='#15191d', titleText='', subtitleText='', badgeText='', isTransparent=false, scale=1, offsetX=0, offsetY=0, glowIntensity=0, speedMultiplier=1}) => {
 const frame=useCurrentFrame(); const {width,height,durationInFrames}=useVideoConfig();
 const phase=Math.max(0,Math.min(1,frame*speedMultiplier/Math.max(1,durationInFrames-1)));
 return <AbsoluteFill style={{backgroundColor:isTransparent?'transparent':backgroundColor,alignItems:'center',justifyContent:'center',color:accentColor}}><div style={{transform:`translate(${offsetX}px,${offsetY}px) scale(${scale})`,textAlign:'center'}}><svg width={width*.22} height={height*.35} viewBox="0 0 100 100" style={{filter:glowIntensity>0?`drop-shadow(0 0 ${glowIntensity}px ${accentColor})`:'none'}}><circle cx="50" cy="50" r="32" fill="none" stroke={accentColor} strokeWidth="3" pathLength={1} strokeDasharray={1} strokeDashoffset={1-phase}/></svg>{badgeText&&<div>{badgeText}</div>}{titleText&&<div>{titleText}</div>}{subtitleText&&<div>{subtitleText}</div>}</div></AbsoluteFill>;
};
export const VibeGraphic=DynamicMotion;
export default DynamicMotion;
