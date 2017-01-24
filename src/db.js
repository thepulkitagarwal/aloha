var store = (function() {

	var db = new Dexie('image_database');
	db.version(1).stores({
		images: '&id,dataURI'
	});

	db.open().catch(function (e) {
		console.log('Open failed: ' + e);
	});

	function storeImage(dataURI) {
		db.images.put({
			id: 'last-img',
			dataURI:dataURI
		}).then (function(){
			return db.images.get('last-img');
		}).then(function(img) {
			console.log('Successfully added' + img.dataURI);
		}).catch(function(error) {
		   console.log('Error: ' + error);
		});
	}

	function getImage(callback) {
		db.images
			.where('id')
			.equals('last-img')
			.toArray()
			.then(function(images) {
				callback(images[images.length-1]);
			});
	}

	return {
		storeImage: storeImage,
		getImage: getImage
	}
}());
