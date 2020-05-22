
function $ (el, sel = undefined) {
  if (typeof sel === 'string') {
    return el.querySelector(sel)
  }
  return document.querySelector(el)
}
function $$ (el, sel = undefined) {
  if (typeof sel === 'string') {
    return Array.from(el.querySelectorAll(sel))
  }
  return Array.from(document.querySelectorAll(el))
}
function render (html) {
  var template = document.createElement('template')
  template.innerHTML = html
  return template.content
}
function safe (str) {
  str = (str || '').toString()
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
mapboxgl.accessToken = 'pk.eyJ1IjoibHM1MTIyIiwiYSI6ImNrYTEzcmF3YjBjdW8zbnFjbW54ZHV3anQifQ.2StWHDLCw3ib8IM9DtzYMQ';
var map = new mapboxgl.Map({container: document.getElementById('map'),
	style: 'mapbox://styles/mapbox/streets-v11',
    zoom: 8,
    center: [-74, 40.5] });
map.addControl(new mapboxgl.NavigationControl());
var longitude = geoplugin_longitude();
var latitude = geoplugin_latitude();

function loadImage(path,imgLong,imgLat){
map.on('load', function() {
map.loadImage(
path,
function(error, image) {
if (error) throw error;
map.addImage(path, image);
map.addSource(path, {
'type': 'geojson',
'data': {
'type': 'FeatureCollection',
'features': [
{
'type': 'Feature',
'geometry': {
'type': 'Point',
'coordinates': [imgLong, imgLat]
}
}
]
}
});
map.addLayer({
'id': path,
'type': 'symbol',
'source': path,
'layout': {
'icon-image': path,
'icon-size': 0.15
}
});
}
);
});
	}



window.addEventListener('load', () => {
	$('#add-file-btn').addEventListener('change',onChangeAddFile) 
	updatePage()
})
async function isMember(){
	if(window.localStorage.userURL == null){
		return false
	}
	return true	
}
async function getURL(name){
  var self = new DatArchive(window.location)
  var url = await self.readFile('/Profiles/'+name+'/url','utf8')
  return url 
}
async function updatePage(){
	var fileContainer= $('#file-container')
	var self = new DatArchive(window.location)
	var info = await self.getInfo()
	if (info.isOwner){
		$('.btn').classList.remove('hide')
	}
	if (window.localStorage.userURL == null){
		document.getElementById("file-container").style.display="none"
		displayProfile()
		return	
	}
	displayFiles()
	displayProfile()
  	displayUsers()
  	var fileNames = await self.readdir('Files/')
  	var i
  	for(i=0;i<fileNames.length;i++){
  		var n = fileNames[i]
  		var fileLOC = await self.readFile('Files/'+n+'/location.json')
  		var fileJSON = JSON.parse(fileLOC)
  		var filePath = 'Files/'+n+'/'+n
  		loadImage(filePath,fileJSON.lng,fileJSON.lat)
  	//	loadImage('Files/img-19.png/img-19.png',-74.5,39)
  	}

}
async function displayFiles(){
	var fileContainer= $('#file-container')
	var self = new DatArchive(window.location)
	var info = await self.getInfo()
	var fileNames = await self.readdir('/Files')
  	fileContainer.append(render(`<table> `))
  	var i;
  	for(i = 0; i<fileNames.length; i++){
    	var name = fileNames[i]
    	window.currentFile = name
    	var fileDocuments = await self.readdir('/Files/'+name)
    	fileContainer.append(render(`<tr><td>  ${safe(name)} <button type = "button"
    	id = "add-location-${i}"> Add Location </button> <b id = "file-${i}"></b> `))
    	var loc_id = "#add-location-"+i
   		if(fileDocuments.length!=1){
   			var filelocationJSON = await self.readFile('Files/'+name+"/location.json")
   			var filelocation = JSON.parse(filelocationJSON)
   			fileContainer.append(render(` Longitude= ${safe(filelocation.lng)}
   			  Latitude= ${safe(filelocation.lat)}</tr></td>`))

   		}   	   
   		else{
   			$(loc_id).addEventListener('click',onClickAddFileLocation(name))	
   			fileContainer.append(render(`</tr></td>`))
   		}
   		fileContainer.append(render(`<br></br>`))
    }
  	fileContainer.append(render(`</table>`))

  	//displayFilesOnMap()
  	//displayFilesMap()
}

async function onClickAddFileLocation(name){
	map.on('click',  async function(e) {
		var inf = $('#info')
		var output = JSON.stringify(e.lngLat.wrap());
		var self = new DatArchive(window.location)
		await self.writeFile("Files/"+name+"/location.json",output)
		inf.append(render(`${output}`))
	})

}

// Run through the selected features and set a filter
// to match features with unique FIPS codes to activate
// the `counties-highlighted` layer.
	

async function displayProfile(){
	var profileContainer= $('#profile')
	if (window.localStorage.userURL == null){
		profileContainer.append(render(`<p> Set up new profile </p>`))
		profileContainer.append(render(` <label>Name</label> 
			<input type = "text" id = "myText" value = "enter name" /> `))
		profileContainer.append(render(`<button type = "button" id = "create-profile"> Create Profile </button> `))
		$('#create-profile').addEventListener('click',onClickAddProfile)
	}
	else{
		var self = new DatArchive(window.localStorage.userURL)
		var datfile = await self.readFile("dat.json")
		var jsondat = JSON.parse(datfile)
		var name = jsondat.title
		var profileFile = await self.readFile("profile.json")
		var jsonprofile = JSON.parse(profileFile)
		var user_long = jsonprofile.longitude
		var user_lat = jsonprofile.latitude
		profileContainer.append(render(` Name: ${safe(name)} <br>`))
		profileContainer.append(render(` Profile Page: <a href = "${window.localStorage.userURL}">
			${window.localStorage.userURL} <br>`))
		profileContainer.append(render(` Latitude: ${user_lat} <br>`))
		profileContainer.append(render(` Longitude: ${user_long}</p>`))

	}
}


async function onClickAddProfile(e){
	var self = new DatArchive(window.location)
	var name = document.getElementById("myText").value
	if(name == "enter name"){
		name = "Billy Bob"
	}
	var user_profile = await DatArchive.create({
  title: name,
  description: "My user profile for this network",
  type: ['website']
})
	window.localStorage.setItem("userURL",user_profile.url)
	await self.writeFile("Profiles/"+name,user_profile.url)
	await addLocationToProfile()
	await updatePage()
}
async function onChangeAddFile (e){
	var self = new DatArchive(window.location)
	if (e.target.files){
		const {files} = e.target

		for (let i = 0; i<files.length;i+=1){
			const reader = new FileReader()
			const file = files[i]
			await self.mkdir("Files/"+file.name)
			reader.onload = async function(){
				const path = `/Files/${file.name}/${file.name}`
				await self.writeFile(path,reader.result)
				updatePage()
			}
			reader.readAsArrayBuffer(file)
		}
	}
	window.location.reload()
}
async function addLocationToProfile(){
	var locationDict = {"latitude":latitude,"longitude":longitude};
	var dictstring = JSON.stringify(locationDict); 
	if(window.localStorage.userURL == null){
		return
	}
	var user = new DatArchive(window.localStorage.userURL)
    await user.writeFile("profile.json",dictstring)
}

async function displayUsers(){ 
	if(window.localStorage.userURL == null){
		return
	}
	var usersContainer= $('#users')
	var self = new DatArchive(window.location)
	var profiles = await self.readdir("/Profiles")
	var i;
	for(i=0;i<profiles.length;i++){
		var user_name = profiles[i]
		var user_url = await self.readFile("/Profiles/"+user_name)
		var user_archive = new DatArchive(user_url)
		var user_profile = await user_archive.readFile("profile.json")
		var user_location = JSON.parse(user_profile)
		var popup = new mapboxgl.Popup({ offset: 35, closeButton:false }).setText(
        user_name
    );
	    var user_marker = new mapboxgl.Marker()
.setLngLat([user_location.longitude, user_location.latitude])
.setPopup(popup)
.addTo(map);
		
		usersContainer.append(render(`Name: ${user_name}<br>`))
		usersContainer.append(render(`Profile Page: <a href = "${user_url}">
			${user_url} </a> <br>`))
		usersContainer.append(render(`Latitude: ${user_location.latitude}<br>`))
		usersContainer.append(render(`Longitude: ${user_location.longitude}<br><br>`))
	}
}

