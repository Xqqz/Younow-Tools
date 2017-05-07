import * as younow from "./module_younow"
import * as database from "./module_db"
import {settings} from "./main"
import {log,error,prettify,getURL} from "./module_utils"

interface LiveBroadcasters
{
	[index:number]:
	{
		status:number
	}
}

export async function cmdFollow(users:string[])
{
	database.openDB()
	.then(db=>
	{
		return Promise.all(users.map(user=>
		{
			return younow.resolveUser(db,younow.extractUser(user))
			.then(dbuser=>
			{
				if (dbuser.errorCode)
				{
					throw `${user} ${dbuser.errorCode} ${dbuser.errorMsg}`
				}

				return dbuser
			})
		}))
	})
	.then((curators:Array<DBUser>)=>
	{
		let liveBroadcasters:LiveBroadcasters={}

		async function monitor()
		{
			Promise.all(curators.map(curator=>
			{
				return getURL(`https://api.younow.com/php/api/channel/getLocationOnlineFansOf/channelId=${curator.userId}/numberOfRecords=50`)
				.catch(err=>
				{
					error(err)
					return null
				})
			}))
			.then((curatorsFollowed:Younow.FollowedOnline[])=>
			{
				let old=liveBroadcasters

				liveBroadcasters={}

				for (let curatorFollowed of curatorsFollowed)
				{
					if (curatorFollowed)
					{
						for (let followed of curatorFollowed.users)
						{
							let userId=followed.userId

							if (userId in old)
							{
								liveBroadcasters[userId]=old[userId]
							}
							else
							{
								liveBroadcasters[userId]={status:null}
							}

							if (followed.status!=liveBroadcasters[userId].status)
							{
								liveBroadcasters[userId].status=followed.status

								switch (followed.status)
								{
									case Younow.FollowedStatus.watching:

									log(`${followed.profile} is watching ${followed.channelName}`)
									break

									case Younow.FollowedStatus.broadcasting:

									log(`${followed.profile} is broadcasting`)

									younow.getLiveBroadcastByUID(userId)
									.then(liveBroadcast=>
									{
										if (liveBroadcast.errorCode==0)
										{
											return younow.downloadThemAll(liveBroadcast)
											.then(([thumb,video,json])=>
											{
												log(`${followed.profile} is over json : ${thumb} image : ${video} video :${json}`)
											})
										}
									})
									.catch(error)
									break

									default:
									error(`Status:${followed.status}`)
								}
							}
						}
					}
				}
			})
			.catch(error)
		}

		setInterval(monitor,settings.timeout*Utils.Time.MINUTE)
		monitor()
	})
	.catch(error)
}
