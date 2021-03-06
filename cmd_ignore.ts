import {settings} from "./main"
import {log,error} from "./module_utils"
import {openDB,isUsernameInDB,convertToUserDB} from "./module_db"
import * as younow from "./module_younow"
import * as _async from "async"

export function cmdIgnore(users:string[])
{
	openDB()
	.then(db=>
	{
		_async.eachSeries(users,function(user,callback)
		{
			user=younow.extractUser(user)

			let userdb=isUsernameInDB(db,user)

			if (userdb)
			{
				userdb.ignore=!userdb.ignore
				db[userdb.userId]=userdb // writeDB
				log(`${userdb.profile} in the db has been ${userdb.ignore?"ignored":"unignored"}`)
				callback()
			}
			else
			{
				younow.resolveUser(db,user)
				.then(function(infos:Younow.UserInfo)
				{
					if (infos.errorCode)
					{
						error(`${user} ${infos.errorCode} ${infos.errorMsg}`)
						callback()
					}
					else
					{
						let userdb=convertToUserDB(infos.userId,infos)
						userdb.ignore=true

						db[infos.userId]=userdb

						log(`${infos.profile} has been ignored and added to the db`)
						callback()
					}
				})
				.catch(err=>
				{
					error(err)
					callback()
				})
			}
		})
	})
	.catch(error)
}
