import pygame
import math
import numpy as np

import utils.draw

WHITE = (255, 255, 255)
window_width = 620
window_height = 460

# Initializing Pygame
pygame.init()

window = pygame.display.set_mode((window_width, window_height))
pygame.display.set_caption("Problème 4 - Musique déformée - TFJM² 2023")
# Set window background
window.fill(WHITE)


band_width = 420
first_row_y, second_row_y = 60, 145

note_number = 4
x_axis_padding = (window_width - band_width) / 2
note_width, note_height = band_width / note_number, 60
note_colors = ((0, 159, 227), (128, 207, 241), (234, 94, 0), (244, 175, 128))
outline_width = 1

for i in range(note_number):
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

new_note_number = 7
new_note_width = band_width / new_note_number
new_note_colors = (
    (0, 159, 227),
    (0, 159, 227),
    (128, 207, 241),
    (255, 255, 255),
    (234, 94, 0),
    (244, 175, 128),
    (244, 175, 128),
)

for i in range(new_note_number):
    note = pygame.Rect(
        x_axis_padding + i * new_note_width, second_row_y, new_note_width, note_height
    )

    # Draw note
    pygame.draw.rect(window, new_note_colors[i], note)
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
        dash_length=4,
    )


# Refresh window
pygame.display.flip()


running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
