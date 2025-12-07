# generate_geohash_geojson_20k.py
import json, math, random

BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz"
BASE32_MAP = {c: i for i, c in enumerate(BASE32)}

def geohash_encode(lat, lon, precision=6):
    lat_min, lat_max = -90.0, 90.0
    lon_min, lon_max = -180.0, 180.0
    bits = [16, 8, 4, 2, 1]
    out = []
    bit = 0
    ch = 0
    even = True  # starts with longitude
    while len(out) < precision:
        if even:
            mid = (lon_min + lon_max) / 2.0
            if lon >= mid:
                ch |= bits[bit]
                lon_min = mid
            else:
                lon_max = mid
        else:
            mid = (lat_min + lat_max) / 2.0
            if lat >= mid:
                ch |= bits[bit]
                lat_min = mid
            else:
                lat_max = mid
        even = not even
        if bit < 4:
            bit += 1
        else:
            out.append(BASE32[ch])
            bit = 0
            ch = 0
    return "".join(out)

def geohash_bbox(gh):
    lat_min, lat_max = -90.0, 90.0
    lon_min, lon_max = -180.0, 180.0
    even = True
    for c in gh:
        cd = BASE32_MAP[c]
        for mask in (16, 8, 4, 2, 1):
            if even:
                mid = (lon_min + lon_max) / 2.0
                if cd & mask:
                    lon_min = mid
                else:
                    lon_max = mid
            else:
                mid = (lat_min + lat_max) / 2.0
                if cd & mask:
                    lat_min = mid
                else:
                    lat_max = mid
            even = not even
    return lat_min, lat_max, lon_min, lon_max

def geohash_center(gh):
    lat_min, lat_max, lon_min, lon_max = geohash_bbox(gh)
    return (lat_min + lat_max) / 2.0, (lon_min + lon_max) / 2.0

