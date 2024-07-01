open Js_of_ocaml
;;
let canvas = Dom_html.getElementById_coerce "canvas" Dom_html.CoerceTo.canvas
;;
exception NoCanvasFound;;
let gl = match canvas with
  | Some c -> (
    WebGL.getContext c
  )
  | None -> raise NoCanvasFound
