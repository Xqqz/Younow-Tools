import {settings} from "./younow"
import {log,error} from "./module_utils"
import {FakeDB,openDB,isUsernameInDB,convertToUserDB} from "./module_db"
import * as _younow from "./module_younow"
import * as _async from "async"

export function cmdLive(users:string[])
{
	openDB()
	.then((db:DB)=>
	{
		_async.eachSeries(users,function(user,cbAsync)
		{
			user=_younow.extractUser(user)

			let p=isNaN(user)?_younow.getLiveBroadcastByUsername(user):_younow.getLiveBroadcastByUID(user)

			p.then(live=>
			{
				if (live.errorCode)
				{
					error(`${user} ${live.errorCode} ${live.errorMsg}`)
				}
				else if (live.state!="onBroadcastPlay")
				{
					error(`${live.state} ${live.stateCopy}`)
				}
				else
				{
					_younow.downloadThemAll(live)
					.then(result=>
					{
						log(`${live.profile} broadcast is over`)
						return true
					},error)
				}
			},error)
			.then(()=>
			{
				cbAsync()
			})
		})
	})
	.catch(error)


}
