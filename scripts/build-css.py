#!/usr/bin/env python3
"""Expand u(N) tokens in css/styles.src.css into calc(N * var(--u)) -> css/styles.css.
Run after editing the .src.css file:  python3 scripts/build-css.py"""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "css" / "styles.src.css").read_text()
out = re.sub(r"\bu\((-?\d*\.?\d+)\)", lambda m: f"calc({m.group(1)} * var(--u))", src)
(root / "css" / "styles.css").write_text(out)
print("wrote css/styles.css,", len(out), "bytes")
