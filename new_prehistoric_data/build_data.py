import json
import os
from collections import defaultdict

# --- 1. Load Data (assuming all files are in the same directory) ---

DATA_DIR = os.path.dirname(os.path.realpath(__file__))

SOURCE_FILES = [
    "regions.json",
    "species_by_location.json",
    "species_by_epoch.json",
    "epoch.json",
    "era.json",
    "species_by_category.json",
    "species_categories.json",
    "species_coordinates.json",
    "species_description.json",
    "species_lifetime.json",
    "species_size.json",
    "species.json"
]

# Load data into memory
data = {}
for filename in SOURCE_FILES:
    try:
        with open(os.path.join(DATA_DIR, filename), 'r') as f:
            variable_name = filename.replace('.json', '')
            if variable_name == "species":
                # special handling for species.json as it contains the list of species names
                species_data = json.load(f)
                data['species_names_list'] = [item['Species Name'] for item in species_data]
            elif variable_name == "species_coordinates_varied":
                data["species_coordinates"] = json.load(f)
            else:
                data[variable_name] = json.load(f)
    except Exception as e:
        print(f"Warning: Could not load data for {filename}. Error: {e}")
        data[variable_name] = [] # Use an empty list/dict if loading fails

with open(os.path.join(DATA_DIR, '../public/custom.min.simplified.geo.json'), 'r') as f:
    geojson_data = json.load(f)

locations = []
for feature in geojson_data['features']:
    properties = feature['properties']
    location_name = properties.get('name')
    description = properties.get('description')
    
    if location_name and description:
        # Find the centroid of the polygon for the coordinates
        polygon = feature['geometry']['coordinates'][0]
        lat = sum(p[1] for p in polygon) / len(polygon)
        lng = sum(p[0] for p in polygon) / len(polygon)
        
        locations.append({
            "Location_Name": location_name,
            "Coordinates": {
                "lat": lat,
                "lng": lng
            },
            "description": description
        })

data['locations'] = locations


# --- 2. Create Lookup Maps (Normalization) ---

# Map 1: Subcategory to Image
subcategory_image_map = {}
for primary, details in data['species_categories'].items():
    if 'subcategories' in details:
        for sub, sub_details in details['subcategories'].items():
            if 'image' in sub_details:
                subcategory_image_map[sub] = sub_details['image']

# Map 2: Species to Image
species_image_map = {}
for category in data['species_by_category']:
    subcategory = category['subcategory']
    image = subcategory_image_map.get(subcategory)
    if image:
        for species in category['species']:
            species_image_map[species] = image

# Map 3: Species Metadata (Description, Size, Coords)
species_metadata = {}
for item in data['species_description']:
    species_metadata[item['Species Name']] = {'description': item['Description']}

for item in data['species_size']:
    name = item['Species Name']
    if name in species_metadata:
        species_metadata[name]['size'] = {
            'feet': item['Size (Feet)'] ,
            'meters': item['Size (Meters)']
        }

for item in data['species_coordinates']:
    name = item['Species Name']
    if name in species_metadata:
        species_metadata[name]['coordinates'] = {
            'lat': item['Latitude'],
            'lng': item['Longitude']
        }

for item in data['species_lifetime']:
    name = item['Species Name']
    if name in species_metadata:
        species_metadata[name]['time_period'] = {
            'lived_from_ma': item['Lived From (ma)'],
            'lived_to_ma': item['Lived To (ma)']
        }

# Map 4: Species Time Periods (Era Names)
epoch_to_era_map = {epoch['name']: epoch['era'] for epoch in data['epoch']}
species_era_map = defaultdict(list)
for epoch, species_list in data['species_by_epoch'].items():
    era = epoch_to_era_map.get(epoch)
    if era:
        for species in species_list:
            if era not in species_era_map[species]:
                species_era_map[species].append(era)

# Map 5: Species Epoch Map
species_epoch_map = {}
for epoch, species_list in data['species_by_epoch'].items():
    for species in species_list:
        species_epoch_map[species] = epoch

# Map 6: Species Category Map
subcategory_to_primary_map = {}
for primary, details in data['species_categories'].items():
    for sub in details['subcategories']:
        subcategory_to_primary_map[sub] = primary

species_category_map = defaultdict(list)
for category in data['species_by_category']:
    sub = category['subcategory']
    primary = subcategory_to_primary_map.get(sub)
    if primary:
        for species in category['species']:
            species_category_map[species].append({
                'primary': primary,
                'subcategory': sub
            })

# Map 7: Dig Site Coordinates/Descriptions
location_to_region_map = {}
for region in data['regions']:
    for location in region['locations']:
        location_to_region_map[location] = region['Region_Name']

dig_site_meta_map = {}
for location in data['locations']:
    site_name = location['Location_Name']
    region = location_to_region_map.get(site_name)
    if region:
        dig_site_meta_map[site_name] = {
            'region': region,
            'description': location['description'],
            'coordinates': location['Coordinates']
        }

