import LinuxSpotifyController from './linux-spotify-controller';

var test = new LinuxSpotifyController();
test.promise.then((intance) => {
	intance.pause();
});