import json
import ijson

# Input file names
FILE_ROUTES = 'bus_routes.json'
FILE_TRIPS = 'bus_trips.json'
FILE_STOPS = 'bus_stops.json'
FILE_STOP_TIMES = 'bus_stop_times.json'

# Output file
OUTPUT = 'merged_gtfs.json'

print("Loading small JSON files (routes, trips, stops)...")

with open(FILE_ROUTES, 'r', encoding='utf-8') as f:
    routes = json.load(f)

with open(FILE_TRIPS, 'r', encoding='utf-8') as f:
    trips = json.load(f)

with open(FILE_STOPS, 'r', encoding='utf-8') as f:
    stops = json.load(f)

print("Small files loaded.")
print("Merging large stop_times.json using streaming...")

# Create the merged JSON file
with open(OUTPUT, 'w', encoding='utf-8') as out:
    out.write('{\n')
    out.write('"routes": ')
    json.dump(routes, out)
    out.write(',\n"trips": ')
    json.dump(trips, out)
    out.write(',\n"stops": ')
    json.dump(stops, out)
    out.write(',\n"stop_times": [')

    # Stream stop_times.json elements
    first = True
    with open(FILE_STOP_TIMES, 'rb') as f:
        parser = ijson.items(f, 'item')
        for item in parser:
            if not first:
                out.write(',\n')
            json.dump(item, out)
            first = False

    out.write(']\n}')
    print(f"Merged file saved as {OUTPUT}")
