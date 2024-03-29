const bcrypt = require('bcryptjs');
const client = require('../lib/client');
// import our seed data:
const character = require('./character.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
const weapons = require('./weapons.js');
run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        const hash = bcrypt.hashSync(user.password, 8);
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      weapons.map(weapon => {
        return client.query(`
                    INSERT INTO weapons (weapon_name)
                    VALUES ($1)
                    RETURNING *;
                `,
        [weapon.weapon_name]);
      })
    );

    await Promise.all(
      character.map(character => {
        return client.query(`
                    INSERT INTO character (name, race, hp, owner_id)
                    VALUES ($1, $2, $3, $4);
                `,
        [character.name, character.race, character.hp, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
