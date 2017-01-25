var initializeCropper = function () {
	$image = $('#image-to-crop')
	$image.cropper({
		viewMode: 0,
		dragMode: 'move',
		autoCropArea: 1.01,
		restore: false,
		modal: false,
		guides: false,
		highlight: false,
		cropBoxMovable: false,
		cropBoxResizable: false,
		center: false,
		toggleDragModeOnDblclick: false,
		// minCanvasWidth: window.innerWidth,
		// minCanvasHeight: window.innerHeight,
		aspectRatio: window.innerWidth/window.innerHeight,
		ready: function() {
			$('#crop-toolbar').find('*').off();
			var self = $(this);
			window.self = self;
			$('.cropper-container').css('margin-top', '-' + ($('.cropper-container').height() - $('.cropper-crop-box').height())/2 + 'px')
			$('.rotate-cw').click(function(e) {self.cropper('rotate', 90);});
			$('.rotate-ccw').click(function(e) {self.cropper('rotate', -90);});
			$('.save-button').click(function() {
				var img = self.cropper('getCroppedCanvas', {fillColor: '#000'}).toDataURL('image/jpg');
				// var win = window.open(img, '_blank');
				// win.focus();
				setBackground(img);
				var cropContainer = $('.crop-container');
				self.cropper('destroy', function() {console.log('done')});
				cropContainer.find('*').off();
				cropContainer.toggleClass('hide');
				$('#bg-img-container').toggleClass('hide');
				$('#bg-container').toggleClass('hide');
			});
			
			var inputImage = $('#crop-image-input');

			function changeImage(file) {
				if(file && file.type.match(/^image\/(jpe?g|png)$/i)) {
					var blobURL = URL.createObjectURL(file);
					$image.one('built.cropper', function () {
						URL.revokeObjectURL(blobURL);
					}).cropper('reset').cropper('replace', blobURL);
					inputImage.val('');
				}
			}

			inputImage.change(function() {
				var files = this.files;
				var file;

				if (files && files.length) {
					file = files[0];
					changeImage(file);
				}
			});

			$(document).on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
				e.preventDefault();
				e.stopPropagation();
			})
			.on('drop', function(e) {
				var files = e.originalEvent.dataTransfer.files;
				var file;

				if (files && files.length) {
					file = files[0];
					changeImage(file);
				}
			});
		}
	});
};
