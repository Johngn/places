import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next';
import Map, { Marker } from 'react-map-gl';
import mapStyles from '../styles/map.json';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch('http://localhost:3000/api/places');
  const places = await res.json();

  return { props: { places } };
};

type placeType = {
  id: React.Key;
  name: String;
  lat: number;
  lng: number;
};

type HomeProps = {
  places: placeType[];
};

const Home: NextPage<HomeProps> = ({ places }) => {
  const [newMapStyles, setNewMapStyles] = useState(mapStyles);
  const router = useRouter();

  useEffect(() => {
    const countriesList = places.map(place => place.name.toString());

    const spreadMapStyles = { ...newMapStyles }; // Need this to update state correctly

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
              ['get', 'name_en'],
              countriesList,
              'hsla(190, 100%, 70%, 0.8)',
              'hsla(240, 23%, 75%,0)',
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

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const addLocation = async (event: any) => {
    // Reverse Geocoding
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${event.lngLat.lng},${event.lngLat.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
    );

    const place = await res.json();

    const countryLevel = place.features.filter((addressLevel: any) => {
      const { place_type } = addressLevel;
      return place_type[0] === 'country';
    });

    if (countryLevel.length > 0) {
      const data = {
        name: countryLevel[0].text,
        lat: event.lngLat.lat,
        lng: event.lngLat.lng,
      };

      await fetch('http://localhost:3000/api/places', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });

      refreshData(); // Run getServerSideProps again
    }
  };

  return (
    <div>
      <Head>
        <title>Places</title>
        <meta name="description" content="All the places I've visited" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css"
          rel="stylesheet"
        ></link>
      </Head>

      <div className="w-screen h-screen">
        <Map
          initialViewState={{
            longitude: 0,
            latitude: 40,
            zoom: 3,
          }}
          // style={{ width: '100%', height: '100%' }}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          mapStyle={newMapStyles}
          // onMouseUp={event => addLocation(event)}
          onContextMenu={event => addLocation(event)}
          projection="globe"
        ></Map>
      </div>
    </div>
  );
};

export default Home;
