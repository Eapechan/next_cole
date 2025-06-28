# Google Maps Integration Guide for Land Area Calculator

## Overview

The land area calculator in the NextCoal Initiative now includes enhanced Google Maps integration to help you easily specify locations for your carbon sink projects.

## How to Use Google Maps Integration

### Method 1: Paste Google Maps URL (Recommended)

1. **Get Coordinates from Google Maps:**

   - Go to [Google Maps](https://maps.google.com)
   - Navigate to your desired location
   - Right-click on the exact spot
   - Select "What's here?" from the context menu
   - Click on the coordinates that appear at the bottom
   - Copy the URL from your browser's address bar

2. **Paste in the Application:**
   - In the Land Area Calculator, find the "Paste Google Maps Link" field
   - Paste the copied URL
   - Click "Extract" or wait for automatic extraction
   - The coordinates will be automatically filled in

### Method 2: Manual Coordinate Entry

1. **Find Coordinates:**

   - Use Google Maps to find your location
   - Right-click and select "What's here?"
   - Note the latitude and longitude values

2. **Enter Manually:**
   - Fill in the Latitude field (e.g., 23.5937)
   - Fill in the Longitude field (e.g., 78.9629)

### Method 3: Paste Coordinates

1. **Copy Coordinates:**

   - From Google Maps, copy the coordinates (e.g., "23.5937, 78.9629")

2. **Use Paste Button:**
   - Click the "Paste Coordinates" button
   - Paste the coordinates in the format: lat,lng
   - Click OK

## Supported URL Formats

The system can extract coordinates from various Google Maps URL formats:

- **Standard URLs:** `https://www.google.com/maps/@23.5937,78.9629,15z`
- **Search URLs:** `https://www.google.com/maps?q=23.5937,78.9629`
- **Place URLs:** `https://www.google.com/maps/place/23.5937,78.9629`
- **Short URLs:** `https://maps.app.goo.gl/...` (requires backend service)

## Troubleshooting

### Common Issues:

1. **"Could Not Extract Coordinates" Error:**

   - **Cause:** URL doesn't contain coordinates
   - **Solution:** Use "What's here?" method to get coordinates in the URL

2. **Backend Service Not Available:**

   - **Cause:** The maps-expander service isn't running
   - **Solution:** The system will fall back to direct URL parsing

3. **Invalid Coordinates:**
   - **Cause:** Coordinates are out of valid range
   - **Solution:** Ensure latitude is between -90 and 90, longitude between -180 and 180

### Tips for Best Results:

1. **Always use "What's here?" method** for the most reliable coordinate extraction
2. **Avoid place names** in URLs - use coordinates instead
3. **Test with a simple coordinate URL** first to verify the system is working
4. **Use the map preview** to confirm your location is correct

## Example URLs That Work:

```
https://www.google.com/maps/@23.5937,78.9629,15z
https://www.google.com/maps?q=23.5937,78.9629
https://www.google.com/maps/place/23.5937,78.9629
23.5937,78.9629
```

## Backend Service

The system includes a backend service (`maps-expander`) that:

- Expands shortened Google Maps URLs
- Extracts coordinates from complex URLs
- Provides fallback parsing methods

To start the backend service:

```bash
cd maps-expander
npm install
node index.js
```

The service runs on `http://localhost:3001` and is automatically used when available.

## Testing the Integration

1. **Test with a known location:**

   - Use coordinates for a major city (e.g., New Delhi: 28.6139, 77.2090)
   - Verify the map preview shows the correct location

2. **Test URL parsing:**

   - Try pasting different Google Maps URL formats
   - Check that coordinates are extracted correctly

3. **Test manual entry:**
   - Enter coordinates manually
   - Verify the map preview updates

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify the backend service is running (if using short URLs)
3. Try the manual coordinate entry method as a fallback
4. Contact support with specific error messages and URLs used
