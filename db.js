///Data Layer: add a syncAndSeedMethod in your db.js which will be called from server.js
// add your models, associations, and seeded data
// the UUID type and the UUIDV4 method will be used for the primary keys for tables

const Sequelize = require('sequelize');
const { DataTypes: { UUID, UUIDV4, STRING, DATE } } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db');

const members = ['moe', 'lucy', 'larry', 'ethyl'];
const facilities = ['tennis', 'ping-pong', 'raquet-ball', 'bowling'];

const syncAndSeed = async()=> {
  await conn.sync({ force: true }); //
  const [moe, lucy, larry, ethyl ] = await Promise.all(members.map( firstName => Member.create({ firstName })));
  moe.sponsorId = lucy.id;
  ethyl.sponsorId = moe.id;
  larry.sponsorId = lucy.id;
  await Promise.all([moe.save(), ethyl.save(), larry.save()]);
  const [tennis, pingPong, raquetBall, bowling] = await Promise.all(
    facilities.map( fac_name => Facility.create({ fac_name }))
  );
  await Promise.all([
    Booking.create({
      bookedById: lucy.id,
      facilityId: tennis.id
    }),
    Booking.create({
      bookedById: moe.id,
      facilityId: pingPong.id
    })
  ]);
};

const Member = conn.define('member', {
  id: {
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  },
  firstName: {
    type: STRING, 
    unique: true,
    allowNull: false
  }
});

const Facility = conn.define('facility', {
  id: {
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  },
  fac_name: {
    type: STRING, 
    unique: true,
    allowNull: false
  }
});

const Booking = conn.define('booking', {
  id: {
    primaryKey: true,
    type: UUID,
    defaultValue: UUIDV4
  },
  startTime: {
    type: DATE, 
    allowNull: false,
    defaultValue: ()=> new Date()
  },
  endTime: {
    type: DATE, 
    allowNull: false,
    defaultValue: ()=> new Date(new Date().getTime() + 1000*60*60)
  },
  bookedById: {
    type: UUID,
    allowNull: false
  },
  facilityId: {
    type: UUID,
    allowNull: false
  }
});
//Associations:
//The A.belongsTo(B) association means that a One-To-One relationship exists between A and B, 
    //with the foreign key being defined in the source model (A).
Member.belongsTo(Member, { as: 'sponsor'});

//The A.hasMany(B) association means that a One-To-Many relationship exists between A and B, 
    //with the foreign key being defined in the target model (B).
Member.hasMany(Member, { as: 'sponsored', foreignKey: 'sponsorId'});

Booking.belongsTo(Member, { as: 'bookedBy'});
Booking.belongsTo(Facility);
Facility.hasMany(Booking);

module.exports = {
  syncAndSeed,
  models: {
    Facility,
    Member,
    Booking
  }
}
