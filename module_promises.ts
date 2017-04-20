import * as fs from "fs"

/** returns Promise(exists:boolean,err) */

export function exists(filename:string):Promise<boolean>
{
	return new Promise((resolve,reject)=>
	{
		fs.exists(filename,resolve)
	})
}

/** returns Promise(null,err) */

export function writeFile(filename:string,data:string|Buffer)
{
	return new Promise((resolve,reject)=>
	{
		fs.writeFile(filename,data,err=>err?reject(err):resolve(err))
	})
}

/** returns Promise(null,err) */

export function rename(oldpath:string,newpath:string)
{
	return new Promise((resolve,reject)=>
	{
		fs.rename(oldpath,newpath,err=>err?reject(err):resolve(err))
	})
}
