import * as fs from "fs"
import {spawn,ChildProcess} from "child_process"
import {log,info,error} from "./module_utils"

/**
 * [VideoWriter description]
 * @type {[type]}
 */
export class VideoWriter
{
	private stream:fs.WriteStream=null
	private ffmpeg:ChildProcess=null
	private filename:string=null
	/**
	 * [constructor description]
	 * @param {string} filename  [description]
	 * @param {string} useFFMPEG [description]
	 */
	constructor (filename:string,useFFMPEG:string)
	{
		this.filename=filename

		if (useFFMPEG)
		{
			let params=`-i - ${useFFMPEG} ${filename}`.split(" ")

			info(`FFMPEG : ${params.join(" ")}`)

			try
			{
				this.ffmpeg=spawn("ffmpeg",params)

				/** @todo */

				this.ffmpeg.on("error",err=>
				{
					this.ffmpeg=null
					error(err)
				})

				this.ffmpeg.on("close",result=>
				{
					this.ffmpeg=null
					info("FFMPEG close",result)
				})

				this.ffmpeg.on("exit",code=>
				{
					this.ffmpeg=null
					if (code)
					{
						error(`FFMPEG exit ${code}`)
					}
				})

				this.ffmpeg.stderr.on("data",data=>
					error(data.toString()))
			}
			catch(e)
			{
				error(e)
			}
		}
		else
		{
			this.stream=fs.createWriteStream(filename)
		}
	}
	/**
	 * [close description]
	 * @param {Function} callback [description]
	 */
	close(callback:Function)
	{
		try
		{
			if (this.ffmpeg)
			{
				this.ffmpeg.stdin.end(callback)
			}
			else if (this.stream)
			{
				this.stream.end(callback)
			}
		}
		catch(e)
		{
			error(e)
		}
	}
	/**
	 * [write description]
	 * @param {Buffer}   data     [description]
	 * @param {Function} callback [description]
	 */
	write(data:Buffer,callback:Function)
	{
		try
		{
			if (this.ffmpeg && data)
			{
				this.ffmpeg.stdin.write(data,callback)
			}
			else if (this.stream && data)
			{
				this.stream.write(data,callback)
			}
		}
		catch(e)
		{
			error(e)
		}
	}
}
