import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

DOCS_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs', 'themes')
FONTS_DIR = os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts')
SEGOE_BOLD = os.path.join(FONTS_DIR, 'segoeuib.ttf')
SEGOE_SEMIBOLD = os.path.join(FONTS_DIR, 'seguisb.ttf')
SEGOE_REG = os.path.join(FONTS_DIR, 'segoeui.ttf')

PRESETS = [
    {'id': 'muted-violet', 'name': 'Muted Violet', 'file': '01-muted-violet.png', 'color': (138, 122, 208)},
    {'id': 'poiesis-blue', 'name': 'Poiesis Blue', 'file': '02-poiesis-blue.png', 'color': (90, 142, 198)},
    {'id': 'midnight-purple', 'name': 'Midnight Purple', 'file': '03-midnight-purple.png', 'color': (164, 92, 212)},
    {'id': 'noguchi', 'name': 'Noguchi', 'file': '04-noguchi.png', 'color': (140, 142, 166)},
    {'id': 'dark-indigo', 'name': 'Dark Indigo', 'file': '05-dark-indigo.png', 'color': (99, 102, 241)},
    {'id': 'shadow-peonies', 'name': 'Shadow Peonies', 'file': '06-shadow-peonies.png', 'color': (117, 113, 219)},
    {'id': 'poiesis-purple', 'name': 'Poiesis Purple', 'file': '07-poiesis-purple.png', 'color': (147, 83, 158)},
    {'id': 'winter-woods', 'name': 'Winter Woods', 'file': '08-winter-woods.png', 'color': (104, 134, 158)},
    {'id': 'carbon', 'name': 'Carbon', 'file': '09-carbon.png', 'color': (158, 158, 158)},
    {'id': 'frost', 'name': 'Frost', 'file': '10-frost.png', 'color': (56, 189, 248)}
]

def load_images():
    images = []
    for p in PRESETS:
        path = os.path.join(DOCS_DIR, p['file'])
        if not os.path.exists(path):
            raise FileNotFoundError(f"Missing {path}")
        im = Image.open(path).convert('RGBA')
        images.append((p, im))
    return images

