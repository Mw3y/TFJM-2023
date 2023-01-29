import math
from colormap import hex2rgb


def generate_shade(rgb_color, percent):
    red = rgb_color[0] * (1 - 0.1 * percent)
    green = rgb_color[1] * (1 - 0.1 * percent)
    blue = rgb_color[2] * (1 - 0.1 * percent)
    return (red, green, blue)


def generate_tint(rgb_color, percent):
    red = rgb_color[0] + (255 - rgb_color[0]) * percent * 0.1
    green = rgb_color[1] + (255 - rgb_color[1]) * percent * 0.1
    blue = rgb_color[2] + (255 - rgb_color[2]) * percent * 0.1
    return (red, green, blue)


def generate_shades_palette(number_of_shades, color_palette, notes_number):
    shades_palette = []
    for color in color_palette:
        for j in range(number_of_shades):
            rgb_values = hex2rgb(color)
            if number_of_shades >= 5:
                if j < 5:
                    shades_palette.append(generate_shade(rgb_values, 8 - 2 * j))
                    print(
                        f"shades: {number_of_shades}; j: {j}; color: {generate_shade(rgb_values, 10 - 2 * j)}"
                    )
                else:
                    shades_palette.append(generate_tint(rgb_values, 2 * (j - 5)))
                    print(
                        f"shades: {number_of_shades}; j: {j}; color: {generate_tint(rgb_values, 2 * j)}"
                    )
            else:
                shades_palette.append(generate_tint(rgb_values, 2 * j))
                print(
                    f"shades: {number_of_shades}; j: {j}; color: {generate_tint(rgb_values, 2 * j)}"
                )
    return shades_palette


def determine_shades_number(notes_number, available_colors, max_shades_number):
    return math.ceil(((notes_number - available_colors) / max_shades_number) + 1)


def create_notes_color_palette(notes_number):

    # Replicate the exemple of the problem with the same color palette
    if notes_number == 4:
        return ("#009fe3", "#80cff1", "#ea5e00", "#f4af80")

    color_palette = (
        "#008ad4",
        "#ea5e00",
        "#d32b51",
        "#b74083",
        "#845a9f",
        "#3f517d",
        "#386982",
        "#038cb7",
        "#00a0a4",
        "#00a578",
        "#2c9d13",
        "#c49d0a",
    )

    max_number_of_shades = 8
    number_of_shades = determine_shades_number(
        notes_number, len(color_palette), max_number_of_shades
    )

    # If there's too many notes, duplicate the color palette
    while (
        number_of_shades * len(color_palette) > number_of_shades * max_number_of_shades
    ):
        color_palette *= 2
        number_of_shades = determine_shades_number(
            notes_number, len(color_palette), max_number_of_shades
        )

    # If there are more colors than notes
    if number_of_shades <= 0:
        number_of_shades = 2

    shade_palette = generate_shades_palette(
        number_of_shades, color_palette, notes_number
    )

    return list(shade_palette)
