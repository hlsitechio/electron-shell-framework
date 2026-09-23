import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

DOCS_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs', 'themes')
FONTS_DIR = os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts')
SEGOE_BOLD = os.path.join(FONTS_DIR, 'segoeuib.ttf')
SEGOE_SEMIBOLD = os.path.join(FONTS_DIR, 'seguisb.ttf')
SEGOE_REG = os.path.join(FONTS_DIR, 'segoeui.ttf')

def find_coeffs(pa, pb):
    """
    Computes perspective transform matrix mapping 4 points pa (target) to pb (source).
    pa: [(x0,y0), (x1,y1), (x2,y2), (x3,y3)] (top-left, top-right, bottom-right, bottom-left)
    pb: [(x0,y0), (x1,y1), (x2,y2), (x3,y3)]
    """
    matrix = []
    for p1, p2 in zip(pa, pb):
        matrix.append([p1[0], p1[1], 1, 0, 0, 0, -p2[0]*p1[0], -p2[0]*p1[1]])
        matrix.append([0, 0, 0, p1[0], p1[1], 1, -p2[1]*p1[0], -p2[1]*p1[1]])
    A = np.matrix(matrix, dtype=float)
    B = np.array(pb).reshape(8)
    res = np.dot(np.linalg.inv(A.T * A) * A.T, B)
    return np.array(res).reshape(8)

