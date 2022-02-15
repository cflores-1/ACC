const express = require('express');
const app = express();
const db = require('./db');
const { models: { Facility, Member, Booking } } = db;

//GET /api/facilities
app.get('/api/facilities', async(req, res, next)=> {
    try {
      res.send(await Facility.findAll({
        include: [ Booking ]
      }));
    }
    catch(ex){
      next(ex);
    }
  });

const setUp = async()=> { //goes with the await to seed the db
    try {
      await db.syncAndSeed(); //seeds the db
      const port = process.env.PORT || 3000;
      app.listen(port, ()=> console.log(`listening on port ${port}`));
    }
    catch(ex){
      console.log(ex);
    }
};
  
setUp();