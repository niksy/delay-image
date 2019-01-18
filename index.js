import elementWithinViewport from 'element-within-viewport';
import loadImage from 'image-promise';

export default ( element, options = {} ) => {

	const {
		threshold = 0,
		debounce = 300,
		imageSource = element.getAttribute('data-src'),
		onEnter = ( node ) => {},
		onSuccess = ( node ) => {
			node.src = imageSource;
		},
		onFail = ( node ) => {}
	} = options;

	const instance = elementWithinViewport(element, {
		threshold: threshold,
		debounce: debounce,
		once: true,
		onEnter: () => {
			onEnter(element);
			loadImage(imageSource)
				.then(() => onSuccess(element))
				.catch(() => onFail(element));
		}
	});

	return instance;

};
