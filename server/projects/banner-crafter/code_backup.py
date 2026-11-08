#!/usr/bin/env python3
msg = input("Enter message: ") or "NOTICE"
print("#" * (len(msg) + 8))
print(f"### {msg} ###")
print("#" * (len(msg) + 8))
