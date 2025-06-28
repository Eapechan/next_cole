import React, { useState } from 'react';
import { toast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

const parseGoogleMapsLink = (link: string) => {
  try {
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/,
      /[?&]center=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /[?&]saddr=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /[?&]daddr=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /^(-?\d+\.\d+),(-?\d+\.\d+)$/
    ];
    
    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        
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

export const GoogleMapsTest: React.FC = () => {
  const [testUrl, setTestUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testUrls = [
    'https://www.google.com/maps/@23.5937,78.9629,15z',
    'https://www.google.com/maps?q=28.6139,77.2090',
    'https://www.google.com/maps/place/19.0760,72.8777',
    '23.5937,78.9629'
  ];

  const handleTest = async (url: string) => {
    setIsTesting(true);
    setTestUrl(url);
    
    try {
      // Test direct parsing
      let coords = parseGoogleMapsLink(url);
      
      // Test backend service if it's a short URL
      if (!coords && (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps'))) {
        try {
          const res = await fetch(`http://localhost:3001/expand?url=${encodeURIComponent(url)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.lat && data.lng) {
              coords = { lat: parseFloat(data.lat).toFixed(6), lng: parseFloat(data.lng).toFixed(6) };
            } else if (data.expanded) {
              coords = parseGoogleMapsLink(data.expanded);
            }
          }
        } catch (err) {
          console.log('Backend service not available');
        }
      }
      
      setResult({
        url,
        coords,
        success: !!coords,
        timestamp: new Date().toISOString()
      });
      
      if (coords) {
        toast({
          title: "Test Successful",
          description: `Coordinates extracted: ${coords.lat}, ${coords.lng}`,
        });
      } else {
        toast({
          title: "Test Failed",
          description: "Could not extract coordinates from URL",
          variant: "destructive"
        });
      }
    } catch (error) {
      setResult({
        url,
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      });
      toast({
        title: "Test Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const testBackendService = async () => {
    try {
      const res = await fetch('http://localhost:3001/expand?url=https://maps.google.com');
      const data = await res.json();
      toast({
        title: "Backend Service Status",
        description: res.ok ? "Service is running" : "Service error",
      });
      return res.ok;
    } catch (error) {
      toast({
        title: "Backend Service Status",
        description: "Service is not running",
        variant: "destructive"
      });
      return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Google Maps Integration Test</CardTitle>
        <CardDescription>
          Test the Google Maps URL parsing functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Test URL</Label>
          <div className="flex gap-2">
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Paste a Google Maps URL to test..."
            />
            <Button 
              onClick={() => handleTest(testUrl)}
              disabled={!testUrl.trim() || isTesting}
            >
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Quick Tests</Label>
          <div className="flex flex-wrap gap-2">
            {testUrls.map((url, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleTest(url)}
                disabled={isTesting}
              >
                Test {index + 1}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Backend Service</Label>
          <Button variant="secondary" onClick={testBackendService}>
            Test Backend Service
          </Button>
        </div>

        {result && (
          <div className="space-y-2">
            <Label>Test Result</Label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2 text-sm">
                <div><strong>URL:</strong> {result.url}</div>
                <div><strong>Success:</strong> {result.success ? '✅ Yes' : '❌ No'}</div>
                {result.coords && (
                  <div><strong>Coordinates:</strong> {result.coords.lat}, {result.coords.lng}</div>
                )}
                {result.error && (
                  <div><strong>Error:</strong> {result.error}</div>
                )}
                <div><strong>Timestamp:</strong> {result.timestamp}</div>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Instructions:</strong></p>
          <p>1. Paste a Google Maps URL in the input field</p>
          <p>2. Click "Test" to verify coordinate extraction</p>
          <p>3. Use "Quick Tests" to test common URL formats</p>
          <p>4. Check "Backend Service" status if using short URLs</p>
        </div>
      </CardContent>
    </Card>
  );
}; 