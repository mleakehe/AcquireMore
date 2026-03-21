#!/usr/bin/env python3
"""
Josh Bully Head Invasion!
A wholesome family airplane shooter game for kids ages 4-10.
Shoot hearts to turn silly Josh Bully Heads happy!

Controls: Arrow keys or WASD to move, SPACE to shoot hearts.
"""

import pygame
import random
import math
import sys

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
WIDTH, HEIGHT = 800, 600
FPS = 60

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
SKY_BLUE = (135, 206, 235)
CLOUD_WHITE = (240, 248, 255)
PINK = (255, 105, 180)
LIGHT_PINK = (255, 182, 193)
RED = (255, 60, 80)
YELLOW = (255, 230, 0)
ORANGE = (255, 165, 0)
GREEN = (100, 200, 100)
PURPLE = (180, 100, 255)
DARK_PURPLE = (100, 50, 160)
GOLD = (255, 215, 0)
BROWN = (139, 90, 43)
SKIN = (255, 220, 180)
BULLY_GREEN = (120, 200, 120)
ANGEL_GLOW = (255, 200, 255)

# Game settings
PLAYER_SPEED = 5
HEART_SPEED = 8
JOSH_HITS_NEEDED = 3
MAX_LIVES = 3
SHOOT_COOLDOWN = 250  # milliseconds
JOSH_SPAWN_INTERVAL = 2500  # milliseconds
CLOUD_SPAWN_INTERVAL = 3000
MARCY_INTERVAL = 12000  # milliseconds
POWERUP_DURATION = 5000
WIN_SCORE = 100

# ---------------------------------------------------------------------------
# Helper drawing functions
# ---------------------------------------------------------------------------

def draw_heart(surface, x, y, size, color=PINK):
    """Draw a cute heart shape at (x, y)."""
    s = size
    # Two circles on top
    pygame.draw.circle(surface, color, (int(x - s * 0.3), int(y - s * 0.2)), int(s * 0.45))
    pygame.draw.circle(surface, color, (int(x + s * 0.3), int(y - s * 0.2)), int(s * 0.45))
    # Triangle bottom
    points = [
        (x - s * 0.7, y - s * 0.05),
        (x + s * 0.7, y - s * 0.05),
        (x, y + s * 0.7),
    ]
    pygame.draw.polygon(surface, color, points)


def draw_player(surface, x, y):
    """Draw a cute colorful airplane with a happy face.
    # TODO: replace with player.png for a custom sprite
    """
    # Body (rounded rectangle via ellipse)
    body_rect = pygame.Rect(x - 20, y - 30, 40, 60)
    pygame.draw.ellipse(surface, YELLOW, body_rect)
    pygame.draw.ellipse(surface, ORANGE, body_rect, 2)
    # Wings
    pygame.draw.polygon(surface, RED, [(x - 20, y), (x - 45, y + 15), (x - 15, y + 15)])
    pygame.draw.polygon(surface, RED, [(x + 20, y), (x + 45, y + 15), (x + 15, y + 15)])
    # Tail fin
    pygame.draw.polygon(surface, PURPLE, [(x - 8, y + 25), (x + 8, y + 25), (x, y + 40)])
    # Nose cone
    pygame.draw.polygon(surface, ORANGE, [(x - 12, y - 28), (x + 12, y - 28), (x, y - 45)])
    # Happy face
    pygame.draw.circle(surface, BLACK, (x - 7, y - 12), 4)  # left eye
    pygame.draw.circle(surface, BLACK, (x + 7, y - 12), 4)  # right eye
    pygame.draw.circle(surface, WHITE, (x - 6, y - 13), 2)  # eye shine
    pygame.draw.circle(surface, WHITE, (x + 8, y - 13), 2)
    # Smile
    pygame.draw.arc(surface, RED, (x - 8, y - 8, 16, 12), 3.14, 6.28, 2)
    # Rosy cheeks
    pygame.draw.circle(surface, LIGHT_PINK, (x - 14, y - 4), 4)
    pygame.draw.circle(surface, LIGHT_PINK, (x + 14, y - 4), 4)


