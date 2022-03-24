function getScroll() {
	if (window.pageYOffset != undefined) {
		return [pageXOffset, pageYOffset];
	} else {
		var sx, sy, d = document,
			r = d.documentElement,
			b = d.body;
		sx = r.scrollLeft || b.scrollLeft || 0;
		sy = r.scrollTop || b.scrollTop || 0;
		return [sx, sy];
	}
}

export default function bindHomeHeader() {
	const homeHeader = document.querySelector('#home-header');
	const main = document.querySelector('main');
	const siteWrapper = document.querySelector('#wrapper');
	const siteHeader = document.querySelector('#site-header-wrap');
	const siteFooter = document.querySelector('#site-footer-wrap');
	if(! homeHeader || ! main || ! siteWrapper || ! siteHeader || ! siteFooter) {
		console.warn('Note: Parallax missing elements.');
		return;
	}
	document.body.classList.add('parallax');
	homeHeader.classList.add('parallax');
	const mainWrapper = document.createElement('div');
	mainWrapper.setAttribute('id', 'home-parallax-wrap');
	mainWrapper.classList.add('parallax-artifact');
	mainWrapper.appendChild(main);
	mainWrapper.appendChild(siteFooter);
	siteWrapper.appendChild(homeHeader);
	siteWrapper.appendChild(mainWrapper);
	setElementSizes();
	function setElementSizes() {
		const siteHeaderHeight = siteHeader.offsetHeight;
		homeHeader.style.top = siteHeaderHeight + 'px';
		const headerTop = homeHeader.offsetTop;
		const headerHeight = homeHeader.offsetHeight;
		mainWrapper.style.top = headerTop + headerHeight + 'px';
	}
	function setHeaderTextAppearance(e) {
		const headerHeight = homeHeader.offsetHeight;
		const scrollTop = getScroll()[1];
		const scrollPercent = scrollTop / headerHeight;
		if( scrollPercent > 1 || scrollPercent < 0 ) {
			return;
		}
		const textOpacity = 1 - ( scrollPercent + 0.05);
		const container = homeHeader.querySelector('.container h1');
		container.style.opacity = textOpacity;
		container.style.transform = `translateY(${scrollTop * -.1 + 'px'})`;
	}
	window.addEventListener('scroll', setHeaderTextAppearance);
	window.addEventListener('resize', setElementSizes);
}