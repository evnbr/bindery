import h from "hyperscript";

export default function(title, text) {
  return h(".bindery-error",
    h(".bindery-error-title", title),
    h(".bindery-error-text", text),
    h(".bindery-error-footer", "Bindery.js v0.1 Alpha"),
  )
}
