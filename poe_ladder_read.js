
const { Client } = require('pg');
const client = new Client({
	host: 'localhost',
	port: 5432,
	user: 'pi',
	password: 'raspberry',
	database: 'poe_ladder_data'
});


client.connect();


async function ladder_read() {
	var result = await client.query('select * from poe_ladder_data order by _id');
	console.log(result.rows);
	await client.end();
}

ladder_read();