import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  drawSelection,
  highlightActiveLineGutter,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  StreamLanguage,
  syntaxHighlighting,
  HighlightStyle,
  bracketMatching,
  indentUnit,
} from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { tags } from "@lezer/highlight";
const codeStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#a8c7ff" },
  { tag: tags.comment, color: "#a8b7ca" },
  { tag: tags.string, color: "#b9dba8" },
  { tag: tags.number, color: "#f1c38d" },
  { tag: tags.typeName, color: "#84d5d0" },
  { tag: tags.meta, color: "#e8c18b" },
]);
const gd = StreamLanguage.define({
  token(s) {
    if (s.eatSpace()) return null;
    if (s.match("#")) {
      s.skipToEnd();
      return "comment";
    }
    if (s.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/)) return "string";
    if (s.match(/^@\w+/)) return "meta";
    if (s.match(/^\$[\w/]+/)) return "variableName.special";
    if (
      s.match(
        /^\b(?:extends|class_name|func|var|const|if|elif|else|for|while|return|pass|await|signal|and|or|not|in|is|as|true|false|null)\b/,
      )
    )
      return "keyword";
    if (
      s.match(
        /^\b(?:int|float|bool|String|Vector2|Color|Node2D|Marker2D|Input|Timer)\b/,
      )
    )
      return "typeName";
    if (s.match(/^\d+(?:\.\d+)?/)) return "number";
    if (s.match(/^[\w]+/)) return "variableName";
    s.next();
    return null;
  },
});
export function createEditor(
  parent: HTMLElement,
  code: string,
  onChange: (code: string) => void,
) {
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        highlightActiveLine(),
        bracketMatching(),
        closeBrackets(),
        indentUnit.of("\t"),
        gd,
        syntaxHighlighting(codeStyle),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
        EditorView.contentAttributes.of({
          "aria-label": "GDScript 코드 편집기",
          spellcheck: "false",
        }),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange(u.state.doc.toString());
        }),
        EditorView.theme(
          {
            "&": {
              color: "#e4ebf6",
              backgroundColor: "#202a3b",
              fontFamily: "Pretendard, sans-serif",
              fontSize: "14px",
            },
            ".cm-content": {
              fontFamily: "Pretendard, sans-serif",
              lineHeight: "1.8",
              caretColor: "#b9d9ff",
              minHeight: "420px",
            },
            ".cm-gutters": {
              backgroundColor: "#202a3b",
              color: "#96a9c4",
              borderRight: "1px solid #35455d",
            },
            ".cm-activeLineGutter": { backgroundColor: "#2c3c54" },
            ".cm-activeLine": { backgroundColor: "#27374d" },
            ".cm-scroller": { overflow: "auto" },
            ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
              backgroundColor: "#405b80",
            },
            // 클릭할 때마다 테두리가 생기지 않도록 한다. 커서와 현재 줄 강조로 초점을 보여 준다.
            "&.cm-focused": { outline: "none" },
            ".cm-content:focus-visible": { outline: "none" },
          },
          { dark: true },
        ),
      ],
    }),
  });
  return {
    value: () => view.state.doc.toString(),
    setValue: (code: string) =>
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: code },
      }),
    destroy: () => view.destroy(),
  };
}
