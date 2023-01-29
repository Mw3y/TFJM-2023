import pygame
import math
import numpy as np

import utils.draw
import utils.colors

WHITE = (255, 255, 255)
window_scale = 2
window_width = 620 * window_scale
window_height = 420 * window_scale

# Initializing Pygame
pygame.init()

window = pygame.display.set_mode((window_width, window_height))
pygame.display.set_caption("Problème 4 - Musique déformée - TFJM² 2023")
# Set window background
window.fill(WHITE)


band_width = 420 * window_scale
first_row_y, second_row_y = 60 * window_scale, 145 * window_scale

notes_number = 4
x_axis_padding = (window_width - band_width) / 2
note_width, note_height = band_width / notes_number, 60 * window_scale
note_colors = utils.colors.create_notes_color_palette(notes_number)
outline_width = 1

for i in range(notes_number):
    note = pygame.Rect(
        x_axis_padding + i * note_width, first_row_y, note_width, note_height
    )
    # Draw note
    pygame.draw.rect(window, note_colors[i], note)
    # Fix outline overlap
    note.width += outline_width
    note.x -= outline_width
    # Draw note outline
    pygame.draw.rect(window, (0, 0, 0), note, outline_width)

new_notes_number = 7
new_note_width = band_width / new_notes_number
base_note_index = 0

for i in range(new_notes_number):
    note = pygame.Rect(
        x_axis_padding + i * new_note_width, second_row_y, new_note_width, note_height
    )

    total_width = new_note_width * (i + 1)
    color = note_colors[base_note_index]

    # Determine if the color of the new note usinng modulo
    if i != 0 and (total_width % note_width) > 0.5 * new_note_width:
        base_note_index += 1
        color = note_colors[base_note_index]
    # Special case where the a note aligned with the middle of a new note
    elif i != 0 and (total_width % note_width) == 0.5 * new_note_width:
        color = WHITE

    # Draw note
    pygame.draw.rect(window, color, note)
    # Fix outline overlap
    note.width += 1
    note.x -= 1
    # Draw note outline
    pygame.draw.rect(window, (0, 0, 0), note, outline_width)

    utils.draw.line_dashed(
        window,
        (226, 226, 226),
        (note.centerx, first_row_y + note_height),
        (note.centerx, second_row_y - 1),
        width=2,
        dash_length=4 * window_scale,
    )


# Refresh window
pygame.display.flip()

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
