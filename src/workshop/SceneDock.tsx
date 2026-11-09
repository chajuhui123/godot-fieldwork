import { useState } from "react";
import type { SceneNode } from "./session";
import type { SceneConfig } from "./types";
import { frogPixels } from "./frog";

function initialTree(config: SceneConfig, id: string, spatial: boolean): SceneNode[] {
  const nodes = [
    ["Main", "Node2D"], ["Main/Player", "Node2D"],
    ["Main/Player/Shape", "Polygon2D"],
    ...(config.beacon ? [["Main/Player/Beacon", "Marker2D"]] : []),
    ["Main/Status", "Label"],
    ...(id === "signals" ? [["Main/Timer", "Timer"]] : []),
  ];
  if (spatial) {
    const stage = "Main/Preview/World/Stage";
    nodes.push(["Main/Preview", "SubViewportContainer"], ["Main/Preview/World", "SubViewport"],
      [stage, "Node3D"], [stage+"/Mesh","MeshInstance3D"], [stage+"/Camera","Camera3D"],
      [stage+"/Light","DirectionalLight3D"], [stage+"/Environment","WorldEnvironment"]);
  }
  return nodes.map(([path,type]) => ({path,type}));
}

export function SceneDock({config, id, spatial, tree}: {
  config: SceneConfig; id: string; spatial: boolean; tree: SceneNode[];
}) {
  const [selected,setSelected] = useState("Main/Player");
  const nodes = tree.length ? tree : initialTree(config,id,spatial);
  const current = nodes.find(node => node.path === selected) ?? nodes[0];
  return <aside className="scene-dock" aria-label="씬 구조">
    <header>씬 <small>{tree.length ? "Remote" : "Local"}</small></header>
    <div className="scene-branches">
      {nodes.map(({path,type}) => <button type="button" key={path} title={type}
        aria-pressed={current.path === path} onClick={() => setSelected(path)}
        style={{paddingInlineStart: 8 + 10 * (path.split("/").length - 1)}}>
        <i aria-hidden="true">◇</i>{path.split("/").pop()}
      </button>)}
    </div>
    <div className="node-detail"><strong>{current.type}</strong><small>{current.path}</small></div>
  </aside>;
}

const colors: Record<string,string> = {"#":"#1a2e23",e:"#ade580",s:"#649450",b:"#99c95c"};
export function SceneLayout({config, spatial}: {config: SceneConfig; spatial: boolean}) {
  return <div className="scene-layout-view">
    <small>{spatial ? "기본 3D 씬 · 위에서 본 배치" : "씬 시작 배치 · 640 × 360"}</small>
    <svg viewBox="0 0 640 360" role="img" aria-label={spatial ? "원점의 Mesh와 Z축의 Camera" : "씬에 저장한 개구리의 시작 위치"}>
      <defs><pattern id="layout-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M32 0H0V32" fill="none" stroke="#475366"/></pattern></defs>
      <rect width="640" height="360" fill="url(#layout-grid)"/>
      {spatial ? <g fill="#b9cde2"><rect x="304" y="84" width="32" height="32"/>
        <text x="352" y="106">Mesh (0, 0, 0)</text><path d="M320 240l-12 20h24z"/>
        <text x="352" y="260">Camera (0, 0, 5)</text></g> :
        <g transform={`translate(${config.x-20} ${config.y-20})`}>
          {frogPixels.flatMap((row,y) => [...row].map((pixel,x) => pixel==="." ? null :
            <rect key={y*16+x} x={x*2.5} y={y*2.5} width="2.5" height="2.5" fill={colors[pixel]}/>))}
        </g>}
    </svg>
    {!spatial && <small>Player　({config.x}, {config.y})</small>}
  </div>;
}