def render_3d_trio():
    """
    3-panel standing 3D perspective slats directly matching user's reference diagram
    with realistic contact shadows, floor reflections, and theme badges.
    """
    cw, ch = 1600, 1100
    canvas = Image.new('RGBA', (cw, ch), (8, 10, 16, 255))

    # Ambient backdrop glow
    bg_glow = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(bg_glow)
    glow_draw.ellipse([cw//2 - 600, ch//2 - 250, cw//2 + 600, ch//2 + 250], fill=(75, 65, 150, 40))
    canvas = Image.alpha_composite(canvas, bg_glow)

    im1 = Image.open(os.path.join(DOCS_DIR, '01-muted-violet.png')).convert('RGBA')
    im2 = Image.open(os.path.join(DOCS_DIR, '02-poiesis-blue.png')).convert('RGBA')
    im3 = Image.open(os.path.join(DOCS_DIR, '09-carbon.png')).convert('RGBA')

    bw, bh = im1.size

    # Reference center: x=493, y=488
    ref_cx, ref_cy = 493, 488
    target_cx, target_cy = cw // 2, ch // 2 + 35
    scale = 1.82

    bars_ref = [
        # xl, xr, ytl, ybl, ytr, ybr, image, src_x0, src_x1, name, color
        (297, 370, 349, 622, 306, 672, im1, 0, int(bw * 0.33), "Muted Violet", (138, 122, 208)),
        (418, 514, 322, 648, 272, 707, im2, int(bw * 0.33), int(bw * 0.67), "Poiesis Blue", (90, 142, 198)),
        (560, 689, 301, 668, 243, 734, im3, int(bw * 0.67), bw, "Carbon", (158, 158, 158))
    ]

    try:
        font_badge = ImageFont.truetype(SEGOE_SEMIBOLD, 11)
        font_title = ImageFont.truetype(SEGOE_BOLD, 22)
        font_sub = ImageFont.truetype(SEGOE_REG, 13)
    except Exception:
        font_badge = font_title = font_sub = ImageFont.load_default()

    draw = ImageDraw.Draw(canvas)

    # Header
    title = "ELECTRON SHELL FRAMEWORK  •  3D PERSPECTIVE STACK"
    t_bbox = font_title.getbbox(title)
    draw.text(((cw - (t_bbox[2] - t_bbox[0])) // 2, 26), title, font=font_title, fill=(245, 247, 255, 255))

    sub = "Standing 3D perspective projection across core runtime presets: Muted Violet, Poiesis Blue, and Carbon"
    s_bbox = font_sub.getbbox(sub)
    draw.text(((cw - (s_bbox[2] - s_bbox[0])) // 2, 56), sub, font=font_sub, fill=(145, 150, 175, 255))

    for xl, xr, ytl, ybl, ytr, ybr, im_theme, src_x0, src_x1, name, color in bars_ref:
        dst_xl = target_cx + int((xl - ref_cx) * scale)
        dst_xr = target_cx + int((xr - ref_cx) * scale)
        dst_ytl = target_cy + int((ytl - ref_cy) * scale)
        dst_ybl = target_cy + int((ybl - ref_cy) * scale)
        dst_ytr = target_cy + int((ytr - ref_cy) * scale)
        dst_ybr = target_cy + int((ybr - ref_cy) * scale)

        slice_crop = im_theme.crop((src_x0, 0, src_x1, bh))
        sw, sh = slice_crop.size

        src_quad = [(0, 0), (sw, 0), (sw, sh), (0, sh)]
        dst_quad = [
            (dst_xl, dst_ytl),
            (dst_xr, dst_ytr),
            (dst_xr, dst_ybr),
            (dst_xl, dst_ybl)
        ]

        coeffs = find_coeffs(dst_quad, src_quad)
        transformed = slice_crop.transform((cw, ch), Image.Transform.PERSPECTIVE, coeffs, Image.Resampling.BICUBIC)

        # 1. Floor Reflection
        # Flip vertically and project below bottom edge
        flipped = slice_crop.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        # Reflection quad coordinates: top mirrors bottom
        refl_h_factor = 0.38
        refl_ybl = dst_ybl + int((dst_ybl - dst_ytl) * refl_h_factor)
        refl_ybr = dst_ybr + int((dst_ybr - dst_ytr) * refl_h_factor)
        dst_refl_quad = [
            (dst_xl, dst_ybl),
            (dst_xr, dst_ybr),
            (dst_xr, refl_ybr),
            (dst_xl, refl_ybl)
        ]
        refl_coeffs = find_coeffs(dst_refl_quad, src_quad)
        transformed_refl = flipped.transform((cw, ch), Image.Transform.PERSPECTIVE, refl_coeffs, Image.Resampling.BICUBIC)

        # Reflection gradient mask (fade out into floor)
        refl_mask = Image.new('L', (cw, ch), 0)
        rm_draw = ImageDraw.Draw(refl_mask)
        # Vertical gradient inside the polygon
        min_y = min(dst_ybl, dst_ybr)
        max_y = max(refl_ybl, refl_ybr)
        poly_mask = Image.new('L', (cw, ch), 0)
        ImageDraw.Draw(poly_mask).polygon(dst_refl_quad, fill=255)

        for y in range(min_y, max_y + 1):
            fraction = (y - min_y) / max(1, (max_y - min_y))
            alpha = int(max(0, (1 - fraction) * 85))
            rm_draw.line([(0, y), (cw, y)], fill=alpha)

        # Composite reflection with mask
        final_refl_mask = Image.fromarray(np.minimum(np.array(refl_mask), np.array(poly_mask)))
        canvas.paste(transformed_refl, (0, 0), final_refl_mask)

        # 2. Drop Shadow behind panel
        bar_mask = Image.new('L', (cw, ch), 0)
        ImageDraw.Draw(bar_mask).polygon(dst_quad, fill=255)

        shadow = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        shadow_quad = [(p[0] + 16, p[1] + 20) for p in dst_quad]
        ImageDraw.Draw(shadow).polygon(shadow_quad, fill=(0, 0, 0, 180))
        shadow = shadow.filter(ImageFilter.GaussianBlur(22))
        canvas.paste(shadow, (0, 0), shadow)

        # 3. Main transformed panel
        canvas.paste(transformed, (0, 0), bar_mask)

        # 4. Subtle glowing glass border
        border = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        b_draw = ImageDraw.Draw(border)
        b_draw.polygon(dst_quad, outline=(255, 255, 255, 110), width=2)
        canvas.paste(border, (0, 0), border)

        # 5. Floating theme badge above or below
        badge_cx = (dst_xl + dst_xr) // 2
        badge_y = dst_ytr - 42

        b_bbox = font_badge.getbbox(name)
        text_w = b_bbox[2] - b_bbox[0]
        text_h = b_bbox[3] - b_bbox[1]
        badge_w = text_w + 28
        badge_h = 26
        bx0 = badge_cx - badge_w // 2

        # Draw badge pill
        draw.rounded_rectangle([bx0, badge_y, bx0 + badge_w, badge_y + badge_h], radius=7, fill=(16, 20, 32, 230), outline=(255, 255, 255, 50), width=1)
        dot_r = 4
        draw.ellipse([bx0 + 10 - dot_r, badge_y + 13 - dot_r, bx0 + 10 + dot_r, badge_y + 13 + dot_r], fill=color + (255,))
        draw.text((bx0 + 20, badge_y + 5), name, font=font_badge, fill=(240, 244, 255, 255))
        draw.line([(badge_cx, badge_y + badge_h), (badge_cx, dst_ytr - 6)], fill=(255, 255, 255, 60), width=1)

    return canvas

def render_3d_deck():
    """
    3D perspective deck where 5 full windows stand upright, overlapping in 3D perspective
    along the exact angle of the user's reference diagram.
    """
    cw, ch = 1600, 1100
    canvas = Image.new('RGBA', (cw, ch), (8, 10, 16, 255))

    bg_glow = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(bg_glow)
    glow_draw.ellipse([cw//2 - 600, ch//2 - 250, cw//2 + 600, ch//2 + 250], fill=(75, 65, 150, 45))
    canvas = Image.alpha_composite(canvas, bg_glow)

    presets = [
        ('01-muted-violet.png', 'Muted Violet', (138, 122, 208)),
        ('02-poiesis-blue.png', 'Poiesis Blue', (90, 142, 198)),
        ('03-midnight-purple.png', 'Midnight Purple', (164, 92, 212)),
        ('05-dark-indigo.png', 'Dark Indigo', (99, 102, 241)),
        ('09-carbon.png', 'Carbon', (158, 158, 158))
    ]

    try:
        font_badge = ImageFont.truetype(SEGOE_SEMIBOLD, 12)
        font_title = ImageFont.truetype(SEGOE_BOLD, 22)
        font_sub = ImageFont.truetype(SEGOE_REG, 13)
    except Exception:
        font_badge = font_title = font_sub = ImageFont.load_default()

    draw = ImageDraw.Draw(canvas)

    title = "ELECTRON SHELL FRAMEWORK  •  3D STACKED WINDOW DECK"
    t_bbox = font_title.getbbox(title)
    draw.text(((cw - (t_bbox[2] - t_bbox[0])) // 2, 36), title, font=font_title, fill=(245, 247, 255, 255))

    sub = "5 ready-made shells standing in 3D perspective with realistic depth, ambient lighting, and floor shadows"
    s_bbox = font_sub.getbbox(sub)
    draw.text(((cw - (s_bbox[2] - s_bbox[0])) // 2, 68), sub, font=font_sub, fill=(145, 150, 175, 255))

    n = len(presets)
    # Windows are stacked from left (back) to right (front)
    # The front window (right) has the largest width & height
    # Slope of top edge is approx -0.32, slope of bottom is +0.35
    for i, (fn, name, color) in enumerate(presets):
        im = Image.open(os.path.join(DOCS_DIR, fn)).convert('RGBA')
        bw, bh = im.size

        # Parameter t from 0 (back) to 1 (front)
        t = i / (n - 1)

        # Scale in perspective: back window is 0.70x, front is 1.0x
        persp_scale = 0.70 + 0.30 * t
        win_w = int(580 * persp_scale)
        win_h_left = int(600 * persp_scale)
        win_h_right = int(780 * persp_scale)

        # Position along horizontal trajectory
        # Back window starts at x=140, front window ends near x=1480
        x_left = int(140 + t * 560)
        x_right = x_left + win_w

        center_y = int(560 + t * 20)
        y_tl = center_y - win_h_left // 2
        y_bl = center_y + win_h_left // 2
        y_tr = center_y - win_h_right // 2
        y_br = center_y + win_h_right // 2

        src_quad = [(0, 0), (bw, 0), (bw, bh), (0, bh)]
        dst_quad = [
            (x_left, y_tl),
            (x_right, y_tr),
            (x_right, y_br),
            (x_left, y_bl)
        ]

        coeffs = find_coeffs(dst_quad, src_quad)
        transformed = im.transform((cw, ch), Image.Transform.PERSPECTIVE, coeffs, Image.Resampling.BICUBIC)

        # Shadow
        shadow = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        shadow_quad = [(p[0] + 18, p[1] + 24) for p in dst_quad]
        ImageDraw.Draw(shadow).polygon(shadow_quad, fill=(0, 0, 0, 190))
        shadow = shadow.filter(ImageFilter.GaussianBlur(24))
        canvas.paste(shadow, (0, 0), shadow)

        # Panel Mask
        bar_mask = Image.new('L', (cw, ch), 0)
        ImageDraw.Draw(bar_mask).polygon(dst_quad, fill=255)
        canvas.paste(transformed, (0, 0), bar_mask)

        # Border
        border = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        ImageDraw.Draw(border).polygon(dst_quad, outline=(255, 255, 255, 100), width=2)
        canvas.paste(border, (0, 0), border)

        # Badge
        badge_x = x_left + 24
        badge_y = y_tl - 38
        b_bbox = font_badge.getbbox(name)
        text_w = b_bbox[2] - b_bbox[0]
        badge_w = text_w + 26
        badge_h = 24

        draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=6, fill=(16, 20, 32, 235), outline=(255, 255, 255, 50), width=1)
        draw.ellipse([badge_x + 9 - 3, badge_y + 12 - 3, badge_x + 9 + 3, badge_y + 12 + 3], fill=color + (255,))
        draw.text((badge_x + 18, badge_y + 4), name, font=font_badge, fill=(240, 244, 255, 255))
        draw.line([(badge_x + badge_w // 2, badge_y + badge_h), (badge_x + badge_w // 2, y_tl - 4)], fill=(255, 255, 255, 50), width=1)

    return canvas

def render_3d_trio_clean():
    """
    Pure 3D standing slats matching the user's reference diagram without headers
    on a sleek dark gradient backdrop.
    """
    cw, ch = 1440, 1000
    canvas = Image.new('RGBA', (cw, ch), (8, 10, 16, 255))

    bg_glow = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(bg_glow)
    glow_draw.ellipse([cw//2 - 500, ch//2 - 200, cw//2 + 500, ch//2 + 200], fill=(75, 65, 150, 45))
    canvas = Image.alpha_composite(canvas, bg_glow)

    im1 = Image.open(os.path.join(DOCS_DIR, '01-muted-violet.png')).convert('RGBA')
    im2 = Image.open(os.path.join(DOCS_DIR, '02-poiesis-blue.png')).convert('RGBA')
    im3 = Image.open(os.path.join(DOCS_DIR, '09-carbon.png')).convert('RGBA')

    bw, bh = im1.size

    ref_cx, ref_cy = 493, 488
    target_cx, target_cy = cw // 2, ch // 2 - 10
    scale = 1.90

    bars_ref = [
        (297, 370, 349, 622, 306, 672, im1, 0, int(bw * 0.33)),
        (418, 514, 322, 648, 272, 707, im2, int(bw * 0.33), int(bw * 0.67)),
        (560, 689, 301, 668, 243, 734, im3, int(bw * 0.67), bw)
    ]

    for xl, xr, ytl, ybl, ytr, ybr, im_theme, src_x0, src_x1 in bars_ref:
        dst_xl = target_cx + int((xl - ref_cx) * scale)
        dst_xr = target_cx + int((xr - ref_cx) * scale)
        dst_ytl = target_cy + int((ytl - ref_cy) * scale)
        dst_ybl = target_cy + int((ybl - ref_cy) * scale)
        dst_ytr = target_cy + int((ytr - ref_cy) * scale)
        dst_ybr = target_cy + int((ybr - ref_cy) * scale)

        slice_crop = im_theme.crop((src_x0, 0, src_x1, bh))
        sw, sh = slice_crop.size

        src_quad = [(0, 0), (sw, 0), (sw, sh), (0, sh)]
        dst_quad = [
            (dst_xl, dst_ytl),
            (dst_xr, dst_ytr),
            (dst_xr, dst_ybr),
            (dst_xl, dst_ybl)
        ]

        coeffs = find_coeffs(dst_quad, src_quad)
        transformed = slice_crop.transform((cw, ch), Image.Transform.PERSPECTIVE, coeffs, Image.Resampling.BICUBIC)

        # Reflection
        flipped = slice_crop.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        refl_h_factor = 0.35
        refl_ybl = dst_ybl + int((dst_ybl - dst_ytl) * refl_h_factor)
        refl_ybr = dst_ybr + int((dst_ybr - dst_ytr) * refl_h_factor)
        dst_refl_quad = [
            (dst_xl, dst_ybl),
            (dst_xr, dst_ybr),
            (dst_xr, refl_ybr),
            (dst_xl, refl_ybl)
        ]
        refl_coeffs = find_coeffs(dst_refl_quad, src_quad)
        transformed_refl = flipped.transform((cw, ch), Image.Transform.PERSPECTIVE, refl_coeffs, Image.Resampling.BICUBIC)

        refl_mask = Image.new('L', (cw, ch), 0)
        rm_draw = ImageDraw.Draw(refl_mask)
        min_y = min(dst_ybl, dst_ybr)
        max_y = max(refl_ybl, refl_ybr)
        poly_mask = Image.new('L', (cw, ch), 0)
        ImageDraw.Draw(poly_mask).polygon(dst_refl_quad, fill=255)

        for y in range(min_y, max_y + 1):
            fraction = (y - min_y) / max(1, (max_y - min_y))
            alpha = int(max(0, (1 - fraction) * 80))
            rm_draw.line([(0, y), (cw, y)], fill=alpha)

        final_refl_mask = Image.fromarray(np.minimum(np.array(refl_mask), np.array(poly_mask)))
        canvas.paste(transformed_refl, (0, 0), final_refl_mask)

        # Shadow
        bar_mask = Image.new('L', (cw, ch), 0)
        ImageDraw.Draw(bar_mask).polygon(dst_quad, fill=255)

        shadow = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        shadow_quad = [(p[0] + 16, p[1] + 20) for p in dst_quad]
        ImageDraw.Draw(shadow).polygon(shadow_quad, fill=(0, 0, 0, 180))
        shadow = shadow.filter(ImageFilter.GaussianBlur(22))
        canvas.paste(shadow, (0, 0), shadow)

        # Panel
        canvas.paste(transformed, (0, 0), bar_mask)

        # Border
        border = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        ImageDraw.Draw(border).polygon(dst_quad, outline=(255, 255, 255, 110), width=2)
        canvas.paste(border, (0, 0), border)

    return canvas

def main():
    print("Generating 3D perspective trio (labeled)...")
    trio = render_3d_trio()
    out1 = os.path.join(DOCS_DIR, 'theme-stack-3d-trio.png')
    trio.save(out1, quality=95)
    print(f"Saved {out1}")

    print("Generating 3D perspective trio (clean)...")
    clean = render_3d_trio_clean()
    out1_clean = os.path.join(DOCS_DIR, 'theme-stack-3d-trio-clean.png')
    clean.save(out1_clean, quality=95)
    print(f"Saved {out1_clean}")

    print("Generating 3D perspective window deck (5 themes overlapping)...")
    deck = render_3d_deck()
    out2 = os.path.join(DOCS_DIR, 'theme-stack-3d-deck.png')
    deck.save(out2, quality=95)
    print(f"Saved {out2}")

    print("All 3D compositions generated successfully!")

if __name__ == '__main__':
    main()
