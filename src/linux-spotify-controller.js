import child_process from 'child_process';
import debug from 'debug';

var exec = child_process.exec;
var log = debug('linux-spotify-controller');

const findWindowCmd = 'xdotool search --name spotify.*linux';

const findPID = 'ps -la | grep spotify | grep -v 00:00:00 | awk \'{print $4}\'';
const findWindowsByPID = 'xdotool search --pid {{PID}} | while read -r line ; do echo $line$\'\\t\'$(xdotool getwindowname $line); done | grep Spotify.*Linux | awk \'{print $1}\'';
const sendKeyCommand = 'xdotool key --window {{WID}} {{CMD}}';

export default class LinuxSpotifyController {
	constructor (cb) {
		let self = this;
		this.promise = new Promise((resolve, reject) => {
			let errResolve = (err) => {
				if (err){
					reject(err);
					return;
				}
			};
			
			getProcessPID().then((pid) => {
				self.pid = pid;
				
				getX11Window(pid).then((wid) => {
					self.wid = wid;
					
					resolve(self);
				}, errResolve);
				
			}, errResolve);
			
		});
		
		return self;
	};
	
	pause (cb){
		return new Promise((resolve, reject) => {
			log('pause -> command: %s', sendKeyCommand.replace('{{WID}}', this.wid).replace('{{CMD}}', 'space'));
			exec(sendKeyCommand.replace('{{WID}}', this.wid).replace('{{CMD}}', 'space'), (err, stdOut, stderr) => {
				log('pause -> err: %o', err);
				log('pause -> stdOut: %o', stdOut);
				log('pause -> stderr: %o', stderr);
				
				if (err){
					reject(err);
					return;
				}		
				resolve();
			});
		});
	}
}


function getX11Window(pid){
	
	log('getX11Window -> command: %s', findWindowsByPID.replace('{{PID}}', pid));
	return new Promise((resolve, reject) => {
		exec(findWindowsByPID.replace('{{PID}}', pid), (err, stdOut, stderr) => {
			log('getX11Window -> err: %o', err);
			log('getX11Window -> stdOut: %o', stdOut);
			log('getX11Window -> stderr: %o', stderr);
			
			if (err){
				reject(err);
				return;
			}
			
			let result = cleanStdOut(stdOut);			
			
			if (result.length === 0){
				reject('X11 window ID not found, Spotify not running?');
				return;
			}
			
			resolve(result[0]);
			
		});
	});
	
}

function getProcessPID(){
	
	log('getProcessPID -> command: %s', findPID);
	return new Promise((resolve, reject) => {
		exec(findPID, (err, stdOut, stderr) => {
			log('getProcessPID -> err: %o', err);
			log('getProcessPID -> stdOut: %o', stdOut);
			log('getProcessPID -> stderr: %o', stderr);
			if (err){
				reject(err);
				return;
			}
			
			let result = cleanStdOut(stdOut);			
			
			if (result.length === 0){
				reject('Spotify PID not found, not running?');
				return;
			}
			
			resolve(result[0]);
		});
	});
	
}

function cleanStdOut(std){
	let result = std.split('\n');
		
	//cleanning the array
	let temp = [];
	for(let i of result){
		i && i !== '' && temp.push(i);
	}
	return temp;
}
