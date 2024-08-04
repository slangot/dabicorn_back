require('dotenv').config();
const express = require('express');
const mysql = require('../db-config');
const router = express.Router();

router.get('/', (req, res) => {
  let sql = 'SELECT * FROM hero';
  mysql.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving all images' });
    } else {

      // Add  complete URL
      const images = result.map(image => {
        return {
          ...image,
          image_link: `http://localhost:3001/${image.image_link}`
        };
      });
      res.status(200).json(images);
    }
  });
})

router.get('/count', (req, res) => {
  let sql = 'SELECT COUNT(*) AS count FROM hero';

  mysql.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving heroes count' });
    } else {
      res.status(200).send(result[0]);
    }
  });
})

router.get('/id', (req, res) => {
  const { id } = req.query

  const values = [parseInt(id)]
  const query = `
    SELECT
      h.name AS hero_name,
      h.categories,
      h.image_link AS hero_link,
      s.id AS sound_id,
      s.name AS sound_name,
      s.hero_id,
      s.image_id,
      s.keywords,
      s.link AS sound_link,
      s.views,
      i.id AS image_id,
      i.name AS image_name,
      i.link AS image_link
    FROM
      sound s
    JOIN
      image i ON s.image_id = i.id
    JOIN
      hero h ON s.hero_id = h.id
    WHERE
      s.hero_id = ?
      `;
  // LIMIT 15 OFFSET ?

  mysql.query(query, values, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving specific id hero' });
    } else {
      res.status(200).json(result);
    }
  });
})

// router.get('/search', (req, res) => {
//   const { search } = req.query;
//   const searchLike = `%${search}%`;

//   if (!search) {
//     return res.status(400).json({ error: 'Search parameter is required' });
//   }

//   // Promesse pour la requête hero
//   const getHero = new Promise((resolve, reject) => {
//     const heroQuery = 'SELECT * FROM hero WHERE keyword LIKE ?';
//     mysql.query(heroQuery, [searchLike], (err, results) => {
//       if (err) {
//         reject('Error fetching hero: ' + err);
//       } else {
//         resolve(results);
//       }
//     });
//   });

//   // Exécuter toutes les promesses et envoyer la réponse une fois toutes résolues
//   Promise.all([getHero])
//     .then(([hero]) => {

//       res.status(200).json({
//         hero
//       });
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).json({ error: 'Internal server error' });
//     });
// });

router.get('/search', (req, res) => {
  const { word } = req.query;
  let sql = `SELECT * FROM hero 
  WHERE name LIKE '%${word}%' 
  OR keywords LIKE '%${word}%'
  `
  mysql.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving hero' });
    } else {
      res.status(200).send(result);
    }
  })
})

module.exports = router