import {settings} from "./main"
import * as Progress from "progress"
import {getURL,log,info,error} from "./module_utils"
import {VideoWriter} from "./module_ffmpeg"

/**
 * download segments for rewind/archive
 * @param {string}        url            [description]
 * @param {string}        video_filename [description]
 * @param {number}        total_segment  [description]
 * @param {Progress|null} bar            [description]
 */
export function downloadSegments(url:string,
	video_filename:string,
	total_segment:number,
	bar:Progress|null,
	isLive:boolean):Promise<boolean|VideoWriter>
{
	let running=0
	let counter=0
	let ptr=0
	let buffers:Array<Buffer>=[]
	let stream=new VideoWriter(video_filename,settings.useFFMPEG)

	return new Promise(resolve=>
	{
		function downloadSegment()
		{
			while (running<settings.parallelDownloads && counter<total_segment)
			{
				let segment=counter

				running++
				counter++

				getURL(`${url}${segment}.ts`,null)
				.catch(err=>
				{
					error(`segment ${segment} fail with ${err}`)
					return null
				})
				.then(buffer=>
				{
					if (bar)
					{
						bar.tick()
					}

					buffers[segment]=buffer

					if (segment==ptr)
					{
						while (ptr in buffers)
						{
							stream.write(buffers[ptr],null)
							delete buffers[ptr] // free memory
							ptr++
						}
					}

					running--

					if (counter<total_segment)
					{
						downloadSegment()
					}
					else if (running==0)
					{
						if (isLive)
						{
							resolve(stream)
						}
						else
						{
							stream.close(err=>
							{
								resolve(err)
							})
						}
					}
				})
				.catch(err=>
				{
					error(err)
					return false
				})
			}
		}

		downloadSegment()
	})
}
