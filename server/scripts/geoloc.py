from geopy.geocoders import Nominatim

def get_city_coordinates(city_name, country_code=None):
    # Initialize the geolocator
    geolocator = Nominatim(user_agent="city_coordinate_finderx")
    
    # Build the location query
    query = city_name
    if country_code:
        query += f", {country_code}"
    
    # Get the location
    location = geolocator.geocode(query)
    
    if location:
        return (location.latitude, location.longitude)
    else:
        return None

# # Example usage
# city = "Paris"
# country = "FR"  # Optional: country code for more accurate results
# coordinates = get_city_coordinates(city, country)

# if coordinates:
#     latitude, longitude = coordinates
#     print(f"Coordinates of {city}: {latitude}, {longitude}")
# else:
#     print(f"Could not find coordinates for {city}")