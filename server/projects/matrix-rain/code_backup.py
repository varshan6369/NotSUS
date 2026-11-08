#!/usr/bin/env python3
import time
import random

CHARS = "01ABCDEF"
print("=== MATRIX FALLBACK RUNNER ===")
try:
    for _ in range(50):
        print(" ".join(random.choice(CHARS) for _ in range(30)))
        time.sleep(0.08)
except KeyboardInterrupt:
    pass
print("Done.")