def draw_josh_head(surface, x, y, scale=1.0, hit_flash=False):
    """Draw Josh Bully Head — a big goofy cartoon monster head.
    # TODO: replace with josh.png for a custom sprite
    """
    s = scale
    color = PINK if hit_flash else BULLY_GREEN
    # Big head
    pygame.draw.circle(surface, color, (int(x), int(y)), int(35 * s))
    pygame.draw.circle(surface, DARK_PURPLE, (int(x), int(y)), int(35 * s), 2)
    # Wild hair (spiky lines on top)
    for angle_deg in range(-140, -40, 15):
        angle = math.radians(angle_deg)
        ex = x + math.cos(angle) * 48 * s
        ey = y + math.sin(angle) * 48 * s
        pygame.draw.line(surface, PURPLE, (int(x + math.cos(angle) * 30 * s),
                         int(y + math.sin(angle) * 30 * s)), (int(ex), int(ey)), 3)
    # Huge eyes
    pygame.draw.circle(surface, WHITE, (int(x - 13 * s), int(y - 8 * s)), int(12 * s))
    pygame.draw.circle(surface, WHITE, (int(x + 13 * s), int(y - 8 * s)), int(12 * s))
    pygame.draw.circle(surface, BLACK, (int(x - 11 * s), int(y - 6 * s)), int(6 * s))
    pygame.draw.circle(surface, BLACK, (int(x + 15 * s), int(y - 6 * s)), int(6 * s))
    # Eye shine
    pygame.draw.circle(surface, WHITE, (int(x - 9 * s), int(y - 9 * s)), int(3 * s))
    pygame.draw.circle(surface, WHITE, (int(x + 17 * s), int(y - 9 * s)), int(3 * s))
    # Big laughing mouth
    pygame.draw.ellipse(surface, RED, (int(x - 16 * s), int(y + 6 * s), int(32 * s), int(18 * s)))
    pygame.draw.ellipse(surface, WHITE, (int(x - 12 * s), int(y + 6 * s), int(24 * s), int(10 * s)))
    # Eyebrows (mischievous)
    pygame.draw.line(surface, BLACK, (int(x - 22 * s), int(y - 22 * s)),
                     (int(x - 5 * s), int(y - 18 * s)), 3)
    pygame.draw.line(surface, BLACK, (int(x + 5 * s), int(y - 18 * s)),
                     (int(x + 22 * s), int(y - 22 * s)), 3)


def draw_marcy(surface, x, y):
    """Draw Guardian Angel Marcy — glowing pink angel with wings and halo.
    # TODO: replace with marcy.png for a custom sprite
    """
    # Glow
    glow = pygame.Surface((60, 60), pygame.SRCALPHA)
    pygame.draw.circle(glow, (255, 200, 255, 60), (30, 30), 30)
    surface.blit(glow, (int(x - 30), int(y - 30)))
    # Body
    pygame.draw.ellipse(surface, LIGHT_PINK, (int(x - 10), int(y - 5), 20, 25))
    # Head
    pygame.draw.circle(surface, SKIN, (int(x), int(y - 14)), 10)
    # Eyes
    pygame.draw.circle(surface, BLACK, (int(x - 4), int(y - 15)), 2)
    pygame.draw.circle(surface, BLACK, (int(x + 4), int(y - 15)), 2)
    # Smile
    pygame.draw.arc(surface, PINK, (int(x - 4), int(y - 12), 8, 6), 3.14, 6.28, 1)
    # Wings
    pygame.draw.ellipse(surface, ANGEL_GLOW, (int(x - 28), int(y - 12), 20, 30))
    pygame.draw.ellipse(surface, ANGEL_GLOW, (int(x + 8), int(y - 12), 20, 30))
    # Halo
    pygame.draw.ellipse(surface, GOLD, (int(x - 10), int(y - 30), 20, 8), 2)


