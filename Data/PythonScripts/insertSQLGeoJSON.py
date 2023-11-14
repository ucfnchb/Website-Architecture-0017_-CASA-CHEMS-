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
inputFilePath = r'C:\Users\User\Downloads\geoRows.txt' #UK_Ward_Canopy_Cover.geojson'  
outputFilePath = r'C:\Users\User\Downloads\WardAreas.txt'  
outputFilePath2 = r'C:\Users\User\Downloads\WardGeoJSON.txt' 

# Field names for which you want to extract values
fieldNames = ["OBJECTID", "country", "wardcode", "wardname", "designated", "status", "survyear", "percancov", "standerr", "numpts", "warea"]

try:
    with open(inputFilePath, 'r') as inputFile, open(outputFilePath, 'w') as outFile1, open(outputFilePath2, 'w') as outFile2:
        lineCount = 0
        outFile1.write("INSERT INTO WardAreas(OBJECTID, country, wardcode, wardname, designated, status, survyear, percancov, standerr, numpts, warea) values " + "\n")
        outFile2.write("INSERT INTO WardGeoJSON(OBJECTID, GeoJSON) values " + "\n")
        startFrom = 5
        
        for line in inputFile:
            if lineCount < startFrom:
                lineCount = lineCount + 1
                continue
            if lineCount >10:
                #for testing
                print(f'Successfully created the output file: {outFile1}')
                exit
            values = []
            values2 = []
            for field in fieldNames:
                searchText = f'"{field}": '
                if searchText in line:
                    #get the start point
                    startIndex = line.index(searchText) + len(searchText)
                    #get the end point using comma and space+curly brace
                    endIndex = min(line.find(',', startIndex), line.find(' }', startIndex))
                    value = line[startIndex:endIndex].strip()
                    # replace the double quotes with single ready for insert
                    values.append(value.replace('"', "'"))
                    if (field == "OBJECTID"):
                        values2.append(value.replace('"', "'"))
                        values2.append("'" + line + "'")
            # Join the extracted values with commas and add the prefix
            newLine1 = "values (" + ", ".join(values) + "),"
            newLine2 = "values (" + ", ".join(values2) + "),"
            # Write the modified line to the output file
            outFile1.write(newLine1 + "\n")
            outFile2.write(newLine2 + "\n")
            

    print(f'Successfully created the output file: {outFile1} and {outFile2}')
except Exception as e:
    print(f'An error occurred: {str(e)} + "\n"' + f'{str(e.with_traceback)}')
