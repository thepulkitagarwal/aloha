var store = (function() {

	var db = new Dexie('image_database');

	db.version(1).stores({
		images: '++id,origURI,dataURI'
	});

	db.open().catch(function (e) {
		console.log('Open failed: ' + e);
	});

	function storeImage(dataURI) {
		db.images.put({
			id: 0,
			origURI:dataURI,
			dataURI:dataURI
		}).catch(function(error) {
		   console.log('Error: ' + error);
		});
		// .then (function(){
		// 	return db.images.get('last-img');
		// }).then(function(img) {
		// 	console.log('Successfully added' + img.dataURI);
		// })
	}

	function updateImage(dataURI) {
		db.images.update(0, {
			dataURI:dataURI
		});
	}

	function getImage(callback) {
		db.images
			.where('id')
			.equals(0)
			.toArray()
			.then(function(images) {
				callback(images[images.length-1]);
			});
	}

	return {
		storeImage: storeImage,
		getImage: getImage,
		updateImage: updateImage
	}
}());
