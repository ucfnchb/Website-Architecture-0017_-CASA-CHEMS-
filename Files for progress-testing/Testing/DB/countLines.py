#C:\Users\User\Downloads\UK_Ward_Canopy_Cover.geojson

# Open the file for reading
file_path = 'C:\\Users\\User\Downloads\\UK_Ward_Canopy_Cover.geojson'
try:
    with open(file_path, 'r') as file:
        line_count = 0
        for line in file:
            line_count += 1

    print(f'The number of lines in the file is: {line_count}')
except FileNotFoundError:
    print(f'The file "{file_path}" was not found.')
except Exception as e:
    print(f'An error occurred: {str(e)}')