def create_sliced_window(images):
    """
    Creates a 1280x800 window with 10 vertical slices and subtle hairlines.
    Clean without obstructing overlays.
    """
    base_w, base_h = images[0][1].size
    n = len(images)
    slice_w = base_w / n

    composite = Image.new('RGBA', (base_w, base_h), (0, 0, 0, 0))
    overlay = Image.new('RGBA', (base_w, base_h), (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)

    for i, (p, im) in enumerate(images):
        x0 = int(round(i * slice_w))
        x1 = int(round((i + 1) * slice_w)) if i < n - 1 else base_w

        box = (x0, 0, x1, base_h)
        slice_im = im.crop(box)
        composite.paste(slice_im, (x0, 0))

        if i > 0:
            # Subtle vertical hairline with left drop shadow
            for dy in range(base_h):
                draw_overlay.point((x0 - 1, dy), fill=(0, 0, 0, 110))
                draw_overlay.point((x0, dy), fill=(255, 255, 255, 60))
                draw_overlay.point((x0 + 1, dy), fill=(255, 255, 255, 20))

    result = Image.alpha_composite(composite, overlay)
    return result

def create_framed_showcase(images):
    """
    Creates a high-fidelity 1440x1000 presentation banner featuring the
    sliced dashboard window with theme badges and accent dots above each slice.
    """
    win = create_sliced_window(images)
    win_w, win_h = win.size

    canvas_w = 1440
    canvas_h = 1000
    win_x = (canvas_w - win_w) // 2
    win_y = 148

    canvas = Image.new('RGBA', (canvas_w, canvas_h), (10, 12, 18, 255))

    # Background ambient lighting
    bg_glow = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(bg_glow)
    for r in range(500, 50, -25):
        alpha = int((1 - r / 500) * 40)
        glow_draw.ellipse([canvas_w//2 - r*1.6, win_y + 350 - r, canvas_w//2 + r*1.6, win_y + 350 + r], fill=(85, 75, 170, alpha))
    canvas = Image.alpha_composite(canvas, bg_glow)

    draw = ImageDraw.Draw(canvas)

    try:
        font_title = ImageFont.truetype(SEGOE_BOLD, 22)
        font_sub = ImageFont.truetype(SEGOE_REG, 13)
        font_badge = ImageFont.truetype(SEGOE_SEMIBOLD, 10)
        font_footer = ImageFont.truetype(SEGOE_REG, 11)
    except Exception:
        font_title = font_sub = font_badge = font_footer = ImageFont.load_default()

    # Header Title
    title = "ELECTRON SHELL FRAMEWORK  •  10 THEME PRESETS"
    t_bbox = font_title.getbbox(title)
    draw.text(((canvas_w - (t_bbox[2] - t_bbox[0])) // 2, 34), title, font=font_title, fill=(245, 247, 255, 255))

    # Header Subtitle
    sub = "Instant two-layer theme switching — dark & light modes, HSL tokens, and zero CSS runtime overhead"
    s_bbox = font_sub.getbbox(sub)
    draw.text(((canvas_w - (s_bbox[2] - s_bbox[0])) // 2, 66), sub, font=font_sub, fill=(150, 155, 180, 255))

    # Window Drop Shadow
    shadow_margin = 35
    shadow = Image.new('RGBA', (win_w + shadow_margin * 2, win_h + shadow_margin * 2), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle(
        [shadow_margin, shadow_margin + 10, shadow_margin + win_w, shadow_margin + win_h + 10],
        radius=14,
        fill=(0, 0, 0, 200)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    canvas.paste(shadow, (win_x - shadow_margin, win_y - shadow_margin), shadow)

    # Window with rounded corners and border
    mask = Image.new('L', (win_w, win_h), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle([0, 0, win_w, win_h], radius=10, fill=255)

    border_overlay = Image.new('RGBA', (win_w, win_h), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(border_overlay)
    b_draw.rounded_rectangle([0, 0, win_w - 1, win_h - 1], radius=10, outline=(255, 255, 255, 60), width=1)
    win_bordered = Image.alpha_composite(win, border_overlay)

    canvas.paste(win_bordered, (win_x, win_y), mask)

    # Theme Badges above each slice
    n = len(images)
    slice_w = win_w / n

    for i, (p, _) in enumerate(images):
        slice_cx = int(win_x + i * slice_w + slice_w / 2)
        dot_color = p['color']

        name = p['name']
        b_bbox = font_badge.getbbox(name)
        text_w = b_bbox[2] - b_bbox[0]
        text_h = b_bbox[3] - b_bbox[1]

        badge_w = text_w + 26
        badge_h = 24
        bx0 = slice_cx - badge_w // 2
        by0 = 106

        # Draw pill
        draw.rounded_rectangle(
            [bx0, by0, bx0 + badge_w, by0 + badge_h],
            radius=6,
            fill=(18, 22, 34, 230),
            outline=(255, 255, 255, 40),
            width=1
        )
        # Accent dot
        dot_r = 4
        dot_cx = bx0 + 10
        dot_cy = by0 + badge_h // 2
        draw.ellipse([dot_cx - dot_r, dot_cy - dot_r, dot_cx + dot_r, dot_cy + dot_r], fill=dot_color + (255,))

        # Text
        draw.text((bx0 + 19, by0 + 4), name, font=font_badge, fill=(235, 240, 250, 255))

        # Downward tick pointing to slice
        draw.line([(slice_cx, by0 + badge_h + 1), (slice_cx, win_y - 2)], fill=(255, 255, 255, 60), width=1)

    # Footer note
    footer = "Each vertical slice displays the real Electron runtime styled by that preset's HSL tokens  •  Ready to extend or author in seconds"
    f_bbox = font_footer.getbbox(footer)
    draw.text(((canvas_w - (f_bbox[2] - f_bbox[0])) // 2, win_y + win_h + 20), footer, font=font_footer, fill=(110, 118, 140, 255))

    return canvas

def create_cascading_stack(images, reverse=False):
    """
    Creates an offset cascade of full windows stacked horizontally with deep shadows.
    """
    base_w, base_h = images[0][1].size
    scale = 0.70
    win_w = int(base_w * scale)
    win_h = int(base_h * scale)

    imgs = list(reversed(images)) if reverse else images
    n = len(imgs)
    step_x = 72
    step_y = 10

    total_w = win_w + (n - 1) * step_x + 100
    total_h = win_h + (n - 1) * step_y + 120

    canvas = Image.new('RGBA', (total_w, total_h), (9, 11, 17, 255))

    # Glow
    bg_glow = Image.new('RGBA', (total_w, total_h), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(bg_glow)
    cx, cy = total_w // 2, total_h // 2
    for r in range(450, 50, -25):
        alpha = int((1 - r / 450) * 45)
        glow_draw.ellipse([cx - r * 1.5, cy - r, cx + r * 1.5, cy + r], fill=(80, 70, 160, alpha))
    canvas = Image.alpha_composite(canvas, bg_glow)

    start_x = 50
    start_y = 60

    for i, (p, im) in enumerate(imgs):
        resized = im.resize((win_w, win_h), Image.Resampling.LANCZOS)

        corner_r = 12
        mask = Image.new('L', (win_w, win_h), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([0, 0, win_w, win_h], radius=corner_r, fill=255)

        border_overlay = Image.new('RGBA', (win_w, win_h), (0, 0, 0, 0))
        b_draw = ImageDraw.Draw(border_overlay)
        b_draw.rounded_rectangle([0, 0, win_w - 1, win_h - 1], radius=corner_r, outline=(255, 255, 255, 60), width=1)
        win_with_border = Image.alpha_composite(resized, border_overlay)

        pos_x = start_x + i * step_x
        pos_y = start_y + (n - 1 - i) * step_y

        shadow_margin = 35
        shadow = Image.new('RGBA', (win_w + shadow_margin * 2, win_h + shadow_margin * 2), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow)
        s_draw.rounded_rectangle(
            [shadow_margin, shadow_margin + 10, shadow_margin + win_w, shadow_margin + win_h + 10],
            radius=corner_r + 2,
            fill=(0, 0, 0, 180)
        )
        shadow = shadow.filter(ImageFilter.GaussianBlur(16))
        canvas.paste(shadow, (pos_x - shadow_margin, pos_y - shadow_margin), shadow)

        canvas.paste(win_with_border, (pos_x, pos_y), mask)

    return canvas

def create_grid_gallery(images):
    """
    Creates a 2x5 grid showing all 10 presets side-by-side with labels.
    """
    thumb_w, thumb_h = 580, 362
    pad_x, pad_y = 24, 28
    cols, rows = 2, 5

    total_w = cols * thumb_w + (cols + 1) * pad_x
    total_h = rows * thumb_h + (rows + 1) * pad_y + 40

    canvas = Image.new('RGBA', (total_w, total_h), (10, 12, 18, 255))
    draw = ImageDraw.Draw(canvas)

    try:
        font_label = ImageFont.truetype(SEGOE_BOLD, 14)
    except Exception:
        font_label = ImageFont.load_default()

    for idx, (p, im) in enumerate(images):
        col = idx % cols
        row = idx // cols

        x = pad_x + col * (thumb_w + pad_x)
        y = pad_y + row * (thumb_h + pad_y)

        resized = im.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)

        corner_r = 10
        mask = Image.new('L', (thumb_w, thumb_h), 0)
        m_draw = ImageDraw.Draw(mask)
        m_draw.rounded_rectangle([0, 0, thumb_w, thumb_h], radius=corner_r, fill=255)

        b_overlay = Image.new('RGBA', (thumb_w, thumb_h), (0, 0, 0, 0))
        b_draw = ImageDraw.Draw(b_overlay)
        b_draw.rounded_rectangle([0, 0, thumb_w - 1, thumb_h - 1], radius=corner_r, outline=(255, 255, 255, 50), width=1)
        thumb = Image.alpha_composite(resized, b_overlay)

        canvas.paste(thumb, (x, y), mask)

        # Label tag on top left
        draw.rounded_rectangle([x + 14, y + 14, x + 160, y + 42], radius=6, fill=(10, 12, 18, 220), outline=(255, 255, 255, 50), width=1)
        draw.ellipse([x + 24, y + 24, x + 32, y + 32], fill=p['color'] + (255,))
        draw.text((x + 38, y + 20), p['name'], font=font_label, fill=(240, 243, 250, 255))

    return canvas

def main():
    print("Loading theme screenshots...")
    images = load_images()
    print(f"Loaded {len(images)} images.")

    # 1. Clean Sliced Window (1280x800)
    print("Generating sliced window (1280x800)...")
    win = create_sliced_window(images)
    out1 = os.path.join(DOCS_DIR, 'theme-stack-slices.png')
    win.save(out1, quality=95)
    print(f"Saved {out1}")

    # 2. Framed Showcase Banner (1440x1000)
    print("Generating framed showcase banner (1440x1000)...")
    showcase = create_framed_showcase(images)
    out2 = os.path.join(DOCS_DIR, 'theme-stack-showcase.png')
    showcase.save(out2, quality=95)
    print(f"Saved {out2}")

    # 3. Cascading Stack (Frost in front)
    print("Generating cascading window stack (Frost front)...")
    cascade1 = create_cascading_stack(images, reverse=False)
    out3a = os.path.join(DOCS_DIR, 'theme-stack-cascade.png')
    cascade1.save(out3a, quality=95)
    print(f"Saved {out3a}")

    # 3b. Cascading Stack (Muted Violet / Poiesis in front)
    print("Generating cascading window stack (Dark front)...")
    cascade2 = create_cascading_stack(images, reverse=True)
    out3b = os.path.join(DOCS_DIR, 'theme-stack-cascade-dark.png')
    cascade2.save(out3b, quality=95)
    print(f"Saved {out3b}")

    # 4. Grid Gallery (2x5 overview)
    print("Generating grid gallery...")
    grid = create_grid_gallery(images)
    out4 = os.path.join(DOCS_DIR, 'theme-stack-grid.png')
    grid.save(out4, quality=95)
    print(f"Saved {out4}")

    print("All compositions completed successfully!")

if __name__ == '__main__':
    main()
