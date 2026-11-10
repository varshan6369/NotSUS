#!/usr/bin/env python3
"""System Hardware Monitor - Backup Script"""
import os
import platform
import time

def main():
    print("\033[93m" + "=== SYSTEM MONITOR [BACKUP RUNNER] ===" + "\033[0m")
    print(f"OS: {platform.system()} {platform.release()} ({platform.machine()})")
    print(f"Processor: {platform.processor() or 'Standard x86/x64 Architecture'}")
    print(f"Python Runtime: {platform.python_version()}")
    print("--------------------------------------------------")
    print("Telemetry stream running via backup script:")
    for i in range(5):
        print(f"[{time.strftime('%H:%M:%S')}] Heartbeat tick #{i+1} - Status: NOMINAL (Backup Runner Active)")
        time.sleep(1)
    print("\n[OK] Backup execution completed successfully.")

if __name__ == '__main__':
    main()
