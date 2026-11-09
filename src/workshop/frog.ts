import rows from "../../runtime-src/frog.json";

export { rows as frogPixels };
export const frogPalette: Record<string, string> = {
  ".": "00000000", "#": "263346ff", e: "ffffffff", s: "94a5a0ff", b: "e1dfb9ff",
};

// A text resource also works in downloaded projects before their first editor import.
export function frogTextureResource() {
  const bytes = [...rows.join("")].flatMap(pixel =>
    frogPalette[pixel].match(/../g)!.map(byte => parseInt(byte, 16)),
  );
  return `[gd_resource type="ImageTexture" load_steps=2 format=3]
[sub_resource type="Image" id="Pixels"]
data = {"data":PackedByteArray(${bytes.join(",")}),"format":"RGBA8","height":16,"mipmaps":false,"width":16}
[resource]
image = SubResource("Pixels")
`;
}
