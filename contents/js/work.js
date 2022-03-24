/* global Isotope */

export default function bindProjects(args) {
	const container = document.querySelector(args.container);
	if (!container) {
		return;
	}
	const workItems = container.querySelectorAll('.item');
	let categories = [];
	workItems.forEach(item => {
		const category = item.getAttribute('data-category');
		if (category && !categories.includes(category)) {
			categories.push(category);
		}
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
		button.classList.add('active');
		let filter = '*';
		if (categoryName !== 'All') {
			filter = `[data-category="${categoryName}"]`;
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
	selectCategory('All', container.querySelector('[data-category="All"]'));

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
		if( project.querySelector('.embed') ) {
			clone.classList.add('has-embed');
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
			const endingLeft = bodyWidth / 2 - projectWidth / 2;
			const endingTop = bodyHeight / 2 - projectHeight / 2;
			return {
				left: endingLeft,
				top: endingTop,
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
				clone.style.width = `${cloneInitialWidth}px`;
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
		setTimeout(() => {
			setPosition();
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
	
}
