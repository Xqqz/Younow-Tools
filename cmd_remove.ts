import {settings} from "./younow"
import * as younow from "./module_younow"
import {openDB,isUsernameInDB} from "./module_db"
import {log,info,error} from "./module_utils"
import * as _async from "async"

export function cmdRemove(users:string[])
{
	openDB()
	.then(db=>
	{
		_async.eachSeries(users,function(user:string,callback)
		{
			user=younow.extractUser(user)

			let dbuser=isUsernameInDB(db,user)

			if (dbuser)
			{
				log(`${user} removed from the db`)
				delete db[dbuser.userId]
			}
			else
			{
				error(`${user} is not in the db`)
				callback()
			}
		})
	})
	.catch(error)
}
