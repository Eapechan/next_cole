import { Globe } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "../hooks/use-toast";

const parseGoogleMapsLink = (link: string) => {
  try {
    // Enhanced patterns for different Google Maps URL formats
    const patterns = [
      // Standard Google Maps coordinates
      /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
      /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?q=lat,lng
      /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?ll=lat,lng
      /\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/, // /place/lat,lng
      /[?&]center=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?center=lat,lng
      /[?&]saddr=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?saddr=lat,lng
      /[?&]daddr=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?daddr=lat,lng
      /^(-?\d+\.\d+),(-?\d+\.\d+)$/ // direct lat,lng
    ];
    
    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // Validate coordinates
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing Google Maps link:', error);
    return null;
  }
};

export default function MapInput({ mapCoordinates, setMapCoordinates, mapsLink, setMapsLink }) {
  // Helper to paste coordinates string
  const handlePasteCoordinates = () => {
    const input = prompt("Paste coordinates as 'lat,lng' (e.g., 23.5937,78.9629):");
    if (input) {
      const match = input.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
        // Validate coordinates
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          setMapCoordinates({ lat: match[1], lng: match[2] });
          toast({
            title: "Coordinates Pasted",
            description: `Latitude: ${match[1]}, Longitude: ${match[2]}`,
          });
        } else {
          toast({
            title: "Invalid Coordinates",
            description: "Coordinates are out of valid range. Latitude: -90 to 90, Longitude: -180 to 180",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Invalid Format",
          description: "Please paste coordinates in the format: lat,lng (e.g., 23.5937,78.9629)",
          variant: "destructive"
        });
      }
    }
  };

  // Enhanced maps link handler with fallback options
  const handleMapsLinkPaste = async (link: string) => {
    setMapsLink(link);
    
    // First try to parse the link directly
    let coords = parseGoogleMapsLink(link);
    
    // If no coordinates found and it's a short link, try to expand it
    if (!coords && (link.includes('maps.app.goo.gl') || link.includes('goo.gl/maps'))) {
      try {
        // Try the backend service first
        const res = await fetch(`http://localhost:3001/expand?url=${encodeURIComponent(link)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.lat && data.lng) {
            coords = { lat: parseFloat(data.lat).toFixed(6), lng: parseFloat(data.lng).toFixed(6) };
          } else if (data.expanded) {
            coords = parseGoogleMapsLink(data.expanded);
          }
        }
      } catch (err) {
        console.log('Backend service not available, trying alternative methods');
        
        // Fallback: Try to extract from the URL structure
        try {
          // For some short links, we can try to follow the redirect manually
          const response = await fetch(link, { 
            method: 'HEAD',
            redirect: 'follow'
          });
          
          if (response.url) {
            coords = parseGoogleMapsLink(response.url);
          }
        } catch (fallbackErr) {
          console.log('Fallback method also failed');
        }
      }
    }
    
    if (coords && coords.lat && coords.lng) {
      setMapCoordinates(coords);
      toast({
        title: "Location Detected",
        description: `Coordinates extracted: ${coords.lat}, ${coords.lng}`,
      });
    } else {
      // Provide helpful guidance
      toast({
        title: "Could Not Extract Coordinates",
        description: "Try right-clicking on Google Maps, selecting 'What's here?', then copying the URL with coordinates.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
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
          <strong>Alternative:</strong> You can also manually enter coordinates below, or use the "Paste Coordinates" button.<br />
          <strong>Note:</strong> Google Maps short links and place-name links may not contain coordinates and are not always reliable for automated extraction.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
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
      
      {/* Google Maps Preview */}
      {mapCoordinates.lat && mapCoordinates.lng && (
        <div className="space-y-2">
          <Label>Location Preview</Label>
          <div className="rounded-lg overflow-hidden border">
            <iframe
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${mapCoordinates.lat},${mapCoordinates.lng}&z=16&output=embed`}
              title="Map Preview"
            />
          </div>
        </div>
      )}
      
      {/* Placeholder when no coordinates */}
      {(!mapCoordinates.lat || !mapCoordinates.lng) && (
        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Globe className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Google Maps Integration</p>
            <p className="text-xs text-gray-400">Enter coordinates above or paste a Google Maps link</p>
          </div>
        </div>
      )}
    </div>
  );
} 