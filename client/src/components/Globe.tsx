import Globe from "react-globe.gl";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import Navbar from "@/components/Nav";
function convertUsernameToColor(username) {
  const hash = username.split("").reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const color = `hsl(${hash % 360}, 100%, 50%)`;
  return color;
}

export default function MyGlobe() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const myGlobe = useRef(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    setLoading(true);
    fetchData();
    async function fetchData() {
      try {
        const response = await api.get("/users/all");
        //All users except the current user
        const filteredUsers = response.data.filter((u) => u.username !== user.username);
        setUsers(filteredUsers);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (myGlobe.current) {
      // Only access the ref if it exists
      myGlobe.current?.pointOfView({ lat: 41.8575, lng: 2.3514, altitude: 1.2 });
    }
  }, [myGlobe.current]); // This effect runs when the ref is available

  // Calculate distance between two points in km using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Enhanced location processing with proximity detection
  const locationOfUsers = useMemo(() => {
    if (!users || users.length === 0) {
      return [];
    }

    // Extract all locations
    const rawLocations = users.map((user) => {
      const { latitude, longitude } = user.location || { latitude: 0, longitude: 0 };

      return {
        lat: latitude,
        lng: longitude,
        size: 0.05, // Starting size
        color: convertUsernameToColor(user.username),
        user: user,
        count: 1, // Count of users at this location
      };
    });

    // Define what "nearby" means (in km)
    const proximityThreshold = 50; // 50km radius

    // Group nearby locations
    const groupedLocations = [];
    const processedIndices = new Set();

    for (let i = 0; i < rawLocations.length; i++) {
      if (processedIndices.has(i)) continue;

      const currentLocation = rawLocations[i];
      let nearbyCount = 1;
      let avgLat = currentLocation.lat;
      let avgLng = currentLocation.lng;

      // Find all points near this one
      const nearby = [];
      for (let j = i + 1; j < rawLocations.length; j++) {
        if (processedIndices.has(j)) continue;

        const distance = calculateDistance(currentLocation.lat, currentLocation.lng, rawLocations[j].lat, rawLocations[j].lng);

        if (distance <= proximityThreshold) {
          nearby.push(j);
          nearbyCount++;
          avgLat += rawLocations[j].lat;
          avgLng += rawLocations[j].lng;
          processedIndices.add(j);
        }
      }

      // Calculate size based on proximity
      // Base size is 0.1, add 0.05 for each additional nearby point
      const sizeMultiplier = Math.min(2, 0.005 + (nearbyCount - 1) * 0.02);

      // Add the grouped location (using average position if multiple points)
      groupedLocations.push({
        lat: avgLat / nearbyCount,
        lng: avgLng / nearbyCount,
        size: sizeMultiplier,
        color: currentLocation.color,
        count: nearbyCount,
        username: [currentLocation.user.username, ...nearby.map((index) => rawLocations[index].user.username)].join(", "),
        users: [currentLocation.user, ...nearby.map((index) => rawLocations[index].user)],
      });

      processedIndices.add(i);
    }

    return groupedLocations;
  }, [users]);

  if (loading) {
    return <div className="w-screen h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="w-screen h-screen flex items-center justify-center">Error loading data</div>;
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Navbar isGlobePage={true} />
      <Globe
        ref={myGlobe}
        width={window.innerWidth}
        height={window.innerHeight}
        globeImageUrl="//unpkg.com/three-globe@2.42.2/example/img/earth-blue-marble.jpg"
        pointsData={locationOfUsers}
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointAltitude="size"
        pointColor="color"
        pointResolution={24}
        pointLabel={(point) => `
          <div class="p-2 rounded-lg shadow-md">
          ${
            point.users
              ?.map((u, i) => {
                if (i > 2) {
                  return "";
                }
                return `
            <div key="${i}" class="flex items-center">
            <img src="${u.profile_picture}" class="w-54 h-54 rounded-full" />
            <p class="ml-2 text-sm font-semibold">${u.firstname} ${new Date().getFullYear() - new Date(u.birth_date).getFullYear()} ans</p>
            </div>`;
              })
              .join("") || ""
          }
          </div>`}
        onPointClick={(point) => {
          alert("point" + JSON.stringify(point.username));
        }}
      />
    </div>
  );
}
