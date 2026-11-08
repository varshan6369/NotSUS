#!/usr/bin/env python3
"""
Matrix Digital Rain Terminal
Pure-Python console animation using ANSI escape codes.
"""
import os
import sys
import time
import random
import shutil

CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-/<>~ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈ"

def get_size():
    try:
        cols, rows = shutil.get_terminal_size((80, 24))
        return cols, rows
    except Exception:
        return 80, 24

def main():
    cols, rows = get_size()
    drops = [random.randint(0, rows) for _ in range(cols)]
    
    print("\033[?25l")  # Hide cursor
    try:
        print("\033[2J") # Clear screen
        for _ in range(300): # Run for 300 iterations (or until Ctrl+C)
            line = ""
            for i in range(cols):
                if drops[i] == 0:
                    if random.random() > 0.95:
                        drops[i] = random.randint(5, rows)
                
                if drops[i] > 0:
                    char = random.choice(CHARS)
                    # Top head is bright white, body is phosphor green
                    if drops[i] == 1:
                        line += f"\033[97m{char}\033[0m"
                    else:
                        line += f"\033[92m{char}\033[0m"
                    drops[i] -= 1
                else:
                    line += " "
            print(line)
            time.sleep(0.04)
    except KeyboardInterrupt:
        pass
    finally:
        print("\033[?25h\033[0m") # Restore cursor
        print("\nMatrix stream disconnected.")

if __name__ == '__main__':
    main()
