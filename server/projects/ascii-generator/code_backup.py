#!/usr/bin/env python3
"""
ASCII Generator - Lightweight Backup Runner
Zero-dependency minimal ASCII font banner generator.
"""
import sys

def simple_banner(text):
    border = "+" + "-" * (len(text) + 6) + "+"
    print(border)
    print(f"|   {text.upper()}   |")
    print(border)

def main():
    print("=== ASCII GENERATOR [STANDALONE BACKUP RUNNER] ===")
    word = input("Enter text: ") or "ASCII LAUNCHER"
    simple_banner(word)
    print("\nProcess complete. You can close this window.")

if __name__ == '__main__':
    main()
