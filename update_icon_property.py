
import json

def update_icon_property():
    """
    This script updates the 'icon' property for each species in the
    species_index_full.json file. The new icon name will be in the format
    '<speciesname>icon.webp'.
    """

    # Define the path to the JSON file
    json_file_path = 'json/species_index_full.json'

    # Load the species data from the JSON file
    with open(json_file_path, 'r') as f:
        species_data = json.load(f)

    # Iterate over each species in the data and update the icon property
    for species in species_data:
        species_name = species.get('name', '')
        if species_name:
            species['icon'] = f"{species_name}icon.webp"

    # Write the updated data back to the JSON file
    with open(json_file_path, 'w') as f:
        json.dump(species_data, f, indent=4)

    print("Successfully updated the icon property in species_index_full.json")

if __name__ == '__main__':
    update_icon_property()
