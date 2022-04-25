/* global Isotope */

export default function bindProjects(args) {
	const container = document.querySelector(args.container);
	if (!container) {
		return;
	}
	const workItems = container.querySelectorAll('.item');
	let categories = [];
	workItems.forEach(item => {
		if( ! item.hasAttribute('data-category') ) return;
		const categoryString = item.getAttribute('data-category');
		let categoryArray = categoryString.split(',');
		categoryArray.forEach( category => {
			category = category.trim();
			if (! categories.includes(category)) {
				categories.push(category);
			}
		} )
	});
	// Sort
	categories = categories.sort((a, b) => a.localeCompare(b));
	categories.unshift('All');

	// Add category buttons
	const categoriesEl = document.createElement('ul');
	categoriesEl.setAttribute('id', 'filters');

	// Start Isotope
	const grid = new Isotope('#items', {
		itemSelector: '.item',
		layoutMode: 'fitRows'
	});

	function selectCategory(categoryName, button) {
		container.querySelectorAll('.category-button').forEach(thisButton => {
			thisButton.classList.remove('active');
		});
		workItems.forEach( item => {
			item.setAttribute('data-in-filter', false);
			if(! item.hasAttribute('data-category') ) return;
			const categoryString = item.getAttribute('data-category');
			const categoryArray = categoryString.split(',');
			categoryArray.forEach( category => {
				category = category.trim();
				if( category === categoryName ) {
					item.setAttribute('data-in-filter', true);
				}
			} )
		});
		button.classList.add('active');
		let filter = '*';
		if (categoryName !== 'All') {
			filter = `[data-in-filter="true"]`;
		}
		grid.arrange({
			filter,
		});
	}

	// Create category buttons based on listed categories
	categories.forEach(category => {
		const buttonEl = document.createElement('li');
		const button = document.createElement('button');
		button.classList.add('category-button');
		button.innerText = category;
		button.setAttribute('data-category', category);
		buttonEl.appendChild(button);
		categoriesEl.appendChild(buttonEl);
		button.addEventListener('click', () => {
			selectCategory(category, button);
		});
	});
	container.insertBefore(categoriesEl, container.querySelector('#items'));		

	/*
	 * Show project when clicked
	 */
	function showProject(project) {
		// Create clone
		const clone = project.cloneNode(true);
		clone.classList.add('clone');
		clone.style.opacity = 0;

		// Set min width on title element
		const mediaEl = project.querySelector('.preview');
		if (mediaEl) {
			clone.querySelector('.title').style.minWidth = `${mediaEl.offsetWidth}px`;
		}
		// Determine if we have embed
		const embedText = project.querySelector('script[type="x-embed"]');
		if( embedText ) {
			clone.classList.add('has-embed');
			const embedEl = document.createElement('div');
			embedEl.classList.add('embed');
			embedEl.innerHTML = embedText.innerHTML;
			clone.querySelector('.title').insertBefore( embedEl, clone.querySelector('.preview') );
		}
		// Set starting position
		const projectRect = project.getBoundingClientRect();
		const startingLeft = projectRect.left;
		const startingTop = projectRect.top;
		clone.style.position = 'fixed';
		clone.style.zIndex = '50';
		clone.style.minHeight = project.offsetHeight + 'px';
		clone.style.left = `${startingLeft}px`;
		clone.style.top = `${startingTop}px`;
		// Append to DOM
		project.parentNode.appendChild(clone);

		// Set ending styles
		function getEndingPos(widthOverride = false, heightOverride = false) {
			const projectWidth = widthOverride !== false ? widthOverride : clone.offsetWidth;
			const projectHeight = heightOverride !== false ? heightOverride : clone.offsetHeight;
			const bodyWidth = window.visualViewport.width;
			const bodyHeight = window.visualViewport.height;
			let smallScreen = false;
			let endingLeft = bodyWidth / 2 - projectWidth / 2;
			if( projectWidth === bodyWidth ) {
				endingLeft = projectRect.left;
				smallScreen = true;
			}
			const endingTop = bodyHeight / 2 - projectHeight / 2;
			return {
				left: endingLeft,
				top: endingTop,
				smallScreen: smallScreen
			};
		}

		function closeProject() {
			const overlay = document.querySelector('.overlay');
			clone.classList.add('fade-out');
			overlay.classList.add('fade-out');
			project.style.opacity = 1;
			// Reload iframe
			const iframe = clone.querySelector('iframe');
			if(iframe) {
				iframe.src = iframe.src;
			}
			setTimeout(() => {
			clone.parentNode.removeChild(clone);
				overlay.parentNode.removeChild(overlay);
			}, 250);
		}

		function setPosition() {
			// Save the expanded dimensions so we remember them...
			const cloneInitialWidth = clone.offsetWidth;
			const cloneInitialHeight = clone.offsetHeight;
			// Then, set the "closed" dimensions
			const projectWidth = projectRect.width;
			const projectHeight = projectRect.height;
			clone.style.opacity = 1;
			project.style.opacity = 0;
			clone.style.width = `${projectWidth}px`;
			clone.style.height = `${projectHeight}px`;
			// Set the end position
			const endPos = getEndingPos(cloneInitialWidth, cloneInitialHeight);
			setTimeout(() => {
				clone.classList.add('expand');
				clone.style.opacity = null;
				clone.style.left = `${endPos.left}px`;
				clone.style.top = `${endPos.top}px`;
				if( ! endPos.smallScreen ) {
					clone.style.width = `${cloneInitialWidth}px`;
				}
				clone.style.height = `${cloneInitialHeight}px`;
			}, 10);
			setTimeout(() => {
				clone.classList.add('open');
			}, 500);
			// Reposition on resize
			window.addEventListener('resize', () => {
				const resizePos = getEndingPos();
				clone.style.left = `${resizePos.left}px`;
				clone.style.top = `${resizePos.top}px`;
			});
			// Create overlay
			const overlay = document.createElement('div');
			overlay.classList.add('overlay');
			setTimeout(() => {
				overlay.classList.add('fade-in');
			});
			project.parentNode.appendChild(overlay);
			overlay.addEventListener('click', () => {
				closeProject();
			});
		}
		
		// Set timeout so that we properly register the correct expanded dimensions
		const cloneCheck = setInterval(() => {
			if( project.parentNode.querySelector('.clone') ) {
				clearInterval(cloneCheck);
				setPosition();
			}
		}, 20);
		
	}

	workItems.forEach(item => {
		item.addEventListener('click', () => {
			showProject(item);
		});
	});
	
	if( args.hasOwnProperty('onComplete') ) {
		args.onComplete();
	}
	
	// Select default category
	selectCategory('Featured', container.querySelector('[data-category="Featured"]'));

}
