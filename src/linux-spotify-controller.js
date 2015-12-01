import child_process from 'child_process';
import debug from 'debug';

var exec = child_process.exec;
var log = debug('linux-spotify-controller');

const findWindowCmd = 'xdotool search --name spotify.*linux';

const findPID = 'ps -la | grep spotify | grep -v 00:00:00 | awk \'{print $4}\'';
const findWindowsByPID = 'xdotool search --pid {{PID}} | while read -r line ; do echo $line$\'\\t\'$(xdotool getwindowname $line); done | grep Spotify.*Linux | awk \'{print $1}\'';

export default class LinuxSpotifyController {
	constructor (cb) {
		var self = this;
		
		getProcessPID((err, pid) => {
			if (err){
				cb(err);
				return;
			}
			self.pid = pid;
			
			getX11Window(pid, (err, wid) => {
				if (err){
					cb(err);
					return;
				}
				
				self.wid = wid;
				
				cb(null, self);
			});
		});
		
		
        /**
         * @param  {any} pid
         * @param  {any} cb
         */
		function getX11Window(pid, cb){
			log('getX11Window -> command: %s', findWindowsByPID.replace('{{PID}}', pid));
			exec(findWindowsByPID.replace('{{PID}}', pid), (err, stdOut, stderr) => {
				log('getX11Window -> err: %o', err);
				log('getX11Window -> stdOut: %o', stdOut);
				log('getX11Window -> stderr: %o', stderr);
				
				if (err){
					cb(err);
					return;
				}
				
				let result = cleanStdOut(stdOut);			
				
				if (result.length === 0){
					cb('X11 window ID not found, Spotify not running?');
					return;
				}
				
				cb(null, result[0]);
				
			});
		}
		
		function getProcessPID(cb){
			log('getProcessPID -> command: %s', findPID);
			exec(findPID, (err, stdOut, stderr) => {
				log('getProcessPID -> err: %o', err);
				log('getProcessPID -> stdOut: %o', stdOut);
				log('getProcessPID -> stderr: %o', stderr);
				if (err){
					cb(err);
					return;
				}
				
				let result = cleanStdOut(stdOut);			
				
				if (result.length === 0){
					cb('Spotify PID not found, not running?');
					return;
				}
				
				cb(null, result[0]);
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
	}
}
