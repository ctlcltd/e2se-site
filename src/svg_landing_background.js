/*!
 * src/svg_landing_background.js
 *
 * SVG image transform
 *
 * @author Leonardo Laureti
 * @license MIT License
 */

const svg = document.rootElement;

const src_size = svg.outerHTML.length / 1e3;

var elements = svg.querySelectorAll('line');

var opacity = {
	't': [ 0.5, 0.53, 0.55, 0.57, 0.6, 0.64, 0.67, 0.69, 0.72, 0.74, 0.76, 0.76, 0.72, 0.72, 0.69, 0.69, 0.67, 0.67, 0.64, 0.64, 0.62, 0.62, 0.6, 0.57, 0.53, 0.48, 0.43, 0.38, 0.36, 0.34, 0.31, 0.26, 0.24, 0.22, 0.15, 0.15, 0.1, 0.1, 0.05, 0.05, 0.03 ],
	'm': [ 0.91, 0.88, 0.86, 0.83, 0.81, 0.79, 0.86, 0.83, 0.81, 0.79, 0.76, 0.74, 0.72, 0.69, 0.67, 0.69, 0.72, 0.74, 0.76, 0.74, 0.72, 0.69, 0.67, 0.69, 0.72, 0.74, 0.76, 0.74, 0.72, 0.69, 0.67, 0.69, 0.72, 0.74, 0.76, 0.79, 0.81, 0.83, 0.86, 0.88, 0.91 ],
	'b': [ 0.03, 0.05, 0.1, 0.12, 0.15, 0.17, 0.19, 0.22, 0.24, 0.26, 0.29, 0.31, 0.34, 0.36, 0.38, 0.41, 0.43, 0.45, 0.48, 0.5, 0.53, 0.55, 0.57, 0.6, 0.62, 0.64, 0.67, 0.69, 0.72, 0.74, 0.76, 0.79, 0.81, 0.83, 0.86, 0.88, 0.91, 0.93, 0.95, 0.98, 1 ],
};

var current = 0;
var x = 0;
var i = document.location.pathname.match(/ttten-(\w)_src/)[1];

for (const el of elements) {
	if (el.getAttribute('y1') != current) {
		x++;
	}

	el.setAttribute('opacity', opacity[i][x].toString().replace('0.', '.'));
	current = el.getAttribute('y1');
}


{
	const el = svg.querySelector('g');
}



const dst_size = svg.outerHTML.length / 1e3;

console.log({ src_size, dst_size });
console.log(svg.outerHTML);
