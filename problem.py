"""
 * Copyright (C) TFJM² 2023 Lycée Pierre-Paul-Riquet, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Maxence Espagnet <maxence.espagnet16@gmail.com>, February 2023
 *
 * Compile with `nuitka --onefile --windows-icon-from-ico=".\icon.ico" problem.py -o Problem_4_tfjm_2023_visualizer.exe --follow-imports --windows-disable-console` 
"""

import pygame
import pygame_textinput
import utils.draw
import utils.colors
import easydev  # import for nuitka

# Window configuration
window_width = 620 * 2
window_height = 420 * 2
origin = [0, 0]
zoom_factor = 1

# Default problem configuration
note_encodings = [4, 7]

# Initializing Pygame
pygame.init()

window = pygame.display.set_mode((window_width, window_height))
pygame.display.set_caption("Problème 4 - Musique déformée - TFJM² 2023")
clock = pygame.time.Clock()

running = True
latest_mouse_pos = (0, 0)
is_mouse_down = False

# Create a manager with custom input validator
textinput_manager = pygame_textinput.TextInputManager(
    validator=lambda input: not 0
    in list(map(int, input.replace(" ", "").rstrip(",").split(","))),
    initial=", ".join(map(str, note_encodings)),
)

# Create TextInput-object
font_object = pygame.font.SysFont(
    "Segoe UI", 32, True
)
textinput = pygame_textinput.TextInputVisualizer(
    manager=textinput_manager, font_object=font_object
)

while running:
    current_mouse_pos = pygame.mouse.get_pos()
    events = pygame.event.get()

    for event in events:
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

    # Refresh the text input
    textinput.update(events)
    window.blit(textinput.surface, (10, 10))

    # Change the note encodings based on the text input
    try:
        new_note_encodings = list(
            map(int, textinput.value.replace(" ", "").rstrip(",").split(","))
        )

        if not new_note_encodings == note_encodings:
            note_encodings = new_note_encodings
            origin = [0, 0]
            zoom_factor = 1
    except:
        print("Invalid encoding input.")

    # Refresh window
    pygame.display.update()
    # Set the framerate of the window
    clock.tick(30)
