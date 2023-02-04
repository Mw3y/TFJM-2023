from math import exp
import numpy as np
import pygame


def draw_base_note_band(
    surface,
    notes_number,
    note_width,
    note_height,
    note_colors,
    start_pos,
    outline_width=1,
):
    for i in range(notes_number):
        note_object = pygame.Rect(
            start_pos[0] + i * note_width, start_pos[1], note_width, note_height
        )
        draw_note(surface, note_object, note_colors[i], outline_width)


def draw_new_encoding_note_band(
    surface,
    new_notes_number,
    new_note_width,
    new_band_start_pos,
    note_width,
    note_height,
    note_colors,
    band_start_pos,
    zoom_factor=1,
    outline_width=1,
):
    note_objects, new_note_colors = [], []
    for i in range(new_notes_number):
        note_object = pygame.Rect(
            new_band_start_pos[0] + i * new_note_width,
            new_band_start_pos[1],
            new_note_width,
            note_height,
        )

        # Determine the color of the new note
        color_index = int(
              (note_object.centerx - new_band_start_pos[0]) // note_width
        )
        # print(f"color_index: {color_index}; {note_width}")
        color = note_colors[color_index]
        if (note_object.centerx - new_band_start_pos[0]) % note_width == 0:
            color = (255, 255, 255)
            
        new_note_colors.append(color)

        draw_note(surface, note_object, color, outline_width)
        draw_line_dashed(
            surface,
            (226, 226, 226),
            (note_object.centerx, band_start_pos[1] + note_height),
            # Minus 1 to avoid overlapping with the outline
            (note_object.centerx, new_band_start_pos[1] - 1),
            width=2,
            dash_length=8 * zoom_factor,
        )
        note_objects.append(note_object)

    return {"notes": list(note_objects), "colors": list(new_note_colors)}


def draw_note(surface, note_object, color, outline_width):
    # Draw note
    pygame.draw.rect(surface, color, note_object)
    # Fix outline overlap
    note_object.width += outline_width
    note_object.x -= outline_width
    # Draw note outline
    pygame.draw.rect(surface, (0, 0, 0), note_object, outline_width)


def draw_notes(
    window,
    window_width,
    zoom_factor,
    origin,
    note_encodings,
    note_colors,
):

    # Calculate the bandwidth based on the zoom factor
    band_width = 420 * int(exp(zoom_factor))
    x_axis_padding = ((window_width - band_width) / 2) + origin[0]

    base_note_height = 60 * 2 * zoom_factor
    base_note_width = band_width / note_encodings[0]
    base_note_band_y = (origin[1] + base_note_height) * zoom_factor
    # The space between two note bands
    bands_margin = base_note_height - 35

    draw_base_note_band(
        window,
        note_encodings[0],
        base_note_width,
        base_note_height,
        note_colors,
        (x_axis_padding, base_note_band_y),
    )

    previous_note_width = base_note_width
    previous_note_colors = note_colors
    for i in range(1, len(note_encodings)):
        # Determine the start Y axis position of the previous & current band
        previous_note_band_y = (
            origin[1] + base_note_height + 2 * (i - 1) * bands_margin
        ) * zoom_factor
        new_note_band_y = (
            origin[1] + base_note_height + 2 * i * bands_margin
        ) * zoom_factor

        new_notes_number = note_encodings[i]
        # Calculate the new note width
        new_note_width = band_width / new_notes_number
        # Draw the new note band
        draw_result = draw_new_encoding_note_band(
            window,
            new_notes_number,
            new_note_width,
            (x_axis_padding, new_note_band_y),
            previous_note_width,
            base_note_height,
            previous_note_colors,
            (x_axis_padding, previous_note_band_y),
            zoom_factor,
        )

        # Save the data of this band to use it for the next one
        previous_note_colors = draw_result.get("colors")
        previous_note_width = new_note_width


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

    for n in range(int(exclude_corners) + 1, dash_amount - int(exclude_corners), 2):
        pygame.draw.line(
            surface, color, tuple(dash_knots[n - 1]), tuple(dash_knots[n]), width
        )
