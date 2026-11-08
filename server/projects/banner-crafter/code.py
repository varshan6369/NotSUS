#!/usr/bin/env python3
"""
Retro Banner & Frame Crafter v2.0
Construct custom ANSI and Unicode decorative borders for code & documentation.
"""

STYLES = {
    'classic': {'tl': '+', 'tr': '+', 'bl': '+', 'br': '+', 'h': '-', 'v': '|'},
    'double':  {'tl': '╔', 'tr': '╗', 'bl': '╚', 'br': '╝', 'h': '═', 'v': '║'},
    'rounded': {'tl': '╭', 'tr': '╮', 'bl': '╰', 'br': '╯', 'h': '─', 'v': '│'},
    'cyber':   {'tl': '◢', 'tr': '◣', 'bl': '◥', 'br': '◤', 'h': '━', 'v': '┃'}
}

def make_box(text, style_name='double'):
    s = STYLES.get(style_name, STYLES['double'])
    width = len(text) + 6
    top = s['tl'] + s['h'] * width + s['tr']
    mid = s['v'] + f"   {text}   " + s['v']
    bot = s['bl'] + s['h'] * width + s['br']
    return "\n".join([top, mid, bot])

def main():
    print("====================================================")
    print("    RETRO BANNER & BOX CRAFTER — LOCAL TERMINAL     ")
    print("====================================================")
    title = input("Enter box header title: ").strip() or "SYSTEM NOTICE"
    
    print("\n--- PREVIEWS ---\n")
    for name in STYLES:
        print(f"[{name.upper()}]")
        print(make_box(title, name))
        print()
        
    with open("crafted_banner.txt", "w", encoding="utf-8") as f:
        f.write(make_box(title, 'double'))
    print("[SUCCESS] Exported 'double' frame to crafted_banner.txt")

if __name__ == '__main__':
    main()
