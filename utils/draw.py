import numpy as np
import pygame


def draw_note_band(
    surface, notes_number, note_width, note_height, note_colors, start_pos, outline_width=1
):
    start_x, start_y = start_pos
    for i in range(notes_number):
        note_object = pygame.Rect(
            start_x + i * note_width, start_y, note_width, note_height
        )
        draw_note(surface, note_object, note_colors[i], outline_width)


def draw_note(surface, note_object, color, outline_width):
    # Draw note
    pygame.draw.rect(surface, color, note_object)
    # Fix outline overlap
    note_object.width += outline_width
    note_object.x -= outline_width
    # Draw note outline
    pygame.draw.rect(surface, (0, 0, 0), note_object, outline_width)


def draw_line_dashed(
    surface, color, start_pos, end_pos, width=1, dash_length=10, exclude_corners=False
):
    """Draw a dash line on the surface.

    Args:
        surface ([type]): The pygame window.
        color ([type]): The color of the line.
        start_pos ([type]): The position of the start fo the line.
        end_pos ([type]): The position of the end fo the line.
        width (int, optional): The width of the line. Defaults to 1.
        dash_length (int, optional): The length of each dash. Defaults to 10.
        exclude_corners (bool, optional): If the dash starts at corners. Defaults to False.

    Returns:
        [type]: [description]
    """
    # convert tuples to numpy arrays
    start_pos = np.array(start_pos)
    end_pos = np.array(end_pos)

    # get euclidian distance between start_pos and end_pos
    length = np.linalg.norm(end_pos - start_pos)

    # get amount of pieces that line will be split up in (half of it are amount of dashes)
    dash_amount = int(length / dash_length)

    # x-y-value-pairs of where dashes start (and on next, will end)
    dash_knots = np.array(
        [np.linspace(start_pos[i], end_pos[i], dash_amount) for i in range(2)]
    ).transpose()

    return [
        pygame.draw.line(
            surface, color, tuple(dash_knots[n]), tuple(dash_knots[n + 1]), width
        )
        for n in range(int(exclude_corners), dash_amount - int(exclude_corners), 2)
    ]
