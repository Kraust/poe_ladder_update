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

async function sleep(millis) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () { resolve(); }, millis);
    });
}


async function get_items(account_name, character_name) {	
	var result = await rp({
		uri: 'http://www.pathofexile.com/character-window/get-items', 
		json: true,
		method: 'POST',
		form: {
			character: character_name,
			accountName: account_name

		},
	}).catch(function(error) {
		console.log(error.error);
		return 0;
	});

	var data = result;
	
	//var data_s = JSON.stringify(data);
	var id = account_name + character_name;
	var result = await client.query('insert into poe_character_items values($1, $2, $3, $4) on conflict (_id) do ' +
									'update set account = $1, character = $2, items = $3', 
									[account_name, character_name, data, id]);
}

// Accessing http://www.pathofexile.com/character-window/get-items is rate limited.
// Works with a 1000ms pause between calls.
async function update() {
	var result = await client.query("select * from poe_ladder_data where (league = 'Abyss') order by rank");
	//console.log(result);

	var date_1 = new Date().toUTCString();

	for(var i = 0; i < result.rows.length; i++)
	{
		console.log(i + " : " + result.rows[i].account_name + " " + result.rows[i].name);
		await get_items(result.rows[i].account_name, result.rows[i].name);
		await sleep(1000);
	}

	var date_2 = new Date().toUTCString();
	
	console.log('start: ' + date_1);
	console.log('end: ' + date_2);

	await client.end();
}

async function retrieve_skills(skill) {
	// select * from poe_character_items where items @> '{"items": [{ "socketedItems": [{"typeLine": "Kinetic Blast"}]}]}';
	console.log(`select * from poe_character_items where items @> '{"items": [{ "socketedItems": [{"typeLine": "` + skill + `"}]}]}'`);
	var result = await client.query(`select * from poe_character_items where items @> '{"items": [{ "socketedItems": [{"typeLine": "` + skill + `"}]}]}'`);

	console.log(result);


	var result = await client.query("select * from poe_character_items");
	//console.log(JSON.stringify(result.rows[2].items));

	await client.end();
}

async function character_skills(league, character, support) {
	// select * from poe_character_items where items @> '{"items": [{ "socketedItems": [{"typeLine": "Kinetic Blast"}]}]}';
	var result = await client.query(`select * from poe_character_items where items @> ` +
									`'{"items": [{ "socketedItems": [{"support": "${support}"}]}], "character": { "name": "${character}"}, "league": "${league}}'`);

	console.log(result);


	var result = await client.query("select * from poe_character_items");
	//console.log(JSON.stringify(result.rows[2].items));

	await client.end();
}

update();

//retrieve_skills("Assassin\'s Mark");

//character_skills("Abyss", "Cool_PleaseBuffRory", false);