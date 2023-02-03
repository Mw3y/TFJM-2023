import pygame
import utils.draw
import utils.colors

# Window configuration
window_width = 620 * 2
window_height = 420 * 2
zoom_factor = 1

# Problem configuration
notes_number = 4
new_notes_number = 7

# Initializing Pygame
pygame.init()

window = pygame.display.set_mode((window_width, window_height))
pygame.display.set_caption("Problème 4 - Musique déformée - TFJM² 2023")

running = True
latest_mouse_pos = (0, 0)
is_mouse_down = False
origin = [0, 0]

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
            pos_diff = (current_mouse_pos[i] - latest_mouse_pos[i]) / (1 + zoom_factor / 10)
            origin[i] = int(origin[i] + pos_diff)
        
        latest_mouse_pos = current_mouse_pos
    
    # Set window background
    window.fill((255, 255, 255))
    # Draw notes
    note_colors = utils.colors.create_notes_color_palette(notes_number)
    utils.draw.draw_notes(window, window_width, zoom_factor, origin, notes_number, new_notes_number,  note_colors)
    # Refresh window
    pygame.display.flip()
