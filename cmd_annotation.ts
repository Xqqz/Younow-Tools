import {settings} from "./younow"
import {log,error} from "./module_utils"
import {openDB,isUsernameInDB,convertToUserDB} from "./module_db"
import * as younow from "./module_younow"
import * as _async from "async"

export function cmdAnnotation(user:string,note:string)
{
	openDB()
	.then(db=>
	{
		user=younow.extractUser(user)

		let userdb=isUsernameInDB(db,user)

		if (userdb)
		{
			userdb.comment=note
			db[userdb.userId]=userdb

			log(`${userdb.profile} in db annotated as ${note}`)
		}
		else
		{
			younow.resolveUser(db,user)
			.then(function(infos)
			{
				if (infos.errorCode)
				{
					error(`${user} ${infos.errorCode} ${infos.errorMsg}`)
				}
				else
				{
					let userdb=convertToUserDB(infos.userId,infos as Younow.UserInfo)
					userdb.comment=note

					db[infos.userId]=userdb

					log(`${infos.profile} added and annotated as ${note}`)
				}
			})
			.catch(err=>
			{
				error(err)
			})
		}
	})
	.catch(error)
}
