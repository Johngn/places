import { useState, useEffect } from "react";
import Head from "next/head";
import Map from "react-map-gl";
import * as mapStyles from "../styles/map.json";
import { useRouter } from "next/router";
import { useSession, signIn, signOut } from "next-auth/react";

//  NEED TO CHANGE CALLBACK URI IN GITHUB!!!!!!!

const Home = () => {
  const [newMapStyles, setNewMapStyles] = useState(mapStyles);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const router = useRouter();
  const { data: session } = useSession();

  console.log(places);

  const getPlaces = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/places`);
    setPlaces(await res.json());
  };

  useEffect(() => {
    if (session) getPlaces();
  }, [session]);

  useEffect(() => {
    const countriesList = places.map(place =>
      place.isoCode.toString().toUpperCase()
    );
    // const countriesList = ['FR', 'DE'];

    const spreadMapStyles = { ...newMapStyles }; // Need to do this to update state correctly

    const modifiedLayers = spreadMapStyles.layers.map(layer => {
      if (layer.id === "country-boundaries") {
        const modifiedLayer = {
          id: "country-boundaries",
          type: "fill",
          source: "composite",
          "source-layer": "country_boundaries",
          layout: {},
          paint: {
            "fill-color": [
              "match",
              ["get", "iso_3166_1"],
              ["", ...countriesList],
              "hsla(190, 50%, 50%, 1)", // Colour of selected countries
              "hsla(240, 23%, 75%, 0)", // Colour of rest of countries
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
      return place_type[0] === "country";
    });

    if (countryLevel.length > 0) {
      // Check if click was made within country
      const data = {
        isoCode: countryLevel[0].properties.short_code,
        name: countryLevel[0].text,
        lat: event.lngLat.lat,
        lng: event.lngLat.lng,
      };

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/places`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });

      getPlaces();
    } else {
      setLoading(false);
    }
  };

  return (
    <>
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
              latitude: 0,
              zoom: 2.5,
            }}
            cursor={loading ? "wait" : "auto"}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            mapStyle={session ? newMapStyles : mapStyles}
            onDblClick={event => session && addLocation(event)}
            doubleClickZoom={false}
            projection="globe"
          ></Map>

          <div className="absolute top-5 right-5">
            {session ? (
              <button
                className="rounded-full bg-cyan-300 p-3 text-lg "
                onClick={() => signOut()}
              >
                Sign out
              </button>
            ) : (
              <button
                className="rounded-full bg-cyan-300 p-3 text-lg "
                onClick={() => signIn()}
              >
                Sign in
              </button>
            )}
          </div>

          {session && (
            <div className="absolute p-2 top-1 left-0  rounded-md">
              <h1 className="text-5xl md:text-8xl mb-2 text-cyan-300">
                {places.length}
              </h1>

              {places.length > 0 && (
                <div className="h-[calc(100vh-9rem)] overflow-y-auto scrollbar-hide">
                  {places.map(place => (
                    <h2
                      key={place.name}
                      className="text-xs md:text-base uppercase text-cyan-300"
                    >
                      {place.name}
                    </h2>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
