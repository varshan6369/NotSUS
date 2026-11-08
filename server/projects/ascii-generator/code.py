#!/usr/bin/env python3
"""
ASCII Generator v1.0.0
High-resolution terminal text-to-ASCII banner synthesizer.
Executes entirely locally on your terminal.
"""
import os
import sys
import time

BANNER = """
  ___   ___   ___  ___ ___    ___                          _             
 /   \ / __| / __||_ _|_ _|  / __| ___  _ _   ___  _ _  __ _| |_  ___  _ _ 
| - | |\__ \| (__  | |  | |  | (_ |/ -_)| ' \ / -_)| '_|/ _` |  _|/ _ \| '_|
|_|_|_||___/ \___||___||___|  \___|\___||_||_|\___||_|  \__,_|\__|\___/|_|  
"""

FONT_BLOCK = {
    'A': ["  ███  ", " ██ ██ ", "██   ██", "███████", "██   ██", "██   ██"],
    'B': ["██████ ", "██   ██", "██████ ", "██   ██", "██   ██", "██████ "],
    'C': [" █████ ", "██   ██", "██     ", "██     ", "██   ██", " █████ "],
    'D': ["██████ ", "██   ██", "██   ██", "██   ██", "██   ██", "██████ "],
    'E': ["███████", "██     ", "█████  ", "██     ", "██     ", "███████"],
    'F': ["███████", "██     ", "█████  ", "██     ", "██     ", "██     "],
    'G': [" █████ ", "██   ██", "██     ", "██  ███", "██   ██", " █████ "],
    'H': ["██   ██", "██   ██", "███████", "██   ██", "██   ██", "██   ██"],
    'I': ["█████", "  ██ ", "  ██ ", "  ██ ", "  ██ ", "█████"],
    'L': ["██     ", "██     ", "██     ", "██     ", "██     ", "███████"],
    'O': [" █████ ", "██   ██", "██   ██", "██   ██", "██   ██", " █████ "],
    'R': ["██████ ", "██   ██", "██████ ", "██   ██", "██   ██", "██   ██"],
    'S': [" █████ ", "██     ", " █████ ", "     ██", "██   ██", " █████ "],
    'T': ["███████", "  ███  ", "  ███  ", "  ███  ", "  ███  ", "  ███  "],
    ' ': ["     ", "     ", "     ", "     ", "     ", "     "]
}

def render_text(text):
    text = text.upper()
    lines = ["" for _ in range(6)]
    for char in text:
        glyph = FONT_BLOCK.get(char, [" ??? "] * 6)
        for i in range(6):
            lines[i] += glyph[i] + "  "
    return "\n".join(lines)

def main():
    print("\033[92m" + BANNER + "\033[0m")
    print("=" * 64)
    print(" Welcome to ASCII Generator (Offline Terminal Edition)")
    print("=" * 64)
    
    while True:
        print("\nSelect option:")
        print(" [1] Render Custom Word in ASCII Block Font")
        print(" [2] Render Sample Terminal Cyber Banner")
        print(" [3] Save Rendered Art to output.txt")
        print(" [0] Exit")
        choice = input("\n>> ").strip()
        
        if choice == '1':
            word = input("Enter word (letters A-Z): ").strip()
            if word:
                rendered = render_text(word)
                print("\n" + "\033[92m" + rendered + "\033[0m\n")
        elif choice == '2':
            sample = render_text("TERMINAL")
            print("\n" + "\033[96m" + sample + "\033[0m\n")
        elif choice == '3':
            word = input("Enter text to export to file: ").strip()
            if word:
                rendered = render_text(word)
                with open("output.txt", "w", encoding="utf-8") as f:
                    f.write(rendered)
                print("\n[OK] Art successfully exported to output.txt")
        elif choice == '0':
            print("Exiting ASCII Generator. Have a great day!")
            break
        else:
            print("Invalid choice. Please select 0, 1, 2, or 3.")

if __name__ == '__main__':
    main()
