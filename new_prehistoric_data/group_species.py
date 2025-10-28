
import json
import os
from collections import defaultdict

def process_species_data():
    input_file = '/Users/yiannigaliatsatos/Documents/GitHub/Fossil-Planet/new_prehistoric_data/data/species_index_full.json'
    output_dir = '/Users/yiannigaliatsatos/Documents/GitHub/Fossil-Planet/new_prehistoric_data/data'

    try:
        with open(input_file, 'r') as f:
            species_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Input file not found at {input_file}")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {input_file}")
        return

    def save_json(data, filename):
        with open(os.path.join(output_dir, filename), 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully created {filename}")

    # --- Grouping logic ---
    def create_grouped_file(data, group_key, list_key, filename):
        temp_group = defaultdict(list)
        for species in data:
            if species.get(group_key):
                # Handle both string and list type for the group key
                if isinstance(species[group_key], list):
                    for item in species[group_key]:
                        temp_group[item].append(species['id'])
                else:
                    temp_group[species[group_key]].append(species['id'])
        
        final_list = [{list_key: key, 'species': value} for key, value in temp_group.items()]
        save_json(final_list, filename)

    def create_nested_grouped_file(data, primary_key, sub_key, filename):
        temp_group = defaultdict(list)
        for species in data:
            if species.get(primary_key):
                for item in species[primary_key]:
                    if item.get(sub_key):
                        temp_group[item[sub_key]].append(species['id'])
        
        final_list = [{sub_key: key, 'species': value} for key, value in temp_group.items()]
        save_json(final_list, filename)

    create_grouped_file(species_data, 'epoch', 'epoch', 'species_by_epoch.json')
    create_grouped_file(species_data, 'eras', 'era', 'species_by_era.json')
    create_nested_grouped_file(species_data, 'categories', 'primary', 'species_by_primary_category.json')
    create_nested_grouped_file(species_data, 'categories', 'subcategory', 'species_by_subcategory.json')
    create_nested_grouped_file(species_data, 'discovery_locations', 'region', 'species_by_region.json')
    create_nested_grouped_file(species_data, 'discovery_locations', 'dig_site', 'species_by_digsite.json')

    # --- Individual property files (from previous step) ---
    species_ids = {s['id']: s['id'] for s in species_data if s.get('id')}
    species_descriptions = {s['id']: s.get('description') for s in species_data if s.get('id')}
    species_sizes = {s['id']: s.get('size') for s in species_data if s.get('id')}
    species_coordinates = {s['id']: s.get('coordinates') for s in species_data if s.get('id')}
    species_time_periods = {s['id']: s.get('time_period') for s in species_data if s.get('id')}
    species_images = {s['id']: {'image': s.get('image'), 'xray_image': s.get('xray_image')} for s in species_data if s.get('id')}
    species_naming = {s['id']: {'phonetic_spelling': s.get('phonetic_spelling'), 'literal_translation': s.get('literal_translation'), 'etymology': s.get('etymology')} for s in species_data if s.get('id')}

    save_json(species_ids, 'species_ids.json')
    save_json(species_descriptions, 'species_descriptions.json')
    save_json(species_sizes, 'species_sizes.json')
    save_json(species_coordinates, 'species_coordinates.json')
    save_json(species_time_periods, 'species_time_periods.json')
    save_json(species_images, 'species_images.json')
    save_json(species_naming, 'species_naming.json')

if __name__ == '__main__':
    process_species_data()
