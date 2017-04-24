import * as fs from "fs"
import * as child from "child_process"
import {log,info,error} from "./module_utils"

/**
 * [VideoWriter description]
 * @type {[type]}
 */
export class VideoWriter
{
	private stream:fs.WriteStream=null
	private ffmpeg:child.ChildProcess=null
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
				this.ffmpeg=child.spawn("ffmpeg",params,
				{
					stdio:["pipe",process.stdout,"pipe"]
				})

				//this.ffmpeg.stdout.on("data",data=>log(data.toString()))
				this.ffmpeg.stderr.on("data",data=>error(data.toString()))

				this.ffmpeg.on("close",result=>
				{
					this.ffmpeg=null
					info("FFMPEG close",result)
				})

				this.ffmpeg.on("error",err=>
				{
					this.ffmpeg=null
					error(err)
				})

				this.ffmpeg.on("exit",result=>
				{
					info("FFMPEG exit",result)
					this.ffmpeg=null
				})
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
		if (this.ffmpeg)
		{
			this.ffmpeg.stdin.end(callback)
		}
		else if (this.stream)
		{
			this.stream.end(callback)
		}
	}
	/**
	 * [write description]
	 * @param {Buffer}   data     [description]
	 * @param {Function} callback [description]
	 */
	write(data:Buffer,callback:Function)
	{
		if (this.ffmpeg)
		{
			this.ffmpeg.stdin.write(data,callback)
		}
		else if (this.stream)
		{
			this.stream.write(data,callback)
		}
	}
}
