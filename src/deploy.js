/* eslint-disable no-unused-vars */
/* global process __dirname __filename */
const _ = require('lodash')
const moment = require('moment')
const fs = require('fs')
const fse = require('fs-extra')
const xls = require('node-xlsx')
const path = require('path')
const { loadFile } = require('../common/load_file')
const child_process = require('child_process')

async function fn(environment) {
	console.log('----------before-------------', )
	await new Promise(resolve => setTimeout(resolve,3e3))
	console.log('----------after-------------', )

	try {
		// Sync:
		try {

			/**
			 * generate version
			 */
			const config = fse.readJsonSync('./config.json')
			const {
				[environment]: {
					cluster,
					service,
					taskDefinitionName,
					version,
					relasedate,
					WORK_DIR,
					WORK_DIR_DIST,
					BUILD_DIR,
				}
			} = config;
			const Today = moment().format('YYYYMMDD');
			if(relasedate == Today) {
				config[environment].version = version + 1;
			} else {
				config[environment].version = 1;
				config[environment].relasedate = Today;
			}

			fse.writeJsonSync('./config.json', config)
			
			console.log(`---------- version ${version} ${environment}-------------`)

			const dockerTag = Today + version;
			/**
			 * update taskDefinition
			 */
			const taskDefinitionConfig = fse.readJsonSync(`${WORK_DIR}/taskDefinition.json`)

			taskDefinitionConfig.containerDefinitions[0].image = `968125615088.dkr.ecr.cn-northwest-1.amazonaws.com.cn/cmds-dev:${dockerTag}`

			fse.writeJsonSync(`${WORK_DIR}/taskDefinition.json`, taskDefinitionConfig)

			/**
			 * replace source code.
			 */
			fse.removeSync(WORK_DIR_DIST)
			console.log('removeSync success!')
			
			fs.mkdirSync(WORK_DIR_DIST)
			fse.copySync(WORK_DIR_DIST, BUILD_DIR)
			console.log('copySync success!')

			/**
			 * replace aws environment variables
			 */
			fse.copySync('C:/Users/ConnorBai/.aws/credentials-dev', 'C:/Users/ConnorBai/.aws/credentials')
			console.log('update AWS Access Key success!')

			const alias = child_process.execSync('aws iam list-account-aliases', { encoding: 'utf8', })	
			console.log('----------alias-------------', JSON.parse(alias.toString()).AccountAliases[0])
			// /**
			//  * docker build & push into AWS
			//  */
			// console.log('------------------------------  docker build & push into AWS  -------------------------------------')
			// const dockerResult = child_process.execSync(`docker build -t cmds-dev .`, { cwd: WORK_DIR })
			// console.log('docker build success ---------------', dockerResult.toString())

			// const loginAWS = child_process.execSync('aws ecr get-login-password --region cn-northwest-1 | docker login --username AWS --password-stdin 968125615088.dkr.ecr.cn-northwest-1.amazonaws.com.cn/cmds-dev')
			// console.log('loginAWS ---------------', loginAWS.toString())

			// const taskList = child_process.execSync(`aws  ecs  list-tasks --cluster ${cluster}`)
			// const currentTaskArn = JSON.parse(taskList.toString())
			// const currentTaskList = currentTaskArn.taskArns
			// const currentTaskuuids = currentTaskList.map(v => v.split('/').slice(-1)[0])
			// console.log('task list ---------------', currentTaskuuids)

			// const tag = child_process.execSync(`docker tag cmds-dev:latest 968125615088.dkr.ecr.cn-northwest-1.amazonaws.com.cn/cmds-dev:${dockerTag}`)
			// console.log('task list ---------------', tag.toString())

			// const dockerPushed = child_process.execSync(`docker push 968125615088.dkr.ecr.cn-northwest-1.amazonaws.com.cn/cmds-dev:${dockerTag}`)
			// console.log('docker Pushed success ---------------', dockerPushed.toString())

			// /**
			//  * definite task & run
			//  */
			// console.log('------------------------------  define task & run  -------------------------------------')
			// const taskDefinition = child_process.execSync('aws  ecs register-task-definition   --cli-input-json  file://taskDefinition.json', { cwd: WORK_DIR_DIST })
			// const taskVersion = JSON.parse(taskDefinition.toString()).taskDefinition.taskDefinitionArn.split(':').slice(-1)[0]
			// console.log('taskDefinition: ', JSON.parse(taskDefinition.toString()).taskDefinition.taskDefinitionArn)
			// console.log('taskVersion: ', taskVersion)

			// const updateTaskDefinition = child_process.execSync(`aws ecs update-service --cluster ${cluster} --service ${service} --task-definition ${taskDefinitionName}:${taskVersion}`)
			// console.log('update TaskDefinition success', updateTaskDefinition.toString())

			// if(currentTaskuuids.length == 1) {
			// 	const stopPreviousTask = child_process.execSync(`aws  ecs  stop-task --cluster ${cluster}  --task  ${currentTaskuuids[0]}`)
			// 	console.log('stop Previous Task success', stopPreviousTask.toString())
			// } else {
			// 	console.warn('--count of previous tasks is ', currentTaskuuids, ' should stop it manually.')
			// }


		} catch (err) {
			console.error(err)
		}

		
	} catch (err) {
		console.log(err);
	}
}



let environment = 'dev'
process.argv.forEach(v => {
	if(v == '--env=dev') environment = 'dev';
	if(v == '--env=qa') environment = 'qa';
})


fn(environment)