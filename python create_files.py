import json
import os
from pathlib import Path

# --- Configuration ---
JSON_FILE = 'species_by_category.json'
BASE_FOLDER = 'species_images'  # The main folder to put everything in
FILE_EXTENSION = '.png'         # The desired file extension for your images
# ---------------------

def sanitize_name(name):
    """Replaces spaces with underscores for safe folder/file names."""
    return name.replace(' ', '_').replace('/', '_')

# 1. Create the main base folder
os.makedirs(BASE_FOLDER, exist_ok=True)

# 2. Load the JSON data
with open(JSON_FILE, 'r') as f:
    data = json.load(f)

print(f"Starting to build structure in '{BASE_FOLDER}'...")
total_species = 0

# 3. Loop through the data and create folders/files
for primary_cat in data:
    primary_name = sanitize_name(primary_cat['primary'])
    primary_path = os.path.join(BASE_FOLDER, primary_name)
    os.makedirs(primary_path, exist_ok=True)
    
    for sub_cat in primary_cat['subcategories']:
        sub_name = sanitize_name(sub_cat['subcategory'])
        sub_path = os.path.join(primary_path, sub_name)
        
        # This is the folder for your existing subcategory image
        os.makedirs(sub_path, exist_ok=True) 
        
        for species_name_raw in sub_cat['species']:
            species_name = sanitize_name(species_name_raw)
            file_name = f"{species_name}{FILE_EXTENSION}"
            file_path = os.path.join(sub_path, file_name)
            
            # This creates the empty placeholder file for the species
            Path(file_path).touch()
            total_species += 1

print(f"Done! Created structure for {len(data)} primary categories.")
print(f"Created {total_species} empty species files.")