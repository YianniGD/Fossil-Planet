import json

# File paths
cleaned_file_path = r'c:\Users\ygali\Documents\GitHub\encyclopedia_web_app\new_prehistoric_data\data\species_index_full_cleaned.json'
merged_file_path = r'c:\Users\ygali\Documents\GitHub\encyclopedia_web_app\new_prehistoric_data\data\species_index_full_merged.json'

# Load the cleaned data and create a mapping from id to categories
with open(cleaned_file_path, 'r', encoding='utf-8') as f:
    cleaned_data = json.load(f)

categories_map = {item['id']: item['categories'] for item in cleaned_data}

# Load the merged data
with open(merged_file_path, 'r', encoding='utf-8') as f:
    merged_data = json.load(f)

# Update the categories in the merged data
for item in merged_data:
    if item['id'] in categories_map:
        item['categories'] = categories_map[item['id']]

# Write the updated data back to the merged file
with open(merged_file_path, 'w', encoding='utf-8') as f:
    json.dump(merged_data, f, indent=2)

print("Categories updated successfully!")
