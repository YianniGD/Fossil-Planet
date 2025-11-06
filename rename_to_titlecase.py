
import os
import sys

def rename_files_to_titlecase(directory):
    """
    Renames all files in the given directory and its subdirectories to title case.
    """
    for root, _, files in os.walk(directory):
        for filename in files:
            old_filepath = os.path.join(root, filename)
            name, ext = os.path.splitext(filename)
            new_name = name.title() + ext
            new_filepath = os.path.join(root, new_name)

            if old_filepath != new_filepath:
                try:
                    os.rename(old_filepath, new_filepath)
                    print(f"Renamed '{old_filepath}' to '{new_filepath}'")
                except OSError as e:
                    print(f"Error renaming {old_filepath}: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python rename_to_titlecase.py <directory_path>")
        sys.exit(1)

    target_directory = sys.argv[1]
    if not os.path.isdir(target_directory):
        print(f"Error: Directory '{target_directory}' not found.")
        sys.exit(1)

    rename_files_to_titlecase(target_directory)
