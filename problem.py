"""
 * Copyright (C) TFJM² 2023 Lycée Pierre-Paul-Riquet, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Maxence Espagnet <maxence.espagnet16@gmail.com>, February 2023
"""

import pygame
import utils.draw
import utils.colors

# Window configuration
window_width = 620 * 2
window_height = 420 * 2
origin = [0, 0]
zoom_factor = 1

# Problem configuration
note_encodings = [4, 7, 12, 8, 4]

# Initializing Pygame
pygame.init()

window = pygame.display.set_mode((window_width, window_height))
pygame.display.set_caption("Problème 4 - Musique déformée - TFJM² 2023")
clock = pygame.time.Clock()  

running = True
latest_mouse_pos = (0, 0)
is_mouse_down = False

while running:
    current_mouse_pos = pygame.mouse.get_pos()

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEWHEEL:
            zoom_factor += event.y
            if zoom_factor < 1:
                zoom_factor = 1
        elif event.type == pygame.MOUSEBUTTONDOWN:
            is_mouse_down = True
            latest_mouse_pos = current_mouse_pos
        elif event.type == pygame.MOUSEBUTTONUP:
            is_mouse_down = False

    if is_mouse_down:
        # Recalculate the position of the origin based on the
        # movement the mouse did
        for i in range(len(origin)):
            pos_diff = (current_mouse_pos[i] - latest_mouse_pos[i]) / (
                1 + zoom_factor / 10
            )
            origin[i] = int(origin[i] + pos_diff)
        # Save the mouse position to calculate the next coordinates difference
        latest_mouse_pos = current_mouse_pos

    # Set window background
    window.fill((255, 255, 255))
    # Draw notes
    note_colors = utils.colors.create_notes_color_palette(note_encodings[0])
    utils.draw.draw_notes(
        window, window_width, zoom_factor, origin, note_encodings, note_colors
    )

    print(clock.get_fps())
    # Refresh window
    pygame.display.flip()
    # Set the framerate of the window
    clock.tick(60)
