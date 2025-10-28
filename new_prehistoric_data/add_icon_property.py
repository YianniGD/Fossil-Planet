import json
import os

def add_icon_property_to_public_file():
    """
    Adds an 'icon' property to each species in the public species_index_full.json file.
    The default icon is 'slice2.png', with a specific override for Tyrannosaurus.
    """
    # Construct the path to the project root and then to the public JSON file
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_file_path = os.path.join(project_root, 'public', 'species_index_full.json')

    # Read the existing species data
    try:
        with open(json_file_path, 'r') as f:
            species_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: The file at {json_file_path} was not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from the file at {json_file_path}.")
        return

    # Define the default and specific icons
    default_icon = "slice2.png"
    tyrannosaurus_icon = "Tyrannosaurusicon.png"

    # Iterate through each species and add/update the icon property
    for species in species_data:
        if species.get('id') == 'Tyrannosaurus':
            species['icon'] = tyrannosaurus_icon
        else:
            species['icon'] = default_icon

    # Write the updated data back to the file
    with open(json_file_path, 'w') as f:
        json.dump(species_data, f, indent=4)

    print(f"Successfully updated 'icon' properties in {json_file_path}")

if __name__ == '__main__':
    add_icon_property_to_public_file()