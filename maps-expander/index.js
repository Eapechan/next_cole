const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

function extractCoordsFromHtml(html) {
  // Try to find coordinates in meta tags or embedded JSON
  // This is a simple regex and may need to be improved for edge cases
  const metaMatch = html.match(/"center":\{"lat":(-?\d+\.\d+),"lng":(-?\d+\.\d+)\}/);
  if (metaMatch) {
    return { lat: metaMatch[1], lng: metaMatch[2] };
  }
  // Try to find in og:image (sometimes contains a static map with coordinates)
  const ogImageMatch = html.match(/maps\.googleapis\.com\/maps\/api\/staticmap\?center=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (ogImageMatch) {
    return { lat: ogImageMatch[1], lng: ogImageMatch[2] };
  }
  return null;
}

app.get('/expand', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    // Only follow the first redirect (shortened URL)
    const response = await axios.get(url, { maxRedirects: 0, validateStatus: null });
    const location = response.headers.location;
    if (location) {
      // Try to extract coordinates from the expanded URL
      const coordMatch = location.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        return res.json({ expanded: location, lat: coordMatch[1], lng: coordMatch[2] });
      }
      // If not found, fetch the HTML and try to extract
      try {
        const htmlRes = await axios.get(location);
        const coords = extractCoordsFromHtml(htmlRes.data);
        if (coords) {
          return res.json({ expanded: location, ...coords });
        }
      } catch (err) {
        // Ignore HTML fetch errors
      }
      return res.json({ expanded: location, error: 'No coordinates found in URL or HTML' });
    } else {
      res.status(400).json({ error: 'No redirect found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to expand URL' });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`URL expander running on port ${PORT}`)); 