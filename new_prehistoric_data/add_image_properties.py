import json

def add_image_properties():
    """
    Reads species data from a JSON file, adds image and xray_image properties
    based on the species ID, and writes the updated data to a new JSON file.
    """
    input_file = 'new_prehistoric_data/data/species_index_full.json'
    output_file = 'new_prehistoric_data/data/species_index_full_updated.json'

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            species_data = json.load(f)

        for species in species_data:
            species_id = species.get("id")
            if species_id:
                species["image"] = f"{species_id}.png"
                species["xray_image"] = f"{species_id}_skeleton.png"

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(species_data, f, indent=4)

        print(f"Successfully updated species data and saved to {output_file}")

    except FileNotFoundError:
        print(f"Error: The file {input_file} was not found.")
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from the file {input_file}.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    add_image_properties()