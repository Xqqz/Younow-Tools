import * as _fs from "fs"
import * as _path from "path"

/** returns Promise(exists:boolean or err) */

export function exists(filename:string):Promise<boolean>
{
	return new Promise((resolve,reject)=>
	{
		_fs.exists(filename,resolve)
	})
}

/** returns Promise(data or err) */

export function readFile(filename:string)
{
	return new Promise((resolve,reject)=>
	{
		_fs.readFile(filename,(err,data)=>err?reject(err):resolve(data))
	})
}

/** returns Promise(null or err) */

export function writeFile(filename:string,data:string|Buffer)
{
	return new Promise((resolve,reject)=>
	{
		_fs.writeFile(filename,data,err=>err?reject(err):resolve(err))
	})
}

/** returns Promise(null or err) */

export function appendFile(filename:string,data:string|Buffer)
{
	return new Promise((resolve,reject)=>
	{
		_fs.appendFile(filename,data,err=>err?reject(err):resolve(err))
	})
}

/** returns Promise(null or err) */

export function rename(src:string,dst:string)
{
	return new Promise((resolve,reject)=>
	{
		_fs.rename(src,dst,err=>err?reject(err):resolve(err))
	})
}

export function moveTo(filename:string,path:string)
{
	let newpath=_path.join(path,filename)
	return rename(filename,newpath)
}

export function createDirectory(path:string):Promise<any>
{
	return exists(path)
	.then(bool=>
	{
		if (!bool)
		{
			return new Promise((resolve,reject)=>
			{
				_fs.mkdir(path,err=>err?reject(err):resolve(true))
			})
		}
	})
}

export async function setCurrentDirectory(path)
{
	process.chdir(path)
	return true
}

export async function getCurrentDirectory()
{
	return process.cwd()
}

export function timeout(timeout:number)
{
	return new Promise((resolve,reject)=>
	{
		setTimeout(resolve,timeout)
	})
}
