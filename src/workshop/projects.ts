import { frogPixels, frogTextureResource } from "./frog";
import { workshops, sources, type Workshop } from "../data/catalog";
import type { SceneConfig } from "./types";
import notice from "../data/attribution.json";
export const forLesson = (id: string) =>
  notice +
  "\n이 과제의 참고 문서: " +
  sources[id].docs +
  "\nGodot 4.5 기술 참고: " +
  sources[id].reference +
  "\n";
const project =
  '[application]\nconfig/name="Godot Fieldwork"\nrun/main_scene="res://main.tscn"\n\n[display]\nwindow/size/viewport_width=640\nwindow/size/viewport_height=360\n\n[rendering]\nrenderer/rendering_method="gl_compatibility"\nenvironment/defaults/default_clear_color=Color(0.08, 0.11, 0.17, 1)\n';
export function files(id: string, code: string, completed = false) {
  const lesson = workshops[id];
  if (!lesson) throw Error("Unknown workshop");
  const attached = !lesson.detached || completed;
  let scene = `[gd_scene load_steps=${attached ? 3 : 2} format=3]\n[ext_resource type="Texture2D" path="res://frog.tres" id="frog"]\n\n${attached ? '[ext_resource type="Script" path="res://main.gd" id="1"]\n\n' : ""}[node name="Main" type="Node2D"]\n${attached ? 'script = ExtResource("1")\n' : ""}\n[node name="Player" type="Node2D" parent="."]\nposition = Vector2(120, 180)\n\n[node name="Shape" type="Polygon2D" parent="Player"]\npolygon = PackedVector2Array(-20, -20, 20, -20, 20, 20, -20, 20)\nuv = PackedVector2Array(0, 0, 16, 0, 16, 16, 0, 16)\ntexture_filter = 1\ntexture = ExtResource("frog")\ncolor = Color(0.678431, 0.898039, 0.501961, 1)\n\n[node name="Status" type="Label" parent="."]\noffset_left = 24.0\noffset_top = 24.0\noffset_right = 616.0\noffset_bottom = 72.0\ntext = "Godot Fieldwork"\n`;
  if (id === "signals")
    scene +=
      '\n[node name="Timer" type="Timer" parent="."]\nwait_time = 1.0\nautostart = false\n';
  if (completed && id === "signals")
    scene =
      scene.replace("autostart = false", "autostart = true") +
      '\n[connection signal="timeout" from="Timer" to="." method="_on_timer_timeout"]\n';
  if (completed && id === "nodes")
    scene +=
      '\n[node name="Beacon" type="Marker2D" parent="Player"]\nposition = Vector2(80, 0)\n';
  return {
    "ATTRIBUTION.txt":
      forLesson(id) ||
      "Godot documentation: Juan Linietsky, Ariel Manzur, and the Godot Engine community. CC BY 3.0 https://creativecommons.org/licenses/by/3.0/ — Adapted learning exercise. https://docs.godotengine.org/en/4.5/",
    "project.godot": project,
    "frog.tres": frogTextureResource(),
    "main.tscn": scene,
    "main.gd": code,
    "README.txt": `${lesson.title}\nGodot 4.5+ / Compatibility\n\n${completed ? "비교용 완성 프로젝트: GUI 작업도 반영되어 있습니다." : "실습 프로젝트: 아래 GUI 작업을 직접 진행하세요."}\n\n${lesson.steps.map(([title, body], i) => `${i + 1}. ${title}\n${body}`).join("\n\n")}\n\n실행 후 확인: ${lesson.expected}\n\n작성한 코드는 main.gd에 들어 있습니다. 에디터에서 수정한 씬과 코드는 에디터에서 저장하세요. 웹 에디터에서는 Project > Tools > Download Project Source로 백업하세요.\n`,
  };
}
// Uncompressed ZIP (UTF-8 filenames), no network dependency or script evaluation.
export function zip(files: Record<string, string>) {
  const encoder = new TextEncoder(),
    locals = [],
    centrals = [];
  let offset = 0;
  const crc = (bytes: Uint8Array) => {
    let c = 0xffffffff;
    for (const b of bytes) {
      c ^= b;
      for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
    return (c ^ 0xffffffff) >>> 0;
  };
  for (const [name, text] of Object.entries(files)) {
    const n = encoder.encode(name),
      d = encoder.encode(text),
      sum = crc(d),
      h = new Uint8Array(30 + n.length),
      v = new DataView(h.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 0x800, true);
    v.setUint32(14, sum, true);
    v.setUint32(18, d.length, true);
    v.setUint32(22, d.length, true);
    v.setUint16(26, n.length, true);
    h.set(n, 30);
    locals.push(h, d);
    const c = new Uint8Array(46 + n.length),
      cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x800, true);
    cv.setUint32(16, sum, true);
    cv.setUint32(20, d.length, true);
    cv.setUint32(24, d.length, true);
    cv.setUint16(28, n.length, true);
    cv.setUint32(42, offset, true);
    c.set(n, 46);
    centrals.push(c);
    offset += h.length + d.length;
  }
  const end = new Uint8Array(22),
    ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, centrals.length, true);
  ev.setUint16(10, centrals.length, true);
  ev.setUint32(
    12,
    centrals.reduce((s, c) => s + c.length, 0),
    true,
  );
  ev.setUint32(16, offset, true);
  return new Blob([...locals, ...centrals, end], { type: "application/zip" });
}

