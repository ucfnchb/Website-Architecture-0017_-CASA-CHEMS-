# strips non-valid chars from a file
# usage:
#    python dataClenser.py fileClense.txt

import sys
import os

def removeCharsInQuotes(line):
    #strip out special chars within quotes otherwise they will break the upload format
    insideQuotes = False
    result = []
    
    try:
        for char in line:
            if char == '"':
                insideQuotes = not insideQuotes
            #skip unwanted chars
            if (char == ',' or char == "'") and insideQuotes:
                continue
            result.append(char)
    except:
        #if the line has bad chars, don't try to insert into db
        pass

    return ''.join(result)

def cleanFile(filePath):
    validChars = set("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\r\n /.,\"-()[{}]@:;")
    output = []
    print("File size before clense: " + str(os.path.getsize(filePath)))
    try:
        with open(filePath, 'r', encoding='utf-8') as file:
        #with open(filePath, 'r', encoding='utf-8') as file:
            for line in file:
                ### REMOVE COMMAS AND APOSTROPHES WITHIN TEXT FIELDS 
                line = removeCharsInQuotes(line)
                cleanLine = ''.join(char for char in line if char in validChars)
                output.append(cleanLine)

        with open(filePath, 'w', encoding='utf-8') as file:
            file.writelines(output)
        
        print(f'File "{filePath}" has been cleaned and unwanted characters removed.')
        print("File size after clense: " + str(os.path.getsize(filePath)))
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

