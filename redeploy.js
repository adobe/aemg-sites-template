/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
const fs = require('fs');
let rawPackageJSON = fs.readFileSync('./package.json');
let packageJSON = JSON.parse(rawPackageJSON);

const version = packageJSON.version;
let [major,minor,patch] = packageJSON.version.split('.');
const newPatch = parseInt(patch) + 1;
const newVersion = [major,minor,newPatch].join('.').toString()

packageJSON.version = newVersion; 
packageJSON.scripts.deploy = packageJSON.scripts.deploy.replace(version,newVersion);
packageJSON.scripts.undeploy = packageJSON.scripts.undeploy.replace(version,newVersion);

fs.writeFileSync('./package.json', JSON.stringify(packageJSON, null, 2));