# (name, lat, lon, weight, region, country_code)
# weights are just for sampling bias (bigger = more points)
CITIES = [
    # =========================
    # EUROPE (focus)
    # =========================
    # UK / IE
    ("London", 51.5074, -0.1278, 24, "EU", "GB"),
    ("Manchester", 53.4808, -2.2426, 10, "EU", "GB"),
    ("Birmingham", 52.4862, -1.8904, 9, "EU", "GB"),
    ("Glasgow", 55.8642, -4.2518, 7, "EU", "GB"),
    ("Edinburgh", 55.9533, -3.1883, 6, "EU", "GB"),
    ("Liverpool", 53.4084, -2.9916, 6, "EU", "GB"),
    ("Bristol", 51.4545, -2.5879, 5, "EU", "GB"),
    ("Leeds", 53.8008, -1.5491, 5, "EU", "GB"),
    ("Dublin", 53.3498, -6.2603, 8, "EU", "IE"),
    ("Cork", 51.8985, -8.4756, 3, "EU", "IE"),

    # France
    ("Paris", 48.8566, 2.3522, 22, "EU", "FR"),
    ("Marseille", 43.2965, 5.3698, 8, "EU", "FR"),
    ("Lyon", 45.7640, 4.8357, 8, "EU", "FR"),
    ("Toulouse", 43.6047, 1.4442, 6, "EU", "FR"),
    ("Nice", 43.7102, 7.2620, 5, "EU", "FR"),
    ("Bordeaux", 44.8378, -0.5792, 5, "EU", "FR"),
    ("Lille", 50.6292, 3.0573, 5, "EU", "FR"),
    ("Nantes", 47.2184, -1.5536, 4, "EU", "FR"),
    ("Strasbourg", 48.5734, 7.7521, 4, "EU", "FR"),

    # Germany
    ("Berlin", 52.5200, 13.4050, 18, "EU", "DE"),
    ("Hamburg", 53.5511, 9.9937, 10, "EU", "DE"),
    ("Munich", 48.1351, 11.5820, 10, "EU", "DE"),
    ("Cologne", 50.9375, 6.9603, 8, "EU", "DE"),
    ("Frankfurt", 50.1109, 8.6821, 8, "EU", "DE"),
    ("Stuttgart", 48.7758, 9.1829, 6, "EU", "DE"),
    ("Dusseldorf", 51.2277, 6.7735, 6, "EU", "DE"),
    ("Leipzig", 51.3397, 12.3731, 4, "EU", "DE"),
    ("Dresden", 51.0504, 13.7373, 4, "EU", "DE"),
    ("Nuremberg", 49.4521, 11.0767, 4, "EU", "DE"),
    ("Hannover", 52.3759, 9.7320, 3, "EU", "DE"),
    ("Bremen", 53.0793, 8.8017, 3, "EU", "DE"),

    # Spain
    ("Madrid", 40.4168, -3.7038, 14, "EU", "ES"),
    ("Barcelona", 41.3851, 2.1734, 14, "EU", "ES"),
    ("Valencia", 39.4699, -0.3763, 6, "EU", "ES"),
    ("Seville", 37.3891, -5.9845, 5, "EU", "ES"),
    ("Zaragoza", 41.6488, -0.8891, 3, "EU", "ES"),
    ("Malaga", 36.7213, -4.4214, 4, "EU", "ES"),
    ("Bilbao", 43.2630, -2.9350, 3, "EU", "ES"),

    # Italy
    ("Rome", 41.9028, 12.4964, 14, "EU", "IT"),
    ("Milan", 45.4642, 9.1900, 14, "EU", "IT"),
    ("Naples", 40.8518, 14.2681, 6, "EU", "IT"),
    ("Turin", 45.0703, 7.6869, 5, "EU", "IT"),
    ("Palermo", 38.1157, 13.3615, 4, "EU", "IT"),
    ("Bologna", 44.4949, 11.3426, 4, "EU", "IT"),
    ("Florence", 43.7696, 11.2558, 3, "EU", "IT"),
    ("Genoa", 44.4056, 8.9463, 3, "EU", "IT"),
    ("Venice", 45.4408, 12.3155, 3, "EU", "IT"),

    # Benelux
    ("Amsterdam", 52.3676, 4.9041, 10, "EU", "NL"),
    ("Rotterdam", 51.9244, 4.4777, 6, "EU", "NL"),
    ("The Hague", 52.0705, 4.3007, 4, "EU", "NL"),
    ("Utrecht", 52.0907, 5.1214, 4, "EU", "NL"),
    ("Eindhoven", 51.4416, 5.4697, 3, "EU", "NL"),
    ("Brussels", 50.8476, 4.3572, 8, "EU", "BE"),
    ("Antwerp", 51.2194, 4.4025, 5, "EU", "BE"),
    ("Ghent", 51.0543, 3.7174, 3, "EU", "BE"),
    ("Luxembourg", 49.6116, 6.1319, 2, "EU", "LU"),

    # Nordics
    ("Stockholm", 59.3293, 18.0686, 8, "EU", "SE"),
    ("Gothenburg", 57.7089, 11.9746, 4, "EU", "SE"),
    ("Malmo", 55.6050, 13.0038, 3, "EU", "SE"),
    ("Copenhagen", 55.6761, 12.5683, 8, "EU", "DK"),
    ("Aarhus", 56.1629, 10.2039, 3, "EU", "DK"),
    ("Oslo", 59.9139, 10.7522, 6, "EU", "NO"),
    ("Bergen", 60.3913, 5.3221, 3, "EU", "NO"),
    ("Helsinki", 60.1699, 24.9384, 6, "EU", "FI"),
    ("Tampere", 61.4978, 23.7610, 3, "EU", "FI"),

    # Central / East
    ("Vienna", 48.2082, 16.3738, 8, "EU", "AT"),
    ("Graz", 47.0707, 15.4395, 3, "EU", "AT"),
    ("Salzburg", 47.8095, 13.0550, 2, "EU", "AT"),
    ("Zurich", 47.3769, 8.5417, 8, "EU", "CH"),
    ("Geneva", 46.2044, 6.1432, 5, "EU", "CH"),
    ("Basel", 47.5596, 7.5886, 3, "EU", "CH"),
    ("Prague", 50.0755, 14.4378, 7, "EU", "CZ"),
    ("Brno", 49.1951, 16.6068, 3, "EU", "CZ"),
    ("Warsaw", 52.2297, 21.0122, 8, "EU", "PL"),
    ("Krakow", 50.0647, 19.9450, 5, "EU", "PL"),
    ("Wroclaw", 51.1079, 17.0385, 4, "EU", "PL"),
    ("Gdansk", 54.3520, 18.6466, 3, "EU", "PL"),
    ("Poznan", 52.4064, 16.9252, 3, "EU", "PL"),
    ("Budapest", 47.4979, 19.0402, 7, "EU", "HU"),
    ("Bratislava", 48.1486, 17.1077, 3, "EU", "SK"),
    ("Ljubljana", 46.0569, 14.5058, 2, "EU", "SI"),
    ("Zagreb", 45.8150, 15.9819, 3, "EU", "HR"),
    ("Belgrade", 44.7866, 20.4489, 4, "EU", "RS"),
    ("Bucharest", 44.4268, 26.1025, 6, "EU", "RO"),
    ("Cluj-Napoca", 46.7712, 23.6236, 3, "EU", "RO"),
    ("Sofia", 42.6977, 23.3219, 4, "EU", "BG"),
    ("Riga", 56.9496, 24.1052, 3, "EU", "LV"),
    ("Vilnius", 54.6872, 25.2797, 3, "EU", "LT"),
    ("Tallinn", 59.4370, 24.7536, 3, "EU", "EE"),

    # South / Southeast
    ("Lisbon", 38.7223, -9.1393, 7, "EU", "PT"),
    ("Porto", 41.1579, -8.6291, 4, "EU", "PT"),
    ("Athens", 37.9838, 23.7275, 6, "EU", "GR"),
    ("Thessaloniki", 40.6401, 22.9444, 4, "EU", "GR"),
    ("Istanbul", 41.0082, 28.9784, 10, "EU", "TR"),
    ("Ankara", 39.9334, 32.8597, 5, "EU", "TR"),

    # =========================
    # UNITED STATES (focus)
    # =========================
    ("New York", 40.7128, -74.0060, 24, "US", "US"),
    ("Los Angeles", 34.0522, -118.2437, 20, "US", "US"),
    ("Chicago", 41.8781, -87.6298, 16, "US", "US"),
    ("Houston", 29.7604, -95.3698, 14, "US", "US"),
    ("Phoenix", 33.4484, -112.0740, 12, "US", "US"),
    ("Philadelphia", 39.9526, -75.1652, 12, "US", "US"),
    ("San Antonio", 29.4241, -98.4936, 10, "US", "US"),
    ("San Diego", 32.7157, -117.1611, 10, "US", "US"),
    ("Dallas", 32.7767, -96.7970, 12, "US", "US"),
    ("San Jose", 37.3382, -121.8863, 10, "US", "US"),
    ("Austin", 30.2672, -97.7431, 10, "US", "US"),
    ("Jacksonville", 30.3322, -81.6557, 7, "US", "US"),
    ("Fort Worth", 32.7555, -97.3308, 7, "US", "US"),
    ("Columbus", 39.9612, -82.9988, 7, "US", "US"),
    ("Charlotte", 35.2271, -80.8431, 8, "US", "US"),
    ("San Francisco", 37.7749, -122.4194, 14, "US", "US"),
    ("Indianapolis", 39.7684, -86.1581, 6, "US", "US"),
    ("Seattle", 47.6062, -122.3321, 10, "US", "US"),
    ("Denver", 39.7392, -104.9903, 9, "US", "US"),
    ("Washington DC", 38.9072, -77.0369, 10, "US", "US"),
    ("Boston", 42.3601, -71.0589, 10, "US", "US"),
    ("Nashville", 36.1627, -86.7816, 7, "US", "US"),
    ("Detroit", 42.3314, -83.0458, 7, "US", "US"),
    ("Portland", 45.5152, -122.6784, 7, "US", "US"),
    ("Las Vegas", 36.1699, -115.1398, 8, "US", "US"),
    ("Miami", 25.7617, -80.1918, 10, "US", "US"),
    ("Atlanta", 33.7490, -84.3880, 10, "US", "US"),
    ("Tampa", 27.9506, -82.4572, 7, "US", "US"),
    ("Orlando", 28.5383, -81.3792, 7, "US", "US"),
    ("Cleveland", 41.4993, -81.6944, 5, "US", "US"),
    ("Cincinnati", 39.1031, -84.5120, 5, "US", "US"),
    ("Pittsburgh", 40.4406, -79.9959, 5, "US", "US"),
    ("Minneapolis", 44.9778, -93.2650, 6, "US", "US"),
    ("St Louis", 38.6270, -90.1994, 5, "US", "US"),
    ("Kansas City", 39.0997, -94.5786, 5, "US", "US"),
    ("Sacramento", 38.5816, -121.4944, 5, "US", "US"),
    ("Salt Lake City", 40.7608, -111.8910, 5, "US", "US"),
    ("New Orleans", 29.9511, -90.0715, 5, "US", "US"),
    ("Raleigh", 35.7796, -78.6382, 5, "US", "US"),
    ("San Bernardino", 34.1083, -117.2898, 4, "US", "US"),
    ("Oakland", 37.8044, -122.2711, 5, "US", "US"),
    ("Baltimore", 39.2904, -76.6122, 6, "US", "US"),
    ("Milwaukee", 43.0389, -87.9065, 5, "US", "US"),
    ("Albuquerque", 35.0844, -106.6504, 5, "US", "US"),
    ("Tucson", 32.2226, -110.9747, 5, "US", "US"),
    ("Fresno", 36.7378, -119.7871, 4, "US", "US"),
    ("Oklahoma City", 35.4676, -97.5164, 5, "US", "US"),
    ("Memphis", 35.1495, -90.0490, 5, "US", "US"),
    ("Louisville", 38.2527, -85.7585, 4, "US", "US"),
    ("Richmond", 37.5407, -77.4360, 4, "US", "US"),
    ("Norfolk", 36.8508, -76.2859, 4, "US", "US"),
    ("Buffalo", 42.8864, -78.8784, 4, "US", "US"),
    ("Hartford", 41.7658, -72.6734, 3, "US", "US"),
    ("Providence", 41.8240, -71.4128, 3, "US", "US"),
]

