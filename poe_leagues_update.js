const rp = require("request-promise-native");
const { Client } = require('pg');
const client = new Client({
	host: 'localhost',
	port: 5432,
	user: 'pi',
	password: 'raspberry',
	database: 'poe_ladder_data'
});

client.connect();

async function update_leagues() {	
	var result = await rp({
		url:'http://api.pathofexile.com/leagues?type=main', 
		json: true
	});
		
	var resp = result;
	var result = await client.query('delete from poe_leagues');
	for(var entry of resp) {
		if(	(entry.id !== "Standard") && 
			(entry.id !== "Hardcore") && 
			(entry.id !== "SSF Standard") && 
			(entry.id !== "SSF Hardcore")) {
			console.log("updating " + entry.id);
			
			//console.log(`insert into poe_leagues values('${entry.id}')`);
			
			var result = await client.query(`insert into poe_leagues values('${entry.id}')`);
		}
	}
}

async function update() {
	await update_leagues();

	var result = await client.query('select * from poe_leagues');
	console.log(result.rows.length);

	await client.end();

}

update();