import { useState, useEffect } from 'react';
// import type { NextPage } from 'next';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Map, { Layer } from 'react-map-gl';
import * as mapStyles from '../styles/map.json';
import { useRouter } from 'next/router';

export const getServerSideProps = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/places`);
  const places = await res.json();

  return { props: { places } };
};

// type placeType = {
//   id: React.Key;
//   isoCode: String;
//   name: String;
//   lat: number;
//   lng: number;
// };

// type HomeProps = {
//   places: placeType[];
// };

const Home = ({ places }) => {
  const [newMapStyles, setNewMapStyles] = useState(mapStyles);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  useEffect(() => {
    const countriesList = places.map(place =>
      place.isoCode.toString().toUpperCase()
    );

    const spreadMapStyles = { ...newMapStyles }; // Need to do this to update state correctly

    const modifiedLayers = spreadMapStyles.layers.map(layer => {
      if (layer.id === 'country-boundaries') {
        const modifiedLayer = {
          id: 'country-boundaries',
          type: 'fill',
          source: 'composite',
          'source-layer': 'country_boundaries',
          layout: {},
          paint: {
            'fill-color': [
              'match',
              ['get', 'iso_3166_1'],
              ['', ...countriesList],
              'hsla(190, 100%, 70%, 0.4)', // Colour of selected countries
              'hsla(240, 23%, 75%, 0)', // Colour of rest of countries
            ],
          },
        };
        return modifiedLayer;
      } else {
        return layer;
      }
    });

    setNewMapStyles({
      ...spreadMapStyles,
      layers: modifiedLayers,
    });
  }, [places]);

  useEffect(() => {
    setLoading(false);
  }, [newMapStyles]);

  const addLocation = async event => {
    setLoading(true);
    // Reverse Geocoding
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${event.lngLat.lng},${event.lngLat.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
    );

    const place = await res.json();

    const countryLevel = place.features.filter(addressLevel => {
      const { place_type } = addressLevel;
      return place_type[0] === 'country';
    });

    if (countryLevel.length > 0) {
      // Check if click was made within country
      const data = {
        isoCode: countryLevel[0].properties.short_code,
        name: countryLevel[0].text,
        lat: event.lngLat.lat,
        lng: event.lngLat.lng,
      };

      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/places`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });

      refreshData(); // Run getServerSideProps again
    } else {
      setLoading(false);
    }
  };

  // const parkLayer = {
  //   id: 'landuse_park',
  //   type: 'fill',
  //   source: 'mapbox',
  //   'source-layer': 'landuse',
  //   filter: ['==', 'class', 'park'],
  //   paint: {
  //     'fill-color': '#4E3FC8',
  //   },
  // };

  return (
    <div>
      <Head>
        <title>Places</title>
        <meta name="description" content="All the places I've visited" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="w-screen h-screen">
        <Map
          initialViewState={{
            longitude: 0,
            latitude: 40,
            zoom: 2.7,
          }}
          cursor={loading ? 'wait' : 'auto'}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          mapStyle={newMapStyles}
          onContextMenu={event => addLocation(event)}
          projection="globe"
        ></Map>
      </div>
    </div>
  );
};

export default Home;
