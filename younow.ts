#!/usr/bin/env node

import * as _fs from "fs"
import * as _path from "path"
import * as _child from "child_process"
import * as _cli from "commander"
import * as _async from "async"

let pkg=require("../package.json")

export var settings:Settings=
{
	version:pkg.version,
	pathDB:null,
	pathDownload:null,
	pathMove:null,
	dbBroadcasters:null,
	pathConfig:_path.join(process.env.APPDATA||process.env.HOME,"YounowTools"),
	parallelDownloads:null
}

import * as _younow from "./module_younow"
import {log,info,debug,dump,error,formatDateTime,prettify,setVerbose} from "./module_utils"
import {FakeDB,openDB,isUsernameInDB,convertToUserDB} from "./module_db"

import {cmdAdd} from "./cmd_add"
import {cmdAnnotation} from "./cmd_annotation"
import {cmdAPI} from "./cmd_api"
import {cmdIgnore} from "./cmd_ignore"
import {cmdRemove} from "./cmd_remove"
import {cmdScan} from "./cmd_scan"
import {cmdResolve,cmdSearch} from "./cmd_search"
import {cmdVCR} from "./cmd_vcr"
import {cmdLive} from "./cmd_live"
import {cmdBroadcast} from "./cmd_broadcast"

enum CommandID
{
	add,
	remove,
	ignore,
	search,
	resolve,
	annotation,
	vcr,
	live,
	broadcast,
	api,
	fixdb,
	scan,
	debug
}

if (!_fs.existsSync(settings.pathConfig))
{
	log("config path",settings.pathConfig)
	_fs.mkdirSync(settings.pathConfig)
}

_cli
.version(settings.version)
.option("-v, --verbose","verbosity level (-v -vv -vvv)",((x,v)=>v+1),0)
.option("--db <path>","database filename (default ./broadcasters.json")
.option("--dl <path>","download path (default current)")
.option("--mv <path>","at the end MOVE files to this path (default do nothing)")
.option("-t --timer <minutes>","scan interval (default 5 minutes)")
.option("-l --limit <number>","number of parallel downloads for a stream (default 5)")
//.option("-f --format <format","change video format container mkv/mp4 without re-encoding (default ts)")

_cli
.command("add <users...>")
.description("add user(s) by username, uid, URL to db")
.action((users,cmd)=>commandId=CommandID.add)

_cli
.command("remove <users...>")
.description("remove users(s) by username, uid, URL from db")
.action((users,cmd)=>commandId=CommandID.remove)

_cli
.command("ignore <users...>")
.description("ignore/unignore users(s) by username, uid, URL from db")
.action((users,cmd)=>commandId=CommandID.ignore)

_cli
.command(`note <user> [text]`)
.description(`add a "note" (quoted) to a user in db`)
.action((users,cmd)=>commandId=CommandID.annotation)

_cli
.command("search <patterns...>")
.description("search in db for matching pattern(s)")
.action((users,cmd)=>commandId=CommandID.search)

_cli
.command("resolve <users...>")
.description("resolve user(s) online")
.action((users,cmd)=>commandId=CommandID.resolve)

_cli
.command("vcr <users...>")
.description("download archived broadcast if available")
.action((users,cmd)=>commandId=CommandID.vcr)

_cli
.command("live <users...>")
.description("download live broadcast from the beginning")
.action((users,cmd)=>commandId=CommandID.live)

_cli
.command("broadcast <broadcastId...>")
.description("download broadcastId ")
.action((users,cmd)=>commandId=CommandID.broadcast)

_cli

.command("scan <config_file>")
.description("scan live broadcasts")
.action((users,cmd)=>commandId=CommandID.scan)

_cli
.command("api")
.description("api compatibility test (advanced)")
.action((users,cmd)=>commandId=CommandID.api)

_cli
.command("fixdb")
.description("normalize db informations (advanced)")
.action((users,cmd)=>commandId=CommandID.fixdb)

_cli
.command ("debug")
.description("debug tool ignore this")
.action(()=>commandId=CommandID.debug)

// list
// info user(s)

let commandId=-1
_cli.parse(process.argv)
let params:any=_cli.args[0] // string|string[]

setVerbose(_cli["verbose"]||0)

settings.pathDB=_cli["db"]||_path.join(settings.pathConfig,"broadcasters.txt")
settings.pathDownload=_cli["dl"]||"."
settings.pathMove=_cli["mv"]||null
settings.parallelDownloads=_cli["limit"]||5

info(prettify(settings))

if (settings.pathMove)
{
	_fs.existsSync(settings.pathMove)
}

_fs.existsSync(settings.pathDownload)

/*

	main

*/

switch (commandId)
{
	case CommandID.scan:
	cmdScan(params,_cli["timer"]*60 || 5*60*60)
	break

	case CommandID.search:
	cmdSearch(params)
	break

	case CommandID.resolve:
	cmdResolve(params)
	break

	case CommandID.annotation:
	cmdAnnotation(params,_cli.args[1]||"---")
	break

	case CommandID.vcr:
	cmdVCR(params)
	break

	case CommandID.live:
	cmdLive(params)
	break

	case CommandID.broadcast:
	cmdBroadcast(params)
	break

	case CommandID.api:
	cmdAPI()
	break

	case CommandID.fixdb:

	/**	normalize db */
	openDB()
	.then((db)=>
	{
		_fs.rename(settings.pathDB,settings.pathDB+".tmp",err=>
		{
			if (err)
			{
				error(err)
			}
			else
			{
				for (let user in db)
				{
					if (!isNaN(user))
					{
						db[user]=convertToUserDB(user as any,db[user] as any)
					}
				}
			}
		})
	})
	.catch(error)

	break

	case CommandID.remove:
	cmdRemove(params)
	break

	case CommandID.add:
	cmdAdd(params)
	break

	case CommandID.ignore:
	cmdIgnore(params)
	break

	case CommandID.debug:
	log(pkg)
	require("./cmd_debug").cmdDebug(params)
	break

	default:
	log(`
Younow-tools version ${settings.version}

As an open source project use it at your own risk. Younow can break it down at any time.

Report any bug or missing feature at your will.

If you like this software, please consider a Ƀitcoin donation to 34fygtqeAP62xixpTj6w9XTtfKmqjFqpo6`)
	_cli.help()
}

