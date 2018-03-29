const credentials = require('./credentials.js');


const rp = require("request-promise-native");
const { Client } = require('pg');
const client = new Client({
	host: credentials.postgres_host,
	port: credentials.postgres_port,
	user: credentials.postgres_user,
	password: credentials.postgres_password,
	database: 'poe_ladder_data'
});


client.connect();

async function update_ladder(ladder, offset) {	
	var result = await rp({
		url:'http://api.pathofexile.com/ladders/' + ladder + '?offset=' + offset + '&limit=200', 
		json: true
	});
	
	//console.log(result);
	
	var resp = result;
	for(var entry of resp.entries) {
		var id = ladder + '_' + entry.rank.toString().padStart(5, '0');
		console.log("updating " + id);
		
		/*console.log(`insert into poe_ladder_data values('${id}', ${entry.rank}, ${entry.dead}, ${entry.online}, '${entry.character.name}',` +
						`${entry.character.level}, '${entry.character.class}', ${entry.character.experience}, '${entry.account.name}',` +
						`'${ladder}')`);*/
		
		/*var result = await client.query(`insert into poe_ladder_data values('${id}', ${entry.rank}, ${entry.dead}, ${entry.online}, '${entry.character.name}',` +
						`${entry.character.level}, '${entry.character.class}', ${entry.character.experience}, '${entry.account.name}',` +
						`'${ladder}') on conflict (_id) do update set rank = ${entry.rank}, dead = ${entry.dead}`);*/

		var result = await client.query('insert into poe_ladder_data values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) on conflict (_id) ' +
										'do update set rank = $2, dead = $3, online = $4, name = $5, level = $6, class = $7, experience = $8, account_name = $9, league = $10', 
										[id, entry.rank, entry.dead, entry.online, entry.character.name, entry.character.level, entry.character.class,
											entry.character.experience, entry.account.name, ladder]);
	}
}

async function update_all() {
	
	var date_1 = new Date().toUTCString();
	// Update for Abyss

	var leagues = await client.query(`select * from poe_leagues`);
	leagues.rows.length;
	for(var j = 0; j < leagues.rows.length; j++)
	{
		console.log(leagues.rows[j].league_name);
		for(var i = 0; i < 15000; i+=200) {
			await update_ladder(leagues.rows[j].league_name, i);	
		}
	}

	// Update for Hardcore Abyss
	/*for(var i = 0; i < 15000; i+=200) {
		await update_ladder('Hardcore Abyss', i);	
	}*/
	var date_2 = new Date().toUTCString();
	
	console.log('start: ' + date_1);
	console.log('end: ' + date_2);
	
	
	await client.end();
}


update_all();


/*
client.query('select * from poe_ladder_data', (err, res) => {
	console.log(res.rows);
	client.end();
});
*/