export async function downloadProject(
  id: string,
  code: string,
  config: SceneConfig,
  log: (s: string) => void,
) {
  const l = workshops[id];
  if (l.expanded) {
    await downloadExpanded(id, l, code, config, log);
    return;
  }
  const projectFiles = files(id, code, false);
  let scene = projectFiles["main.tscn"].replace(
    "Vector2(120, 180)",
    `Vector2(${config.x}, ${config.y})`,
  );
  if (config.beacon)
    scene +=
      '\n[node name="Beacon" type="Marker2D" parent="Player"]\nposition = Vector2(' +
      config.beacon_x +
      ", 0)\n";
  if (id === "signals") {
    scene = scene
      .replace("wait_time = 1.0", "wait_time = " + config.wait)
      .replace("autostart = false", "autostart = " + config.autostart);
    if (config.connected)
      scene +=
        '\n[connection signal="timeout" from="Timer" to="." method="_on_timer_timeout"]\n';
  }
  if (id === "attach-script" && config.attached)
    scene = scene
      .replace("load_steps=2", "load_steps=3")
      .replace(
        '[node name="Main"',
        '[ext_resource type="Script" path="res://main.gd" id="1"]\n\n[node name="Main"',
      )
      .replace(
        '[node name="Main" type="Node2D"]',
        '[node name="Main" type="Node2D"]\nscript = ExtResource("1")',
      );
  projectFiles["main.tscn"] = scene;
  const url = URL.createObjectURL(zip(projectFiles)),
    a = document.createElement("a");
  a.href = url;
  a.download = "godot-" + id + "-live.zip";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function downloadExpanded(
  id: string,
  l: Workshop,
  code: string,
  config: SceneConfig,
  log: (s: string) => void,
) {
  try {
    const response = await fetch("runtime/runtime-source.gd");
    if (!response.ok) throw Error("런타임 소스를 읽을 수 없습니다.");
    const fixture = await fetch("runtime/token.tscn");
    if (!fixture.ok) throw Error("씬 파일을 읽을 수 없습니다.");
    const files = {
      "ATTRIBUTION.txt": forLesson(id),
      "project.godot":
        'config_version=5\n[application]\nconfig/name="Fieldwork Exercise"\nrun/main_scene="res://boot.tscn"\n[display]\nwindow/size/viewport_width=640\nwindow/size/viewport_height=360\n[rendering]\nrenderer/rendering_method="gl_compatibility"\n',
      "boot.tscn":
        '[gd_scene load_steps=2 format=3]\n[ext_resource type="Script" path="res://boot.gd" id="1"]\n[node name="Runtime" type="Node"]\nscript = ExtResource("1")\n',
      "boot.gd":
        'extends "res://runtime.gd"\nfunc _ready() -> void:\n\tvar data = JSON.parse_string(FileAccess.get_file_as_string("res://lesson.json"))\n\tdata.code = FileAccess.get_file_as_string("res://main.gd")\n\tstart(data)\n',
      "runtime.gd": await response.text(),
      "frog.json": JSON.stringify(frogPixels),
      "fixtures/token.tscn": await fixture.text(),
      "main.gd": code,
      "lesson.json": JSON.stringify({
        run: 1,
        lesson: id,
        stage: l.stage || "2d",
        config,
        check: false,
      }),
      "README.txt":
        l.title +
        "\n" +
        l.goal +
        "\n" +
        (l.scope || "") +
        "\n씬은 실행 시 runtime.gd에서 만들어집니다. main.gd를 편집하고 프로젝트를 실행하세요.",
    };
    const url = URL.createObjectURL(zip(files)),
      a = document.createElement("a");
    a.href = url;
    a.download = "godot-" + id + "-live.zip";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    log("다운로드 실패: " + String(e));
  }
}
