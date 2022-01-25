const _ = require('lodash')
const moment = require('moment')
const fs = require('fs')
const xls = require('node-xlsx')
const path = require('path')
const { loadFile } = require('./common/load_file')


try {

    const __selectAction__ = loadFile('m_sales_org.txt');

    console.log(__selectAction__.length)

	let sql = ''

	sql = `

	INSERT INTO "cmd_owner"."users"("username", "normalizedusername", "realname", "email", "normalizedemail", "emailconfirmed", "passwordhash", "securitystamp", "concurrencystamp", "phonenumber", "phonenumberconfirmed", "twofactorenabled", "lockoutend", "lockoutenabled", "accessfailedcount") VALUES ($1, $2, $3, $4, $5, DEFAULT, DEFAULT, DEFAULT, DEFAULT, $6, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT) RETURNING "id"
  

	`
	const parameters = 	[
		'L015691',
		'L015691',
		'Jingjing Zhao',
		'ZHAO_JINGJING@NETWORK.LILLY.COM',
		'ZHAO_JINGJING@NETWORK.LILLY.COM',
		'+'
	]
	
	
	sql = sql.replace(/\$\d+/g, (value) => {
		value = value.slice(1)
		console.log('----------value-------------', parameters[value - 1])
		return typeof parameters[value - 1] === 'string' ? `'${parameters[value - 1]}'` : parameters[value - 1]
	})

	console.log('----------sql-------------', sql)












} catch (err) {
    console.log(err);
}