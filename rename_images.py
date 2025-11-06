import json
import os

PROJECT_ROOT = "c:\\Users\\ygali\\Documents\\GitHub\\Fossil-Planet\\"
JSON_FILE = os.path.join(PROJECT_ROOT, "json", "species_index_full.json")
MAIN_IMAGE_DIR = os.path.join(PROJECT_ROOT, "public", "animals", "main")
SKELETON_IMAGE_DIR = os.path.join(PROJECT_ROOT, "public", "animals", "skeleton")

def to_title_case(s):
    return s.replace('-', ' ').replace('_', ' ').title().replace(' ', '')

def rename_images_and_update_json():
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        species_data = json.load(f)

    changes_made = False
    for entry in species_data:
        species_id = entry['id']
        
        # Process main image
        if 'image_url' in entry and 'image' in entry['image_url']:
            current_main_image_path_relative = entry['image_url']['image']
            current_main_image_filename = os.path.basename(current_main_image_path_relative)
            
            expected_main_image_filename = to_title_case(species_id) + '.webp'
            expected_main_image_path_relative = os.path.join("animals", "main", expected_main_image_filename).replace('\\', '/')

            if current_main_image_filename != expected_main_image_filename:
                old_path = os.path.join(MAIN_IMAGE_DIR, current_main_image_filename)
                new_path = os.path.join(MAIN_IMAGE_DIR, expected_main_image_filename)
                
                if os.path.exists(old_path):
                    os.rename(old_path, new_path)
                    print(f"Renamed {old_path} to {new_path}")
                    entry['image_url']['image'] = expected_main_image_path_relative
                    changes_made = True
                else:
                    print(f"Warning: Main image file not found for {species_id} at {old_path}")
            elif current_main_image_path_relative != expected_main_image_path_relative:
                # Update JSON path even if filename is correct, but path structure is different
                entry['image_url']['image'] = expected_main_image_path_relative
                changes_made = True

        # Process xray image
        if 'image_url' in entry and 'xray_image' in entry['image_url']:
            current_xray_image_path_relative = entry['image_url']['xray_image']
            current_xray_image_filename = os.path.basename(current_xray_image_path_relative)
            
            expected_xray_image_filename = to_title_case(species_id) + '_skeleton.webp'
            expected_xray_image_path_relative = os.path.join("animals", "skeleton", expected_xray_image_filename).replace('\\', '/')

            if current_xray_image_filename != expected_xray_image_filename:
                old_path = os.path.join(SKELETON_IMAGE_DIR, current_xray_image_filename)
                new_path = os.path.join(SKELETON_IMAGE_DIR, expected_xray_image_filename)
                
                if os.path.exists(old_path):
                    os.rename(old_path, new_path)
                    print(f"Renamed {old_path} to {new_path}")
                    entry['image_url']['xray_image'] = expected_xray_image_path_relative
                    changes_made = True
                else:
                    print(f"Warning: X-ray image file not found for {species_id} at {old_path}")
            elif current_xray_image_path_relative != expected_xray_image_path_relative:
                # Update JSON path even if filename is correct, but path structure is different
                entry['image_url']['xray_image'] = expected_xray_image_path_relative
                changes_made = True

        # Process icon image
        if 'icon' in entry:
            current_icon_path_relative = entry['icon']
            current_icon_filename = os.path.basename(current_icon_path_relative)
            
            expected_icon_filename = to_title_case(species_id) + 'icon.webp'
            expected_icon_path_relative = os.path.join("animals", "icons", expected_icon_filename).replace('\\', '/')

            if current_icon_filename != expected_icon_filename:
                old_path = os.path.join(PROJECT_ROOT, "public", "animals", "icons", current_icon_filename)
                new_path = os.path.join(PROJECT_ROOT, "public", "animals", "icons", expected_icon_filename)
                
                if os.path.exists(old_path):
                    os.rename(old_path, new_path)
                    print(f"Renamed {old_path} to {new_path}")
                    entry['icon'] = expected_icon_path_relative
                    changes_made = True
                else:
                    print(f"Warning: Icon file not found for {species_id} at {old_path}")
            elif current_icon_path_relative != expected_icon_path_relative:
                # Update JSON path even if filename is correct, but path structure is different
                entry['icon'] = expected_icon_path_relative
                changes_made = True


    if changes_made:
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(species_data, f, indent=4, ensure_ascii=False)
        print(f"Updated {JSON_FILE}")
    else:
        print("No changes needed in JSON or file system.")

if __name__ == "__main__":
    rename_images_and_update_json()
