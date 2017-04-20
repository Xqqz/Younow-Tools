import * as _younow from "./module_younow"
import {log,error,getURL} from "./module_utils"
import * as _async from "async"

export async function cmdAPI()
{
	_younow.getTrendings()
	.then(async trendings=>
	{
		if (trendings.errorCode)
		{
			throw new Error("Fatal")
		}

		log(`getTrendings result:${trendings.errorCode} users:${trendings.trending_users.length}`)

		let user=trendings.trending_users[0]
		let tag=trendings.trending_tags[0]
		let live=await _younow.getLiveBroadcastByUID(user.userId)

		if (live.errorCode)
		{
			throw new Error("Fatal")
		}

		log(`getLiveBroadcastByUID:${live.errorCode?live.errorMsg:"OK"}`)
		log(`getLiveBroadcastByUsername:${await _younow.getLiveBroadcastByUsername(user.profile).then(x=>x.errorCode?x.errorMsg:"OK",error)}`)
		log(`getUserInfoByUID:${await _younow.getUserInfoByUID(user.userId).then(x=>x.errorCode?x.errorMsg:"OK",error)}`)
		log(`getTagInfo:${await _younow.getTagInfo(tag.tag).then(x=>x.errorCode?x.errorMsg:"OK",error)}`)
		log(`getMoments:${await _younow.getMoments(user.userId,0).then(x=>x.errorCode?x.errorMsg:"OK",error)}`)
		log(`getPlaylist:${await _younow.getPlaylist(user.broadcastId).then(x=>x.length?"OK":"Error",error)}`)
		//log(`downloadThumbnail:${await _younow.downloadThumbnail(user,live).then(x=>x?"OK":"Error",error)}`)
		//log(`saveJSON:${await _younow.saveJSON(user,live).then(x=>x?"OK":"Error",error)}`)
		//log(`downloadLiveStream:${await _younow.downloadLiveStream(live).then(x=>x?"OK":"Error",error)}`)
	})
	.catch(error)
}
