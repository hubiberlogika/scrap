from scraper import parse_caption


def test_parse_price_and_location_and_land_area():
    caption = "Rumah Cantik di Jakarta. Harga 500jt. Luas 200 m2. SHM."
    parsed = parse_caption(caption)
    assert parsed['title'].startswith('Rumah Cantik')
    assert '500' in parsed['price']
    assert 'Jakarta' in parsed['location']
    assert '200' in parsed['land_area']
    assert parsed['documents'] == 'SHM'


def test_parse_year_built():
    caption = "Dijual: Apartemen nyaman. Dibangun 2018. Harga 1.2M"
    parsed = parse_caption(caption)
    assert parsed['year_built'] == 2018 or parsed['year_built'] == '2018'
