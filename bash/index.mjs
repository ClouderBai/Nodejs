#!/usr/bin/env zx

// await $`cat package.json | grep name`

// let branch = await $`git branch --show-current`
// // await $`dep deploy --branch=${branch}`

// await Promise.all([
//   $`sleep 1; echo 1`,
//   $`sleep 2; echo 2`,
//   $`sleep 3; echo 3`,
// ])

// let name = 'foo bar'
// // await $`mkdir /tmp/${name}`
// let a = await $`echo ${name}`

let prefix = '/ecs/cmds'
await $`aws logs describe-log-groups --log-group-name-prefix /ecs/cmds`