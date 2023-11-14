#Simple script used as a line count to gauge the size of the files being used

#C:\Users\User\Downloads\UK_Ward_Canopy_Cover.geojson

import sys

def cleanFile(filePath):
    # Open the file for reading
    #filePath = 'C:\\Users\\User\Downloads\\UK_Ward_Canopy_Cover.geojson'
    try:
        with open(filePath, 'r') as file:
            lineCount = 0
            for line in file:
                lineCount += 1

        print(f'The number of lines in the file is: {lineCount}')
    except FileNotFoundError:
        print(f'The file "{filePath}" was not found.')
    except Exception as e:
        print(f'An error occurred: {str(e)}')

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <filePath>")
    else:
        filePath = sys.argv[1]
        cleanFile(filePath)