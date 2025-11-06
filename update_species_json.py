import json
import sys

def update_species_names_to_titlecase(json_filepath):
    """
    Reads a JSON file, converts 'name' and 'id' properties to title case,
    and writes the modified content back to the file.
    """
    try:
        with open(json_filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found at '{json_filepath}'")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{json_filepath}'")
        sys.exit(1)

    modified = False
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                if 'name' in item and isinstance(item['name'], str):
                    original_name = item['name']
                    titlecase_name = original_name.title()
                    if original_name != titlecase_name:
                        item['name'] = titlecase_name
                        modified = True
                if 'id' in item and isinstance(item['id'], str):
                    original_id = item['id']
                    titlecase_id = original_id.title()
                    if original_id != titlecase_id:
                        item['id'] = titlecase_id
                        modified = True
    elif isinstance(data, dict):
        # Handle cases where the root is a dictionary, e.g., if 'species_index_full' is an object with keys
        # This part might need adjustment based on the actual structure of species_index_full.json
        # For now, assuming it's a list of objects as is common for 'index' files.
        print("Warning: JSON root is a dictionary. Script is primarily designed for a list of objects.")
        for key, item in data.items():
            if isinstance(item, dict):
                if 'name' in item and isinstance(item['name'], str):
                    original_name = item['name']
                    titlecase_name = original_name.title()
                    if original_name != titlecase_name:
                        item['name'] = titlecase_name
                        modified = True
                if 'id' in item and isinstance(item['id'], str):
                    original_id = item['id']
                    titlecase_id = original_id.title()
                    if original_id != titlecase_id:
                        item['id'] = titlecase_id
                        modified = True

    if modified:
        try:
            with open(json_filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            print(f"Successfully updated '{json_filepath}' with title-cased names and IDs.")
        except IOError as e:
            print(f"Error writing to file '{json_filepath}': {e}")
    else:
        print(f"No changes needed for '{json_filepath}'. Names and IDs are already in title case or not found.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python update_species_json.py <json_filepath>")
        sys.exit(1)

    target_json_file = sys.argv[1]
    update_species_names_to_titlecase(target_json_file)
