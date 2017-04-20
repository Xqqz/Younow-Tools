import {settings} from "./younow"

import {log,info,debug,error} from "./module_utils"
import * as _fs from "fs"

export class FakeDB
{
	private _filename
	private _title

	constructor()
	{
	}

	/**
	 *
	 * @function	open
	 * @desc load or create db
	 * @return Promise<DB>
	 *
	 */
	open(filename:string,title:string):Promise<DB>
	{
		this._filename=filename
		this._title=title
		return new Promise((resolve,reject)=>
		{
			_fs.exists(filename,exists=>
			{
				if (exists)
				{
					_fs.readFile(filename,(err,data:Buffer)=>
					{
						if (err)
						{
							reject(err)
						}
						else
						{
							this.parse(data.toString().split("\n"))

							resolve(this.proxify())
						}
					})
				}
				else
				{
					_fs.appendFile(filename,`# ${title}\n`,(err)=>
					{
						err?reject(err):resolve(this.proxify())
					})
				}
			})
		})
	}

	proxify()
	{
		return new Proxy(this,
		{
			deleteProperty(obj,key)
			{
				if (key in obj)
				{
					_fs.appendFile((obj as FakeDB)._filename,`-${key}\n`,err=>err)
					return delete obj[key]
				}
				else
				{
					return true
				}
			},
			set(obj,key,value,whatever)
			{
				_fs.appendFile((obj as FakeDB)._filename,`+${key}:${JSON.stringify(value)}\n`,err=>err)
				return obj[key]=value
			}
		})
	}

	/**
	 *
	 * @function parse db
	 *
	 * @return Object
	 *
	 */
	parse(lines:string[])
	{
		let db=this

		for (let line of lines)
		{
			let m=line.match(/([+-@])(\w+):*(.*)/)

			if (m)
			{
				switch (m[1])
				{
					case "@":
					if (!db[m[2]])
					{
						db[m[2]]=[]
					}
					db[m[2]].push(JSON.parse(m[3]))
					break

					case "+":
					db[m[2]]=JSON.parse(m[3])
					break;

					case "-":
					if (m[2] in db)
					{
						delete db[m[2]]
					}
					break;
				}
			}
		}
	}
}

export function openDB()
{
	return new FakeDB().open(settings.pathDB,"Broadcasters")
}

/** Search profile in the db
 *
 * @param {string|number}  profile/profileUrlString or userId
 * @return {DBUser|null}
 */
export function isUsernameInDB(db:DB,user:string|number):DBUser|null
{
	if (isNaN(user as any))
	{
		var regex=new RegExp("^"+user+"$","i")

		/** @todo */

		for (let i of Object.keys(db))
		{
			let dbuser=db[i]

			let profile=dbuser.profile

			if (profile)
			{
				if (profile.match(regex))
				{
					return dbuser
				}
			}
		}

		return null
	}
	else
	{
		return db[user]||null
	}
}
/** Normalize user info
 *
 * @param {Younow.UserInfo}
 * @return {DBUser}
 *
 */
export function convertToUserDB(uid:number,user:Younow.UserInfo):DBUser
{
	let dbuser:DBUser=
	{
		ignore:(user as any).ignore||false,
		comment:(user as any).comment||"---",

		profile: user.profile,
		userId: user.userId||uid,

		firstName: user.firstName,
		lastName: user.lastName,

		country: user.country||"XX",
		state: user.state,
		city: user.city,

		description: user.description,

		twitterId: user.twitterId,
		twitterHandle: user.twitterHandle,
		youTubeUserName: user.youTubeUserName,
		youTubeChannelId: user.youTubeChannelId,
		youTubeTitle: user.youTubeTitle,
		googleId: user.googleId,
		googleHandle: user.googleHandle,
		facebookId: user.facebookId,
		instagramId: user.instagramId,
		instagramHandle: user.instagramHandle,
		facebookPageId: user.facebookId,
		websiteUrl: user.websiteUrl,

		dateCreated: user.dateCreated,
		locale: user.locale,
		language: user.language,
		tumblrId: user.tumblrId
	}

	for (let i in dbuser)
	{
		if (dbuser[i]==="" || dbuser[i]===null || dbuser[i]===undefined)
		{
			delete dbuser[i]
		}
	}

	return dbuser
}
