import json
import os
from collections import defaultdict

def build_species_index():
    """
    Combines species data from multiple JSON files into a single
    comprehensive species index file.
    """
    project_root = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
    
    data_dir = os.path.join(project_root, 'data')
    output_dir = os.path.join(project_root, 'public')
    
    os.makedirs(output_dir, exist_ok=True)

    # --- 1. Load all data files ---
    data_files = {
        'species_by_category': 'species_by_category.json',
        'species_by_digsite': 'species_by_digsite.json',
        'species_by_epoch': 'species_by_epoch.json',
        'species_by_era': 'species_by_era.json',
        'species_by_region': 'species_by_region.json',
        'species_coordinates': 'species_coordinates.json',
        'species_descriptions': 'species_descriptions.json',
        'species_ids': 'species_ids.json',
        'species_images': 'species_images.json',
        'species_naming': 'species_naming.json',
        'species_sizes': 'species_sizes.json',
        'species_time_periods': 'species_time_periods.json'
    }

    loaded_data = {}
    for key, filename in data_files.items():
        filepath = os.path.join(data_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                loaded_data[key] = json.load(f)
        except FileNotFoundError:
            print(f"Warning: {filename} not found at {filepath}. Skipping.")
            loaded_data[key] = {}
        except json.JSONDecodeError:
            print(f"Warning: Could not decode JSON from {filename}. Skipping.")
            loaded_data[key] = {}

    # --- 2. Create lookup maps ---

    # Direct lookups (already in species_name -> data format)
    descriptions_lookup = loaded_data.get('species_descriptions', {})
    images_lookup = loaded_data.get('species_images', {})
    naming_lookup = loaded_data.get('species_naming', {})
    sizes_lookup = loaded_data.get('species_sizes', {})
    time_periods_lookup = loaded_data.get('species_time_periods', {})
    coordinates_lookup = loaded_data.get('species_coordinates', {})

    # Reverse lookups (need to be built)
    def create_reverse_lookup_from_list(data, key_name, species_list_name):
        lookup = defaultdict(list)
        if isinstance(data, list):
            for item in data:
                key = item.get(key_name)
                if key:
                    for species in item.get(species_list_name, []):
                        lookup[species].append(key)
        return lookup

    def create_reverse_lookup_from_dict(data):
        lookup = defaultdict(list)
        if isinstance(data, dict):
            for key, species_list in data.items():
                for species in species_list:
                    lookup[species].append(key)
        return lookup

    category_lookup = defaultdict(list)
    for primary_cat in loaded_data.get('species_by_category', []):
        for sub_cat in primary_cat.get('subcategories', []):
            for species in sub_cat.get('species', []):
                category_lookup[species].append(sub_cat.get('subcategory'))

    epoch_lookup = create_reverse_lookup_from_list(loaded_data.get('species_by_epoch', []), 'epoch', 'species')
    era_lookup = create_reverse_lookup_from_list(loaded_data.get('species_by_era', []), 'era', 'species')
    region_lookup = create_reverse_lookup_from_list(loaded_data.get('species_by_region', []), 'region', 'species')
    digsite_lookup = create_reverse_lookup_from_list(loaded_data.get('species_by_digsite', []), 'dig_site', 'species')


    # --- 3. Build the full species index ---
    species_index_full = []
    species_ids = loaded_data.get('species_ids', {})

    if not isinstance(species_ids, dict):
        print("Error: 'species_ids.json' is not a dictionary or is missing. Cannot build species index.")
        return

    for species_name in species_ids.keys():
        if not species_name:
            continue

        species_obj = {
            'id': species_name,
            'name': species_name,
            'description': descriptions_lookup.get(species_name),
            'image_url': images_lookup.get(species_name),
            'naming': naming_lookup.get(species_name),
            'size': sizes_lookup.get(species_name),
            'time_period': time_periods_lookup.get(species_name),
            'coordinates': coordinates_lookup.get(species_name),
            'category': category_lookup[species_name],
            'digsites': digsite_lookup[species_name],
            'epoch': epoch_lookup[species_name],
            'era': era_lookup[species_name],
            'region': region_lookup[species_name],
        }
        species_index_full.append(species_obj)

    # --- 4. Write the output file ---
    output_filename = 'species_index_full.json'
    output_path = os.path.join(output_dir, output_filename)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(species_index_full, f, indent=2)

    print(f"Successfully created '{output_path}' with {len(species_index_full)} species entries.")

if __name__ == '__main__':
    build_species_index()