def draw_nanny_corner(surface, font, score):
    """Draw Beloved Nanny in the corner with encouraging text.
    # TODO: replace with nanny.png for a custom sprite
    """
    nx, ny = WIDTH - 70, HEIGHT - 55
    # Face
    pygame.draw.circle(surface, SKIN, (nx, ny), 22)
    pygame.draw.circle(surface, BROWN, (nx, ny), 22, 2)
    # Hair
    pygame.draw.arc(surface, BROWN, (nx - 22, ny - 30, 44, 30), 0, 3.14, 4)
    # Eyes
    pygame.draw.circle(surface, BLACK, (nx - 7, ny - 4), 3)
    pygame.draw.circle(surface, BLACK, (nx + 7, ny - 4), 3)
    # Big warm smile
    pygame.draw.arc(surface, RED, (nx - 10, ny, 20, 14), 3.14, 6.28, 2)
    # Rosy cheeks
    pygame.draw.circle(surface, LIGHT_PINK, (nx - 15, ny + 4), 4)
    pygame.draw.circle(surface, LIGHT_PINK, (nx + 15, ny + 4), 4)
    # Encouraging text
    messages = ["Go go go!", "You're amazing!", "Nanny loves you!", "So proud!", "Yay sweetie!"]
    msg = messages[(score // 10) % len(messages)]
    text = font.render(msg, True, PINK)
    surface.blit(text, (nx - text.get_width() // 2, ny + 28))


def draw_cloud_bg(surface, clouds):
    """Draw scrolling background clouds."""
    for cx, cy, cw in clouds:
        pygame.draw.ellipse(surface, CLOUD_WHITE, (int(cx), int(cy), cw, cw // 2))
        pygame.draw.ellipse(surface, CLOUD_WHITE, (int(cx + cw * 0.3), int(cy - cw * 0.15),
                            int(cw * 0.6), int(cw * 0.4)))


# ---------------------------------------------------------------------------
# Game classes
# ---------------------------------------------------------------------------

class Player:
    def __init__(self):
        self.x = WIDTH // 2
        self.y = HEIGHT - 80
        self.speed = PLAYER_SPEED
        self.lives = MAX_LIVES
        self.score = 0
        self.last_shot = 0
        self.invincible_until = 0
        self.triple_until = 0
        self.speed_until = 0
        self.radius = 20

    def move(self, keys):
        spd = self.speed + (3 if pygame.time.get_ticks() < self.speed_until else 0)
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            self.x -= spd
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            self.x += spd
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            self.y -= spd
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            self.y += spd
        self.x = max(25, min(WIDTH - 25, self.x))
        self.y = max(30, min(HEIGHT - 30, self.y))

    def draw(self, surface):
        now = pygame.time.get_ticks()
        if now < self.invincible_until and (now // 100) % 2 == 0:
            # Flash effect during invincibility
            glow = pygame.Surface((80, 80), pygame.SRCALPHA)
            pygame.draw.circle(glow, (255, 255, 100, 80), (40, 40), 40)
            surface.blit(glow, (int(self.x - 40), int(self.y - 40)))
        draw_player(surface, int(self.x), int(self.y))


class Heart:
    def __init__(self, x, y, dx=0):
        self.x = x
        self.y = y
        self.dx = dx
        self.radius = 8

    def update(self):
        self.y -= HEART_SPEED
        self.x += self.dx

    def draw(self, surface):
        draw_heart(surface, int(self.x), int(self.y), 8, PINK)

    def off_screen(self):
        return self.y < -20 or self.x < -20 or self.x > WIDTH + 20


class JoshHead:
    def __init__(self, difficulty):
        self.x = random.randint(50, WIDTH - 50)
        self.y = random.randint(-80, -40)
        self.hp = JOSH_HITS_NEEDED + difficulty // 30
        self.max_hp = self.hp
        self.speed = random.uniform(0.8, 1.5) + difficulty * 0.01
        self.dx = random.uniform(-1, 1)
        self.radius = 35
        self.hit_timer = 0
        self.giggle_text = ""
        self.giggle_timer = 0
        self.defeated = False
        self.confetti = []
        self.defeat_timer = 0

    def update(self):
        if self.defeated:
            self.defeat_timer += 1
            for c in self.confetti:
                c[0] += c[2]
                c[1] += c[3]
                c[3] += 0.1  # gravity
            return self.defeat_timer > 40

        self.y += self.speed
        self.x += self.dx
        if self.x < 40 or self.x > WIDTH - 40:
            self.dx *= -1
        if self.hit_timer > 0:
            self.hit_timer -= 1
        if self.giggle_timer > 0:
            self.giggle_timer -= 1
        return self.y > HEIGHT + 50

    def hit(self):
        self.hp -= 1
        self.hit_timer = 10
        giggles = ["Hee hee hee!", "Boing!", "Tee hee!", "Ha ha ha!", "That tickles!"]
        self.giggle_text = random.choice(giggles)
        self.giggle_timer = 40
        if self.hp <= 0:
            self.defeated = True
            for _ in range(20):
                self.confetti.append([self.x, self.y,
                    random.uniform(-4, 4), random.uniform(-6, 1),
                    random.choice([PINK, YELLOW, PURPLE, GREEN, ORANGE, RED])])
            return True
        return False

    def draw(self, surface, font):
        if self.defeated:
            for c in self.confetti:
                pygame.draw.circle(surface, c[4], (int(c[0]), int(c[1])), 4)
            return
        draw_josh_head(surface, self.x, self.y, 1.0, self.hit_timer > 0)
        # HP bar
        bar_w = 40
        pygame.draw.rect(surface, RED, (int(self.x - bar_w // 2), int(self.y - 45), bar_w, 6))
        fill = int(bar_w * self.hp / self.max_hp)
        pygame.draw.rect(surface, GREEN, (int(self.x - bar_w // 2), int(self.y - 45), fill, 6))
        # Giggle text
        if self.giggle_timer > 0:
            txt = font.render(self.giggle_text, True, PURPLE)
            surface.blit(txt, (int(self.x - txt.get_width() // 2), int(self.y - 55)))


class BullyCloud:
    def __init__(self):
        self.x = random.randint(30, WIDTH - 30)
        self.y = -30
        self.speed = random.uniform(2, 4)
        self.w = random.randint(35, 55)
        self.radius = self.w // 2

    def update(self):
        self.y += self.speed
        return self.y > HEIGHT + 30

    def draw(self, surface):
        # Dark bully cloud with a grumpy face
        pygame.draw.ellipse(surface, (100, 100, 120), (int(self.x - self.w // 2),
                            int(self.y - self.w // 4), self.w, self.w // 2))
        pygame.draw.ellipse(surface, (80, 80, 100),
                            (int(self.x - self.w * 0.2), int(self.y - self.w * 0.3),
                             int(self.w * 0.5), int(self.w * 0.35)))
        # Grumpy eyes
        pygame.draw.circle(surface, WHITE, (int(self.x - 6), int(self.y - 3)), 4)
        pygame.draw.circle(surface, WHITE, (int(self.x + 6), int(self.y - 3)), 4)
        pygame.draw.circle(surface, BLACK, (int(self.x - 6), int(self.y - 2)), 2)
        pygame.draw.circle(surface, BLACK, (int(self.x + 6), int(self.y - 2)), 2)
        # Frown
        pygame.draw.arc(surface, BLACK, (int(self.x - 6), int(self.y + 2), 12, 8), 0, 3.14, 2)


class MarcyPowerup:
    def __init__(self):
        self.x = -30
        self.y = random.randint(60, HEIGHT // 2)
        self.speed = 2.5
        self.kind = random.choice(["shield", "triple", "speed"])
        self.dropped = False
        self.drop_x = 0
        self.drop_y = 0
        self.drop_speed = 2
        self.radius = 14
        self.collected = False

    def update(self):
        if not self.dropped:
            self.x += self.speed
            if self.x > WIDTH // 2 and not self.dropped:
                self.dropped = True
                self.drop_x = self.x
                self.drop_y = self.y + 30
            if self.x > WIDTH + 40:
                if not self.dropped:
                    return True
        if self.dropped and not self.collected:
            self.drop_y += self.drop_speed
            if self.drop_y > HEIGHT + 30:
                return True
        return self.x > WIDTH + 40 and self.dropped

    def draw(self, surface, font):
        if not self.collected:
            # Draw Marcy flying across
            if self.x < WIDTH + 40:
                draw_marcy(surface, int(self.x), int(self.y))
            # Draw dropped powerup
            if self.dropped:
                colors = {"shield": GOLD, "triple": PINK, "speed": GREEN}
                labels = {"shield": "S", "triple": "3x", "speed": ">>"}
                col = colors[self.kind]
                pygame.draw.circle(surface, col, (int(self.drop_x), int(self.drop_y)), 14)
                pygame.draw.circle(surface, WHITE, (int(self.drop_x), int(self.drop_y)), 14, 2)
                txt = font.render(labels[self.kind], True, WHITE)
                surface.blit(txt, (int(self.drop_x - txt.get_width() // 2),
                                   int(self.drop_y - txt.get_height() // 2)))


class FloatingText:
    def __init__(self, x, y, text, color=YELLOW, size=24):
        self.x = x
        self.y = y
        self.text = text
        self.color = color
        self.timer = 50
        self.size = size

    def update(self):
        self.y -= 1
        self.timer -= 1
        return self.timer <= 0

    def draw(self, surface, font):
        alpha = min(255, self.timer * 6)
        txt = font.render(self.text, True, self.color)
        surface.blit(txt, (int(self.x - txt.get_width() // 2), int(self.y)))


# ---------------------------------------------------------------------------
# Main game
# ---------------------------------------------------------------------------

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Josh Bully Head Invasion!")
    clock = pygame.time.Clock()

    font_sm = pygame.font.SysFont("arial", 18, bold=True)
    font_md = pygame.font.SysFont("arial", 24, bold=True)
    font_lg = pygame.font.SysFont("arial", 42, bold=True)
    font_xl = pygame.font.SysFont("arial", 54, bold=True)

    # Background clouds (decorative)
    bg_clouds = [[random.randint(0, WIDTH), random.randint(0, HEIGHT),
                  random.randint(60, 120)] for _ in range(8)]

    def reset_game():
        return (Player(), [], [], [], [], [], 0, pygame.time.get_ticks(),
                pygame.time.get_ticks(), pygame.time.get_ticks())

    state = "menu"  # menu, playing, gameover, win
    player, hearts, joshes, clouds_obs, marcys, texts = None, [], [], [], [], []
    difficulty = 0
    last_josh, last_cloud, last_marcy = 0, 0, 0

    running = True
    while running:
        dt = clock.tick(FPS)
        now = pygame.time.get_ticks()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                if state == "menu" and event.key == pygame.K_SPACE:
                    state = "playing"
                    (player, hearts, joshes, clouds_obs, marcys, texts,
                     difficulty, last_josh, last_cloud, last_marcy) = reset_game()
                if (state == "gameover" or state == "win") and event.key == pygame.K_SPACE:
                    state = "menu"

        # Scroll background clouds
        for c in bg_clouds:
            c[1] += 0.3
            if c[1] > HEIGHT + 60:
                c[1] = -60
                c[0] = random.randint(0, WIDTH)

        # --- Draw background ---
        screen.fill(SKY_BLUE)
        draw_cloud_bg(screen, bg_clouds)

        # =================================================================
        # MENU
        # =================================================================
        if state == "menu":
            title = font_xl.render("Josh Bully Head", True, PURPLE)
            title2 = font_xl.render("Invasion!", True, RED)
            screen.blit(title, (WIDTH // 2 - title.get_width() // 2, 100))
            screen.blit(title2, (WIDTH // 2 - title2.get_width() // 2, 160))

            draw_josh_head(screen, WIDTH // 2, 290, 1.5)
            draw_player(screen, WIDTH // 2 - 120, 300)
            draw_marcy(screen, WIDTH // 2 + 120, 280)

            prompt = font_md.render("Press SPACE to start!", True, WHITE)
            screen.blit(prompt, (WIDTH // 2 - prompt.get_width() // 2, 400))

            sub = font_sm.render("Arrow keys / WASD to move  |  SPACE to shoot hearts!", True, WHITE)
            screen.blit(sub, (WIDTH // 2 - sub.get_width() // 2, 450))

            credit = font_sm.render("With love from Nanny & Guardian Angel Marcy", True, PINK)
            screen.blit(credit, (WIDTH // 2 - credit.get_width() // 2, 520))

        # =================================================================
        # PLAYING
        # =================================================================
        elif state == "playing":
            keys = pygame.key.get_pressed()
            player.move(keys)
            difficulty = player.score

            # Shooting
            if keys[pygame.K_SPACE] and now - player.last_shot > SHOOT_COOLDOWN:
                player.last_shot = now
                hearts.append(Heart(player.x, player.y - 30))
                if now < player.triple_until:
                    hearts.append(Heart(player.x - 15, player.y - 20, -1.5))
                    hearts.append(Heart(player.x + 15, player.y - 20, 1.5))
                texts.append(FloatingText(player.x, player.y - 50,
                             random.choice(["Heart blast!", "Pew pew!", "Love shot!"]),
                             LIGHT_PINK, 16))

            # Spawn Josh heads
            spawn_interval = max(800, JOSH_SPAWN_INTERVAL - difficulty * 15)
            if now - last_josh > spawn_interval:
                joshes.append(JoshHead(difficulty))
                last_josh = now

            # Spawn bully clouds
            if now - last_cloud > CLOUD_SPAWN_INTERVAL:
                clouds_obs.append(BullyCloud())
                last_cloud = now

            # Spawn Marcy
            if now - last_marcy > MARCY_INTERVAL:
                marcys.append(MarcyPowerup())
                last_marcy = now
                texts.append(FloatingText(100, 80, "Marcy is here!", ANGEL_GLOW))

            # Update hearts
            for h in hearts:
                h.update()
            hearts = [h for h in hearts if not h.off_screen()]

            # Update Joshes
            remove_joshes = []
            for j in joshes:
                gone = j.update()
                if gone:
                    remove_joshes.append(j)
            for j in remove_joshes:
                joshes.remove(j)

            # Update bully clouds
            clouds_obs = [c for c in clouds_obs if not c.update()]

            # Update Marcy powerups
            marcys = [m for m in marcys if not m.update()]

            # Update floating texts
            texts = [t for t in texts if not t.update()]

            # --- Collision: hearts vs joshes ---
            for h in hearts[:]:
                for j in joshes:
                    if j.defeated:
                        continue
                    dist = math.hypot(h.x - j.x, h.y - j.y)
                    if dist < h.radius + j.radius:
                        if h in hearts:
                            hearts.remove(h)
                        defeated = j.hit()
                        if defeated:
                            player.score += 10
                            texts.append(FloatingText(j.x, j.y - 40, "+10 Yay!!", YELLOW))
                            nanny_cheers = ["Nanny is so proud!", "Amazing sweetie!",
                                            "You did it!", "Yay Nanny!"]
                            texts.append(FloatingText(WIDTH // 2, HEIGHT // 2,
                                         random.choice(nanny_cheers), PINK, 24))
                        break

            # --- Collision: player vs bully clouds ---
            for c in clouds_obs[:]:
                dist = math.hypot(player.x - c.x, player.y - c.y)
                if dist < player.radius + c.radius:
                    if now < player.invincible_until:
                        clouds_obs.remove(c)
                        texts.append(FloatingText(player.x, player.y - 40, "Shield!", GOLD))
                    else:
                        clouds_obs.remove(c)
                        player.lives -= 1
                        player.invincible_until = now + 1500  # brief invincibility
                        texts.append(FloatingText(player.x, player.y - 40, "Ouch!", RED))
                        if player.lives <= 0:
                            state = "gameover"

            # --- Collision: player vs josh (body contact) ---
            for j in joshes:
                if j.defeated:
                    continue
                dist = math.hypot(player.x - j.x, player.y - j.y)
                if dist < player.radius + j.radius - 5:
                    if now >= player.invincible_until:
                        player.lives -= 1
                        player.invincible_until = now + 1500
                        texts.append(FloatingText(player.x, player.y - 40, "Bonk!", ORANGE))
                        if player.lives <= 0:
                            state = "gameover"

            # --- Collision: player vs Marcy powerup ---
            for m in marcys:
                if m.dropped and not m.collected:
                    dist = math.hypot(player.x - m.drop_x, player.y - m.drop_y)
                    if dist < player.radius + m.radius:
                        m.collected = True
                        if m.kind == "shield":
                            player.invincible_until = now + POWERUP_DURATION
                            texts.append(FloatingText(player.x, player.y - 50,
                                         "Shield UP!", GOLD))
                        elif m.kind == "triple":
                            player.triple_until = now + POWERUP_DURATION
                            texts.append(FloatingText(player.x, player.y - 50,
                                         "Triple Hearts!", PINK))
                        elif m.kind == "speed":
                            player.speed_until = now + POWERUP_DURATION
                            texts.append(FloatingText(player.x, player.y - 50,
                                         "Speed Boost!", GREEN))

            # Win check
            if player.score >= WIN_SCORE:
                state = "win"

            # --- Draw everything ---
            for c in clouds_obs:
                c.draw(screen)
            for m in marcys:
                m.draw(screen, font_sm)
            for j in joshes:
                j.draw(screen, font_sm)
            for h in hearts:
                h.draw(screen)
            player.draw(screen)
            for t in texts:
                t.draw(screen, font_md)

            # HUD
            draw_nanny_corner(screen, font_sm, player.score)

            score_txt = font_md.render(f"Score: {player.score}", True, WHITE)
            screen.blit(score_txt, (15, 10))

            lives_txt = font_md.render("Lives: ", True, WHITE)
            screen.blit(lives_txt, (15, 40))
            for i in range(player.lives):
                draw_heart(screen, 100 + i * 25, 50, 10, RED)

            # Active powerup indicators
            py = 75
            if now < player.invincible_until:
                t = font_sm.render("SHIELD", True, GOLD)
                screen.blit(t, (15, py)); py += 20
            if now < player.triple_until:
                t = font_sm.render("TRIPLE", True, PINK)
                screen.blit(t, (15, py)); py += 20
            if now < player.speed_until:
                t = font_sm.render("SPEED", True, GREEN)
                screen.blit(t, (15, py))

            goal = font_sm.render(f"Goal: {WIN_SCORE} pts", True, LIGHT_PINK)
            screen.blit(goal, (WIDTH // 2 - goal.get_width() // 2, 10))

        # =================================================================
        # GAME OVER
        # =================================================================
        elif state == "gameover":
            overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            pygame.draw.rect(overlay, (0, 0, 0, 140), (0, 0, WIDTH, HEIGHT))
            screen.blit(overlay, (0, 0))

            draw_josh_head(screen, WIDTH // 2, 200, 2.0)
            t1 = font_lg.render("Josh Bully Head wins...", True, PURPLE)
            t2 = font_md.render("but he still loves you!", True, LIGHT_PINK)
            t3 = font_md.render("Press SPACE to try again!", True, WHITE)
            screen.blit(t1, (WIDTH // 2 - t1.get_width() // 2, 300))
            screen.blit(t2, (WIDTH // 2 - t2.get_width() // 2, 355))
            screen.blit(t3, (WIDTH // 2 - t3.get_width() // 2, 420))

            nanny_txt = font_md.render("Nanny believes in you!", True, PINK)
            screen.blit(nanny_txt, (WIDTH // 2 - nanny_txt.get_width() // 2, 480))

        # =================================================================
        # WIN
        # =================================================================
        elif state == "win":
            overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            pygame.draw.rect(overlay, (255, 200, 255, 100), (0, 0, WIDTH, HEIGHT))
            screen.blit(overlay, (0, 0))

            t1 = font_xl.render("YOU SAVED THE DAY!", True, GOLD)
            screen.blit(t1, (WIDTH // 2 - t1.get_width() // 2, 60))

            draw_player(screen, WIDTH // 2 - 140, 220)
            draw_marcy(screen, WIDTH // 2, 200)
            draw_josh_head(screen, WIDTH // 2 + 140, 220, 1.2, True)  # pink/happy Josh

            t2 = font_lg.render("Nanny loves you SO much!", True, PINK)
            screen.blit(t2, (WIDTH // 2 - t2.get_width() // 2, 310))

            score_final = font_md.render(f"Final Score: {player.score}", True, WHITE)
            screen.blit(score_final, (WIDTH // 2 - score_final.get_width() // 2, 380))

            names = font_sm.render("Player  |  Guardian Angel Marcy  |  Josh Bully Head  |  Beloved Nanny",
                                   True, WHITE)
            screen.blit(names, (WIDTH // 2 - names.get_width() // 2, 430))

            t3 = font_md.render("Press SPACE to play again!", True, WHITE)
            screen.blit(t3, (WIDTH // 2 - t3.get_width() // 2, 490))

            # Confetti
            for _ in range(3):
                cx = random.randint(0, WIDTH)
                cy = random.randint(0, HEIGHT)
                color = random.choice([PINK, YELLOW, PURPLE, GREEN, ORANGE, GOLD])
                pygame.draw.circle(screen, color, (cx, cy), random.randint(3, 6))

        pygame.display.flip()

    pygame.quit()
    sys.exit()


if __name__ == "__main__":
    main()
