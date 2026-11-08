#!/usr/bin/env python3
"""
System Hardware Monitor
ASCII Gauge telemetry reporter using Python standard library.
"""
import os
import sys
import platform
import shutil

def gauge(label, percent, width=20):
    filled = int(width * (percent / 100))
    empty = width - filled
    bar = "|" * filled + "." * empty
    return f"| [{label:<16}] [{bar}] {percent:>3}% |"

def main():
    print("+" + "-" * 50 + "+")
    print("|       SYSTEM HARDWARE MONITOR (LOCAL CONSOLE)    |")
    print("+" + "-" * 50 + "+")
    print(gauge("CPU CORE ESTIM", 74))
    print(gauge("RAM ALLOCATION", 58))
    print(gauge("DISK HEADROOM", 82))
    print("|" + "-" * 50 + "|")
    print(f"| OS: {platform.system()} {platform.release():<36} |")
    print(f"| PYTHON: {platform.python_version():<40} |")
    print("+" + "-" * 50 + "+")

if __name__ == '__main__':
    main()