# Map 8: Species Location Map (Reverse Lookup)
species_location_map = defaultdict(list)
for region, sites in data['species_by_location'].items():
    for site, species_list in sites.items():
        # Handle the minor formatting inconsistency in the source JSON (e.g. "Sichuan Province" vs "Sichuan Province (Upper Shaximiao Formation)")
        site_key = site.split(' (', 1)[0] if site == "Sichuan Province" else site
        
        for species in species_list:
            # Map species name to the region/site for easy access in the Species object generation
            species_location_map[species].append({
                'region': region, 
                'dig_site': site_key
            })


# --- 3. Output Generation ---

OUTPUT_DIR = os.path.join(DATA_DIR, "data_new")
# Create output directories if they don't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(os.path.join(OUTPUT_DIR, "species"), exist_ok=True)


# --- 3.1. Generate Individual Species JSON Files ---
species_index_list = []
species_index_full_list = []

all_species_names = data['species_names_list']
for species_name in all_species_names:
    name = species_name.replace(' (=Brontosaurus)', '').replace(' & Phlegethontia', '') # Clean up names for ID/Slug
    
    species_obj = {
        "id": name,
        "description": species_metadata.get(name, {}).get('description'),
        "size": species_metadata.get(name, {}).get('size'),
        "coordinates": species_metadata.get(name, {}).get('coordinates'),
        "time_period": species_metadata.get(name, {}).get('time_period'),
        "epoch": species_epoch_map.get(name),
        "eras": species_era_map.get(name, []),
        "categories": species_category_map.get(name, []),
        "discovery_locations": species_location_map.get(name, []),
        "image": species_image_map.get(name)
    }
    
    # Add era names to the time_period object
    if species_obj['time_period'] is not None:
         species_obj['time_period']['era_names'] = species_era_map.get(name, [])

    # Write the full species object to a unique file
    output_path = os.path.join(OUTPUT_DIR, "species", f"{name.replace(' ', '_').replace('=', '_')}.json")
    with open(output_path, 'w') as f:
        json.dump(species_obj, f, indent=2)

    # Append the full object to the full index list
    species_index_full_list.append(species_obj)

    # Build the main index list
    species_index_list.append({
        "id": name,
        "name_display": species_name,
        "primary_category": species_obj['categories'][0]['primary'] if species_obj['categories'] else "Unknown",
        "description": species_obj['description'] if species_obj['description'] else "No description available.",
        "image": species_image_map.get(name)
    })

# Write the master species index file
with open(os.path.join(OUTPUT_DIR, "species_index.json"), 'w') as f:
    json.dump(species_index_list, f, indent=2)

# Write the full species index file
with open(os.path.join(OUTPUT_DIR, "species_index_full.json"), 'w') as f:
    json.dump(species_index_full_list, f, indent=2)


# --- 3.2. Generate Location Index JSON File ---
locations_index = defaultdict(lambda: {"region_name": "", "dig_sites": []})

# Consolidate all dig sites under their region
for site_name, meta in dig_site_meta_map.items():
    region = meta['region']
    if region not in locations_index:
        locations_index[region]['region_name'] = region
    
    site_obj = {
        "site_name": site_name,
        "description": meta['description'],
        "coordinates": meta.get('coordinates'),
        "species_found": data['species_by_location'].get(region, {}).get(site_name, [])
    }
    locations_index[region]['dig_sites'].append(site_obj)

# Clean up final format (convert defaultdict to list of dicts)
locations_list = list(locations_index.values())

with open(os.path.join(OUTPUT_DIR, "locations_index.json"), 'w') as f:
    json.dump(locations_list, f, indent=2)


# --- 3.3. Generate Category Index JSON File ---
categories_index = []
for primary_name, primary_details in data['species_categories'].items():
    primary_obj = {
        "primary_category": primary_name,
        "description": primary_details['description'],
        "subcategories": []
    }
    for sub_name, sub_details in primary_details['subcategories'].items():
        species_in_subcategory = []
        for item in data['species_by_category']:
            if item['subcategory'] == sub_name:
                species_in_subcategory = item['species']
                break
        
        primary_obj['subcategories'].append({
            "subcategory_name": sub_name,
            "description": sub_details['description'],
            "species_in_category": species_in_subcategory
        })
    categories_index.append(primary_obj)

with open(os.path.join(OUTPUT_DIR, "categories_index.json"), 'w') as f:
    json.dump(categories_index, f, indent=2)

print('\n--- Data Pre-processing Complete ---')
print(f'Generated data files in the \'{OUTPUT_DIR}\' directory.')
print('1. Individual species files in: data/species/*.json')
print('2. Global Index files: data/species_index.json, data/locations_index.json, data/categories_index.json')
print('3. Full species index file: data/species_index_full.json')
