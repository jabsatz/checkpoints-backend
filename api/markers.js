const express = require('express');
const SQLiteClient = require('../clients/SQLiteClient');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const client = new SQLiteClient();
    const markers = await client.getAllMarkers();
    client.close();
    res.send({ markers });
  } catch (e) {
    console.error(e);
    res.status(500).send();
  }
});

router.post('/', async (req, res) => {
  try {
    const { markers } = req.body;
    const client = new SQLiteClient();
    const newMarkers = await client.insertAndGetUpdatedMarkers(
      markers.filter(marker => marker.local),
    );
    const updatedMarkers = await client.updateMarkers(markers.filter(marker => !marker.local));
    const allMarkers = [...newMarkers, ...updatedMarkers];
    await client.deleteOtherMarkers(allMarkers);
    client.close();
    res.send({ markers: allMarkers });
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});

module.exports = router;
