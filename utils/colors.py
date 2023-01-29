import math
import numpy as np
from colormap import rgb2hex
from colormap import hex2rgb

color_palette = {
    "clementine": {
        "50": "#fff8ec",
        "100": "#fff0d3",
        "200": "#ffdca5",
        "300": "#ffc36d",
        "400": "#ff9d32",
        "500": "#ff800a",
        "600": "#ea5e00",
        "700": "#cc4902",
        "800": "#a1390b",
        "900": "#82310c",
    },
    "cerulean": {
        "50": "#eff9ff",
        "100": "#def2ff",
        "200": "#b6e8ff",
        "300": "#75d8ff",
        "400": "#2cc4ff",
        "500": "#009fe3",
        "600": "#008ad4",
        "700": "#006eab",
        "800": "#005d8d",
        "900": "#064d74",
    },
    "amaranth": {
        "50": "#fef2f3",
        "100": "#fde6e8",
        "200": "#fad1d6",
        "300": "#f6abb4",
        "400": "#f17b8c",
        "500": "#e43957",
        "600": "#d32b51",
        "700": "#b11f43",
        "800": "#951c3f",
        "900": "#7f1c3a",
    },
    "mulberry": {
        "50": "#fbf4f9",
        "100": "#f9eaf5",
        "200": "#f4d6eb",
        "300": "#ecb5da",
        "400": "#df87bf",
        "500": "#d163a6",
        "600": "#b74083",
        "700": "#a3336f",
        "800": "#872d5c",
        "900": "#72294f",
    },
    "affair": {
        "50": "#faf7fc",
        "100": "#f3eff8",
        "200": "#e8def0",
        "300": "#d5c3e4",
        "400": "#bd9fd3",
        "500": "#a078bd",
        "600": "#845a9f",
        "700": "#774f90",
        "800": "#5a3c6c",
        "900": "#4d355a",
    },
    "east_bay": {
        "50": "#f5f6fa",
        "100": "#eaecf4",
        "200": "#d0d6e7",
        "300": "#a7b4d2",
        "400": "#788cb8",
        "500": "#576ea0",
        "600": "#3f517d",
        "700": "#37466d",
        "800": "#313c5b",
        "900": "#2d354d",
    },
    "pickled_bluewood": {
        "50": "#f1f8fa",
        "100": "#dcecf1",
        "200": "#bedae3",
        "300": "#90bed0",
        "400": "#5b9bb5",
        "500": "#407f9a",
        "600": "#386982",
        "700": "#33576b",
        "800": "#2f4858",
        "900": "#2c3f4d",
    },
    "cerulean_2": {
        "50": "#ebfdff",
        "100": "#cef9ff",
        "200": "#a2f1ff",
        "300": "#63e4fd",
        "400": "#1ccdf4",
        "500": "#00bbe7",
        "600": "#038cb7",
        "700": "#0a7094",
        "800": "#125a78",
        "900": "#144b65",
    },
    "robins_egg_blue": {
        "50": "#eefffd",
        "100": "#c6fffa",
        "200": "#8efff7",
        "300": "#4dfbf3",
        "400": "#19e8e5",
        "500": "#00d3d3",
        "600": "#00a0a4",
        "700": "#027f83",
        "800": "#086367",
        "900": "#0c5255",
    },
    "turquoise": {
        "50": "#eafff6",
        "100": "#cdfee8",
        "200": "#9ffbd6",
        "300": "#61f4c2",
        "400": "#36e6af",
        "500": "#00cb92",
        "600": "#00a578",
        "700": "#008463",
        "800": "#00684f",
        "900": "#005643",
    },
    "sulu": {
        "50": "#eefde8",
        "100": "#d9facd",
        "200": "#a2f388",
        "300": "#87ed69",
        "400": "#5edf3c",
        "500": "#3ec51d",
        "600": "#2c9d13",
        "700": "#237813",
        "800": "#215f15",
        "900": "#1e5116",
    },
    "festival": {
        "50": "#fdfde9",
        "100": "#fbfcc5",
        "200": "#f9f871",
        "300": "#f7ef4d",
        "400": "#f3e01c",
        "500": "#e3c70f",
        "600": "#c49d0a",
        "700": "#9c710c",
        "800": "#815a12",
        "900": "#6e4915",
    },
}


def number_of_keys(dict):
    count = 0
    for _, _ in dict.items():
        count += 1
    return count


def get_base_palette():
    # https://mycolor.space/
    # https://www.tints.dev/api/colors/EA5E00
    base_orange_colors = (
        (234, 94, 0),
        (228, 57, 87),
        (183, 64, 131),
        (119, 79, 144),
        (63, 81, 125),
        (47, 72, 88),
    )
    base_blue_colors = (
        (0, 159, 227),
        (0, 187, 231),
        (0, 211, 211),
        (54, 230, 175),
        (162, 243, 136),
        (249, 248, 113),
    )
    palette = []
    for x, y in zip(base_orange_colors, base_blue_colors):
        palette += [x, y]

    return {}

    return list(palette)


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
                    print(f"shades: {number_of_shades}; j: {j}; color: {generate_shade(rgb_values, 10 - 2 * j)}")
                else:
                    shades_palette.append(generate_tint(rgb_values, 2 * (j - 5)))
                    print(f"shades: {number_of_shades}; j: {j}; color: {generate_tint(rgb_values, 2 * j)}")
            else:
                shades_palette.append(generate_tint(rgb_values, 2 * j))
                print(f"shades: {number_of_shades}; j: {j}; color: {generate_tint(rgb_values, 2 * j)}")
    return shades_palette

def determine_shades_number(notes_number, available_colors, max_shades_number):
    return math.ceil(((notes_number - available_colors) / max_shades_number) + 1)

def create_notes_color_palette(notes_number):

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
    number_of_shades = determine_shades_number(notes_number, len(color_palette), max_number_of_shades)

    # If there's too many notes, duplicate the color palette
    while number_of_shades * len(color_palette) > number_of_shades * max_number_of_shades:
        color_palette *= 2
        number_of_shades = determine_shades_number(notes_number, len(color_palette), max_number_of_shades)

    # If there are more colors than notes
    if number_of_shades <= 0:
        number_of_shades = 2

    shade_palette = generate_shades_palette(
        number_of_shades, color_palette, notes_number
    )

    return list(shade_palette)
