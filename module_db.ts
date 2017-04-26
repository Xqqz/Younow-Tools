import {settings} from "./younow"

import {log,info,debug,error} from "./module_utils"
import * as _fs from "fs"
import * as dos from "./module_promises"

export class FakeDB
{
	private filename
	private title
	private db:any=
	{
		self:this
	}
	private proxy=null

	/**
	 * Returns a proxified ref to this
	 * @param  {string}       filename [description]
	 * @param  {string}       title    [description]
	 * @return {Promise<any>}          [description]
	 */
	open(filename:string,title:string):Promise<any>
	{
		this.filename=filename
		this.title=title

		return dos.exists(filename)
		.then(exists=>
		{
			if (exists)
			{
				return dos.readFile(filename)
				.then(data=>
				{
					this.parse(this.db,data.toString().split("\n"))
					this.proxy=this.proxify(this.db)
					return this.proxy
				})
			}
			else
			{
				return dos.appendFile(filename,`# ${title}\n`)
				.then(err=>
				{
					this.proxy=this.proxify(this.db)
					return this.proxy
				})
			}
		})
	}

	update()
	{
		dos.readFile(this.filename)
		.then((data:Buffer)=>
		{
			this.parse(this.db,data.toString().split("\n"))
			info(`DB broadcasters ${Object.keys(this.db).length}`)
		})
		.catch(error)
	}

	/** @todo ugly */

	proxify(obj)
	{
		return new Proxy(obj,
		{
			deleteProperty(target,key)
			{
				if (key in target)
				{
					_fs.appendFile(target.self.filename,`-${key}\n`,err=>err)
					return delete target[key]
				}
				else
				{
					return true
				}
			},
			set(target,key,value,recv)
			{
				_fs.appendFile(target.self.filename,`+${key}:${JSON.stringify(value)}\n`,err=>err)
				return target[key]=value
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
	parse(db,lines:string[])
	{
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
