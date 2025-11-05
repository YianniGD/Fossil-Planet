
import json
import os

def rename_species_images():
    """
    This script renames species icon files based on the subcategory and species data.
    It reads species_by_category.json to map subcategories to species.
    It then renames files like 'agile_hunters_1.webp' to 'Deinonychus.webp'
    assuming 'Deinonychus' is the first species in the 'Agile Hunters' subcategory.
    """

    # Load the species data from the JSON file
    with open('data/species_by_category.json', 'r') as f:
        species_data = json.load(f)

    # Define the directory containing the icon files
    icons_dir = 'public/images/Dinosaurs/icons/'

    # Iterate over each primary category in the data
    for primary_category in species_data:
        # Iterate over each subcategory within the primary category
        for subcategory in primary_category['subcategories']:
            subcategory_name = subcategory['subcategory']
            species_list = subcategory['species']
            
            # Create the base file name from the subcategory name
            base_image_name = subcategory_name.replace(' ', '_').lower()
            base_image_name = base_image_name.replace('&', 'and')
            base_image_name = base_image_name.replace('-', '_')
            base_image_name = base_image_name.replace(':', '')

            # Find files that match the pattern {base_image_name}_*.webp
            for i, species_name in enumerate(species_list):
                old_file_name = f"{base_image_name}_{i+1}.webp"
                old_file_path = os.path.join(icons_dir, old_file_name)

                if os.path.exists(old_file_path):
                    new_file_name = f"{species_name}.webp"
                    new_file_path = os.path.join(icons_dir, new_file_name)
                    
                    # Rename the file
                    os.rename(old_file_path, new_file_path)
                    print(f"Renamed {old_file_name} to {new_file_name}")
                else:
                    print(f"File not found: {old_file_name}")

if __name__ == '__main__':
    rename_species_images()