def pick_city(region):
    pool = [c for c in CITIES if c[4] == region]
    total = sum(c[3] for c in pool)
    r = random.uniform(0, total)
    acc = 0.0
    for name, lat, lon, w, reg, cc in pool:
        acc += w
        if r <= acc:
            return name, lat, lon, w, reg, cc
    return pool[-1]

def sample_point_around(lat0, lon0, region, weight):
    # base spread in degrees (roughly: 0.10 lat ~ 11km)
    base_lat = 0.10 if region == "EU" else 0.14
    base_lon = 0.12 if region == "EU" else 0.16

    # bigger city => a bit wider metro spread
    if weight >= 20:
        factor = 1.5
    elif weight >= 14:
        factor = 1.3
    elif weight >= 10:
        factor = 1.15
    elif weight >= 7:
        factor = 1.0
    else:
        factor = 0.85

    sd_lat = base_lat * factor
    sd_lon = base_lon * factor

    lat = lat0 + random.gauss(0, sd_lat)
    # adjust longitude degrees by latitude (avoid huge jumps near poles)
    lon = lon0 + (random.gauss(0, sd_lon) / max(0.2, math.cos(math.radians(lat0))))

    # clamp / wrap
    lat = max(-89.999999, min(89.999999, lat))
    lon = ((lon + 180) % 360) - 180
    return lat, lon

def main():
    random.seed(42)  # reproducible; change/remove for different output

    N = 20000
    precision = 6
    eu_share = 0.55  # Europe vs US mix

    features = []
    for _ in range(N):
        region = "EU" if random.random() < eu_share else "US"
        city, clat, clon, w, _, country_code = pick_city(region)

        lat, lon = sample_point_around(clat, clon, region, w)
        gh = geohash_encode(lat, lon, precision)
        latc, lonc = geohash_center(gh)

        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lonc, latc]},
            "properties": {
                "geohash": gh,
                "country_code": country_code,
                "city_hint": city,
                "region": region
            }
        })

    fc = {"type": "FeatureCollection", "features": features}
    out = "geohash_points_p6_20000.geojson"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(fc, f, ensure_ascii=False)
    print(f"Wrote {out} with {N} features (duplicates allowed).")

if __name__ == "__main__":
    main()
