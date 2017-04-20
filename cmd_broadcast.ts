import {settings} from "./younow"
import {log,error} from "./module_utils"
import {FakeDB,openDB,isUsernameInDB,convertToUserDB} from "./module_db"
import * as _younow from "./module_younow"
import {downloadThemAll} from "./module_younow"
import * as _async from "async"

export function cmdBroadcast(bids:string[])
{
	openDB()
	.then((db:DB)=>
	{
		_async.eachSeries(bids,function(bid,cbAsync)
		{
			_younow.getArchivedBroadcast(bid)
			.then(archive=>
			{
				if (archive.errorCode)
				{
					error(`${bid} ${archive.errorCode} ${archive.errorMsg}`)
				}
				else
				{
					_younow.resolveUser(db,archive.userId)
					.then(user=>
					{
						if (user.errorCode)
						{
							error(`${bid} ${user.errorCode} ${user.errorMsg}`)
						}
						else
						{
							/** @todo created ? */
							return _younow.downloadArchive(user,bid as any,0)
						}
					})
					.catch(error)
				}
			})
			.catch(error)
			.then(cbAsync)
		})
	})
	.catch(error)
}
