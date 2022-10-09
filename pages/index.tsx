import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next';
import Map, { Marker } from 'react-map-gl';

export const getServerSideProps: GetServerSideProps = async context => {
  //Fetch data from external API
  const res = await fetch('http://localhost:3000/api/places');
  const places = await res.json();

  // const places = [
  //   {
  //     id: 1,
  //     name: 'Dublin',
  //     lat: 53,
  //     lng: 6,
  //   },
  //   {
  //     id: 2,
  //     name: 'London',
  //     lat: 52,
  //     lng: 0,
  //   },
  //   {
  //     id: 3,
  //     name: 'Singapore',
  //     lat: 1,
  //     lng: 100,
  //   },
  //   {
  //     id: 4,
  //     name: 'Lagos',
  //     lat: 6,
  //     lng: 3,
  //   },
  // ];

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
  const addLocation = async (event: any) => {
    const data = {
      name: 'test',
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
            latitude: 30,
            zoom: 2.5,
          }}
          // style={{ width: '100%', height: '100%' }}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/jgillan/cl91nwdzy002u14oa9a8xrn98"
          onMouseUp={event => addLocation(event)}
          projection="globe"
        >
          {places.map(place => (
            <Marker
              longitude={place.lng}
              latitude={place.lat}
              draggable={true}
              anchor={'bottom'}
            >
              <img
                src="https://www.goodfreephotos.com/albums/vector-images/map-pins-vector-clipart.png"
                width={30}
                height={30}
              />
            </Marker>
          ))}
        </Map>
      </div>
    </div>
  );
};

export default Home;
