
import json
import os
import shutil

def generate_species_images():
    """
    This script generates copies of species subcategory images for each species.
    It reads the species_by_category.json file to understand the relationship
    between subcategories and species. It then finds the corresponding subcategory
    image in public/images/Dinosaurs/icons/ and creates copies of it, one for
    each species in that subcategory. The copies are named after the species.
    """

    # Load the species data from the JSON file
    with open('data/species_by_category.json', 'r') as f:
        species_data = json.load(f)

    # Define the source and destination directories
    icons_dir = 'public/images/Dinosaurs/icons/'
    output_dir = 'public/images/Dinosaurs/icons/'

    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Iterate over each primary category in the data
    for primary_category in species_data:
        # Iterate over each subcategory within the primary category
        for subcategory in primary_category['subcategories']:
            subcategory_name = subcategory['subcategory']
            
            # Create the image file name from the subcategory name
            # Replace spaces with underscores and convert to lowercase
            # This is an assumed naming convention.
            image_name = subcategory_name.replace(' ', '_').lower() + '.webp'
            
            # Handle some special cases for image names
            image_name = image_name.replace('&', 'and')
            image_name = image_name.replace('-', '_')
            image_name = image_name.replace(':', '')


            # Construct the full path to the source image
            source_image_path = os.path.join(icons_dir, image_name)

            # Check if the source image exists
            if os.path.exists(source_image_path):
                # Iterate over each species in the subcategory
                for species_name in subcategory['species']:
                    # Construct the full path for the new image
                    output_image_path = os.path.join(output_dir, species_name + '.webp')
                    
                    # Copy the source image to the new destination
                    shutil.copy2(source_image_path, output_image_path)
                    print(f"Created image for {species_name} at {output_image_path}")
            else:
                print(f"Source image not found for subcategory: {subcategory_name} (expected: {image_name})")

if __name__ == '__main__':
    generate_species_images()
