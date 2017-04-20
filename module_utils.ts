import * as https from "https"
import * as request from "request"
import * as _fs from "fs"

// this is module

var fix:any=https

fix.globalAgent.keepAlive=true
fix.globalAgent.keepAliveMsecs=10000
fix.globalAgent.maxSockets=100

var get=request.defaults(
{
	gzip:true,
	headers:
	{
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:52.0) Gecko/20100101 Firefox/52.0",
		"Accept-Language":"en-us, en; q=0.5"
	},
	encoding:null
})

enum Verbosity
{
	log,	// basic
	info,	// blue filters
	debug,	// green network
	dump	// red json
}

export var verbose=0

export function setVerbose(level)
{
	verbose=level
}

export const log=console.log

export function info(...args)
{
	if (verbose>=Verbosity.info)
	{
		log("\u001b[94m"+args.join(" ")+"\u001b[39m")
	}
}
export function debug(...args)
{
	if (verbose>=Verbosity.debug)
	{
		log("\u001b[92m"+args.join(" ")+"\u001b[39m")
	}
}

export function dump(o)
{
	if (verbose>=Verbosity.dump)
	{
		log(o)
	}
}

export function error(err)
{
	process.stdout.write(`\u001b[91m`)

	if (err.stack)
	{
		log(err)
	}
	else
	{
		log(err)
	}

	process.stdout.write(`\u001b[39m`)
	return null
}

export function prettify(obj):string
{
	return JSON.stringify(obj,null,"\t").replace(/,|{|}|\"/g,"")
}

/**
 * async getURL
 *
 * @params {string} url
 * @params {string?} encoding string/json/null
 * @return {any}
 */

export function getURL(url:string,encoding:string="json"):Promise<any>
{
	return new Promise(function(resolve,reject)
	{
		if (!url || url.length==0)
		{
			error(`getURL ${url}`)
			reject(0)
			return
		}

		debug(`NET:${url} as ${encoding}`)

		get(url,function(err,res,body:Buffer)
		{
			// res.headers.connection='keep-alive'

			if (err)
			{
				error(`NET ${err} ${url}`)
				reject(new Error(err.message))
			}
			else if (res.statusCode!=200)
			{
				debug(`NET:statusCode=${res.statusCode}`)
				reject(res.statusCode)
			}
			else
			{
				debug(`NET:statusCode:${res.statusCode} Type:${typeof body}`)

				var data:any

				try
				{
					switch(encoding)
					{
						case "json":
						data=JSON.parse(body.toString())
						dump(data)
						break

						case null:
						data=body
						break

						default:
						data=body.toString(encoding)
						dump(data)
					}

					resolve(data)
				}
				catch(e)
				{
					error(`NET:encoding ${e}`)
					reject(1)
				}
			}
		})

	})
}

export function formatDate(date:Date):string
{
	var d = date.getDate();
	var m = date.getMonth() + 1;
	var y = date.getFullYear();
	return '' + y + '.' + (m < 10 ? '0' + m : m) + '.' + (d < 10 ? '0' + d : d);
}

export function formatTime(date:Date):string
{
	var h=date.getHours()
	var m=date.getMinutes()
	var s=date.getSeconds()

	return `${(h<10?"0"+h:h)}-${(m<10?"0"+m:m)}-${(s<10?"0"+s:s)}`
}

export function formatDateTime(date:Date):string
{
	return formatDate(date)+"_"+formatTime(date)
}
