import bindProjects from './work.js';
import bindHomeHeader from './homeHeader.js';

document.addEventListener('DOMContentLoaded', () => {
	imagesLoaded( '#work', () => {
		bindProjects({
			fadeDuration: 0,
			container: '#work',
			onComplete: () => {
				if( document.body.getAttribute('id') === 'home' ) {
					bindHomeHeader();
				}			
			}
		});
	} );
});
