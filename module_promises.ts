import * as fs from "fs"

/** returns Promise(exists:boolean or err) */

export function exists(filename:string):Promise<boolean>
{
	return new Promise((resolve,reject)=>
	{
		fs.exists(filename,resolve)
	})
}

/** returns Promise(data or err) */

export function readFile(filename:string)
{
	return new Promise((resolve,reject)=>
	{
		fs.readFile(filename,(err,data)=>err?reject(err):resolve(data))
	})
}

/** returns Promise(null or err) */

export function writeFile(filename:string,data:string|Buffer)
{
	return new Promise((resolve,reject)=>
	{
		fs.writeFile(filename,data,err=>err?reject(err):resolve(err))
	})
}

/** returns Promise(null or err) */

export function appendFile(filename:string,data:string|Buffer)
{
	return new Promise((resolve,reject)=>
	{
		fs.appendFile(filename,data,err=>err?reject(err):resolve(err))
	})
}

/** returns Promise(null or err) */

export function rename(oldpath:string,newpath:string)
{
	return new Promise((resolve,reject)=>
	{
		fs.rename(oldpath,newpath,err=>err?reject(err):resolve(err))
	})
}

export function mkdir(path:string)
{
	return new Promise((resolve,reject)=>
	{
		fs.mkdir(path,err=>err?reject(err):resolve(err))
	})
}

export function timeout(timeout:number)
{
	return new Promise((resolve,reject)=>
	{
		setTimeout(resolve,timeout)
	})
}
