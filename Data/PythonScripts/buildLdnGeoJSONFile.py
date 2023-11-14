# this script connects to the mysql db and pulls the geojson data
# required to create the london map of greenspace
# it creates a file (UK_Ward_Canopy_Cover.geojson) that can then be directly loaded into the mapbox container
#

import pymysql
import json

def get_value_from_json(json_file, key, sub_key):
   try:
       with open(json_file) as f:
           data = json.load(f)
           return data[key][sub_key]
   except Exception as e:
       print("Error: ", e)
       
host = get_value_from_json("secrets.json", "db", "host")
dbname = get_value_from_json("secrets.json", "db", "name")
user = get_value_from_json("secrets.json", "db", "user")
pwd = get_value_from_json("secrets.json", "db", "pwd")

# MySQL database connection parameters
db_config = {
    "host": host,
    "user": user,
    "password": pwd,
    "database": dbname,
}

# SQL query to retrieve data
query = "select w.GEO_JSON from ward_geo_json as w, ward_geo_json_attributes as a, rcka_ward_codes as r where w.OBJECTID = a.OBJECTID and a.wardcode = r.wardcode;"

# Output file name
output_file = "UK_Ward_Canopy_Cover.geojson"

# Open a connection to the MySQL database
conn = pymysql.connect(**db_config)

# Create a cursor object
cursor = conn.cursor()

cursor.execute(query)
rows = cursor.fetchall()

# Open the output file for writing
with open(output_file, "w") as file:
    file.write('{"type": "FeatureCollection", "name": "UKWardCanopyCover", "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } }, "features": [')

    i = 0
    rowCount = len(rows)
    # Write each record to the file
    while i < rowCount:
    #for row in rows:
        text = rows[i][0]  # write GEO JSON field
        if (i == rowCount - 1):
            #print(text)
            text = text[:len(text) - 2]
        file.write(f'{text}\n')
        i += 1

    # write the closing bracketas
    file.write("\n]}")

# Close db
cursor.close()
conn.close()


"""
# Add the final closing bracket to the GeoJSON file
with open(output_file, "a") as file:
    file.write("]\n }\n")

"""

print(f"Data written to {output_file}")

