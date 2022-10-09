import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next';
import Map, { Marker } from 'react-map-gl';
import styles from '../styles/map.json';
import layers from '../styles/layers.json';

export const getServerSideProps: GetServerSideProps = async context => {
  //Fetch data from external API
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
  const [countries, setCountries] = useState([
    'United States',
    'Canada',
    'United Kingdom',
    'France',
    'Ireland',
    'Germany',
  ]);
  const countriesList = places.map(place => place.name);
  console.log(countriesList);

  const addLocation = async (event: any) => {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${event.lngLat.lng},${event.lngLat.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
    );

    const place = await res.json();

    const countryLevel = place.features.filter((addressLevel: any) => {
      const { place_type } = addressLevel;
      return place_type[0] === 'country';
    });

    if (countryLevel.length > 0) {
      console.log(countryLevel[0].text);
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
            latitude: 0,
            zoom: 2.5,
          }}
          // style={{ width: '100%', height: '100%' }}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          mapStyle={{
            ...styles,
            // ...layers,
            // layers: [
            //   {
            //     id: 'country-boundaries (1)',
            //     type: 'fill',
            //     source: 'composite',
            //     'source-layer': 'country_boundaries',
            //     layout: {},
            //     paint: { 'fill-color': 'hsl(100, 73%, 56%)' },
            //   },
            //   {
            //     id: 'country-boundaries',
            //     type: 'fill',
            //     source: 'composite',
            //     'source-layer': 'country_boundaries',
            //     layout: {},
            //     paint: {
            //       'fill-color': [
            //         'match',
            //         ['get', 'name_en'],
            //         countriesList,
            //         'hsla(0, 0, 0, 0)',
            //         'hsl(50, 73%, 56%)',
            //       ],
            //     },
            //   },
            // ],
          }}
          // onMouseUp={event => addLocation(event)}
          projection="globe"
        ></Map>
      </div>
    </div>
  );
};

export default Home;
