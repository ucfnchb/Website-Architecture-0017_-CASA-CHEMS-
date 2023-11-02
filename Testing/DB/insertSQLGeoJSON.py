#data import script for Ward Canopy cover GeoJSON file 
#creating two sql files to populate the tables
#1 file will allow us to effeciently query the extracted attributes
#2nd file to extract the OBJECTID and store with the full record to be used when the actual GeoJSON is used
#If the above approach isn't used either the table just holds blobs of unqueriable data 
#   OR the table being queried has records that are small except for the large geometry field which could create performance issues
#The con of a small amount of extra storage disk space is worth the trade off to keep data fast to access, clean, accessible 
#   and easy to build the GeoJSON output
#Test ing with C:\Users\User\Downloads\UK_Ward_Canopy_Cover.geojson

import re

# File paths
input_file_path = r'C:\Users\User\Downloads\geoRows.txt' #UK_Ward_Canopy_Cover.geojson'  
output_file_path = r'C:\Users\User\Downloads\output.txt'  


# Field names for which you want to extract values
fields_to_extract = ["OBJECTID", "country", "wardcode", "wardname", "designated", "status", "survyear", "percancov", "standerr", "numpts", "warea"]

try:
    with open(input_file_path, 'r') as input_file, open(output_file_path, 'w') as output_file:
        lineCount = 0
        output_file.write("INSERT INTO GeoJSON(lsoa_cd, OBJECTID, country, wardcode, wardname, designated, status, survyear, percancov, standerr, numpts, warea) values " + "\n")
        for line in input_file:
            if lineCount < 5:
                lineCount = lineCount + 1
                continue
            if lineCount >10:
                #for testing
                print(f'Successfully created the output file: {output_file_path}')
                exit
            values = []
            for field in fields_to_extract:
                search_text = f'"{field}": '
                if search_text in line:
                    #get the start point
                    start_index = line.index(search_text) + len(search_text)
                    #get the end point using comma and space+curly brace
                    end_index = min(line.find(',', start_index), line.find(' }', start_index))
                    value = line[start_index:end_index].strip()
                    # replace the double quotes with single ready for insert
                    values.append(value.replace('"', "'"))
            # Join the extracted values with commas and add the prefix
            new_line = "values (" + ", ".join(values) + "),"
            # Write the modified line to the output file
            output_file.write(new_line + "\n")

    print(f'Successfully created the output file: {output_file_path}')
except FileNotFoundError:
    print(f'The input file "{input_file_path}" was not found.')
except Exception as e:
    print(f'An error occurred: {str(e)}')
