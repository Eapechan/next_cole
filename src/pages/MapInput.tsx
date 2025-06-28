import React from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { toast } from "../hooks/use-toast";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const parseGoogleMapsLink = (link: string) => {
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?q=lat,lng
    /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?ll=lat,lng
    /\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/, // /place/lat,lng
    /^(-?\d+\.\d+),(-?\d+\.\d+)$/ // direct lat,lng
  ];
  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match) {
      return { lat: parseFloat(match[1]).toFixed(6), lng: parseFloat(match[2]).toFixed(6) };
    }
  }
  return null;
};

function LocationPicker({ setMapCoordinates }) {
  useMapEvents({
    click(e) {
      setMapCoordinates({ lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6) });
      toast({
        title: "Location Selected",
        description: `Latitude: ${e.latlng.lat.toFixed(6)}, Longitude: ${e.latlng.lng.toFixed(6)}`,
      });
    }
  });
  return null;
}

export default function MapInput({ mapCoordinates, setMapCoordinates, mapsLink, setMapsLink }) {
  // Helper to paste coordinates string
  const handlePasteCoordinates = () => {
    const input = prompt("Paste coordinates as 'lat,lng' (e.g., 23.5937,78.9629):");
    if (input) {
      const match = input.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
      if (match) {
        setMapCoordinates({ lat: match[1], lng: match[2] });
        toast({
          title: "Coordinates Pasted",
          description: `Latitude: ${match[1]}, Longitude: ${match[2]}`,
        });
      } else {
        toast({
          title: "Invalid Format",
          description: "Please paste coordinates in the format: lat,lng (e.g., 23.5937,78.9629)",
          variant: "destructive"
        });
      }
    }
  };

  // Main extraction handler
  const handleMapsLinkPaste = async (link: string) => {
    setMapsLink(link);
    let coords = parseGoogleMapsLink(link);
    if (!coords && (link.includes('maps.app.goo.gl') || link.includes('goo.gl/maps'))) {
      try {
        const res = await fetch(`http://localhost:3001/expand?url=${encodeURIComponent(link)}`);
        const data = await res.json();
        if (data.lat && data.lng) {
          coords = { lat: parseFloat(data.lat).toFixed(6), lng: parseFloat(data.lng).toFixed(6) };
        } else if (data.expanded) {
          coords = parseGoogleMapsLink(data.expanded);
        }
      } catch (err) {
        // Ignore backend errors, fallback to manual
      }
    }
    if (coords && coords.lat && coords.lng) {
      setMapCoordinates(coords);
      toast({
        title: "Location Detected",
        description: `Coordinates extracted: ${coords.lat}, ${coords.lng}`,
      });
    } else {
      toast({
        title: "Could Not Extract Coordinates",
        description: "Google Maps short links and place-name links may not contain coordinates. Please use a Google Maps URL with coordinates or enter them manually.",
        variant: "destructive"
      });
    }
  };

  // Default map center (India) if no coordinates
  const center = (mapCoordinates.lat && mapCoordinates.lng)
    ? [parseFloat(mapCoordinates.lat), parseFloat(mapCoordinates.lng)]
    : [23.5937, 78.9629];

  return (
    <div className="space-y-2">
      <Label>Paste Google Maps Link (Optional)</Label>
      <div className="flex gap-2">
        <Input
          placeholder="Paste Google Maps URL here..."
          value={mapsLink}
          onChange={e => setMapsLink(e.target.value)}
          onPaste={e => {
            const pastedText = e.clipboardData.getData('text');
            if (pastedText.includes('google.com/maps') || pastedText.includes('maps.google.com')) {
              setTimeout(() => handleMapsLinkPaste(pastedText), 100);
            }
          }}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => handleMapsLinkPaste(mapsLink)}
          disabled={!mapsLink.trim()}
        >
          Extract
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handlePasteCoordinates}
        >
          Paste Coordinates
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        <strong>Tip:</strong> For best results, right-click on your location in Google Maps, select "What's here?", click the coordinates, and copy the URL from your browser's address bar.<br />
        <strong>Alternative:</strong> You can also manually enter coordinates above, or use the "Paste Coordinates" button.<br />
        <strong>Note:</strong> Google Maps short links and place-name links may not contain coordinates and are not always reliable for automated extraction.
      </p>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <Label>Latitude</Label>
          <Input
            placeholder="e.g., 23.5937"
            value={mapCoordinates.lat}
            onChange={e => setMapCoordinates(prev => ({ ...prev, lat: e.target.value }))}
          />
        </div>
        <div>
          <Label>Longitude</Label>
          <Input
            placeholder="e.g., 78.9629"
            value={mapCoordinates.lng}
            onChange={e => setMapCoordinates(prev => ({ ...prev, lng: e.target.value }))}
          />
        </div>
      </div>
      {/* Interactive Map Picker */}
      <div className="mt-4">
        <Label>Pick Location on Map</Label>
        <MapContainer center={center} zoom={5} style={{ height: 300, width: "100%" }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationPicker setMapCoordinates={setMapCoordinates} />
          {mapCoordinates.lat && mapCoordinates.lng && (
            <Marker position={[parseFloat(mapCoordinates.lat), parseFloat(mapCoordinates.lng)]} />
          )}
        </MapContainer>
      </div>
      {/* Google Maps Preview (optional, for cross-check) */}
      {mapCoordinates.lat && mapCoordinates.lng && (
        <div className="rounded-lg overflow-hidden border mt-2">
          <iframe
            width="100%"
            height="200"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${mapCoordinates.lat},${mapCoordinates.lng}&z=16&output=embed`}
            title="Map Preview"
          />
        </div>
      )}
    </div>
  );
} 