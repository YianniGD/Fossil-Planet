import json

def format_descriptions():
    """
    Loads species data, reformats the description for each species,
    and writes the updated data back to the file.

    Formatting rules:
    1. The description begins with a lowercase letter.
    2. The description does not have a period at the end.
    """
    # The script is in new_prehistoric_data, so the path to the data file is relative from there.
    file_path = 'data/species_index_full.json'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            species_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: The file at {file_path} was not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from the file at {file_path}.")
        return

    for species in species_data:
        if 'description' in species and isinstance(species['description'], str) and species['description']:
            description = species['description']
            
            # 1. Ensure the description starts with a lowercase letter.
            description = description[0].lower() + description[1:]
            
            # 2. Remove a period at the end, if it exists.
            if description.endswith('.'):
                description = description[:-1]
                
            species['description'] = description

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(species_data, f, indent=4)
        print("Successfully reformatted descriptions in species_index_full.json")
    except IOError:
        print(f"Error: Could not write the updated data back to {file_path}.")

if __name__ == '__main__':
    format_descriptions()
